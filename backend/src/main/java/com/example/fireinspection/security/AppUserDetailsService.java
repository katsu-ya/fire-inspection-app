package com.example.fireinspection.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.fireinspection.entity.User;
import com.example.fireinspection.repository.UserRepository;

/**
 * メールアドレスからユーザーを読み込むUserDetailsService実装
 */
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("ユーザーが見つかりません"));
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UsernameNotFoundException("無効なユーザーです");
        }
        return new AppUserDetails(user);
    }
}
