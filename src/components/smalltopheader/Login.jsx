import React, { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaLock, FaCamera, FaMobileAlt, FaUserCircle, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Form, Button } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { googleProvider, facebookprovider } from "../../firebase";
import { auth } from "../../firebase";
import * as api from "../../utils/api";
import Header from "../../partials/header/Header";
import config from "../../utils/config";
import Footer from "../../partials/footer/Footer";

function Login({ t }) {
    const [loading, setLoading] = useState(false);

    const [newUserScreen, setNewUserScreen] = useState(false);

    const [showReferCode, setShowReferCode] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        mobile: "",
        email: "",
        profile: "",
        all_time_rank: "",
        all_time_score: "",
        coins: "",
    });

    const emailRef = useRef();

    const passwordRef = useRef();

    const history = useHistory();

    const { signin, setUserDetails } = useAuth();

    useEffect(() => {
        api.getLanguages().then((response) => {
            if (!response.error) {
                let user_selected_lang = localStorage.getItem("language");
                if (user_selected_lang && user_selected_lang !== undefined) {
                    user_selected_lang = JSON.parse(user_selected_lang);
                    localStorage.setItem("language", JSON.stringify(user_selected_lang));
                } else {
                    let index = response.data.filter((data) => {
                        return data.code === config.defaultLanguage;
                    });
                    localStorage.setItem("language", JSON.stringify(index[0]));
                }
            }
        });
    }, []);

    //email signin
    const handleSignin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        try {
            var response = await signin(email, password);
            setProfile(response.user);
            setProfile((values) => ({ ...values, auth_type: "email" }));
            if (response.user.emailVerified) {
                var checkUserExists = await api.checkUserExists(response.user.uid);
                if (checkUserExists.error) {
                    toast.error(response.message);
                    return false;
                }
                if (checkUserExists.message === "130") {
                    var firebase_id = response.user.uid;
                    var phone = null;
                    var image_url = response.user.photoURL;
                    var name = null;
                    var fcm_id = null;
                    var friends_code = null;
                    var userAuth = await api.userAuth(firebase_id, "email", name, email, image_url, phone, fcm_id, friends_code);
                    if (!userAuth.error) {
                        setUserDetails(userAuth.data);
                        setNewUserScreen(false);
                        history.push("/Quizplay");
                    }
                } else if (checkUserExists.message === "131") {
                    //If new User then show the Update Profile Screen
                    setNewUserScreen(true);
                }
                setLoading(false);
            } else {
                toast.error(t("Please Verify your Email First"));
                setLoading(false);
            }
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                toast.error(t("User Not Found"));
            } else if (error.code === "auth/wrong-password") {
                toast.error(t("Password is wrong"));
            } else {
                toast.error(error.message);
            }
            setLoading(false);
        }
    };

    //google sign in
    const signInWithGoogle = async (e) => {
        e.preventDefault();
        await auth
            .signInWithPopup(googleProvider)
            .then((response) => {
                setProfile(response.user);
                setProfile((values) => ({ ...values, auth_type: "gmail" }));
                if (response.additionalUserInfo.isNewUser) {
                    //If new User then show the Update Profile Screen
                    setNewUserScreen(true);
                } else {
                    var firebase_id = response.user.uid;
                    var email = response.user.email;
                    var phone = response.user.phoneNumber;
                    var image_url = response.user.photoURL;
                    var name = null;
                    var fcm_id = null;
                    var friends_code = null;
                    api.userAuth(firebase_id, "gmail", name, email, image_url, phone, fcm_id, friends_code).then((response) => {
                        if (response.error) {
                            toast.error(response.message);
                        } else {
                            setUserDetails(response.data);
                            setLoading(false);
                            history.push("/Quizplay");
                        }
                    });
                }
                setLoading(false);
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    //facebook login
    const signInWithfacebook = async (e) => {
        e.preventDefault();
        await auth
            .signInWithPopup(facebookprovider)
            .then((response) => {
                setProfile(response.user);
                setProfile((values) => ({ ...values, auth_type: "fb" }));
                if (response.additionalUserInfo.isNewUser) {
                    //If new User then show the Update Profile Screen
                    setNewUserScreen(true);
                } else {
                    var firebase_id = response.user.uid;
                    var email = response.user.email;
                    var phone = response.user.phoneNumber;
                    var image_url = response.user.photoURL;
                    var name = null;
                    var fcm_id = null;
                    var friends_code = null;
                    api.userAuth(firebase_id, "fb", name, email, image_url, phone, fcm_id, friends_code).then((response) => {
                        if (response.error) {
                            toast.error(response.message);
                        } else {
                            setUserDetails(response.data);
                            setLoading(false);
                            history.push("/Quizplay");
                        }
                    });
                }
                setLoading(false);
            })
            .catch((error) => {
                toast.error(error.message);
                setLoading(false);
            });
    };

    const formSubmit = async (e) => {
        e.preventDefault();
        var firebase_id = profile.uid;
        var email = profile.email;
        var phone = profile.phoneNumber;
        var image_url = profile.photoURL;
        var name = profile.name;
        var fcm_id = null;
        var friends_code = profile.friends_code;
        var auth_type = profile.auth_type;
        var userAuth = await api.userAuth(firebase_id, auth_type, name, email, image_url, phone, fcm_id, friends_code);
        setUserDetails(userAuth.data);
        if (profile.image) {
            api.updateUserProfileImage(profile.image);
        }
        if (!userAuth.error) {
            history.push("/Quizplay");
        } else {
            toast.error(t("Please Try again"));
        }
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        setProfile((values) => ({ ...values, image: e.target.files[0] }));
    };

    const handleChange = (event) => {
        const field_name = event.target.name;
        const field_value = event.target.value;
        setProfile((values) => ({ ...values, [field_name]: field_value }));
    };

    const changeReferCodeCheckbox = () => {
        var state = !showReferCode;
        setShowReferCode(state);
    };

     // server image error
     const imgError = (e) => {
        e.target.src = "/images/user.webp"
    }

    return (
        <React.Fragment>
            <Header />
            <div className="loginform wrapper">
                {!newUserScreen ? (
                    <div className="container glassmorcontain">
                        <div className="row morphisam">
                            <div className="col-lg-6 col-md-12 col-12">
                                <div className="inner__login__img justify-content-center align-items-center d-flex">
                                    <img src={process.env.PUBLIC_URL + "/images/login/login_img.webp"} alt="login" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-12 border-line position-relative">
                                <div className="inner__login__form outerline">
                                    <h3 className="mb-4 text-uppercase ">{t("Login")}</h3>
                                    <Form onSubmit={(e) => handleSignin(e)}>
                                        <Form.Group className="mb-3 position-relative d-inline-block w-100" controlId="formBasicEmail">
                                            <Form.Control type="email" placeholder={t("Enter Your Email")} className="inputelem" ref={emailRef} required={true} defaultValue={config.demo ? "wrteam.demo@outlook.com" : ""} />
                                            <span className="emailicon">
                                                <FaEnvelope />
                                            </span>
                                        </Form.Group>
                                        <Form.Group className="position-relative d-inline-block w-100" controlId="formBasicPassword">
                                            <Form.Control type="password" placeholder={t("Enter Your Password")} className="inputelem" ref={passwordRef} required={true} defaultValue={config.demo ? "123456" : ""} />
                                            <span className="emailicon2">
                                                <FaLock />
                                            </span>
                                        </Form.Group>
                                        <div className="text-end text-small mb-3 resetpassword">
                                            <small>
                                                <Link to={"/ResetPassword"}>{t("Forgot Password")} ?</Link>
                                            </small>
                                        </div>
                                        <Button variant="primary w-100 mb-3" type="submit" disabled={loading}>
                                            {loading ? t("Please Wait") : t("Login")}
                                        </Button>
                                    </Form>
                                    <div className="social__icons">
                                        <ul>
                                            <li>
                                                <button className="social__icons" onClick={signInWithGoogle}>
                                                    <FcGoogle />
                                                </button>
                                            </li>
                                            <li>
                                                <button className="social__icons facebook_icon" onClick={signInWithfacebook}>
                                                    <FaFacebookF />
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="social__icons"
                                                    onClick={() => {
                                                        history.push("Otpverify");
                                                    }}
                                                >
                                                    <FaMobileAlt />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="sign__up">
                                        <p className="">
                                            {t("Dont have account")}&nbsp;
                                            <span>
                                                <Link to="/SignUp" replace>
                                                    {t("Sign Up")}
                                                </Link>
                                            </span>
                                        </p>
                                        <small className="text-center">
                                            {t("user agreement message")}&nbsp;
                                            <u>
                                                <Link className="main-color" to="/terms-conditions">
                                                    {t("Terms and Conditions")}
                                                </Link>
                                            </u>
                                            &nbsp;&nbsp;
                                            <u>
                                                <Link className="main-color" to="/privacy-policy">
                                                    {t("Privacy Policy")}
                                                </Link>
                                            </u>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="Profile__Sec">
                        <div className="container">
                            <div className="row morphism p-5">
                                <form onSubmit={formSubmit}>
                                    <div className="row">
                                        <div className="col-xl-5 col-lg-5 col-md-12 col-12 ">
                                            <div className="card main__profile pt-5 d-flex justify-content-center align-items-center">
                                                <div className="prop__image">
                                                    <img src={profile.profile ? profile.profile : process.env.PUBLIC_URL + "/images/user.webp"} alt="profile" id="user_profile" onError={imgError}/>
                                                    <div className="select__profile">
                                                        <input type="file" name="profile" id="file" onChange={handleImageChange} />
                                                        <label htmlFor="file">
                                                            {" "}
                                                            <em>
                                                                <FaCamera />
                                                            </em>
                                                        </label>
                                                        <input type="text" className="form-control" placeholder="Upload File" id="file1" name="myfile" disabled hidden />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-7 col-lg-7 col-md-12 col-12 border-line">
                                            <div className="card p-4 bottom__card_sec">
                                                <div className="col-md-12 col-12">
                                                    <label htmlFor="fullName">
                                                        <input type="text" name="name" id="fullName" placeholder={t("Enter Your Name")} defaultValue={profile.name} onChange={handleChange} required />
                                                        <i>
                                                            <FaUserCircle />
                                                        </i>
                                                    </label>
                                                </div>

                                                <Form.Group className="mb-3 d-flex" controlId="formBasicCheckbox">
                                                    <Form.Check type="checkbox" id="have_refer_code" label="Do you have Refer Code ?" onChange={changeReferCodeCheckbox} value={"code"} name="code" />
                                                </Form.Group>

                                                {showReferCode ? (
                                                    <div className="col-md-12 col-12">
                                                        <label htmlFor="mobilenumber">
                                                            <input type="text" name="friends_code" id="friends_code" placeholder={t("Refer Code")} defaultValue={profile.friends_code} onChange={handleChange} required />
                                                            <i>
                                                                <FaMobileAlt />
                                                            </i>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    ""
                                                )}
                                                <button className="btn btn-primary text-uppercase" type="submit" value="submit" name="submit" id="mc-embedded-subscribe">
                                                    {t("Submit")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </React.Fragment>
    );
}
export default withTranslation()(Login);
