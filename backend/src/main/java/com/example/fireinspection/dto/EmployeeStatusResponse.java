package com.example.fireinspection.dto;

/**
 * 職員ごとの当日状況レスポンス
 */
public record EmployeeStatusResponse(
        Long userId,
        String userName,
        /** 当日の割当現場数 */
        long totalSites,
        /** 完了現場数 */
        long completedSites,
        /** 作業中の現場名（作業中でなければnull） */
        String currentSiteName,
        /** 日報提出済みか */
        boolean dailyReportSubmitted
) {
}
