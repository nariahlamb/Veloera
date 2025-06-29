package controller

import (
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/songquanpeng/one-api/common"
	"github.com/songquanpeng/one-api/common/logger"
	"github.com/songquanpeng/one-api/dto"
	"github.com/songquanpeng/one-api/model"
)

// In-memory store for reports (for now)
var reportsStore = make(map[string]dto.ReportResponse)

// IGNORED_ERROR_PATTERNS hardcoded as per request
var IGNORED_ERROR_PATTERNS = []string{
	"the maximum number of tokens",
	"user quota is not enough",
}

func buildErrorFilterClause() (string, []interface{}) {
	var errorFilterClause strings.Builder
	var errorFilterParams []interface{}
	if len(IGNORED_ERROR_PATTERNS) > 0 {
		for _, pattern := range IGNORED_ERROR_PATTERNS {
			errorFilterClause.WriteString(" AND content NOT LIKE ?")
			errorFilterParams = append(errorFilterParams, "%"+pattern+"%")
		}
	}
	return errorFilterClause.String(), errorFilterParams
}

func GetReports(c *gin.Context) {
	var reportList []dto.ReportListItem
	for id, report := range reportsStore {
		reportList = append(reportList, dto.ReportListItem{
			ID:        id,
			Name:      report.Name,
			CreatedAt: report.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    reportList,
	})
}

func GenerateReport(c *gin.Context) {
	var reportRequest dto.ReportRequest
	if err := c.ShouldBindJSON(&reportRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的请求参数",
		})
		return
	}

	if reportRequest.Name == "" {
		reportRequest.Name = "未命名报告 - " + time.Now().Format("2006-01-02 15:04:05")
	}

	// Default to last 24 hours if no time range is provided
	startTime := time.Now().Add(-24 * time.Hour).Unix()
	endTime := time.Now().Unix()

	if reportRequest.StartTime != 0 {
		startTime = reportRequest.StartTime
	}
	if reportRequest.EndTime != 0 {
		endTime = reportRequest.EndTime
	}
	if startTime >= endTime {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "开始时间必须早于结束时间",
		})
		return
	}

	reportID := uuid.New().String()
	createdAt := time.Now().Unix()

	overview, err := generateOverview(startTime, endTime)
	if err != nil {
		logger.SysError("Failed to generate report overview: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成报告概览失败"})
		return
	}

	var channelStats []dto.ChannelStat
	var userStats []dto.UserStat
	var tokenStats []dto.TokenStat
	var modelStats []dto.ModelStat
	var ipStats []dto.IPStat

	for _, item := range reportRequest.StatisticItems {
		switch item {
		case "渠道统计":
			channelStats, err = generateChannelStats(startTime, endTime)
			if err != nil {
				logger.SysError("Failed to generate channel stats: " + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成渠道统计失败"})
				return
			}
		case "用户统计":
			userStats, err = generateUserStats(startTime, endTime)
			if err != nil {
				logger.SysError("Failed to generate user stats: " + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成用户统计失败"})
				return
			}
		case "Token统计":
			tokenStats, err = generateTokenStats(startTime, endTime)
			if err != nil {
				logger.SysError("Failed to generate token stats: " + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成Token统计失败"})
				return
			}
		case "模型统计":
			modelStats, err = generateModelStats(startTime, endTime)
			if err != nil {
				logger.SysError("Failed to generate model stats: " + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成模型统计失败"})
				return
			}
		case "IP统计":
			ipStats, err = generateIPStats(startTime, endTime)
			if err != nil {
				logger.SysError("Failed to generate IP stats: " + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "生成IP统计失败"})
				return
			}
		}
	}

	report := dto.ReportResponse{
		ID:           reportID,
		Name:         reportRequest.Name,
		CreatedAt:    createdAt,
		Overview:     overview,
		ChannelStats: channelStats,
		UserStats:    userStats,
		TokenStats:   tokenStats,
		ModelStats:   modelStats,
		IPStats:      ipStats,
		RawRequest:   reportRequest,
	}

	reportsStore[reportID] = report

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "报告生成成功",
		"data":    report,
	})
}

func GetReportByID(c *gin.Context) {
	reportID := c.Param("id")
	report, ok := reportsStore[reportID]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "报告未找到",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    report,
	})
}

