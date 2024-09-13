import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import UserJoinPage from './pages/UserJoinPage/UserJoinPage';
import UserLoginPage from './pages/UserLoginPage/UserLoginPage';
import { instance } from './apis/util/instance';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import OAuth2JoinPage from './pages/OAuth2JoinPage/OAuth2JoinPage';
import OAuth2LoginPage from './pages/OAuth2LoginPage/OAuth2LoginPage';
import WritePage from './pages/boardPages/WritePage/WritePage';
import DetailPage from './pages/boardPages/DetailPage/DetailPage';
import NumberBoardListPage from './pages/boardPages/NumberBoardListPage/NumberBoardListPage';
import ScrollBoardListPage from './pages/boardPages/ScrollBoardListPage/ScrollBoardListPage';

function App() {
     
    const location = useLocation();
    const navigate = useNavigate();
    const [ authRefresh, setAuthRefresh ] = useState(true);

    useEffect(() => {
        if (!authRefresh) {
            setAuthRefresh(true);
        }
    }, [location.pathname]);

    // const [ refresh, setRefresh ] = useState(false);

    // 주기적으로 정보를 가져오는 것. 서버의 데이터를 가지고 온다(get 요청) useQuery & 특정 시점에 값을 insert 혹은 update, delete 할 때는 use
    const accessTokenValid = useQuery(      // localstorage의 값이 바뀌면 동작을 해야함
        ["accessTokenValidQuery"], // [키값, 디펜던시]
        async () => {              // 요청 메서드
            // setRefresh(false);
            // console.log("쿼리에서 요청")
            setAuthRefresh(false);
            return await instance.get("/auth/access", {
                params: {
                    accessToken: localStorage.getItem("accessToken")
                }
            });
        }, 
        {        // 객체
            // enabled: refresh,       // enabled 의 상태가 true 로 바뀌면 다시 실행시켜 준다. 기존 상태는 false    enabled 는 토큰을 가져올 때, 응답데이터가 있으면 true로 바뀌면서 동기적으로 처리하도록 하는곳에서 많이 쓰임
            //                         // 갔다 온 응답이 200 이든 400 이든 (try catch 가아니라서) refresh 해준다. 
            // // 자주 쓰이는 옵션들 : getNextPageParam (페이지네이션), refetch(새로운 데이터 적용), retry(요청 실패 시에 다시 요청 날리는 것), 
            // //                    refetchInterval(해당 시간마다 요청을 날림) 등 모든 요청들은 enabled가 true 일 때 동작                         
            // refetchOnWindowFocus: false,    // 윈도우에 포커스가 갔을 때 refetch 해라. 데이터를 최신화, 조회하는 용도
            enabled: authRefresh,
            retry: 0,
            refetchOnWindowFocus: false,
            onSuccess: response => {                // 로그인 되어져 있는 상태에서는 다시 로그인페이지로 들어가면 안되니까.
                const permitAllPaths = ["/user"];        
                for (let permitAllPath of permitAllPaths) {
                    if (location.pathname.startsWith(permitAllPath)) {
                        navigate("/");         
                        break;
                    }
                } 
            },
            // onSuccess: response => {        // try catch 문처럼 
            //     // console.log("OK 응답")
            //     console.log(response.data);  // return 의 요청과 응답이 정상이면 success
            // },
            onError: error => {             // 403 이 떳을 경우에 실행한다.
                const authPaths = ["/profile"];        // 에러 상태에서 profile로 시작하면~
                for (let authPath of authPaths) {
                    if (location.pathname.startsWith(authPath)) {
                        navigate("/user/login");         // replace, href 는 완전히 새로운 페이지의 랜더링. navigate 는 기록을 남기고 상태를 날리는 것 
                        break;
                    }
                } 
            }
        }
    );

    const userInfo = useQuery(
        ["userInfoQuery"],
        async () => {
            return await instance.get("/user/me");
        },
        {
            enabled: accessTokenValid.isSuccess && accessTokenValid.data?.data,  // data?.data : axios의 데이터가 존재하면(첫번째 data?.) 참조(두번째 data)
            refetchOnWindowFocus: false,
            // onSuccess: response => {
            //     console.log(response);
            // }
        }
    );

    // console.log(accessTokenValid);

    // console.log("그냥 출력")
    // console.log(accessTokenValid.data);
    // console.log("--------------")
    // console.log(accessTokenValid.status);

    useEffect(() => {
        // const accessToken = localStorage.getItem("accessToken");
        // if (!!accessToken) {    // accessToken 이 쓸 수 있는 것인가를 확인해야 한다.
        //     setRefresh(true);
        // }
        // console.log("useEffect 동작");
    }, [accessTokenValid.data])

    return (
        <Routes>
            <Route path="/" element={ <IndexPage /> }/>
            <Route path="/user/join" element={ <UserJoinPage /> }/>
            <Route path="/user/join/oauth2" element={ <OAuth2JoinPage /> }/>
            <Route path="/user/login" element={ <UserLoginPage /> }/>
            <Route path="/user/login/oauth2" element={ <OAuth2LoginPage /> }/>
            <Route path="/profile" element={ <UserProfilePage /> }/>

            <Route path="/board/number" element={ <NumberBoardListPage /> } />
            <Route path="/board/scroll" element={ <ScrollBoardListPage /> } />
            <Route path="/board/detail/:boardId" element={ <DetailPage /> } />
            <Route path="/board/write" element={ <WritePage /> } />

            <Route path="/admin/*" element={ <></> }/>
            <Route path="/admin/*" element={ <h1>Not Found</h1> }/>
            <Route path="*" element={ <h1>Not Found</h1> }/>
        </Routes>
    );
}

export default App;

/** 경우의 수 먼저 확인
 *  페이지 이동 시 Auth(로그인, 토큰) 확인
 *  1. index(home) 페이지를 먼저 들어가서 로그인 페이지로 이동한 경우           => index로 이동
 *  2. 탭을 열자마자 주소창에 수동입력을 통해 로그인 페이지로 이동한 경우        => index로 이동
 *  3. 로그인 해야 사용 가능한 페이지로 들어갔을 때 로그인 페이지로 이동한 경우    => 이전 페이지
 *  4. 로그인이 된 상태                                                      => 어느 페이지든 이동 가능
 * 
 */
