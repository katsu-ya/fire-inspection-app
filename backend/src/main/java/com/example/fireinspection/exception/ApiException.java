package com.example.fireinspection.exception;

import org.springframework.http.HttpStatus;

/**
 * 業務エラーを表す例外（HTTPステータス + 日本語メッセージ）
 */
public class ApiException extends RuntimeException {

    /** 返却するHTTPステータス */
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
