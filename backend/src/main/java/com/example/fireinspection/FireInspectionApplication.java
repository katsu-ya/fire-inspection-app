package com.example.fireinspection;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 消防保守点検システム バックエンドアプリケーション
 */
@SpringBootApplication
public class FireInspectionApplication {

    public static void main(String[] args) {
        // アプリ全体のデフォルトタイムゾーンをJSTに固定する。
        // ※DB接続プール生成前に設定しないと、JDBCの日付変換が非対称になり
        //   DATE型が読み込み時に1日ズレる（更新のたびに日付が過去へ移動する）ため、
        //   @PostConstructではなくmainの先頭で行うこと
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Tokyo"));
        SpringApplication.run(FireInspectionApplication.class, args);
    }
}
