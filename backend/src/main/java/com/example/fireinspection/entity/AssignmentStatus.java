package com.example.fireinspection.entity;

/**
 * ルート割当の作業状態
 */
public enum AssignmentStatus {
    /** 未着手 */
    NOT_STARTED,
    /** 作業中（到着報告済み） */
    IN_PROGRESS,
    /** 完了（離脱報告済み） */
    COMPLETED
}