func generateOverview(startTime, endTime int64) (dto.ReportOverview, error) {
	var overview dto.ReportOverview
	db := common.DB
	errorFilterClause, errorFilterParams := buildErrorFilterClause()

	baseQuery := "FROM logs WHERE created_at >= ? AND created_at <= ?"
	params := []interface{}{startTime, endTime}

	// Total Tokens and Requests
	type TotalResult struct {
		TotalTokens   int64 `gorm:"column:total_tokens"`
		TotalRequests int64 `gorm:"column:total_requests"`
	}
	var totalResult TotalResult
	if err := db.Raw("SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0) as total_tokens, COUNT(id) as total_requests "+baseQuery, params...).Scan(&totalResult).Error; err != nil {
		return overview, fmt.Errorf("query total stats: %w", err)
	}
	overview.TotalTokens = totalResult.TotalTokens
	overview.TotalRequests = totalResult.TotalRequests

	// Error Counts
	// Note: The condition `(type = 5 OR (type = 2 AND completion_tokens = 0 AND content LIKE '%超时%'))` is specific.
	// Type 5 seems to be error type. Type 2 with 0 completion_tokens and "超时" (timeout) in content is also considered an error.
	errorCondition := "(type = 5 OR (type = 2 AND completion_tokens = 0 AND content LIKE '%超时%'))"

	var error429Count int64
	query429 := fmt.Sprintf("SELECT COUNT(id) FROM logs WHERE created_at >= ? AND created_at <= ? AND %s AND content LIKE ? %s", errorCondition, errorFilterClause)
	final429Params := append(append([]interface{}{startTime, endTime, "%429%"}, errorFilterParams...), errorFilterParams...) // errorFilterParams repeated due to query structure, needs careful construction if errorFilterClause is complex

	// Correcting param list for 429 errors
	queryParams429 := []interface{}{startTime, endTime, "%429%"}
	queryParams429 = append(queryParams429, errorFilterParams...)

	if err := db.Raw(query429, queryParams429...).Scan(&error429Count).Error; err != nil {
		return overview, fmt.Errorf("query 429 error count: %w", err)
	}
	overview.Error429Count = error429Count

	var normalErrorCount int64
	queryNormalError := fmt.Sprintf("SELECT COUNT(id) FROM logs WHERE created_at >= ? AND created_at <= ? AND %s AND content NOT LIKE ? %s", errorCondition, errorFilterClause)
	// Correcting param list for normal errors
	queryParamsNormalError := []interface{}{startTime, endTime, "%429%"}
	queryParamsNormalError = append(queryParamsNormalError, errorFilterParams...)

	if err := db.Raw(queryNormalError, queryParamsNormalError...).Scan(&normalErrorCount).Error; err != nil {
		return overview, fmt.Errorf("query normal error count: %w", err)
	}
	overview.NormalErrorCount = normalErrorCount

	if overview.TotalRequests > 0 {
		overview.Error429Percent = math.Round((float64(overview.Error429Count)/float64(overview.TotalRequests))*1000) / 1000 // 3 decimal places
		overview.NormalErrorPercent = math.Round((float64(overview.NormalErrorCount)/float64(overview.TotalRequests))*1000) / 1000
	}

	return overview, nil
}

