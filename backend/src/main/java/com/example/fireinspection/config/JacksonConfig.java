package com.example.fireinspection.config;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * Jackson設定（snake_case・日付のISO文字列出力）
 * application.ymlと同一内容だが、設定漏れ防止のためコードでも明示する
 */
@Configuration
public class JacksonConfig {

    /** ObjectMapperのカスタマイズ */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> builder
                // JSONプロパティ名はsnake_caseに統一
                .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
                // 日付はタイムスタンプではなくISO文字列で出力
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
