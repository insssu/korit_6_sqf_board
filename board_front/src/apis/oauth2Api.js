import { instance } from "./util/instance";

export const oauth2MergeApi = async (user) => {
    let mergeData = {
        isSuccess: false,
        fieldError: [
            {
                field: "",
                defaultMessage: ""
            }
        ]
    }

    // 회원가입 후 로그인창으로 보내주면 된다.
    try {   
        const response = await instance.post("/auth/oauth2/merge", user);
        mergeData = {
            isSuccess: true,
        }
        
    } catch (error) {
        const response = error.response;
        console.log(response);
        mergeData = {
            isSuccess: false,
        }
        
        if (typeof(response.data) === 'string') {
            mergeData['errorStatus'] = "loginError";
            mergeData['error'] = response.data;
        } else {
            mergeData['errorStatus'] = "fieldError";
            mergeData['error'] = response.data.map(fieldError => ({
                field: fieldError.field, 
                defaultMessage: fieldError.defaultMessage
            }));
        }
    }

    return mergeData;
}

export const oauth2SignupApi = async (user) => {
    let signupData = {
        isSuccess: false,
        ok: {
            message: "",
            user: null
        },
        fieldErrors: [
            {
                field: "",
                defaultMessage: ""
            }
        ]
    }
    try {
        const response = await instance.post("/auth/oauth2/signup", user);
        signupData = {
            isSuccess: true,
            ok: response.data
        }
    } catch (error) {
        const response = error.response;
        signupData = {
            isSuccess: false,
            fieldErrors: response.data.map(fieldError => ({
                field: fieldError.field, 
                defaultMessage: fieldError.defaultMessage
            })),
        }
    }
    return signupData;
}