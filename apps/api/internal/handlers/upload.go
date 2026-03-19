package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

type UTFileMeta struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
	Type string `json:"type"`
}

type UTUploadRequest struct {
	Files []UTFileMeta `json:"files"`
}

type UTPresignedData struct {
	Url    string            `json:"url"`
	Fields map[string]string `json:"fields"`
	UfsUrl string            `json:"ufsUrl"`
}

type UTPresignedResponse struct {
	Data  []UTPresignedData `json:"data"`
	Error string            `json:"error,omitempty"`
}

// uploadFile handles uploading to UploadThing via their REST API (2-step process)
func (a *API) uploadFile(c echo.Context) error {
	secret := os.Getenv("UPLOADTHING_API_KEY")
	if secret == "" {
		secret = os.Getenv("UPLOADTHING_SECRET")
	}
	if secret == "" {
		return echo.NewHTTPError(http.StatusInternalServerError, "UPLOADTHING_API_KEY is not set")
	}

	form, err := c.MultipartForm()
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid multipart form")
	}

	files := form.File["files"]
	if len(files) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "No files provided")
	}

	// 1. Prepare metadata for UploadThing
	var utFiles []UTFileMeta
	for _, file := range files {
		utFiles = append(utFiles, UTFileMeta{
			Name: file.Filename,
			Size: file.Size,
			Type: file.Header.Get("Content-Type"),
		})
	}

	reqBody, _ := json.Marshal(UTUploadRequest{Files: utFiles})

	req, err := http.NewRequest("POST", "https://api.uploadthing.com/v6/uploadFiles", bytes.NewReader(reqBody))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create request")
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-uploadthing-api-key", secret)
	req.Header.Set("x-uploadthing-version", "7.0.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadGateway, "Failed to contact UploadThing API")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return echo.NewHTTPError(resp.StatusCode, fmt.Sprintf("UploadThing error: %s", string(bodyBytes)))
	}

	var utResp UTPresignedResponse
	if err := json.NewDecoder(resp.Body).Decode(&utResp); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to decode UploadThing response")
	}

	if len(utResp.Data) != len(files) {
		return echo.NewHTTPError(http.StatusInternalServerError, "UploadThing response mismatch")
	}

	// 2. Upload each file to S3
	type FrontendResult struct {
		Data struct {
			Url    string `json:"url"`
			UfsUrl string `json:"ufsUrl"`
		} `json:"data"`
		Error *string `json:"error"`
	}

	var results []FrontendResult

	for i, file := range files {
		uploadData := utResp.Data[i]

		src, err := file.Open()
		if err != nil {
			continue // Skip or handle error
		}

		var b bytes.Buffer
		w := multipart.NewWriter(&b)

		// Fields MUST be added before the file
		for k, v := range uploadData.Fields {
			_ = w.WriteField(k, v)
		}

		fw, err := w.CreateFormFile("file", file.Filename)
		if err == nil {
			_, _ = io.Copy(fw, src)
		}
		w.Close()
		src.Close()

		req2, err := http.NewRequest("POST", uploadData.Url, &b)
		if err == nil {
			req2.Header.Set("Content-Type", w.FormDataContentType())
			resp2, err := client.Do(req2)
			if err == nil {
				resp2.Body.Close()
				if resp2.StatusCode >= 200 && resp2.StatusCode < 300 {
					results = append(results, FrontendResult{
						Data: struct {
							Url    string `json:"url"`
							UfsUrl string `json:"ufsUrl"`
						}{
							Url:    uploadData.UfsUrl,
							UfsUrl: uploadData.UfsUrl,
						},
					})
					continue
				} else {
					body, _ := io.ReadAll(resp2.Body)
					fmt.Println("S3 upload failed:", string(body))
				}
			}
		}

		errStr := "Failed to upload to storage"
		results = append(results, FrontendResult{Error: &errStr})
	}

	return c.JSON(http.StatusOK, results)
}
