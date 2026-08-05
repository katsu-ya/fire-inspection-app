package com.example.fireinspection.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.RefreshToken;

/**
 * リフレッシュトークンリポジトリ
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** トークン文字列で検索 */
    Optional<RefreshToken> findByToken(String token);

    /** トークン文字列で削除 */
    void deleteByToken(String token);
}
