import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import SEO from "../components/SEO";
import Header from "../partials/header/Header";
import { FaCamera, FaEnvelope, FaEnvelopeOpenText, FaMobileAlt, FaPhoneAlt, FaRegBookmark, FaSignOutAlt, FaTrashAlt, FaUserCircle } from "react-icons/fa";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import TopHeader from "../components/smalltopheader/TopHeader";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { withTranslation } from "react-i18next";
import config from "../utils/config";
import Footer from "../partials/footer/Footer";

const MySwal = withReactContent(Swal);

const Profile = ({ t }) => {
    const { signout } = useAuth();
    const history = useHistory();

    const [profile, setProfile] = useState({
        name: "",
        mobile: "",
        email: "",
        profile: "",
        all_time_rank: "",
        all_time_score: "",
        coins: "",
    });
    const [statistics, setStatistics] = useState({
        correct_answers: 0,
        questions_answered: 0,
    });
    const [load, setLoad] = useState(false);

    useEffect(() => {
        var user = localStorage.getItem("user");
        if (user) {
            setProfile(JSON.parse(user));
        }
        api.getUserProfile().then((response) => {
            if (!response.error) {
                setProfile(response.data);
            }
        });

        api.getUserStatistics().then((response) => {
            if (!response.error) {
                setStatistics(response.data);
            }
        });
    }, []);

    const handleChange = (event) => {
        const field_name = event.target.name;
        const field_value = event.target.value;
        if (field_name === "mobile" && event.target.value.length > 16) {
            event.target.value = field_value.slice(0, event.target.maxLength);
            return false;
        }
        setProfile((values) => ({ ...values, [field_name]: field_value }));
    };

    const formSubmit = (e) => {
        e.preventDefault();
        setLoad(true);
        if (!config.demo) {
            api.updateUserProfile(profile.name, profile.mobile)
                .then((response) => {
                    if (!response.error) {
                        var user = JSON.parse(localStorage.getItem("user"));
                        var data = {
                            ...user,
                            name: response.data.name,
                            mobile: response.data.mobile,
                        };
                        localStorage.setItem("user", JSON.stringify(data));
                        toast.success(t("user success message"));
                    } else {
                        toast.error(response.error);
                    }
                    setLoad(false);
                })
                .catch(() => {
                    setLoad(false);
                });
        } else {
            setLoad(false);
            toast.error("Profile update is not allowed in demo version.");
        }
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        if (!config.demo) {
            api.updateUserProfileImage(e.target.files[0]).then((response) => {
                if (!response.error) {
                    setProfile((values) => ({
                        ...values,
                        profile: response.data.profile,
                    }));
                } else {
                    toast.error(response.error);
                }
            });
        } else {
            setLoad(false);
            toast.error("Profile update is not allowed in demo version.");
        }
    };

    const handleSignout = (e) => {
        e.preventDefault();
        MySwal.fire({
            title: t("Logout"),
            text: t("Are you sure"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("Logout"),
            cancelButtonText: t("Cancel"),
        }).then((result) => {
            if (result.isConfirmed) {
                signout();
                history.push("/");
            }
        });
    };

    const deleteAccountClick = (e) => {
        e.preventDefault();
        MySwal.fire({
            title: t("Are you sure"),
            text: t("You won't be able to revert this"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("Yes delete it"),
            cancelButtonText: t("Cancel"),
        }).then((result) => {
            if (result.isConfirmed) {
                api.deleteUserAccount().then((response) => {
                    if (!response.error) {
                        Swal.fire(t("Deleted"), t("Data has been deleted"), "success");
                        signout();
                        history.push("/");
                    } else {
                        Swal.fire(t("OOps"), t("Please Try again"), "error");
                    }
                });
            }
        });
    };

    // server image error
    const imgError = (e) => {
        e.target.src = "/images/user.webp"
    }

    return (
        <React.Fragment>
            <SEO title={t("Profile")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Profile")} content={t("Home")} contentTwo={t("Profile")} />
            <div className="Profile__Sec">
                <div className="container px-1">
                    <div className="morphism p-5">
                        <form onSubmit={formSubmit}>
                            <div className="row pro-card position-relative">
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
                                                <input type="text" className="form-control" placeholder={t("Upload File")} id="file1" name="myfile" disabled hidden />
                                            </div>
                                        </div>
                                        <div className="prop__title">
                                            <h3>{profile.name}</h3>
                                        </div>
                                        {profile.mobile ? (
                                            <div className="mobile__number">
                                                <span>
                                                    <i>
                                                        <FaPhoneAlt />
                                                    </i>
                                                    <p>{profile.mobile}</p>
                                                </span>
                                            </div>
                                        ) : (
                                            ""
                                        )}

                                        {profile.email ? (
                                            <div className="email__id">
                                                <span>
                                                    <i>
                                                        <FaEnvelope />
                                                    </i>
                                                    <p>{profile.email}</p>
                                                </span>
                                            </div>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                                <div className="col-xl-7 col-lg-7 col-md-12 col-12 border-line">
                                    <div className="card p-4 bottom__card_sec">
                                        <div className="row">
                                            <div className="col-md-6 col-12">
                                                <label htmlFor="fullName">
                                                    <input type="text" name="name" id="fullName" placeholder={t("Enter Your Name")} defaultValue={profile.name} onChange={handleChange} required />
                                                    <i className="custom-icon">
                                                        <FaUserCircle />
                                                    </i>
                                                </label>
                                            </div>
                                            <div className="col-md-6 col-12">
                                                <label htmlFor="mobilenumber">
                                                    <input
                                                        type="number"
                                                        name="mobile"
                                                        id="mobilenumber"
                                                        className="mobile"
                                                        placeholder={t("Enter Your Mobile Number")}
                                                        defaultValue={profile.mobile}
                                                        onChange={handleChange}
                                                        min="0"
                                                        required
                                                        onWheel={(event) => event.currentTarget.blur()}
                                                    />
                                                    <i className="custom-icon">
                                                        <FaMobileAlt />
                                                    </i>
                                                </label>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary text-uppercase" type="submit" value="submit" name="submit" id="mc-embedded-subscribe">
                                            {!load ? t("Submit") : t("Please Wait")}
                                        </button>

                                        <div className="bottom__profile_card">
                                            <div className="row">
                                                <div className="col-md-6 col-12">
                                                    <div className="bookmark__content">
                                                        <NavLink to={"/Bookmark"} className="w-100 d-block">
                                                            <span>{t("bookmark")}</span>
                                                            <i className="custom-icon">
                                                                <FaRegBookmark />
                                                            </i>
                                                        </NavLink>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-12">
                                                    <div className="Invite_friends__content">
                                                        <NavLink to={"/Invitefriends"} className="w-100 d-block">
                                                            <span>{t("Invite Friends")}</span>
                                                            <i className="custom-icon">
                                                                <FaEnvelopeOpenText />
                                                            </i>
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 col-12">
                                                    <div className="Delete_account__content">
                                                        <NavLink to={""} className="w-100 d-block" onClick={deleteAccountClick}>
                                                            <span>{t("Delete Account")}</span>
                                                            <i className="custom-icon">
                                                                <FaTrashAlt />
                                                            </i>
                                                        </NavLink>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-12">
                                                    <div className="Logout__content">
                                                        <NavLink to={""} onClick={handleSignout} className="w-100 d-block">
                                                            <span>{t("Logout")}</span>
                                                            <i className="custom-icon">
                                                                <FaSignOutAlt />
                                                            </i>
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="row botton_card_details">
                        <div className="col-md-6 col-12 ps-0">
                            <div className="quiz_details morphism">
                                <p className="quiz_details_title">{t("Quiz Details")}</p>
                                <ul className="quiz_details_inner">
                                    <li>
                                        {t("Rank")}
                                        <span className="badge badge-pill custom_badge">{profile.all_time_rank}</span>
                                    </li>
                                    <li>
                                        {t("Score")}
                                        <span className="badge badge-pill custom_badge">{profile.all_time_score}</span>
                                    </li>
                                    <li>
                                        {t("Coins")}
                                        <span className="badge badge-pill custom_badge">{profile.coins}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-6 col-12 pe-0">
                            <div className="questions_details morphism">
                                <p className="questions_details_title">{t("Questions Details")}</p>
                                <ul className="questions_details_inner">
                                    <li>
                                        {t("Attempted")}
                                        <span className="badge badge-pill custom_badge">{statistics.questions_answered}</span>
                                    </li>
                                    <li>
                                        {t("Correct")}
                                        <span className="badge badge-pill custom_badge">{statistics.correct_answers}</span>
                                    </li>
                                    <li>
                                        {t("Incorrect")}
                                        <span className="badge badge-pill custom_badge">{statistics.questions_answered && statistics.correct_answers && parseInt(statistics.questions_answered) - parseInt(statistics.correct_answers)}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(Profile);
