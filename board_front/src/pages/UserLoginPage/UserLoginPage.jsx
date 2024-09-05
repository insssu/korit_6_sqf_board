import { css } from '@emotion/react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signinApi } from '../../apis/signinApi';
import { instance } from '../../apis/util/instance';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    margin: 0px auto;
    width: 460px;

`;

const logo = css`
    font-size: 24px;
    margin-bottom: 40px;

`;

const loginInfoBox = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    width: 100%;

    & input {
        box-sizing: border-box;
        border: none;
        outline: none;
        width: 100%;
        height: 50px;
        flex-grow: 50px;
        font-size: 16px;
    }

    & p {
        margin: 0px 0px 10px 10px;
        color: #ff2f2f;
        font-size: 12px;
    }

    & div {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dbdbdb;
        border-bottom: none;
        padding: 0px 20px;
    }

    & div:nth-of-type(1) {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    & div:nth-last-of-type(1) {
        border-bottom: 1px solid #dbdbdb;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }
`;

const loginButton = css`
    border: none;
    border-radius: 10px;
    width: 100%;
    height: 50px;
    background-color: #999999;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
`;
    
function UserLoginPage(props) {
    const navigate = useNavigate();

    const [ inputUser, setInputUser ] = useState({
        username: "",
        password: "",
    });

    const [ fieldErrorMessages, setFieldErrorMessages ] = useState({
        username: <></>,
        password: <></>,
    });

    // input의 상태가 변할 때 유저객체를 하나 만들어 주는 것
    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }


    const showFieldErrorMessage = (fieldErrors) => {
        let emptyFieldErrors = {
            username: <></>,
            password: <></>,
        };

        for (let fieldError of fieldErrors) {
            emptyFieldErrors = {
                ...emptyFieldErrors,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>
            }
        }

        setFieldErrorMessages(emptyFieldErrors);
    }

    const handleLoginSubmitOnClick = async () => {
        const signinData = await signinApi(inputUser);
        if (!signinData.isSuccess) {
            if (signinData.errorStatus === 'fieldError') {
                showFieldErrorMessage(signinData.error);
            }
            if (signinData.errorStatus === 'loginError') {
                let emptyFieldErrors = {
                    username: <></>,
                    password: <></>,
                };
                setFieldErrorMessages(emptyFieldErrors);
                alert(signinData.error);
            }
            return;
        }
        
        localStorage.setItem("accessToken", "Bearer " + signinData.token.accessToken);

        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken");
            return config;      // instanse에서 방금 전 로그인 한 새로운 token값을 headers에 넣어준 것.
        });

        if (window.history.length > 2) {        // tap(새 창) -> index(home) -> login : length = 3
            navigate(-1);                       //               index(home) <- login : navigate(-1)
            return;
        }
        navigate("/");   // navigate는 상태가 유지된 채로 요청이 가지만, window. 을 해주면 주소창에 입력해서 넘어가는 것과 같다.
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={loginInfoBox}>
                <div>
                    <input type="text" name='username' onChange={handleInputUserOnChange} value={inputUser.username} placeholder='아이디'/>
                    {fieldErrorMessages.username}
                </div>    
                <div>
                    <input type="password" name='password' onChange={handleInputUserOnChange} value={inputUser.password} placeholder='비밀번호 '/>
                    {fieldErrorMessages.password}
                </div>    
            </div>
            <button css={loginButton} onClick={handleLoginSubmitOnClick} >로그인</button>
            <a href="http://localhost:8080/oauth2/authorization/google">구글 로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/naver">네이버 로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/kakao">카카오 로그인</a>
        </div>
    );
}
export default UserLoginPage;