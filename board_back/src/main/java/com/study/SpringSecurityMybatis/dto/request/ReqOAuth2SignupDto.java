package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.User;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class ReqOAuth2SignupDto {
    @Pattern(regexp = "^[a-z0-9]{6,}$", message = "사용자이름은 6자이상의 영소문자, 숫자 조합이어야합니다.")
    private String username;
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^&*?])[A-Za-z\\d~!@#$%^&*?]{8,16}$", message = "비밀번호는 8자이상 16자이하의 영대소문, 숫자, 특수문자(~!@#$%^&*?)를 포함하여합니다.")
    private String password;
    private String checkPassword;
    @Pattern(regexp = "^[가-힣]+$", message = "이름은 한글이어야합니다.")
    private String name;
    @NotBlank(message = "이메일은 공백일 수 없습니다") // notblank는 공백검사
    // 이메일은 공백이어도 공백검사를 하지 않기 때문에 비워두고 싶지 않다면 NotBlack를 걸어줘야한다.
    @Email(message = "이메일 형식이어야 합니다.")
    private String email;
    @NotBlank(message = "OAuth2이름을 입력해 주세요.")
    private String oauth2Name;
    @NotBlank(message = "제휴사명을 입력해 주세요.")
    private String provider;

    public User toEntity(BCryptPasswordEncoder passwordEncoder) {
        return User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .name(name)
                .email(email)
                .build();
    }
}
