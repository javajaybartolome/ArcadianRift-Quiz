import React from "react";
import { FaAngleDown } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { withTranslation } from "react-i18next";
const NavBar = ({ t }) => {
    return (
        <nav className="site-main-menu">
            <ul>
                <li>
                    <NavLink to={"/"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("Home")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Quizplay"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("Quiz Play")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Bookmark"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("bookmark")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Invitefriends"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("Invite Friends")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Instruction"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("Instruction")}</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={"/Leaderboard"} exact activeClassName="navbar__link--active">
                        <span className="menu-text">{t("LeaderBoard")}</span>
                    </NavLink>
                </li>
                <li className="has-children">
                    <NavLink to="#">
                        <span className="menu-text">{t("More")}</span>
                    </NavLink>
                    <span className="menu-toggle">
                        <i className="">
                            <FaAngleDown />
                        </i>
                    </span>
                    <ul className="sub-menu">
                        <li>
                            <NavLink to={"/contact-us"} exact activeClassName="navbar__link--active">
                                <span className="menu-text">{t("Contact Us")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/about-us"} exact activeClassName="navbar__link--active">
                                <span className="menu-text">{t("About Us")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/terms-conditions"} exact activeClassName="navbar__link--active">
                                <span className="menu-text">{t("Terms and Conditions")}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={"/privacy-policy"} exact activeClassName="navbar__link--active">
                                <span className="menu-text">{t("Privacy Policy")}</span>
                            </NavLink>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default withTranslation()(NavBar);
