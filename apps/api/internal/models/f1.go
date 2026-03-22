package models

import "time"

type F1Meeting struct {
	MeetingName      string    `json:"meeting_name"`
	Location         string    `json:"location"`
	CountryName      string    `json:"country_name"`
	CountryFlag      string    `json:"country_flag"`
	CircuitShortName string    `json:"circuit_short_name"`
	CircuitImage     string    `json:"circuit_image"`
	DateStart        time.Time `json:"date_start"`
	DateEnd          time.Time `json:"date_end"`
}

type F1Team struct {
	PositionCurrent int     `json:"position_current"`
	TeamName        string  `json:"team_name"`
	PointsStart     float64 `json:"points_start"`
	PointsCurrent   float64 `json:"points_current"`
}

type F1Driver struct {
	PositionCurrent int     `json:"position_current"`
	DriverNumber    int     `json:"driver_number"`
	PointsStart     float64 `json:"points_start"`
	PointsCurrent   float64 `json:"points_current"`
	FullName        string  `json:"full_name"`
	TeamName        string  `json:"team_name"`
	TeamColour      string  `json:"team_colour"`
}

type F1WidgetData struct {
	Meeting F1Meeting  `json:"meeting"`
	Teams   []F1Team   `json:"teams"`
	Drivers []F1Driver `json:"drivers"`
}
