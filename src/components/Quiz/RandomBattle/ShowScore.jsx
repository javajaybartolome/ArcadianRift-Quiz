import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import "react-circular-progressbar/dist/styles.css";
import { getUserData } from "../../../utils";

function ShowScore({ t, onReviewAnswersClick, reviewAnswer }) {
    const history = useHistory();

    const goToHome = () => {
        history.push("/");
    };

    const goBack = () => {
        history.push("Quizplay");
    };

    let user = getUserData();
    let user1point = localStorage.getItem("user1");
    let user2point = localStorage.getItem("user2");
    let user1name = localStorage.getItem("user1name");
    let user2name = localStorage.getItem("user2name");
    let user1uid = localStorage.getItem("user1uid", user1uid);
    let user2uid = localStorage.getItem("user2uid", user2uid);
    let user1image = localStorage.getItem("user1image", user1image);
    let user2image = localStorage.getItem("user2image", user2image);

    useEffect(() => {
        return () => {
        // clear local storage poins
        localStorage.setItem("user1", 0);
        localStorage.setItem("user2", 0);
        }
    }, [])

     // server image error
    const imgError = (e) => {
        e.target.src = "/images/user.webp"
    }


    return (
        <React.Fragment>
            <div className="my-4 row d-flex align-items-center">
                {(() => {
                    if (user.id == user1uid && user1point > user2point) {
                        return (
                            <div className="result_data">
                                <p>{t("Congratulations")}</p>
                                <h3>{t("Winner")}</h3>
                            </div>
                        );
                    } else if (user.id == user1uid && user1point < user2point) {
                        return (
                            <div className="result_data">
                                <p>{t("Good luck next time")}</p>
                                <h3>{t("You Lose")}</h3>
                                <p className="lost_coin">{t("Unfortunately lost 5 coins")}</p>
                            </div>
                        );
                    } else if (user.id == user2uid && user1point > user2point) {
                        return (
                            <div className="result_data">
                                <p>{t("Good luck next time")}</p>
                                <h3>{t("You Lose")}</h3>
                                <p className="lost_coin">{t("Unfortunately lost 5 coins")}</p>
                            </div>
                        );
                    } else if (user.id == user2uid && user1point < user2point) {
                        return (
                            <div className="result_data">
                                <p>{t("Congratulations")}</p>
                                <h3>{t("Winner")}</h3>
                            </div>
                        );
                    } else if (user1point == user2point) {
                        return (
                            <div className="result_data">
                                <h3>{t("Tie")}</h3>
                            </div>
                        );
                    }
                })()}

                {(() => {
                    if (user1point > user2point) {
                        return (
                            <div className="user_data onevsone">
                                <div className="login_winner">
                                    <img src={user1image ? user1image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user1name}</p>
                                    <p>{t("Winner")}</p>
                                    <p className="point_screen">{user1point}</p>
                                </div>

                                {/* vs */}
                                <div className="versus_screen">
                                    <img src={process.env.PUBLIC_URL + "/images/battle/vs.webp"} alt="versus" />
                                </div>

                                <div className="opponet_loser">
                                    <img src={user2image ? user2image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user2name}</p>
                                    <p>{t("Loser")}</p>
                                    <p className="point_screen">{user2point}</p>
                                </div>
                            </div>
                        );
                    } else if (user1point < user2point) {
                        return (
                            <div className="user_data">
                                <div className="login_winner">
                                    <img src={user2image ? user2image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user2name}</p>
                                    <p>{t("Winner")}</p>
                                    <p className="point_screen">{user2point}</p>
                                </div>

                                {/* vs */}
                                <div className="versus_screen">
                                    <img src={process.env.PUBLIC_URL + "/images/battle/vs.webp"} alt="versus" />
                                </div>

                                <div className="opponet_loser">
                                    <img src={user1image ? user1image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user1name}</p>
                                    <p>{t("Loser")}</p>
                                    <p className="point_screen">{user1point}</p>
                                </div>
                            </div>
                        );
                    } else if (user1point == user2point) {
                        return (
                            <div className="user_data">
                                <div className="login_winner">
                                    <img src={user1image ? user1image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user1name}</p>
                                    <p>{t("Tie")}</p>
                                    <p className="point_screen">{user1point}</p>
                                </div>

                                {/* vs */}
                                <div className="versus_screen">
                                    <img src={process.env.PUBLIC_URL + "/images/battle/vs.webp"} alt="versus" />
                                </div>

                                <div className="opponet_loser">
                                    <img src={user2image ? user2image : process.env.PUBLIC_URL + "/images/user.webp"} alt="user" className="showscore-userprofile" onError={imgError}/>
                                    <p>{user2name}</p>
                                    <p>{t("Tie")}</p>
                                    <p className="point_screen">{user2point}</p>
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>

            <div className="dashoptions row text-center">
                {reviewAnswer ? (
                    <div className="audience__poll col-12 col-sm-6 col-md-2 custom-dash">
                        <button className="btn btn-primary" onClick={onReviewAnswersClick}>
                            {t("Review Answers")}
                        </button>
                    </div>
                ) : (
                    ""
                )}
                <div className="resettimer col-12 col-sm-6 col-md-2 custom-dash">
                    <button className="btn btn-primary" onClick={goBack}>
                        {t("Back")}
                    </button>
                </div>
                <div className="skip__questions col-12 col-sm-6 col-md-2 custom-dash">
                    <button className="btn btn-primary" onClick={goToHome}>
                        {t("Home")}
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

ShowScore.propTypes = {
    coins: PropTypes.number.isRequired,
};
export default withTranslation()(ShowScore);
