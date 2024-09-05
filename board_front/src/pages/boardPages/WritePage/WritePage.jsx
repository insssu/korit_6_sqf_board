import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { css } from '@emotion/react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize';
import { storage } from '../../../firebase/firebase';
import { CircleLoader, RingLoader } from "react-spinners";
import { boardWriteApi } from "../../../apis/boardApi";
import { instance } from "../../../apis/util/instance";
/** @jsxImportSource @emotion/react */

Quill.register("modules/imageResize", ImageResize);

const layout = css`
    box-sizing: border-box;
    margin: 0px auto;
    padding-top: 30px;
    width: 1100px;

`;

const header = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 10px 0px;

    & > h1 {
        margin: 0;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #c0c0c0;
        padding: 6px 15px;
        background-color: white;
        font-size: 12px;
        color: #333333;
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

const titleInput = css`
    box-sizing: border-box;
    margin-bottom: 10px;
    border: 1px solid #c0c0c0;
    outline: none;
    padding: 12px 25px;
    width: 100%;
    font-size: 16px;

`;

const editorLayout = css`
    box-sizing: border-box;
    margin-bottom: 42px;
    width: 100%;
    height: 700px;
`;

const loadingLayout = css`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #00000033;
`;


function WritePage(props) {
    const [ board, setBoard ] = useState({
        title: "",
        content: ""
    })

    const quillRef = useRef(null);
    const [ isUploading, setUploading ] = useState(false);

    const handleWriteSubmitOnClick = async () => {
        instance.post("/board", board)
        .then(response => {
            // 응답 데이터는 response.data에 들어있습니다.
            console.log(response.data);
            
            // 예: 게시글 ID를 꺼내서 사용
            const boardId = response.data.id;
            console.log('게시글 ID:', boardId);
        })
        .catch(error => {
            // 에러 처리
            console.error('Error submitting board:', error);
            const fieldErrors = error.response.data;
            for (let fieldError of fieldErrors) {
                if (fieldError.field === "title") {
                    alert(fieldError.defaultMessage);
                    return;     // alert 하나만 띄우고 싶을 때title이 없다면 이 반복을 빠져나가야 한다는 것을 뜻함. break 가 아닌 return을 써주는 이유
                }
            }
            for (let fieldError of fieldErrors) {
                if (fieldError.field === "content") {
                    alert(fieldError.defaultMessage);
                    return;
                }
            }
        });
    }

    const handleTitleInputOnChange = (e) => {
        setBoard(board => ({
            ...board,
            [e.target.name]: e.target.value,
        }));
    }


    const handleQuillValueOnChange = (value) => {
        
        // 테그 없이 내용 출력
        setBoard(board => ({
            ...board,
            content: quillRef.current.getEditor().getText().trim() === "" ? "" : value,
        }));
    }

    // useCallback : 메모리 재정의하지 않겠다.
    const handleImageLoad = useCallback (() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.click();

        input.onchange = () => {            
            const editor = quillRef.current.getEditor();    // getEditor 은 quill 라이브러리에 이미 정의되어 있는 함수
            const files = Array.from(input.files);
            const imgFile = files[0];
            
            const editPoint = editor.getSelection(true);    // 현재 커서가 선택되어져 있는 위치
            
            const storageRef = ref(storage, `board/img/${uuid()}_${imgFile.name}`)
            const task = uploadBytesResumable(storageRef, imgFile);
            setUploading(true);
            task.on(
                "state_changed",
                () => {},
                () => {},
                async () => {             // success 일 때
                    const url = await getDownloadURL(storageRef);
                    editor.insertEmbed(editPoint.index, "image", url);
                    editor.setSelection(editPoint.index + 1);
                    editor.insertText(editPoint.index + 1, "\n");
                    setUploading(false);
                }
            )
        }
    }, []);

    const toolbarOptions = useMemo(() => [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block'],
      ], []);

    return (
        <div css={layout}>
            <header css={header}>
                <h1>Quill Edit</h1>            
                <button onClick={handleWriteSubmitOnClick}>작성하기</button>
            </header>
            <input css={titleInput} type="text" name="title" onChange={handleTitleInputOnChange} value={board.title} placeholder="게시글의 제목을 입력하세요." />
            <div css={editorLayout}>
                {
                    isUploading &&
                    <div css={loadingLayout}>
                        <RingLoader />
                    </div>
                }
                <ReactQuill 
                    ref={quillRef}
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        height: "100%",
                    }}
                    onChange={handleQuillValueOnChange}
                    modules={{
                        toolbar: {
                            container: toolbarOptions,
                            handlers: {
                                image: handleImageLoad
                            }
                        },
                        imageResize: {
                            parchment: Quill.import("parchment")
                        },
                        
                    }}
                />
            </div>
            <button>임시저장</button>
        </div>
    );
}

export default WritePage;