package com.example.fireinspection.dto;

/**
 * ダッシュボードサマリーレスポンス
 */
public record DashboardSummaryResponse(
        /** 稼働職員数 */
        long workingEmployees,
        /** 予定現場数 */
        long plannedSites,
        /** 完了現場数 */
        long completedSites,
        /** 作業中現場数 */
        long inProgressSites,
        /** 提出済み日報数 */
        long submittedDailyReports,
        /** 不良（FAIL）件数 */
        long failCount
) {
}
