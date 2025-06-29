package dto

type ReportRequest struct {
	Name             string   `json:"name"`
	StatisticItems []string `json:"statistic_items"`
	StartTime        int64    `json:"start_time,omitempty"` // Optional: Unix timestamp
	EndTime          int64    `json:"end_time,omitempty"`   // Optional: Unix timestamp
}

type ReportResponse struct {
	ID               string         `json:"id"`
	Name             string         `json:"name"`
	CreatedAt        int64          `json:"created_at"`
	Overview         ReportOverview `json:"overview"`
	ChannelStats     []ChannelStat  `json:"channel_stats,omitempty"`
	UserStats        []UserStat     `json:"user_stats,omitempty"`
	TokenStats       []TokenStat    `json:"token_stats,omitempty"`
	ModelStats       []ModelStat    `json:"model_stats,omitempty"`
	IPStats          []IPStat       `json:"ip_stats,omitempty"`
	RawRequest       ReportRequest  `json:"raw_request"`
}

type ReportListItem struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
}

type ReportOverview struct {
	TotalTokens     int64   `json:"total_tokens"`
	TotalRequests   int64   `json:"total_requests"`
	Error429Count   int64   `json:"error_429_count"`
	Error429Percent float64 `json:"error_429_percent"`
	NormalErrorCount int64   `json:"normal_error_count"`
	NormalErrorPercent float64 `json:"normal_error_percent"`
}

type ChannelStat struct {
	ChannelID        int     `json:"channel_id"`
	ChannelName      string  `json:"channel_name"`
	TotalRequests    int64   `json:"total_requests"`
	Error429Count    int64   `json:"error_429_count"`
	Error429Percent  float64 `json:"error_429_percent"`
	NormalErrorCount int64   `json:"normal_error_count"`
	NormalErrorPercent float64 `json:"normal_error_percent"`
	TotalTokens      int64   `json:"total_tokens"`
}

type UserStat struct {
	UserID        int    `json:"user_id"`
	Username      string `json:"username"`
	RequestCount  int64  `json:"request_count"`
	TotalTokens   int64  `json:"total_tokens"`
}

type TokenStat struct {
	TokenID       int    `json:"token_id"`
	TokenName     string `json:"token_name"`
	RequestCount  int64  `json:"request_count"`
	TotalTokens   int64  `json:"total_tokens"`
}

type ModelStat struct {
	ModelName     string `json:"model_name"`
	RequestCount  int64  `json:"request_count"`
	TotalTokens   int64  `json:"total_tokens"`
}

type IPStat struct {
	IP            string `json:"ip"`
	RequestCount  int64  `json:"request_count"`
	TotalTokens   int64  `json:"total_tokens"`
}
