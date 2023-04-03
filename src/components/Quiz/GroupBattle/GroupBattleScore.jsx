import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import "react-circular-progressbar/dist/styles.css";
import { getUserData } from "../../../utils";

function GroupBattleScore({ t}) {
    const history = useHistory();

    const goToHome = () => {
        history.push("/");
    };

    const goBack = () => {
        history.push("Quizplay");
    };

    let user = getUserData();

    // fetch data from local storage
    let user1correctanswer = localStorage.getItem("user1CorrectAnswer");
    let user2correctanswer = localStorage.getItem("user2CorrectAnswer");
    let user3correctanswer = localStorage.getItem("user3CorrectAnswer");
    let user4correctanswer = localStorage.getItem("user4CorrectAnswer");

    let user1name = localStorage.getItem("user1name");
    let user2name = localStorage.getItem("user2name");
    let user3name = localStorage.getItem("user3name");
    let user4name = localStorage.getItem("user4name");

    let user1uid = localStorage.getItem("user1uid");
    let user2uid = localStorage.getItem("user2uid");
    let user3uid = localStorage.getItem("user3uid");
    let user4uid = localStorage.getItem("user4uid");

    let user1image = localStorage.getItem("user1image");
    let user2image = localStorage.getItem("user2image");
    let user3image = localStorage.getItem("user3image");
    let user4image = localStorage.getItem("user4image");

    // server image error
    const imgError = (e) => {
        e.target.src = "/images/user.webp";
    };

    // user data
    const alluseranswer = [user1correctanswer, user2correctanswer, user3correctanswer, user4correctanswer];

    const alluid = [user1uid, user2uid, user3uid, user4uid];

    const alluserimage = [user1image, user2image, user3image, user4image];

    const allusername = [user1name, user2name, user3name, user4name];

    //for future use :- more user to join

    // let newalluseranswer = [];

    // let newuid = [];

    // let newalluserimage = [];

    // let newallusername = [];

    // for (let i = 0; i < alluseranswer.length; i++) {
    //     newalluseranswer.push(alluseranswer[i]);
    //     newuid.push(alluid[i]);
    //     newalluserimage.push(alluserimage[i]);
    //     newallusername.push(allusername[i]);
    // }

    // find max number
    const max = Math.max(...alluseranswer);

    let maxIndices = [];

    for (let i = 0; i < alluseranswer.length; i++) {
        if (alluseranswer[i] === max.toString()) {
            maxIndices.push(i);
        }
    }

    // max user index
    const index = alluseranswer.indexOf(max.toString());

    useEffect(() => {

        return () => {
            // clear local storage poins
            localStorage.setItem("user1CorrectAnswer", 0);
            localStorage.setItem("user2CorrectAnswer", 0);
            localStorage.setItem("user3CorrectAnswer", 0);
            localStorage.setItem("user4CorrectAnswer", 0);
            localStorage.setItem("user1uid", "");
            localStorage.setItem("user2uid", "");
            localStorage.setItem("user3uid", "");
            localStorage.setItem("user4uid", "");
            localStorage.setItem("readytoplay", "");
        };
    }, []);

    // all data store in array object
    let allData = [
        {
            uid: user1uid,
            image: user1image,
            name: user1name,
            correctAnswer: user1correctanswer,
        },
        {
            uid: user2uid,
            image: user2image,
            name: user2name,
            correctAnswer: user2correctanswer,
        },
        {
            uid: user3uid,
            image: user3image,
            name: user3name,
            correctAnswer: user3correctanswer,
        },
        {
            uid: user4uid,
            image: user4image,
            name: user4name,
            correctAnswer: user4correctanswer,
        },
    ];

    // all data store in array object
    let tieData = [
        {
            uid: user1uid,
            image: user1image,
            name: user1name,
            correctAnswer: user1correctanswer,
        },
        {
            uid: user2uid,
            image: user2image,
            name: user2name,
            correctAnswer: user2correctanswer,
        },
        {
            uid: user3uid,
            image: user3image,
            name: user3name,
            correctAnswer: user3correctanswer,
        },
        {
            uid: user4uid,
            image: user4image,
            name: user4name,
            correctAnswer: user4correctanswer,
        },
    ];

    // filter to remove winner from all data
    let i = -1;
    let j;
    allData.filter((obj) => {
        i = i + 1;
        if (obj.correctAnswer == max) {
            j = i;
        }
    });

    allData.splice(j, 1);

    // check duplicate array for tie

    let tieuser = [];
    let tieloser = [];

    tieData.forEach((str) => {
        if (str.correctAnswer == max) {
            tieuser.push(str);
        } else {
            tieloser.push(str);
        }
    });

    return (
        <React.Fragment>
            <div className="my-4 row d-flex align-items-center">
                {(() => {
                    if (maxIndices.length == 1) {
                        if (user.id == alluid[index]) {
                            return (
                                <div className="result_data">
                                    <p>{t("Congratulations")}</p>
                                    <h3>{t("Winner")}</h3>
                                </div>
                            );
                        } else {
                            return (
                                <div className="result_data">
                                    <p>{t("Good luck next time")}</p>
                                    <h3>{t("You Lose")}</h3>
                                </div>
                            );
                        }
                    } else if (maxIndices.length >= 2) {
                        return (
                            <div className="result_data">
                                <h3>{t("Tie")}</h3>
                            </div>
                        );
                    }
                })()}

                <div className="user_data group_battle">
                    {(() => {
                        if (maxIndices.length == 1) {
                            return (
                                <>
                                    {/* winner */}
                                    <div className="login_winner">
                                        <img src={alluserimage[index]} alt="user" className="showscore-userprofile" onError={(e) => imgError(e)} />
                                        <p>{allusername[index]}</p>
                                        <p className="point_screen group_result_point">{alluseranswer[index]}</p>
                                        <p>{t("Winner")}</p>
                                    </div>

                                    {/* loser */}
                                    <div className="opponet_loser group_battle_loser">
                                        {allData.map((elem, i) =>
                                            elem.uid !== "" ? (
                                                <>
                                                    <div className="group_data">
                                                        <img src={elem.image} alt="user" className="showscore-userprofile" onError={imgError} />
                                                        <p>{elem.name}</p>
                                                        <p className="point_screen group_result_point">{elem.correctAnswer}</p>
                                                        <p>{t("Loser")}</p>
                                                    </div>
                                                </>
                                            ) : null
                                        )}
                                    </div>
                                </>
                            );
                        } else {

                            let tiesuserData = tieuser.map((elem, i) => (
                                <>
                                    <div className="group_data">
                                        <img src={elem.image} alt="user" className="showscore-userprofile" onError={imgError} />
                                        <p>{elem.name}</p>
                                        <p className="point_screen group_result_point">{elem.correctAnswer}</p>
                                    </div>
                                </>
                            ))

                            let tiesloserData = tieloser.map((elem, i) =>
                            elem.uid !== "" ? (
                                <>
                                    <div className="group_data">
                                        <img src={elem.image} alt="user" className="showscore-userprofile" onError={imgError} />
                                        <p>{elem.name}</p>
                                        <p className="point_screen group_result_point">{elem.correctAnswer}</p>
                                        <p>{t("Loser")}</p>
                                    </div>

                                </>
                            ) : null
                            );

                            let alluserData = [...new Set([...tiesuserData, ...tiesloserData])];

                            return (alluserData);
                        }
                    })()}
                </div>
            </div>

            <div className="dashoptions row text-center">
                <div className="skip__questions col-12 col-sm-6 col-md-2 custom-dash">
                    <button className="btn btn-primary" onClick={goToHome}>
                        {t("Home")}
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

GroupBattleScore.propTypes = {
    coins: PropTypes.number.isRequired,
};
export default withTranslation()(GroupBattleScore);
