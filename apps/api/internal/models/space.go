package models

import "time"

type SpaceLaunch struct {
	Name         string    `json:"name"`
	Provider     string    `json:"provider"`
	ProviderLogo string    `json:"provider_logo"`
	Image        string    `json:"image"`
	Pad          string    `json:"pad"`
	Location     string    `json:"location"`
	Net          time.Time `json:"net"`
	StreamURL    string    `json:"stream_url"`
	InfoURL      string    `json:"info_url"`
}
