import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getSystemSettings } from "../../../utils";
import { db } from "../../../firebase";

function RandomQuestions({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, setCoinScoreOnEnd }) {
    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [Opponentdata, setOpponentdata] = useState({
        userName: "",
        profile: "",
        points: "",
    });

    const [userLogindata, setLogindata] = useState({
        userName: "",
        profile: "",
        points: "",
    });

    const [sysConfig, setSysConfig] = useState();

    const user1 = useRef(null);

    const user2 = useRef(null);

    const scroll = useRef(null);

    let user = getUserData();

    useEffect(() => {
        const fetchData = async () => {
            let response = await api.getSystemConfigurations();
            if (!response.error) {
                setSysConfig(response.data);
            }
        };
        fetchData();
    }, []);

    setTimeout(() => {
        setQuestions(data);
    }, 500);

    //firestore adding answer in doc
    let battleRoomDocumentId = localStorage.getItem("roomid");

    // delete battle room
    const deleteBattleRoom = async (documentId) => {
        try {
            await db.collection("battleRoom").doc(documentId).delete();
        } catch (error) {
            toast.error(error);
        }
    };

    let sysSettings = getSystemSettings();

    // next questions
    const setNextQuestion = () => {
        const nextQuestion = currentQuestion + 1;

        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            let coins = null;
            let userScore = null;
            let result_score = score;
            if (setCoinScoreOnEnd) {
                let percentage = (100 * result_score) / questions.length;
                api.setUserStatistics(questions.length, result_score, questions[currentQuestion].category, percentage);

                userScore = calculateScore(result_score, questions.length);
                let status = "0";
                if (percentage >= sysSettings.maximum_coins_winning_percentage) {
                    coins = calculateCoins(score, questions.length);
                    api.setUserCoinScore(coins, userScore, null, "Quiz Win", status).then((response) => {
                        if (!response.error) {
                            updateUserData(response.data);
                        }
                    });
                } else {
                    api.setUserCoinScore(null, userScore, null, "Quiz Win", status).then((response) => {
                        if (!response.error) {
                            updateUserData(response.data);
                        }
                    });
                }
            }

            onQuestionEnd(coins, userScore);
            deleteBattleRoom(battleRoomDocumentId);
        }
    };

    // button option answer check
    const handleAnswerOptionClick = async (selected_option) => {
        let { id, answer } = questions[currentQuestion];

        let decryptedAnswer = decryptAnswer(answer, user.firebase_id);

        let result_score = score;

        if (decryptedAnswer === selected_option) {
            result_score++;
            setScore(result_score);
        }

        let update_questions = questions.map((data) => {
            return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data;
        });

        setQuestions(update_questions);

        submitAnswer(selected_option);

        onOptionClick(update_questions, result_score);
    };

    // storing dataa of points in localstorage
    const localStorageData = (user1name, user2name, user1uid, user2uid, user1image, user2image) => {
        localStorage.setItem("user1name", user1name);
        localStorage.setItem("user2name", user2name);
        localStorage.setItem("user1uid", user1uid);
        localStorage.setItem("user2uid", user2uid);
        localStorage.setItem("user1image", user1image);
        localStorage.setItem("user2image", user2image);
    };

    const localStoragePoint = (user1point, user2point) => {
        localStorage.setItem("user1", user1point);
        localStorage.setItem("user2", user2point);
    };

    // submit answer
    const submitAnswer = (selected_option) => {
        let documentRef = db.collection("battleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1ans = battleroom.user1.answers;

                    let user2ans = battleroom.user2.answers;

                    // answer update in document
                    if (user.id === battleroom.user1.uid) {
                        // answer push
                        user1ans.push(selected_option);

                        db.collection("battleRoom").doc(battleRoomDocumentId).update({
                            "user1.answers": user1ans,
                        });
                    } else {
                        // answer push
                        user2ans.push(selected_option);

                        db.collection("battleRoom").doc(battleRoomDocumentId).update({
                            "user2.answers": user2ans,
                        });
                    }

                    // anseerCheck
                    answercheck();

                    // point
                    checkpoints(selected_option);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // point check
    const checkpoints = (option) => {
        let documentRef = db.collection("battleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let totalseconds = config.randomBattleSeconds;

                    let seconds = user1.current.getTimerSeconds();

                    let finalScore = totalseconds - seconds;

                    let user1name = battleroom.user1.name;

                    let user2name = battleroom.user2.name;

                    let user1point = battleroom.user1.points;

                    let user2point = battleroom.user2.points;

                    let user1uid = battleroom.user1.uid;

                    let user2uid = battleroom.user2.uid;

                    let user1image = battleroom.user1.profileUrl;

                    let user2image = battleroom.user2.profileUrl;

                    // store data in local storage to get in result screen
                    localStorageData(user1name, user2name, user1uid, user2uid, user1image, user2image);

                    if (user.id === battleroom.user1.uid) {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {
                            // point push
                            if (finalScore < 2) {
                                let totalpush = config.randomBattleoneToTwoSeconds + config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user1.points": totalpush + user1point,
                                    });
                            } else if (finalScore === 3 || finalScore === 4) {
                                let totalpush = config.randomBattlethreeToFourSeconds + config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user1.points": totalpush + user1point,
                                    });
                            } else {
                                let totalpush = config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user1.points": totalpush + user1point,
                                    });
                            }
                        }
                    } else {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {
                            // point push
                            if (finalScore < 2) {
                                let totalpush = config.randomBattleoneToTwoSeconds + config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user2.points": totalpush + user2point,
                                    });
                            } else if (finalScore === 3 || finalScore === 4) {
                                let totalpush = config.randomBattlethreeToFourSeconds + config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user2.points": totalpush + user2point,
                                    });
                            } else {
                                let totalpush = config.battlecorrectanswer;

                                db.collection("battleRoom")
                                    .doc(battleRoomDocumentId)
                                    .update({
                                        "user2.points": totalpush + user2point,
                                    });
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // option answer status check
    const setAnswerStatusClass = (option) => {
        if (questions[currentQuestion].isAnswered) {
            if (sysConfig && sysConfig.answer_mode === "1") {
                let user = getUserData();
                let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                if (decryptedAnswer === option) {
                    return "bg-success";
                } else if (questions[currentQuestion].selected_answer === option) {
                    return "bg-danger";
                }
            } else if (questions[currentQuestion].selected_answer === option) {
                return "bg-dark";
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    // on timer expire
    const onTimerExpire = () => {
        let documentRef = db.collection("battleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1ans = battleroom.user1.answers;

                    let user2ans = battleroom.user2.answers;

                    if (user.id === battleroom.user1.uid) {
                        user1ans.push(-1);

                        db.collection("battleRoom").doc(battleRoomDocumentId).update({
                            "user1.answers": user1ans,
                        });
                    } else {
                        user2ans.push(-1);
                        db.collection("battleRoom").doc(battleRoomDocumentId).update({
                            "user2.answers": user2ans,
                        });
                    }

                    // anseerCheck
                    answercheck();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //answerlength check
    const answercheck = () => {
        let documentRef = db.collection("battleRoom").doc(battleRoomDocumentId);

        documentRef.onSnapshot(
            (doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let useroneAnswer = battleroom.user1.answers.length;

                    let usertwoAnswer = battleroom.user2.answers.length;

                    let user1point = battleroom.user1.points;

                    let user2point = battleroom.user2.points;

                    if (useroneAnswer != 0 || usertwoAnswer != 0) {
                        if (useroneAnswer === usertwoAnswer) {
                            setNextQuestion();
                            user1.current.resetTimer();
                            user2.current.resetTimer();
                        } else if (useroneAnswer > usertwoAnswer) {
                            if (user.id === battleroom.user1.uid) {
                                user1.current.pauseTimer();
                            } else {
                                user2.current.pauseTimer();
                            }
                        } else if (useroneAnswer < usertwoAnswer) {
                            if (user.id === battleroom.user2.uid) {
                                user1.current.pauseTimer();
                            } else {
                                user2.current.pauseTimer();
                            }
                        }
                    }

                    // for user get data
                    if (user.id === battleroom.user1.uid) {
                        setOpponentdata({ ...battleroom, userName: battleroom.user2.name, profile: battleroom.user2.profileUrl, points: battleroom.user2.points });
                        setLogindata({ ...battleroom, userName: battleroom.user1.name, profile: battleroom.user1.profileUrl, points: battleroom.user1.points });
                    } else {
                        setOpponentdata({ ...battleroom, userName: battleroom.user1.name, profile: battleroom.user1.profileUrl, points: battleroom.user1.points });
                        setLogindata({ ...battleroom, userName: battleroom.user2.name, profile: battleroom.user2.profileUrl, points: battleroom.user2.points });
                    }

                    // point update in localstorage
                    localStoragePoint(user1point, user2point);
                }
            },
            (error) => {
                console.log("err", error);
            }
        );
    };

    useEffect(() => {
        answercheck();
        checkpoints();
    }, []);

    return (
        <React.Fragment>
            {/*  */}
            <div className="questions battlequestion" ref={scroll}>
                <div className="inner__headerdash">
                    <div>
                        <div className="total__out__leveldata">
                            <h5 className="text-white inner__total-leveldata">
                                {currentQuestion + 1} | {questions.length}
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="content__text">
                    <p className="question-text pt-4">{questions[currentQuestion].question}</p>
                </div>

                {questions[currentQuestion].image ? (
                    <div className="imagedash">
                        <img src={questions[currentQuestion].image} alt="" />
                    </div>
                ) : (
                    ""
                )}

                {/* options */}
                <div className="row">
                    {questions[currentQuestion].optiona ? (
                        <div className="col-md-6 col-12">
                            <div className="inner__questions">
                                <button className={`btn button__ui w-100 ${setAnswerStatusClass("a")}`} onClick={(e) => handleAnswerOptionClick("a")}>
                                    <div className="row">
                                        <div className="col">{questions[currentQuestion].optiona}</div>
                                        {questions[currentQuestion].probability_a ? <div className="col text-end">{questions[currentQuestion].probability_a}</div> : ""}
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {questions[currentQuestion].optionb ? (
                        <div className="col-md-6 col-12">
                            <div className="inner__questions">
                                <button className={`btn button__ui w-100 ${setAnswerStatusClass("b")}`} onClick={(e) => handleAnswerOptionClick("b")}>
                                    <div className="row">
                                        <div className="col">{questions[currentQuestion].optionb}</div>
                                        {questions[currentQuestion].probability_b ? <div className="col text-end">{questions[currentQuestion].probability_b}</div> : ""}
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {questions[currentQuestion].question_type === "1" ? (
                        <>
                            {questions[currentQuestion].optionc ? (
                                <div className="col-md-6 col-12">
                                    <div className="inner__questions">
                                        <button className={`btn button__ui w-100 ${setAnswerStatusClass("c")}`} onClick={(e) => handleAnswerOptionClick("c")}>
                                            <div className="row">
                                                <div className="col">{questions[currentQuestion].optionc}</div>
                                                {questions[currentQuestion].probability_c ? <div className="col text-end">{questions[currentQuestion].probability_c}</div> : ""}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                            {questions[currentQuestion].optiond ? (
                                <div className="col-md-6 col-12">
                                    <div className="inner__questions">
                                        <button className={`btn button__ui w-100 ${setAnswerStatusClass("d")}`} onClick={(e) => handleAnswerOptionClick("d")}>
                                            <div className="row">
                                                <div className="col">{questions[currentQuestion].optiond}</div>
                                                {questions[currentQuestion].probability_d ? <div className="col text-end">{questions[currentQuestion].probability_d}</div> : ""}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                            {sysConfig && sysConfig.option_e_mode && questions[currentQuestion].optione ? (
                                <div className="row d-flex justify-content-center mob_resp_e">
                                    <div className="col-md-6 col-12">
                                        <div className="inner__questions">
                                            <button className={`btn button__ui w-100 ${setAnswerStatusClass("e")}`} onClick={(e) => handleAnswerOptionClick("e")}>
                                                <div className="row">
                                                    <div className="col">{questions[currentQuestion].optione}</div>
                                                    {questions[currentQuestion].probability_e ? (
                                                        <div className="col" style={{ textAlign: "right" }}>
                                                            {questions[currentQuestion].probability_e}
                                                        </div>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                        </>
                    ) : (
                        ""
                    )}
                </div>

                {/* user1 */}
                <div className="user_data onevsone">
                    <div className="user_one mb-4">
                        {/* timer */}
                        <div className="inner__headerdash">{questions && questions[0]["id"] !== "" ? <Timer ref={user1} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}</div>
                        {/* userinfo */}
                        <div className="inner_user_data onevsonedetails">
                            <div className="username">
                                <p>{userLogindata.userName}</p>
                            </div>
                            <div className="userpoints">
                                <p>
                                    {t("points")} : <span>{userLogindata.points}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="user_two mb-4">
                        {/* timer */}
                        <div className="inner__headerdash">{questions && questions[0]["id"] !== "" ? <Timer ref={user2} timerSeconds={timerSeconds} onTimerExpire={() => {}} /> : ""}</div>
                        {/* userinfo */}
                        <div className="inner_user_data">
                            <div className="username">
                                <p>{Opponentdata.userName}</p>
                            </div>
                            <div className="userpoints">
                                <p>
                                    {t("points")} : <span>{Opponentdata.points}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

RandomQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

RandomQuestions.defaultProps = {
    setCoinScoreOnEnd: true,
};

export default withTranslation()(RandomQuestions);
