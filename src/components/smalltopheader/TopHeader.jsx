import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Modal, Button } from "antd";
import { toast } from "react-toastify";
import { FaRegBell } from "react-icons/fa";
import { withTranslation, useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../utils/api";
import { getSystemSettings, isLogin } from "../../utils";
import config from "../../utils/config";

const MySwal = withReactContent(Swal);

const TopHeader = ({ t }) => {
    const { i18n } = useTranslation();
    //passing route
    const history = useHistory();
    //handle signout
    const { signout } = useAuth();
    //user selector
    const { currentUser } = useAuth();

    //notification
    const [notificationmodal, setNotificationModal] = useState(false);

    const handleSignout = () => {
        MySwal.fire({
            title: t("Logout"),
            text: t("Are you sure"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("Logout"),
        }).then((result) => {
            if (result.isConfirmed) {
                signout();
                history.push("/");
            }
        });
    };

    // language selector
    const [languageValue, setLanguageValue] = useState("");
    const [languages, setLanguages] = useState("");
    const [sysConfig, setSysConfig] = useState("");

    const [notifications, setNotifications] = useState([]);

    const languageChange = (data) => {
        setLanguageValue(data.language);
        selectUserLanguage(data);
    };

    const selectUserLanguage = (data) => {
        localStorage.setItem("language", JSON.stringify(data));
        setLanguageValue(data.language);
        i18n.changeLanguage(data.code);
    };

    const getUserSelectedLanguage = () => {
        var user_selected_lang = localStorage.getItem("language");
        if (user_selected_lang && user_selected_lang !== undefined) {
            user_selected_lang = JSON.parse(user_selected_lang);
        }
        return user_selected_lang;
    };

    //api render

    useEffect(() => {
        setSysConfig(getSystemSettings());
        api.getLanguages().then((response) => {
            if (!response.error) {
                setLanguages(response.data);
                var user_selected_lang = getUserSelectedLanguage();
                if (user_selected_lang) {
                    selectUserLanguage(user_selected_lang);
                } else {
                    var index = response.data.filter((data) => {
                        return data.code === config.defaultLanguage;
                    });
                    selectUserLanguage(index[0]);
                }
            }
        });
        if (isLogin()) {
            api.getNotifications(null, "DESC", 0, 10).then((response) => {
                if (!response.error) {
                    setNotifications(response.data);
                }
            });
        }
    }, []);

     // server image error
     const imgError = (e) => {
        e.target.src = "/images/user.webp"
     }

    return (
        <React.Fragment>
            <div className="small__top__header">
                <div className="row justify-content-between align-items-center">
                    <div className="col-md-6 col-12">
                        {sysConfig && sysConfig.language_mode === "1" ? (
                            <div className="dropdown__language">
                                <DropdownButton className="inner-language__dropdown" title={languageValue ? languageValue : "Select Language"}>
                                    {languages &&
                                        languages.map((data, key) => {
                                            return (
                                                <Dropdown.Item onClick={() => languageChange(data)} value={languageValue} id={data.id} active={languageValue === data.language ? "active" : ""} key={data.language}>
                                                    {data.language}
                                                </Dropdown.Item>
                                            );
                                        })}
                                </DropdownButton>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>

                    <div className="col-md-6 col-12">
                        <div className="top_header_right">
                            <div className="login__sign__form">
                                {isLogin() && currentUser ? (
                                    <DropdownButton id="dropdown-basic-button" title={`${t("hello")} ${currentUser.name ? currentUser.name : currentUser.email}`} className="dropdown__login">
                                        <Dropdown.Item onClick={() => history.push("/Profile")}>{t("Profile")}</Dropdown.Item>
                                        <Dropdown.Item onClick={handleSignout} selected>
                                            {t("Logout")}
                                        </Dropdown.Item>
                                    </DropdownButton>
                                ) : (
                                    <div>
                                        <span>
                                            <Link to={"/Login"} className="login">
                                                {t("Login")}
                                            </Link>
                                        </span>
                                        <span>
                                            <Link to={"/SignUp"} className="signup">
                                                {t("Sign Up")}
                                            </Link>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="notification">
                                {isLogin() ? (
                                    <Button className="notify_btn" onClick={() => setNotificationModal(true)}>
                                        <FaRegBell />
                                    </Button>
                                ) : (
                                    ""
                                )}
                                <Modal title={t("Notification")} centered visible={notificationmodal} onOk={() => setNotificationModal(false)} onCancel={() => setNotificationModal(false)} footer={null} className="custom_modal_notify">
                                    {notifications.length ? (
                                        notifications.map((data, key) => {
                                            return (
                                                <div key={key} className="outer_noti">
                                                    <img className="noti_image" src={data.image ? data.image : process.env.PUBLIC_URL + "/images/user.webp"} alt="notication" id="image" onError={imgError}/>
                                                    <div className="noti_desc">
                                                        <p className="noti_title">{data.title}</p>
                                                        <p>{data.message}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <h5 className="text-center text-black-50">{t("No Data found")}</h5>
                                    )}
                                </Modal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
export default withTranslation()(TopHeader);
