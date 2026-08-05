package com.example.fireinspection.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * 日時ユーティリティ（JST基準の現在日時を一元管理する）
 */
public final class DateTimeUtil {

    /** 日本標準時のタイムゾーン */
    public static final ZoneId ZONE_JST = ZoneId.of("Asia/Tokyo");

    private DateTimeUtil() {
        // インスタンス化禁止
    }

    /** JSTの現在日時を返す */
    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE_JST);
    }

    /** JSTの本日日付を返す */
    public static LocalDate today() {
        return LocalDate.now(ZONE_JST);
    }
}
