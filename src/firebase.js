import firebase from "firebase/app";
import config from "./utils/config";
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
};

// eslint-disable-next-line
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const db = firebase.firestore();

const googleProvider = new firebase.auth.GoogleAuthProvider();

const facebookprovider = new firebase.auth.FacebookAuthProvider();

export { auth, googleProvider, facebookprovider, firebase, db };
