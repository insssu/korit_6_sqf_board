package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    int save(Comment comment);
    List<Comment> findAllByBoardId(Long boardId);       // db에서 order by를 썼다. 순서를 줬다 하면 List(순서를 신경쓰는) 사용해야 한다. Set 은 순서 신경안쓰니까 뒤죽박죽 됨
    int getCommentCountByBoardId(Long boardId);
    int deleteById(Long id);
    Comment findById(Long id);
    Comment findByParentId(Long parentId);
}

// repository 는 데이터베이스와 요청 응답 하는 곳
// JDBC 를 편하게 쓰려고 mybatis 사용중. jpa도 마찬가지.
