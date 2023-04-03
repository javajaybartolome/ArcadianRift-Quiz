import React, { useState, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { NavLink, useHistory } from "react-router-dom";
import { getClosest, getSiblings, slideToggle, slideUp } from "../../../utils";
import { withTranslation, useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import * as api from "../../../utils/api";
import { getSystemSettings, isLogin } from "../../../utils";
import config from "../../../utils/config";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
const MobileNavMenu = ({ t }) => {
    const { currentUser, signout } = useAuth();
    const history = useHistory();
    const [languageValue, setLanguageValue] = useState("");
    const [languages, setLanguages] = useState("");
    const [sysConfig, setSysConfig] = useState("");
    const { i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);

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

    const onClickHandler = (e) => {
        const target = e.currentTarget;
        const parentEl = target.parentElement;
        if (parentEl?.classList.contains("menu-toggle") || target.classList.contains("menu-toggle")) {
            const element = target.classList.contains("icon") ? parentEl : target;
            const parent = getClosest(element, "li");
            const childNodes = parent.childNodes;
            const parentSiblings = getSiblings(parent);
            parentSiblings.forEach((sibling) => {
                const sibChildNodes = sibling.childNodes;
                sibChildNodes.forEach((child) => {
                    if (child.nodeName === "UL") {
                        slideUp(child, 1000);
                    }
                });
            });
            childNodes.forEach((child) => {
                if (child.nodeName === "UL") {
                    slideToggle(child, 1000);
                }
            });
        }
    };

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

    return (
        <nav className="site-mobile-menu">
            <ul>
                <li className="has-children">
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
                </li>
                {currentUser ? (
                    <li className="has-children">
                        <NavLink to="#">
                            <span className="menu-text">{currentUser.name ? currentUser.name : currentUser.email}</span>
                        </NavLink>
                        <span className="menu-toggle" onClick={onClickHandler}>
                            <i className="">
                                <FaAngleDown />
                            </i>
                        </span>
                        <ul className="sub-menu">
                            <li>
                                <NavLink to={"/Profile"}>
                                    <span className="menu-text">{t("Profile")}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={""} onClick={handleSignout}>
                                    <span className="menu-text">{t("Logout")}</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                ) : (
                    ""
                )}

                <li>
                    <NavLink to={"/"}>
                        <span className="menu-text">{t("Home")}</span>
                    </NavLink>
                </li>
                {!currentUser ? (
                    <>
                        <li>
                            <NavLink to={"/Login"}>
                                <span className="menu-text">{t("Login")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/SignUp"}>
                                <span className="menu-text">{t("Sign Up")}</span>
                            </NavLink>
                        </li>
                    </>
                ) : (
                    ""
                )}
                <li>
                    <NavLink to={"/Quizplay"}>
                        <span className="menu-text">{t("Quiz Play")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Bookmark"}>
                        <span className="menu-text">{t("bookmark")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Invitefriends"}>
                        <span className="menu-text">{t("Invite Friends")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Instruction"}>
                        <span className="menu-text">{t("Instruction")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Leaderboard"}>
                        <span className="menu-text">{t("LeaderBoard")}</span>
                    </NavLink>
                </li>

                <li className="has-children">
                    <NavLink to="#">
                        <span className="menu-text">{t("More")}</span>
                    </NavLink>
                    <span className="menu-toggle" onClick={onClickHandler}>
                        <i className="">
                            <FaAngleDown />
                        </i>
                    </span>
                    <ul className="sub-menu">
                        <li>
                            <NavLink to={"/contact-us"}>
                                <span className="menu-text">{t("Contact Us")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/about-us"}>
                                <span className="menu-text">{t("About Us")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/terms-conditions"}>
                                <span className="menu-text">{t("Terms and Conditions")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/privacy-policy"}>
                                <span className="menu-text">{t("Privacy Policy")}</span>
                            </NavLink>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default withTranslation()(MobileNavMenu);
