package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.exception.AccessTokenValidException;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtProvider jwtProvider;

    public Boolean isValidAccessToken(String bearerAccessToken) {
        try {
            String accessToken = jwtProvider.removeBearer(bearerAccessToken);
            Claims claims = jwtProvider.getClaims(accessToken);     // claims 만들다가 예외 터지면 runtimeexeption 오류로 보내고,
            Long userId = ((Integer) claims.get("userId")).longValue(); // userId를 만들다가 예외 터져도 runtime으로 보냄
            User user = userMapper.findById(userId);

            if (user == null) {
                throw new RuntimeException();
            }
        } catch (RuntimeException e) {
            throw new AccessTokenValidException("AccessToken 유효성 검사 실패");
        }

        return true;
    }
}
