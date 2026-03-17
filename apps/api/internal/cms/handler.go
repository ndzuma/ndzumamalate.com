package cms

import (
	"io/fs"
	"net/http"
	"path"
	"strings"

	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) error {
	distFS, err := fs.Sub(Assets, "dist")
	if err != nil {
		return err
	}

	fileServer := http.FileServer(http.FS(distFS))

	e.GET("/", func(c echo.Context) error {
		return serveIndex(c, distFS)
	})
	e.GET("/*", func(c echo.Context) error {
		requestPath := strings.TrimPrefix(c.Request().URL.Path, "/")
		if requestPath == "" {
			return serveIndex(c, distFS)
		}

		if strings.HasPrefix(requestPath, "api/") || requestPath == "health" {
			return echo.NewHTTPError(http.StatusNotFound)
		}

		if hasAsset(distFS, requestPath) {
			fileServer.ServeHTTP(c.Response(), c.Request())
			return nil
		}

		return serveIndex(c, distFS)
	})

	return nil
}

func serveIndex(c echo.Context, distFS fs.FS) error {
	file, err := distFS.Open("index.html")
	if err != nil {
		return err
	}
	defer file.Close()
	return c.Stream(http.StatusOK, echo.MIMETextHTMLCharsetUTF8, file)
}

func hasAsset(distFS fs.FS, requestPath string) bool {
	cleaned := path.Clean(requestPath)
	if cleaned == "." || strings.HasSuffix(cleaned, "/") {
		return false
	}
	_, err := fs.Stat(distFS, cleaned)
	return err == nil
}
