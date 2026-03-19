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

func (a *API) uploadFile(c echo.Context) error {
	secret := os.Getenv("UPLOADTHING_API_KEY")
	if secret == "" {
		secret = os.Getenv("UPLOADTHING_SECRET")
	}
	if secret == "" {
		return echo.NewHTTPError(http.StatusInternalServerError, "UPLOADTHING_API_KEY is not set")
	}

	file, err := c.FormFile("files")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "No file provided")
	}

	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to open file")
	}
	defer src.Close()

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	part, err := writer.CreateFormFile("files", file.Filename)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create form file")
	}

	_, err = io.Copy(part, src)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to copy file content")
	}

	err = writer.Close()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to close writer")
	}

	req, err := http.NewRequest("POST", "https://api.uploadthing.com/v6/uploadFiles", &requestBody)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create request")
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("x-uploadthing-api-key", secret)

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

	var result []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to decode UploadThing response")
	}

	return c.JSON(http.StatusOK, result)
}
