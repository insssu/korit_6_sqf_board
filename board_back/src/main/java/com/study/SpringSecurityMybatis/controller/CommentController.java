package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.dto.request.ReqWriteCommentDto;
import com.study.SpringSecurityMybatis.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentController {

    @Autowired
    private CommentService commentService;

    // 댓글 작성하는 작업
    @PostMapping("/board/comment")
    public ResponseEntity<?> writeComment(@RequestBody ReqWriteCommentDto dto) {
        commentService.write(dto);
        return ResponseEntity.ok().body(true);
    }

    // 댓글 리스트를 가져오는 작업
    @GetMapping("/board/{boardId}/comment")
    public ResponseEntity<?> getComments(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(commentService.getComments(boardId));
    }
}
