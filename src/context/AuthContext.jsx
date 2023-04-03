import { useContext, useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { auth } from "../firebase";
import { toast } from "react-toastify";
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

//properties
AuthProvider.propTypes = {
    children: PropTypes.object,
};

export function AuthProvider({ children }) {
    //state
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    const setUserDetails = (userDetails) => {
        localStorage.setItem("user", JSON.stringify(userDetails));
        setCurrentUser(userDetails);
    };

    //signup
    const signup = async (email, password) => {
        let promise = await new Promise(function (resolve, reject) {
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    userCredential.user.sendEmailVerification();
                    auth.signOut();
                    toast.success("Email sent! Please check Email");
                    resolve(userCredential);
                })
                .catch((error) => reject(error));
        });
        return promise;
    };

    //signin
    const signin = async (email, password) => {
        let promise = await new Promise(function (resolve, reject) {
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    resolve(userCredential);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    };

    //signout
    const signout = async () => {
        setCurrentUser(null);
        // localStorage.clear();
        localStorage.removeItem("user");
        localStorage.removeItem("bookmark");
        return await auth.signOut();
    };

    //passwordreset
    const passwordReset = async (email) => {
        let promise = await new Promise(function (resolve, reject) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    resolve(`Password Reset Email sent to ${email}`);
                })
                .catch((error) => {
                    reject(error);
                });
        });

        return promise;
    };

    //set user
    useEffect(() => {
        setLoading(false);
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser && loggedInUser != undefined) {
            try {
                const foundUser = JSON.parse(loggedInUser);
                setCurrentUser(foundUser);
            } catch (e) {}
        }
    }, []);

    //value call
    const value = {
        currentUser,
        signup,
        signin,
        signout,
        passwordReset,
        setUserDetails,
    };

    //provider
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
