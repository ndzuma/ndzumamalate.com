package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
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

	var reqData UTUploadRequest
	if err := c.Bind(&reqData); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON body")
	}

	if len(reqData.Files) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "No files provided")
	}

	reqBody, _ := json.Marshal(reqData)

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

	return c.JSON(http.StatusOK, utResp.Data)
}
