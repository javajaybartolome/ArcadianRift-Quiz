import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import Bookmark from "../../Common/Bookmark";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import * as api from "../../../utils/api";
import { Modal, Button } from "antd";

import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getAndUpdateBookmarkData, deleteBookmarkByQuestionID, getSystemSettings } from "../../../utils";
import { FaArrowsAlt } from "react-icons/fa";

function SelfLearningQuestions({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, showBookmark, setCoinScoreOnEnd, showQuestions, customMinutes }) {
    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [sysConfig, setSysConfig] = useState();
    const child = useRef(null);
    const scroll = useRef(null);
    const [disablePrev, setDisablePrev] = useState(true);
    const [disableNext, setDisableNext] = useState(false);
    const [color, setColor] = useState(["bg-green", "bg-dark"]);
    const [update_questions, setUpdate_questions] = useState(data);
    const [notificationmodal, setNotificationModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            var response = await api.getSystemConfigurations();
            if (!response.error) {
                setSysConfig(response.data);
            }
        };
        fetchData();
    }, []);

    var user = getUserData();

    setTimeout(() => {
        setQuestions(data);
    }, 500);

    // button option answer check
    const handleAnswerOptionClick = (selected_option) => {
        var { id } = questions[currentQuestion];
        var update_questions = questions.map((data) => {
            return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data;
        });
        setUpdate_questions(update_questions);
        if (questions[currentQuestion].isAnswered) {
            setColor(color[1]);
        } else {
            setColor(color[0]);
        }

        if (questions[currentQuestion].selected_answer) setQuestions(update_questions);
        onOptionClick(update_questions);
    };

    // option answer status check
    const setAnswerStatusClass = (option) => {
        if (questions[currentQuestion].isAnswered) {
            if (sysConfig && sysConfig.answer_mode === "1") {
            }
            if (questions[currentQuestion].selected_answer === option) {
                return "bg-theme";
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const handleBookmarkClick = (question_id, isBookmarked) => {
        var type = 1;
        var bookmark = "0";

        if (isBookmarked) bookmark = "1";
        else bookmark = "0";
        return api
            .setBookmark(question_id, bookmark, type)
            .then((response) => {
                if (response.error) {
                    toast.error(t("Cannot Remove Question from Bookmark"));
                    return false;
                } else {
                    if (isBookmarked) {
                        getAndUpdateBookmarkData();
                    } else {
                        deleteBookmarkByQuestionID(question_id);
                    }
                    return true;
                }
            })
            .catch(() => {
                return false;
            });
    };

    let sysSettings = getSystemSettings();

    const onSubmit = () => {
        let result_score = score;

        questions.map((data) => {
            let selectedAnswer = data.selected_answer;
            let user = getUserData();
            let decryptedAnswer = decryptAnswer(data.answer, user.firebase_id);
            if (decryptedAnswer === selectedAnswer) {
                result_score++;
                setScore(result_score);
            }
        });
        onOptionClick(questions, result_score);

        let coins = null;
        let userScore = null;
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

        onQuestionEnd(coins, userScore);
    };

    const onTimerExpire = () => {
        onSubmit();
    };

    // const scrollToBottom = () => {
    //   window.scrollTo({
    //     top: scroll.current.scrollHeight,
    //     left: 0,
    //     behavior: "smooth",
    //   });
    // };

    const previousQuestion = () => {
        const prevQuestion = currentQuestion - 1;
        if (prevQuestion >= 0) {
            if (prevQuestion > 0) {
                setDisablePrev(false);
            } else {
                setDisablePrev(true);
            }
            setDisableNext(false);
            setCurrentQuestion(prevQuestion);
        }
    };

    const nextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            if (nextQuestion + 1 === questions.length) {
                setDisableNext(true);
            } else {
                setDisableNext(false);
            }
            setDisablePrev(false);
            setCurrentQuestion(nextQuestion);
        }
    };

    // pagination
    const handlePagination = (index) => {
        setCurrentQuestion(index);
    };

    return (
        <React.Fragment>
            <div className="questions selflearnigque" ref={scroll}>
                <div className="inner__headerdash">
                    {/* <div className="p-2 pb-0">
                        {showBookmark ? <Bookmark id={questions[currentQuestion].id} isBookmarked={questions[currentQuestion].isBookmarked ? questions[currentQuestion].isBookmarked : false} onClick={handleBookmarkClick} /> : ""}
                    </div> */}
                    {questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} customMinutes={customMinutes} onTimerExpire={onTimerExpire} /> : ""}

                    <div className="total__out__leveldata">
                        <h5 className="text-white inner__total-leveldata">
                            {currentQuestion + 1} | {questions.length}
                        </h5>
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

                {/* {/ options /} */}
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
                <div className="dashoptions">
                    <div className="fifty__fifty">
                        <button className="btn btn-primary" onClick={previousQuestion} disabled={disablePrev}>
                            &lt;
                        </button>
                    </div>
                    <div className="resettimer">
                        <button className="btn btn-primary" onClick={onSubmit}>
                            {t("Submit")}
                        </button>
                    </div>

                    {/* {/ pagination /} */}

                    <div className="notification self-learning-pagination">
                        <Button className="notify_btn btn-primary" onClick={() => setNotificationModal(true)}>
                            <FaArrowsAlt />
                        </Button>

                        <Modal centered visible={notificationmodal} onOk={() => setNotificationModal(false)} onCancel={() => setNotificationModal(false)} footer={null} className="custom_modal_notify self-modal">
                            <div className="que_pagination">
                                {questions?.map((que_data, index) => {
                                    return (
                                        <div className="que_content" key={index}>
                                            <p className="d-none">{que_data.id}</p>

                                            <p className={`que_box ${update_questions && update_questions[index]?.isAnswered ? "bg-green" : "bg-dark"}`} onClick={() => handlePagination(index)}>
                                                {index + 1}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <hr />
                            <p>{t("Color Code")}</p>
                            {/* {/ check and unchecked /} */}
                            <div className="custom_checkbox d-flex flex-wrap align-items-center">
                                <input type="radio" name="" className="tick me-2" checked readOnly /> {t("Attended Question")}
                                <input type="radio" name="" className="untick ms-3 me-2" disabled readOnly /> {t("Un-Attempted")}
                            </div>
                        </Modal>
                    </div>
                    <div className="skip__questions">
                        <button className="btn btn-primary" onClick={nextQuestion} disabled={disableNext}>
                            &gt;
                        </button>
                    </div>
                </div>

                <div className="text-center text-white">
                    <small>{questions[currentQuestion].note ? <p>{t("Note") + " : " + questions[currentQuestion].note}</p> : ""}</small>
                </div>
            </div>
        </React.Fragment>
    );
}

SelfLearningQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

SelfLearningQuestions.defaultProps = {
    showBookmark: true,
    setCoinScoreOnEnd: true,
};

export default withTranslation()(SelfLearningQuestions);