func generateChannelStats(startTime, endTime int64) ([]dto.ChannelStat, error) {
	var stats []dto.ChannelStat
	db := common.DB
	errorFilterClause, errorFilterParams := buildErrorFilterClause()
	errorCondition := "(l.type = 5 OR (l.type = 2 AND l.completion_tokens = 0 AND l.content LIKE '%超时%'))"

	// Base part of the query
	query := `
        SELECT
            l.channel_id,
            c.name as channel_name,
            COUNT(l.id) as total_requests,
            SUM(CASE WHEN %s AND l.content LIKE ? %s THEN 1 ELSE 0 END) as error_429_count,
            SUM(CASE WHEN %s AND l.content NOT LIKE ? %s THEN 1 ELSE 0 END) as normal_error_count,
            COALESCE(SUM(l.prompt_tokens + l.completion_tokens), 0) AS total_tokens
        FROM logs l
        LEFT JOIN channels c ON l.channel_id = c.id
        WHERE l.created_at >= ? AND l.created_at <= ?
        GROUP BY l.channel_id, c.name
        HAVING COUNT(l.id) >= 10
        ORDER BY total_requests DESC
    `
	// Insert conditions and error filters into the query string
	// Need to be careful with parameter order for errorFilterParams
	// Each %s for errorFilterClause will consume parameters from errorFilterParams

	// Parameters for the main query part
	baseParams := []interface{}{"%429%"} // For error_429_count LIKE
	baseParams = append(baseParams, errorFilterParams...) // For error_429_count error filter
	baseParams = append(baseParams, "%429%"} // For normal_error_count NOT LIKE
	baseParams = append(baseParams, errorFilterParams...) // For normal_error_count error filter
	baseParams = append(baseParams, startTime, endTime) // For WHERE clause

	// Construct the full query string
	fullQuery := fmt.Sprintf(query, errorCondition, errorFilterClause, errorCondition, errorFilterClause)

	rows, err := db.Raw(fullQuery, baseParams...).Rows()
	if err != nil {
		return nil, fmt.Errorf("query channel stats: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var stat dto.ChannelStat
		var channelName sql.NullString // Handle potential NULL channel names
		if err := rows.Scan(
			&stat.ChannelID,
			&channelName,
			&stat.TotalRequests,
			&stat.Error429Count,
			&stat.NormalErrorCount,
			&stat.TotalTokens,
		); err != nil {
			logger.SysError("Error scanning channel stat row: " + err.Error())
			continue
		}
		stat.ChannelName = channelName.String
		if stat.ChannelName == "" {
			stat.ChannelName = "未知渠道"
		}

		if stat.TotalRequests > 0 {
			stat.Error429Percent = math.Round((float64(stat.Error429Count)/float64(stat.TotalRequests))*1000) / 1000
			stat.NormalErrorPercent = math.Round((float64(stat.NormalErrorCount)/float64(stat.TotalRequests))*1000) / 1000
		}
		stats = append(stats, stat)
	}
	return stats, nil
}


func generateUserStats(startTime, endTime int64) ([]dto.UserStat, error) {
	var stats []dto.UserStat
	db := common.DB
	query := `
        SELECT
            user_id,
            username,
            COUNT(id) as request_count,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total_tokens
        FROM logs
        WHERE created_at >= ? AND created_at <= ?
        GROUP BY user_id, username
        ORDER BY request_count DESC
        LIMIT 5
    `
	if err := db.Raw(query, startTime, endTime).Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("query user stats: %w", err)
	}
	return stats, nil
}

func generateTokenStats(startTime, endTime int64) ([]dto.TokenStat, error) {
	var stats []dto.TokenStat
	db := common.DB
	query := `
        SELECT
            token_id,
            token_name,
            COUNT(id) as request_count,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total_tokens
        FROM logs
        WHERE created_at >= ? AND created_at <= ? AND token_name != ''
        GROUP BY token_id, token_name
        ORDER BY request_count DESC
        LIMIT 5
    `
	if err := db.Raw(query, startTime, endTime).Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("query token stats: %w", err)
	}
	return stats, nil
}

func generateModelStats(startTime, endTime int64) ([]dto.ModelStat, error) {
	var stats []dto.ModelStat
	db := common.DB
	query := `
        SELECT
            model_name,
            COUNT(id) as request_count,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total_tokens
        FROM logs
        WHERE created_at >= ? AND created_at <= ? AND model_name != ''
        GROUP BY model_name
        ORDER BY request_count DESC
        LIMIT 5
    `
	if err := db.Raw(query, startTime, endTime).Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("query model stats: %w", err)
	}
	return stats, nil
}

func generateIPStats(startTime, endTime int64) ([]dto.IPStat, error) {
	var stats []dto.IPStat
	db := common.DB
	query := `
        SELECT
            ip,
            COUNT(id) as request_count,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total_tokens
        FROM logs
        WHERE created_at >= ? AND created_at <= ? AND ip IS NOT NULL AND ip != ''
        GROUP BY ip
        ORDER BY request_count DESC
        LIMIT 5
    `
	if err := db.Raw(query, startTime, endTime).Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("query IP stats: %w", err)
	}
	return stats, nil
}

// Helper to ensure sql.NullString is imported if not already
import "database/sql"
