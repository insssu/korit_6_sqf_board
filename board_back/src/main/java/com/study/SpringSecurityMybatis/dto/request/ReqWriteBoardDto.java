package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.Board;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ReqWriteBoardDto {
    @NotBlank(message = "제목을 입력하세요.")
    private String title;
    @NotBlank(message = "내용을 입력하세요.")
    private String content;

    public Board toEntity(Long userId) {
        return Board.builder()
                .title(title)
                .content(content)
                .userId(userId)
                .build();
    }
}

// 유저 아이디는 로그인된 토큰에서 꺼내와야 한다. 유저 아이디 정보는 contextHolder에 들어있고,
// authentication
