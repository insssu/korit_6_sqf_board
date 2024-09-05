

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { get } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const storage = getStorage(app);

// firebaseConfig 라는 녀석을 initiaializeApp에 호출해서 쓰고있음.
// 그러면 firebase 앱에 연결되고, 이 정보를 가지고 설정을 하면, app이라는게 만들어 짐
// 여기선 다양하게 get으로 불러올 수 있는게 많은데, getFireStore 등 firebase에서 들고올 수 있는 것이 많음
// 이미지를 firebase에 파일을 올려놓고 이 파일의 위치 주소를 가져와서 쓰는 것
// file 데이터를 가져다 주는 get 요청인 것.
// storage 기능을 객체로 가져와서 외부에서 쓰려는 것.