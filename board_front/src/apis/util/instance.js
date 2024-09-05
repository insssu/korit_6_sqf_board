import axios from "axios";

export const instance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        Authorization: localStorage.getItem("accessToken"), 
    }
});

// 프로젝트가 처음 랜더링 될 때, 한 번 실행된다. 최초 로그인 시에는 토큰이 없기 때문에 처음 한번은 null이 들어가는 것이 문제인데,
// 이때, "Bearer " + 를 입력해 주고 처리해줘야 한다. 그럼 getItem을 해서 들고오고 
// App.js 에서 토큰검사를 해줄 것이다. (처음에)
// 로그인으로 토큰값이 들어오면 로그인 상태를 그대로 유지하고 있고, 한 번 생성되고 난 후에 페이지를 이동하더라도 로그인이 유지가 되어 있을 수 있음