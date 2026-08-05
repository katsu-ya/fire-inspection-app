package com.example.fireinspection.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.fireinspection.entity.User;

/**
 * 認証済みユーザー情報（Userエンティティのラッパー）
 */
public class AppUserDetails implements UserDetails {

    /** ユーザーエンティティ */
    private final User user;

    public AppUserDetails(User user) {
        this.user = user;
    }

    /** 元のユーザーエンティティを返す */
    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // "ROLE_ADMIN" / "ROLE_EMPLOYEE" 形式で付与する
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive());
    }
}
