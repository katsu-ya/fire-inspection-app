package com.example.fireinspection.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 例外を {"detail": "..."} 形式のレスポンスに統一するハンドラー
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 業務エラー */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApiException(ApiException e, HttpServletRequest request) {
        // 調査しやすいようにリクエストパスと合わせて記録する
        log.warn("業務エラー: {} {} {} -> {}", request.getMethod(), request.getRequestURI(), e.getStatus(), e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(Map.of("detail", e.getMessage()));
    }

    /** バリデーションエラー（最初のフィールドエラーメッセージを返す） */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("入力内容が不正です");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("detail", message));
    }

    /** リクエストボディのパースエラー */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleNotReadableException(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("detail", "リクエスト形式が不正です"));
    }

    /** クエリパラメータ不足・型不一致 */
    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> handleParameterException(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("detail", "リクエストパラメータが不正です"));
    }

    /** 認可エラー（コントローラー層まで到達した場合） */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", "権限がありません"));
    }

    /** 存在しないパスへのアクセス */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoResourceFoundException(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "リソースが見つかりません"));
    }

    /** 想定外のエラー */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("想定外のエラーが発生しました", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("detail", "サーバーエラーが発生しました"));
    }
}
