package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.dto.request.ReqProfileImgDto;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import com.study.SpringSecurityMybatis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return ResponseEntity.ok().body(userService.getUserInfo(id));
    }

    @GetMapping("/user/me")
    public ResponseEntity<?> getUserMe() {
        PrincipalUser principalUser =
                (PrincipalUser) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal();
        return ResponseEntity.ok().body(userService.getUserInfo(principalUser.getId()));    // 토큰안에 들어있는 아이디. 그러려면 토큰이 유효해야 함.
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok().body(userService.deleteUser(id));
    }

    @PatchMapping("/user/img")      // patch 요청 : null 값을 허용하지 않는다. 만약 img 가 빈값으로 들어오면 default img(기본 프로필)로 바꿀 것이다.
    public ResponseEntity<?> updateProfileImg(@RequestBody ReqProfileImgDto dto) {
        return ResponseEntity.ok().body(userService.updateProfileImg(dto));
    }
}
