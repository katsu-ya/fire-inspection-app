package com.example.fireinspection.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.entity.User;
import com.example.fireinspection.repository.UserRepository;

/**
 * シードユーザーのパスワード初期化
 * password_hash='{seed}' のユーザーを検出し、BCryptで "password123" をエンコードして書き戻す（冪等）
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    /** init.sqlが投入するプレースホルダ */
    private static final String SEED_PLACEHOLDER = "{seed}";

    /** シードユーザーの初期パスワード */
    private static final String SEED_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<User> seedUsers = userRepository.findByPasswordHash(SEED_PLACEHOLDER);
        if (seedUsers.isEmpty()) {
            return;
        }
        String encoded = passwordEncoder.encode(SEED_PASSWORD);
        for (User user : seedUsers) {
            user.setPasswordHash(encoded);
        }
        userRepository.saveAll(seedUsers);
        log.info("シードユーザー {} 件のパスワードを初期化しました", seedUsers.size());
    }
}
