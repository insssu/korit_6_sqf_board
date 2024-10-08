package com.study.SpringSecurityMybatis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 스키마에 테이블을 만들면 엔터티에 동일한 구조로 만들어 줘야하는 순서
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Board {
    private Long id;
    private String title;
    private String content;
    private Long userId;
    private int viewCount;

    private User user;

}
