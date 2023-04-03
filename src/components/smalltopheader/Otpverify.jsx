import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import { withTranslation } from "react-i18next";
import { Form } from "react-bootstrap";
import { FaCamera, FaMobileAlt, FaUserCircle } from "react-icons/fa";
import Header from "../../partials/header/Header";
import { auth, firebase } from "../../firebase";
import * as api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import config from "../../utils/config.js";
import "react-phone-input-2/lib/style.css";
const Otpverify = ({ t }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmResult, setConfirmResult] = useState("");
    const [verficationCode, setVerificationCode] = useState("");
    const [userId, setUserId] = useState("");
    const [isSend, setIsSend] = useState(false);
    const [newUserScreen, setNewUserScreen] = useState(false);
    const [showReferCode, setShowReferCode] = useState(false);
    const [profile, setProfile] = useState({ name: "", mobile: "", email: "", profile: "", all_time_rank: "", all_time_score: "", coins: "" });
    const [load, setLoad] = useState(false);
    const history = useHistory();
    const { setUserDetails } = useAuth();

    useEffect(() => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
            size: "invisible",
            // other options
        });
        return () => {
            window.recaptchaVerifier.clear();
        };
    }, []);

    // Validation
    const validatePhoneNumber = (phone_number) => {
        var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
        return regexp.test(phone_number);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setLoad(true);
        var phone_number = "+" + phoneNumber;
        if (validatePhoneNumber(phone_number)) {
            const appVerifier = window.recaptchaVerifier;
            auth.signInWithPhoneNumber(phone_number, appVerifier)
                .then((response) => {
                    // success
                    setIsSend(true);
                    setLoad(false);
                    setConfirmResult(response);
                })
                .catch((error) => {
                    window.recaptchaVerifier.render().then(function (widgetId) {
                        window.recaptchaVerifier.reset(widgetId);
                    });
                    toast.error(error.message);
                    setLoad(false);
                });
        } else {
            setLoad(false);
            toast.error(t("Please Enter correct Mobile Number with Country Code"));
        }
    };
    const resendOtp = (e) => {
        e.preventDefault();
        setLoad(true);
        var phone_number = "+" + phoneNumber;
        const appVerifier = window.recaptchaVerifier;
        auth.signInWithPhoneNumber(phone_number, appVerifier)
            .then((response) => {
                setIsSend(true);
                setLoad(false);
                setConfirmResult(response);
                toast.success(t("OTP has been sent"));
            })
            .catch((error) => {
                window.recaptchaVerifier.render().then(function (widgetId) {
                    window.recaptchaVerifier.reset(widgetId);
                });
                toast.error(error.message);
                setLoad(false);
            });
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        setLoad(true);
        confirmResult
            .confirm(verficationCode)
            .then((response) => {
                setLoad(false);
                setProfile(response.user);
                if (response.additionalUserInfo.isNewUser) {
                    //If new User then show the Update Profile Screen
                    setNewUserScreen(true);
                } else {
                    var firebase_id = response.user.uid;
                    var phone = response.user.phoneNumber;
                    var image_url = response.user.photoURL;
                    var email = response.user.email;
                    var name = response.user.displayName;
                    var fcm_id = null;
                    var friends_code = null;
                    api.userAuth(firebase_id, "mobile", name, email, image_url, phone, fcm_id, friends_code).then((response) => {
                        if (response.error) {
                            toast.error(t("Error") + " :" + response.message);
                        } else {
                            setUserDetails(response.data);
                            setUserId(response.uid);
                            toast.success(t("Successfully Verified") + ` : ${userId}`);
                            history.push("/");
                        }
                    });
                }
            })
            .catch((error) => {
                setLoad(false);
                window.recaptchaVerifier.render().then(function (widgetId) {
                    window.recaptchaVerifier.reset(widgetId);
                });
                toast.error(t("Error") + " :" + error.message);
            });
    };

    const onChangePhoneNumber = (e) => {
        e.preventDefault();
        setVerificationCode("");
        setConfirmResult(null);
        setIsSend(false);
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
        var userAuth = await api.userAuth(firebase_id, "mobile", name, email, image_url, phone, fcm_id, friends_code);
        setUserDetails(userAuth.data);
        if (profile.image) {
            api.updateUserProfileImage(profile.image);
        }
        if (!userAuth.error) {
            history.push("/");
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
        console.log(field_name);
        console.log(field_value);
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
            <div className="otpverify wrapper loginform">
                {!newUserScreen ? (
                    <div className="container glassmorcontain">
                        <div className="row morphisam">
                            <div className="col-md-6 col-12">
                                <div className="inner__login__img justify-content-center align-items-center d-flex">
                                    <img src={process.env.PUBLIC_URL + "/images/login/otp_img.webp"} alt="otp" />
                                </div>
                            </div>
                            <div className="col-md-6 col-12 border-line position-relative">
                                <div className="inner__login__form outerline">
                                    <h3 className="mb-4 text-uppercase ">{t("Otp Verification")}</h3>

                                    {!isSend ? (
                                        <form className="form text-start" onSubmit={onSubmit}>
                                            <div>
                                                <label htmlFor="number" className="text-white mb-3">
                                                    {t("Please Enter mobile number")} :
                                                </label>
                                                <PhoneInput
                                                    value={phoneNumber}
                                                    country={config.DefaultCountrySelectedInMobile}
                                                    countryCodeEditable={false}
                                                    autoFocus={true}
                                                    onChange={(phone) => setPhoneNumber(phone)}
                                                    className="mb-3 position-relative d-inline-block w-100 form-control"
                                                />
                                                <div className="send-button mt-3">
                                                    <button className="btn btn-primary" type="submit">
                                                        {!load ? t("Request OTP") : t("Please Wait")}
                                                    </button>
                                                    <Link className="btn btn-dark backlogin" to={"/Login"} type="button">
                                                        {t("Back to Login")}
                                                    </Link>
                                                </div>
                                            </div>
                                        </form>
                                    ) : null}
                                    {isSend ? (
                                        <form className="form text-start" onSubmit={handleVerifyCode}>
                                            <div className="form">
                                                <label htmlFor="code" className="text-white mb-3">
                                                    {t("Enter your OTP")} :
                                                </label>
                                                <input type="number" placeholder={t("Enter your OTP")} onChange={(e) => setVerificationCode(e.target.value)} className="form-control p-3" required />
                                                <div className="text-end">
                                                    <u>
                                                        <Link className="main-color" to="#" onClick={resendOtp}>
                                                            {t("Resend OTP")}
                                                        </Link>
                                                    </u>
                                                </div>
                                                <div className="btn-group">
                                                    <div className="verify-code">
                                                        <button className="btn btn-primary" type="submit">
                                                            {!load ? t("Submit") : t("Please Wait")}
                                                        </button>
                                                    </div>
                                                    <div className="back-button">
                                                        <button type="button" className="btn btn-dark" onClick={onChangePhoneNumber}>
                                                            {t("Back")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : null}
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

                                                <Form.Group className="mb-3  d-flex" controlId="formBasicCheckbox">
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
                <div id="recaptcha-container"></div>
            </div>
        </React.Fragment>
    );
};

export default withTranslation()(Otpverify);
