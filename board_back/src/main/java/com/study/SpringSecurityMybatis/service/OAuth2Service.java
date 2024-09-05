package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqOAuth2SignupDto;
import com.study.SpringSecurityMybatis.entity.Role;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.entity.UserRoles;
import com.study.SpringSecurityMybatis.repository.OAuth2UserMapper;
import com.study.SpringSecurityMybatis.repository.RoleMapper;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.repository.UserRolesMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@Service
public class OAuth2Service implements OAuth2UserService {

    @Autowired
    private DefaultOAuth2UserService defaultOAuth2UserService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private OAuth2UserMapper oAuth2UserMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleMapper roleMapper;
    @Autowired
    private UserRolesMapper userRolesMapper;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2UserService<OAuth2UserRequest, OAuth2User> service = new DefaultOAuth2UserService();
        // 로그인 요청을 날리면 security config에 들어있는 userinfoEndpoint가 동작해서 userService에 정보들을 넘겨줌.
        // 이때, userRequest(dto라고 생각하면 됨)에 넘겨주고, service.loadUser() 에 넘겨주면 oauth2user 를 가져옴
//        OAuth2User oAuth2User = service.loadUser(userRequest); => defaultOAuth2UserService 가 없을 경우.
        OAuth2User oAuth2User = defaultOAuth2UserService.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        Map<String, Object> oAuth2Attributes = new HashMap<>();
        oAuth2Attributes.put("provider", userRequest.getClientRegistration().getClientName());

        switch (userRequest.getClientRegistration().getClientName()) {
            case "Google":
                oAuth2Attributes.put("id", attributes.get("sub").toString());
                break;
            case "Naver":
                attributes = (Map<String, Object>) attributes.get("response");  // naver 는 실제 attributes 가 response 이므로 한번 더 꺼내서 사용해야 한다.
                oAuth2Attributes.put("id", attributes.get("id").toString());
                break;
            case "Kakao":
                oAuth2Attributes.put("id", attributes.get("id").toString());
                break;
        }

        return new DefaultOAuth2User(new HashSet<>(), oAuth2Attributes, "id");  // 이녀석이 successhandler 의 authentication 안의 principal 에서 꺼내 쓸 수 있도록 하는 것
    }   // return이 되는 순간 authentication(인증하는데 중요한 역할) 객체가 만들어진다. 이 객체 안에는 principal 이 있고,
        // principal 안에는 username, password, getter, authorities 가 들어있고, principal 은 두가지 종류가 있다.
        // 1. UserDetail(interface) : getAuthorities(권한), getName, getAttributes(user에서 받아온 정보들을 가지고 오는 것)
        // 2. OAuth2User(interface) : oauth2name
        // 이 둘의 공통점은 getAuthorities(권한) 을 들고있음. 즉, principal 은 권한을 들고 있다.
        // 일반 로그인때는 userDetail을 가지고 들어오고,
        // 중요한 것은 oAuth2 영역만 보지말고 전체적인 security 의 틀을 보자

    public void merge(com.study.SpringSecurityMybatis.entity.OAuth2User oAuth2User) {
        oAuth2UserMapper.save(oAuth2User);
    }

    @Transactional(rollbackFor = Exception.class)   // insert 가 많으니 하나라도 오류나면 rollback 해라 ~
    public void signup(ReqOAuth2SignupDto dto) {
        User user = dto.toEntity(passwordEncoder);
        userMapper.save(user);
        Role role = roleMapper.findByName("ROLE_USER");
        if (role == null) {
            role = Role.builder().name("ROLE_USER").build();
            roleMapper.save(role);
        }
        userRolesMapper.save(UserRoles.builder()
                .userId(user.getId())
                .roleId(role.getId())
                .build());
        oAuth2UserMapper.save(com.study.SpringSecurityMybatis.entity.OAuth2User.builder()
                .userId(user.getId())
                .oAuth2Name(dto.getOauth2Name())
                .provider(dto.getProvider())
                .build());
    }
}
