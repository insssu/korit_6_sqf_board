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

function SearchBoardPage(props) {
    const navigate = useNavigate();
    const [ searchParams, setSearchParams ] = useSearchParams();    // 주소 : 포트/페이지URL?key=value(쿼리스트링, 파람스)
    const [ totalPageCount, setTotalPageCount ] = useState(1);
    const [ searchValue, setSearchValue ] = useState(searchParams.get("search") ?? "");           // 해당 input에서 입력이 일어나면 상태가 바뀔 수 있도록.
    const [ searchOption, setSearchOption ] = useState(searchParams.get("option") ?? "all");      // ?? 는 앞의 값이 null 이라면~ 뒤를 출력
    const limit = 10;

    const boardList = useQuery(
        ["boardListQuery", searchParams.get("page"), searchParams.get("option"), searchParams.get("search")],   // searchParams.get("page") 이 바뀔 때 마다 boardListQuery를 다시 실행하겠다. 
        async () => await instance.get(`/board/search?page=${searchParams.get("page")}&limit=${limit}&search=${searchValue}&option=${searchOption}`),  // limit 은 한번에 보이는 페이지 수의 제한을 둔 것. limit 을 변경하는건 어떤때인가? 10개씩 보기, 20개씩 보기 등 사용자가 원하는 갯수가 있을 때
        {
            retry: 0,
            refetchOnWindowFocus: false,        // 검색을 눌렀을 때만 research가 되도록. 실시간으로 계속 업데이트가 되어야 한다? 그러면 true
            onSuccess: response => {setTotalPageCount(
                response.data.totalCount % limit === 0 
                ? response.data.totalCount / limit 
                : Math.floor(response.data.totalCount / limit) + 1);
                console.log(response)
            }
        }
    );

    const handleSearchOptionOnChange = (e) => {
        setSearchOption(e.target.value);
    }

    // 검색기능은 페이지를 넘겨도 상태가 유지가 되어야 한다.
    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleSearchButtonOnClick = () => {
        navigate(`/board/search?page=1&option=${searchOption}&search=${searchValue}`)   // 검색을 하면 페이지는 무조건 1번 페이지로 이동해야 한다
    }

    
  
    const handlePageOnChange = (e) => {
        navigate(`/board/search?page=${e.selected + 1}&option=${searchOption}&search=${searchValue}`)    // 페이지가 랜더링되는 컴포넌트는 변하지 않고 그 안의 값(QueryString)이 바뀐다. 즉, 화면은 그대로지만 안의 내용이 바뀌는 것.
    };

    return (
        <div>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <div>
                <select onChange={handleSearchOptionOnChange} value={searchOption} >
                    <option value="all">전체</option>
                    <option value="title">제목</option>
                    <option value="writer">작성자</option>
                </select>
                <input type="search" onChange={handleSearchInputOnChange} value={searchValue} />
                <button onClick={handleSearchButtonOnClick} >검색</button>  
            </div>
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
                        boardList.data?.data?.boards?.map(board =>
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

export default SearchBoardPage;