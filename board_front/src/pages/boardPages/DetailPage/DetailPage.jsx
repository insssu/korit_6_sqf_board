/** @jsxImportSource @emotion/react */

import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
import { css } from "@emotion/react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { GoHeart } from "react-icons/go";

const layout = css`
    box-sizing: border-box;
    margin: 50px auto 0px;
    width: 1100px;

`;

const header = css`
    box-sizing: border-box;
    border: 1px solid #dbdbdb;
    padding: 10px 15px;
    & > h1 {
        margin: 0;
        margin-bottom: 25px;
        font-size: 38px;
        cursor: default
    }
`;

const titleAndLike = css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border: none;
        background-color: #ffffff;
        cursor: pointer;

        & > svg {
            font-size: 30px;
        }
    }
`;

const boardInfoContainer = css`
    display: flex;
    justify-content: space-between;

    & span {
        margin-right: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: default;
    }

    & button {
        box-sizing: border-box;
        margin-left: 5px;
        border: 1px solid #dbdbdb;
        padding: 5px 20px;
        background-color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        &:hover {
            background-color: #fafafa;
        }
        &:active {
            background-color: #eeeeee;
        }
    }
`;

const contentBox = css`
    box-sizing: border-box;
    margin-top: 5px;
    border: 1px solid #dbdbdb;
    padding: 0px 15px;
    & img:not(img[width]) {     // 속성에 width 가 아닌 img의 크기를 100%. 크기조정을 가지고있으면 적용을 안하겠다.
        width: 100%;
    }
`;

function DetailPage(props) {
    const navigate = useNavigate();
    const params = useParams();
    const boardId = params.boardId;
    const queryClient = useQueryClient();
    const userInfoData = queryClient.getQueryData("userInfoQuery");
    
    const board = useQuery(
        ["boardQuery", boardId], 
        async () => {
            return instance.get(`/board/${boardId}`)
        }, 
        {
            refetchOnWindowFocus: false,
            retry: 0,
        }
    );

    const boardLike = useQuery(
        ["boardLikeQuery"],
        async () => {
            return await instance.get(`/board/${boardId}/like`)
        },
        {
            refetchOnWindowFocus: false,
            retry: 0,
        }
    );

    const likeMutation = useMutation(
        async () => {
            return await instance.post(`/board/${boardId}/like`)
        },
        {
            onSuccess: response => {
                boardLike.refetch();
            }
        }
    );

    const dislikeMutation = useMutation(
        async () => {
            return await instance.delete(`/board/like/${boardLike.data?.data.boardLikeId}`)
        },
        {
            onSuccess: response => {
                boardLike.refetch();
            }
        }
    );

    const handleLikeOnClick = () => {
        if (!userInfoData?.data) {
            if (window.confirm("로그인 후 이용가능합니다. 로그인 페이지로 이동하시겠습니까?")) {

                navigate("/user/login");
            }
            return;
        }
        likeMutation.mutateAsync();
    };

    const handleDislikeOnClick = () => {
        dislikeMutation.mutateAsync();
    };

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            {
                board.isLoading && <></>
            }
            {
                board.isError && <h1>{board.error.response.data}</h1>
            }
            {
                board.isSuccess && 
                <>
                    <div css={header}>
                        <div css={titleAndLike}>
                            <h1>{board.data.data.title}</h1>
                            <div>
                                {
                                    !!boardLike?.data?.data?.boardLikeId 
                                        ?
                                        <button onClick={handleDislikeOnClick}>
                                            <IoMdHeart />
                                        </button>
                                        :
                                        <button onClick={handleLikeOnClick}>
                                            <IoMdHeartEmpty />
                                        </button>
                                }
                            </div>
                        </div>
                        <div css={boardInfoContainer}>
                            <div>
                                <span>
                                    작성자 : {board.data.data.writerUsername}
                                </span>
                                <span>
                                    조회 : {board.data.data.viewCount}
                                </span>
                                <span>
                                    추천 : {boardLike?.data?.data.likeCount}
                                </span>
                            </div>
                            <div>
                                {
                                    board.data.data.writer === userInfoData?.data.userId &&
                                    <>
                                        <button>수정</button>
                                        <button>삭제</button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div css={contentBox} dangerouslySetInnerHTML={{         // 실제 게시글이 나타나는 구역
                        __html: board.data.data.content
                    }}>

                    </div>
                </>
            }
        </div>
    );
}

export default DetailPage;