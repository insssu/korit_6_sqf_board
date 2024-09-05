/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React from 'react';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

const layout = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 100px 300px;
    
`;

const header = css`
    display: flex;
    justify-content: center;
    margin-bottom: 40px;

    & > input {
        box-sizing: border-box;
        width: 50%;
        height: 50px;
        border-radius: 50px;
        padding: 10px 20px;

    }
`;

const main = css`
    display: flex;
    justify-content: space-between;
`;

const leftBox = css`
    box-sizing: border-box;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 64%;
`;

const rightBox = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 10px;
    width: 35%;
    padding: 20px;

    & > button {
        margin-bottom: 10px;
        width: 100%;
        height: 40px;
        font-size: 16px;
        font-weight: 600;
    }

    & > div {
        display: flex;
        justify-content: center;
        width: 100%;

        & > a:not(:nth-last-of-type(1))::after {
            display: inline-block;
            content: "";
            margin: 0px 5px;
            height: 60%;
            border-left: 1px solid #222222;
        }
    }
`;

const userInfoBox = css`
    display: flex;
    justify-content: flex-start;
    width: 100%;

`;

const profileImgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 64px;
    height: 64px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }
`;

const profileInfo = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    flex-grow: 1;

    & > button {
        box-sizing: border-box;
        border: 1px solid #dbdbdb;
        border-radius: 37px;
        padding: 5px 10px;
        height: 37px;
        background-color: #ffffff;
        color: #555555;
        font-size: 16px;
        cursor: pointer;
    }
`;

function IndexPage(props) {     
    const navigate = useNavigate();

    const queryClient = useQueryClient();  // 상위에서 데이터를 가져온 후에 이 문장을 실행 해줘야 한다
    const userInfoState = queryClient.getQueryState("userInfoQuery");
    const accessTokenValidState = queryClient.getQueryState("accessTokenValidQuery");
    // const data = queryClient.getQueriesData("accessTokenValidQuery");      // 가지고 오고 싶은 쿼리 키값을 넣어주면 된다.
    // const state = queryClient.getQueryState("accessTokenValidQuery"); 

    console.log(accessTokenValidState);
    console.log(userInfoState);
    // console.log(data);
    // console.log(state);
    

    const handleLoginButtonOnClick = () => {
        navigate("/user/login");
    }

    const handleLogoutButtonOnLick = () => {
        localStorage.removeItem("accessToken");
        window.location.replace("/");
    }

    return (
        <div css={layout}>
            <header css={header}>
                <input type="search" placeholder='검색어를 입력해 주세요'/>
            </header>

            <main css={main}>
                <div css={leftBox}>
                    <Link to={"/board"}>게시글</Link>
                    <Link to={"/board/write"}>글쓰기</Link>
                </div>
                {
                        accessTokenValidState.status !== "success"
                    ?
                        accessTokenValidState.status !== "error"        // 둘 중 하나는 idle 이거나 loading 중일테니
                    ?
                        <></>
                    :
                        <div css={rightBox}>
                            <p>더 안전하고 편리하게 이용하세요</p>
                            <button onClick={handleLoginButtonOnClick}>로그인</button>
                            <div>
                                <Link to={"/user/help/id"}>아이디 찾기</Link>
                                <Link to={"/user/help/pw"}>비밀번호 찾기</Link>
                                <Link to={"/user/join"}>회원가입</Link>
                            </div>
                        </div>
                    :
                        <div css={rightBox}>
                            <div css={userInfoBox}>
                                <div css={profileImgBox} onClick={() => navigate("/profile")}>
                                    <img src={userInfoState?.data?.data.img} alt="" />
                                </div>
                                <div css={profileInfo}>
                                    <div>
                                        <div>{userInfoState.data?.data.username}님</div>
                                        <div>{userInfoState.data?.data.email}</div>
                                    </div>
                                    <button onClick={handleLogoutButtonOnLick}>로그아웃</button>
                                </div>
                            </div>
                        </div>
                }

            </main>

            
            {/* 아래 코드는 로그인 상태일 때, 새로고침시에 로그인 전 페이지가 잠깐 랜더링 되는 경우가 고쳐지지 않음
            {
                accessTokenValidState.status !== "success" || userInfoState.status !== "success" 
                ? <></> 
                :
                <main css={main}>
                    <div css={leftBox}></div>
                    {
                        userInfoState.status === "success" && 
                        
                        <div css={rightBox}>
                            <div css={userInfoBox}>
                                <div css={profileImgBox}>
                                    <img src="" alt="" />
                                </div>
                                <div css={profileInfo}>
                                    <div>
                                        <div>{userInfoState.data.data.username}님</div>
                                        <div>{userInfoState.data.data.email}</div>
                                    </div>
                                    <button onClick={handleLogoutButtonOnLick}>로그아웃</button>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        userInfoState.status !== "success" && 
                        <div css={rightBox}>
                            <p>더 안전하고 편리하게 이용하세요</p>
                            <button onClick={handleLoginButtonOnClick}>로그인</button>
                            <div>
                                <Link to={"/user/help/id"}>아이디 찾기</Link>
                                <Link to={"/user/help/pw"}>비밀번호 찾기</Link>
                                <Link to={"/user/join"}>회원가입</Link>
                            </div>
                        </div>
                    }
                </main>
            } */}
        </div>
    );
}

export default IndexPage;