import { css } from '@emotion/react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { storage } from '../../firebase/firebase';
import { v4 as uuid} from 'uuid'
import 'react-sweet-progress/lib/style.css';
import { Progress } from "react-sweet-progress"
import { updateProfileImgApi } from '../../apis/userApi';
import { Navigate, useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 100px auto;
    width: 1000px;

`;

const imgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 300px;
    height: 300px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }
`;

const progressBox = css`
    padding-top: 20px;
    width: 300px;
`;

function UserProfilePage(props) {

    const queryClient = useQueryClient();
    const userInfoState = queryClient.getQueryState("userInfoQuery");    
    const [ uploadPercent, setUploadPercent ] = useState(0);
    const navigate = useNavigate();
    
    const handleImageChangeOnClick = () => {
        if (window.confirm("프로필 사진을 변경하시겠습니까?")) {
            const fileInput = document.createElement("input");      // createElement : dom 객체 자체를 생성하는 것
            fileInput.setAttribute("type", "file");
            fileInput.setAttribute("accept", "image/*");            // image 외에는 뿌릴 수 없게 만들어 주는 것
            fileInput.click();

            fileInput.onchange = (e) => {
                const files = Array.from(e.target.files);           // 취소를 누를 때, 기존에 있던 파일도 비어버림
                const profileImage = files[0];
                setUploadPercent(0);
                
                const storageRef = ref(storage, `user/profile/${uuid()}_${profileImage.name}`); // 랜덤한 값을 통해 이미지의 이름이 누군가와 겹치지 않도록 하는 것
                const uploadTask = uploadBytesResumable(storageRef, profileImage);  // storageRef 경로에 profileImage를 담겠다
                uploadTask.on(
                    "state_changed",    // 이벤트명
                    (snapshot) => {     // snapshot 함수 호출. 업로드 중
                        setUploadPercent(
                            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        // console.log(snapshot.totalBytes);           // 실제 파일 데이터
                        // console.log(snapshot.bytesTransferred);     // 전송 중인 데이터
                    },
                    (error) => {        // 업로드 중 에러발생 ( 용량부족 등 )
                        console.error(error);
                    },
                    async (success) => {      // 업로드 성공
                        const url = await getDownloadURL(storageRef)    // firebase에 담아 둔 파일의 주소
                        const response = await updateProfileImgApi(url);
                        queryClient.invalidateQueries(["userInfoQuery"]);   // 쿼리를 강제로 만료시켜 userinfo를 다시 들고온다
                    }
                );    // on 안에는 총 네개의 속성이 들어감.
            }

        }
    };

    const handleDefaultImgChangeOnClick = async () => {
        if (window.confirm("기본이미지로 변경하시겠습니까?")) {
            await updateProfileImgApi("");
            queryClient.invalidateQueries(["userInfoQuery"]);
        }
    }

    const handleGohomeOnClick = () => {
        navigate("/");
    }

    return (
        <div css={layout}>
            <h1>프로필</h1>
            <div css={imgBox} onClick={handleImageChangeOnClick}>
                <img src={userInfoState?.data?.data.img} alt="" />
            </div>
            <div css={progressBox}>
                <Progress percent={uploadPercent} status={uploadPercent !== 100 ? "acive" : "success"} />
            </div>
            <div>
                <button onClick={handleDefaultImgChangeOnClick}>기본 이미지로 변경</button>
                <button onClick={handleGohomeOnClick}>확인</button>
            </div>
        </div>
    );
}

export default UserProfilePage;