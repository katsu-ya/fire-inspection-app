package com.example.fireinspection.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.User;

/**
 * ユーザーリポジトリ
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** メールアドレスで検索 */
    Optional<User> findByEmail(String email);

    /** メールアドレスの存在チェック */
    boolean existsByEmail(String email);

    /** パスワードハッシュ値で検索（シード初期化用） */
    List<User> findByPasswordHash(String passwordHash);

    /** ID順の全件取得 */
    List<User> findAllByOrderByIdAsc();
}
