import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getSystemSettings } from "../../../utils";
import { db } from "../../../firebase";
import { toast } from "react-toastify";
import { Modal } from "antd";
import { useHistory } from "react-router-dom";

function GroupQuestions({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, setCoinScoreOnEnd }) {

    const [questions, setQuestions] = useState(data);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [score, setScore] = useState(0);

    const [waitforothers, setWaitforOthers] = useState(false);

    const [battleUserData, setBattleUserData] = useState([]);

    const [sysConfig, setSysConfig] = useState();

    const child = useRef(null);

    const scroll = useRef(null);

    let user = getUserData();

    let history = useHistory();

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
            await db.collection("multiUserBattleRoom").doc(documentId).delete();
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
            child.current.resetTimer();
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

            // {showresult ? onQuestionEnd(coins, userScore) : ""}


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
    const localStorageData = (user1name, user2name, user3name, user4name, user1image, user2image, user3image, user4image,user1uid,user2uid,user3uid,user4uid) => {
        localStorage.setItem("user1name", user1name);
        localStorage.setItem("user2name", user2name);
        localStorage.setItem("user3name", user3name);
        localStorage.setItem("user4name", user4name);
        localStorage.setItem("user1image", user1image);
        localStorage.setItem("user2image", user2image);
        localStorage.setItem("user3image", user3image);
        localStorage.setItem("user4image", user4image);
        localStorage.setItem("user1uid", user1uid);
        localStorage.setItem("user2uid", user2uid);
        localStorage.setItem("user3uid", user3uid);
        localStorage.setItem("user4uid", user4uid);
    };

    // submit answer
    const submitAnswer = (selected_option) => {
        let documentRef = db.collection("multiUserBattleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1ans = battleroom.user1.answers;

                    let user2ans = battleroom.user2.answers;

                    let user3ans = battleroom.user3.answers;

                    let user4ans = battleroom.user4.answers;

                    // answer update in document
                    if (user.id === battleroom.user1.uid) {
                        // answer push
                        user1ans.push(selected_option);

                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user1.answers": user1ans,
                        });
                    } else if (user.id === battleroom.user2.uid) {
                        // answer push
                        user2ans.push(selected_option);

                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user2.answers": user2ans,
                        });
                    } else if (user.id === battleroom.user3.uid) {
                        // answer push
                        user3ans.push(selected_option);

                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user3.answers": user3ans,
                        });
                    } else if (user.id === battleroom.user4.uid) {
                        // answer push
                        user4ans.push(selected_option);

                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user4.answers": user4ans,
                        });
                    }

                    setTimeout(() => {
                        setNextQuestion();
                    }, 1000)

                    // point
                    checkCorrectAnswers(selected_option);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // point check
    const checkCorrectAnswers = (option) => {
        let documentRef = db.collection("multiUserBattleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1name = battleroom.user1.name;

                    let user2name = battleroom.user2.name;

                    let user3name = battleroom.user3.name;

                    let user4name = battleroom.user4.name;

                    let user1image = battleroom.user1.profileUrl;

                    let user2image = battleroom.user2.profileUrl;

                    let user3image = battleroom.user3.profileUrl;

                    let user4image = battleroom.user4.profileUrl;

                    let user1correct = battleroom.user1.correctAnswers;

                    let user2correct = battleroom.user2.correctAnswers;

                    let user3correct = battleroom.user3.correctAnswers;

                    let user4correct = battleroom.user4.correctAnswers;

                    let user1uid = battleroom.user1.uid;

                    let user2uid = battleroom.user2.uid;

                    let user3uid = battleroom.user3.uid;

                    let user4uid = battleroom.user4.uid;

                    // store data in local storage to get in result screen
                    localStorageData(user1name, user2name, user3name, user4name, user1image, user2image, user3image, user4image,user1uid,user2uid,user3uid,user4uid);

                    if (user.id === battleroom.user1.uid) {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {

                            // correctanswer push
                            db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                                "user1.correctAnswers": user1correct + 1,
                            });
                        }
                    } else if (user.id === battleroom.user2.uid) {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {

                            // correctanswer push
                            db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                                "user2.correctAnswers": user2correct + 1,
                            });
                        }
                    } else if (user.id === battleroom.user3.uid) {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {

                            // correctanswer push
                            db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                                "user3.correctAnswers": user3correct + 1,
                            });
                        }
                    } else if (user.id === battleroom.user4.uid) {
                        let user = getUserData();
                        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
                        if (decryptedAnswer === option) {

                            // correctanswer push
                            db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                                "user4.correctAnswers": user4correct + 1,
                            });
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

        let documentRef = db.collection("multiUserBattleRoom").doc(battleRoomDocumentId);

        documentRef
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1ans = battleroom.user1.answers;

                    let user2ans = battleroom.user2.answers;

                    let user3ans = battleroom.user3.answers;

                    let user4ans = battleroom.user4.answers;

                    if (user.id === battleroom.user1.uid) {
                        user1ans.push(-1);

                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user1.answers": user1ans,
                        });
                    } else if(user.id === battleroom.user2.uid) {
                        user2ans.push(-1);
                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user2.answers": user2ans,
                        });
                    }else if(user.id === battleroom.user3.uid) {
                        user3ans.push(-1);
                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user3.answers": user3ans,
                        });
                    }else if(user.id === battleroom.user4.uid) {
                        user4ans.push(-1);
                        db.collection("multiUserBattleRoom").doc(battleRoomDocumentId).update({
                            "user4.answers": user4ans,
                        });
                    }

                }
            })
            .catch((error) => {
                console.log(error);
            });


        setNextQuestion();
    };


        //snapshot realtime data fetch

        const SnapshotData = () => {

        let documentRef = db.collection("multiUserBattleRoom").doc(battleRoomDocumentId);


        documentRef.onSnapshot(
            (doc) => {

                let navigatetoresult = true;

                let waiting = false

                if (doc.exists) {
                    let battleroom = doc.data();

                    let user1 = battleroom.user1;

                    let user2 = battleroom.user2;

                    let user3 = battleroom.user3;

                    let user4 = battleroom.user4;

                    // set answer in localstorage

                    let user1correctanswer = user1.correctAnswers

                    localStorage.setItem("user1CorrectAnswer",user1correctanswer);

                    let user2correctanswer = user2.correctAnswers

                    localStorage.setItem("user2CorrectAnswer",user2correctanswer);

                    let user3correctanswer = user3.correctAnswers

                    localStorage.setItem("user3CorrectAnswer",user3correctanswer);

                    let user4correctanswer = user4.correctAnswers

                    localStorage.setItem("user4CorrectAnswer",user4correctanswer);

                    let navigateUserData = []

                    navigateUserData = [user1, user2, user3, user4]

                    if (user.id === battleroom.user1.uid) {
                        setBattleUserData([user2, user3, user4]);
                    }

                    if (user.id === battleroom.user2.uid) {
                        setBattleUserData([user1, user3, user4]);
                    }

                    if (user.id === battleroom.user3.uid) {
                        setBattleUserData([user1, user2, user4]);
                    }

                    if (user.id === battleroom.user4.uid) {
                        setBattleUserData([user1, user2, user3]);
                    }


                    // if user length is less than 1
                    const newUser = [user1, user2, user3, user4];

                    const newArray = newUser.filter((obj) => Object.keys(obj.uid).length > 0);

                    if (newArray.length < 2) {
                        deleteBattleRoom(battleRoomDocumentId);
                        toast.error("Everyone hase left the game ");
                        history.push("/Quizplay");
                    }


                    //checking if every user has given all question's answer
                    navigateUserData.forEach((elem) => {
                        if (elem.uid != "") {
                            if (elem.answers.length < questions.length) {
                                navigatetoresult = false;
                            } else if (elem.uid == user.id && elem.answers.length >= questions.length) {
                                child.current.pauseTimer()
                                waiting = true

                            }
                        }

                    })


                    //user submitted answer and check other users answers length
                    if (waiting) {
                        setWaitforOthers(true)
                    }

                     //if  all user has submitted answers
                     if (navigatetoresult) {
                         onQuestionEnd()
                         deleteBattleRoom(battleRoomDocumentId);
                     }


                }
            },
            (error) => {
                console.log("err", error);
            }
        );

    }



    useEffect(() => {
        SnapshotData()
        checkCorrectAnswers();


        return () => {
            let documentRef = db.collection("multiUserBattleRoom").doc(battleRoomDocumentId);

            documentRef.onSnapshot(
                (doc) => {

                    if (doc.exists) {
                        let battleroom = doc.data()

                        let user1uid = battleroom.user1.uid

                        let user2uid = battleroom.user2.uid

                        let user3uid = battleroom.user3.uid

                        let user4uid = battleroom.user4.uid

                        let roomid = doc.id;

                        if (user1uid == user.id) {
                            db.collection("multiUserBattleRoom").doc(roomid).update({
                                "user1.name": "",
                                "user1.uid": "",
                                "user1.profileUrl": "",
                            });
                        } else if (user2uid == user.id) {
                            db.collection("multiUserBattleRoom").doc(roomid).update({
                                "user2.name": "",
                                "user2.uid": "",
                                "user2.profileUrl": "",
                            });
                        } else if (user3uid == user.id) {
                            db.collection("multiUserBattleRoom").doc(roomid).update({
                                "user3.name": "",
                                "user3.uid": "",
                                "user3.profileUrl": "",
                            });
                        }else if (user4uid == user.id) {
                            db.collection("multiUserBattleRoom").doc(roomid).update({
                                "user4.name": "",
                                "user4.uid": "",
                                "user4.profileUrl": "",
                            });
                        }

                    }
                },
                (error) => {
                    console.log("err", error);
                }
            );
        }
    }, []);

     // server image error
     const imgError = (e) => {
        e.target.src = "/images/user.webp"
    }

    return (
        <React.Fragment>
            <div className="questions battlequestion groupbattle" ref={scroll}>
                <div className="inner__headerdash groupPlay_header">
                    <div className="inner__headerdash_data">{questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}</div>

                    <div>
                        <div className="total__out__leveldata">
                            <h5 className=" inner__total-leveldata">
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

                <div className="user_data">
                    <div className="user_profile">
                        <img src={user.profile} alt="wrteam" onError={imgError}/>
                        <p className="mt-3">{user.name ? user.name : user.email}</p>
                    </div>

                    {battleUserData?.map((data, index) => (
                         data.uid !== "" ? (
                            <>
                                <div className="opponent_image" key={index}>
                                <img src={data.profileUrl} alt="wrteam" onError={imgError}/>
                                    <p className="mt-3">{data.name ? data.name : "Waiting..."}</p>
                                </div>

                            </>
                        ) : null
                    ))}
                </div>

                {/* waiting popup */}

                <Modal closable={false} keyboard={false} centered visible={waitforothers} footer={null} className="custom_modal_notify retry-modal playwithfriend">
                    {waitforothers ? (
                        <>
                            <p>{t("Please Wait for others Players to Complete their Match")}</p>
                        </>
                    ) : (
                        ""
                    )}
                </Modal>


            </div>
        </React.Fragment>
    );
}

GroupQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

GroupQuestions.defaultProps = {
    setCoinScoreOnEnd: true,
};

export default withTranslation()(GroupQuestions);
