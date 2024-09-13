/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import ReactPaginate from 'react-paginate';
import { css } from '@emotion/react';
import { useQuery } from 'react-query';
import { instance } from '../../../apis/util/instance';

const paginateContainer = css`
    & > ul {
        list-style-type: none;
        display: flex;

        & > li {
            margin: 0px 5px;
        }

        & a {
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #dbdbdb;
            border-radius: 30px;
            padding: 0px 5px;
            min-width: 32px;
            height: 32px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        & .active { 
            border-radius: 32px;
            background-color: #bbbbbb;
            color: #ffffff;
        }
    }
    
`;

function NumberBoardListPage(props) {
    const [ searchParams, setSearchParams ] = useSearchParams();    // 주소 : 포트/페이지URL?key=value(쿼리스트링, 파람스)
    const [ totalPageCount, setTotalPageCount ] = useState(1);
    const navigate = useNavigate();
    const limit = 10;

    const boardList = useQuery(
        ["boardListQuery", searchParams.get("page")],   // searchParams.get("page") 이 바뀔 때 마다 boardListQuery를 다시 실행하겠다. 
        async () => await instance.get(`/board/list?page=${searchParams.get("page")}&limit=${limit}`),  // limit 은 한번에 보이는 페이지 수의 제한을 둔 것.
        {
            retry: 0,
            onSuccess: response => {setTotalPageCount(
                response.data.totalCount % limit === 0 
                ? response.data.totalCount / limit 
                : Math.floor(response.data.totalCount / limit) + 1);
                console.log(response)
            }
        }
    );

    const handlePageOnChange = (e) => {
        navigate(`/board/number?page=${e.selected + 1}`)    // 페이지가 랜더링되는 컴포넌트는 변하지 않고 그 안의 값(QueryString)이 바뀐다. 즉, 화면은 그대로지만 안의 내용이 바뀌는 것.
    };

    return (
        <div>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>추천</th>
                        <th>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        boardList.isLoading
                        ?
                        <></>
                        :
                        boardList.data.data.boards.map(board =>
                            <tr key={board.id} onClick={() => navigate(`/board/detail/${board.id}`)}>
                                <td>{board.id}</td>
                                <td>{board.title}</td>
                                <td>{board.writerName}</td>
                                <td>{board.likeCount}</td>
                                <td>{board.viewCount}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div css={paginateContainer}>
                <ReactPaginate
                    breakLabel="..."
                    previousLabel={<><IoMdArrowDropleft /></>}
                    nextLabel={<><IoMdArrowDropright /></>}
                    pageCount={totalPageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    activeClassName='active'
                    onPageChange={handlePageOnChange}
                    forcePage={parseInt(searchParams.get("page")) - 1}  // parseInt를 해주지 않으면 문자열로 인식하기 때문에
                />
            </div>
        </div>
    );
}

export default NumberBoardListPage;