package com.example.fireinspection.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.UserCreateRequest;
import com.example.fireinspection.dto.UserResponse;
import com.example.fireinspection.dto.UserUpdateRequest;
import com.example.fireinspection.entity.Role;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.UserRepository;

/**
 * 職員マスタ管理サービス（管理者向け）
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 職員一覧（role / is_active フィルター任意）
     */
    @Transactional(readOnly = true)
    public List<UserResponse> list(Role role, Boolean isActive) {
        return userRepository.findAllByOrderByIdAsc().stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> isActive == null || isActive.equals(u.getIsActive()))
                .map(UserResponse::from)
                .toList();
    }

    /**
     * 職員新規登録
     */
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "このメールアドレスは既に登録されています");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.setRole(request.role());
        user.setIsActive(true);
        return UserResponse.from(userRepository.save(user));
    }

    /**
     * 職員更新（passwordは指定時のみ変更）
     */
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = findUser(id);
        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "このメールアドレスは既に登録されています");
        }
        user.setEmail(request.email());
        user.setName(request.name());
        user.setRole(request.role());
        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    /**
     * 職員の論理削除（is_active=false）
     */
    @Transactional
    public void delete(Long id) {
        User user = findUser(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    /** IDで職員を取得（存在しなければ404） */
    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "職員が見つかりません"));
    }
}
