import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import Bookmark from "../../Common/Bookmark";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getAndUpdateBookmarkData, deleteBookmarkByQuestionID, getSystemSettings } from "../../../utils";

function AudioQuestionsDashboard({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, showBookmark, setCoinScoreOnEnd, showQuestions }) {
    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [sysConfig, setSysConfig] = useState();
    const [totalTimerValue, setTotalTimerValue] = useState();
    const child = useRef(null);
    const scroll = useRef(null);

    const audioRef = useRef();

    // console.log("audioRef: " ,audioRef)

    // total audio timer value
    const onLoadedMetadata = () => {
        if (audioRef.current) {
            console.log(audioRef)
            let getvalue = parseInt(audioRef.current.duration);
            setTotalTimerValue(getvalue);
        }


    };

    useEffect(() => {
        const fetchData = async () => {
            let response = await api.getSystemConfigurations();
            if (!response.error) {
                setSysConfig(response.data);
            }
        };
        fetchData();
    }, []);

    let user = getUserData();

    setTimeout(() => {
        setQuestions(data);
    }, 500);

    let sysSettings = getSystemSettings();

    const setNextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
            child.current.resetTimer();
            scrollToBottom();
        } else {
            let coins = null;
            let userScore = null;
            if (setCoinScoreOnEnd) {
                let result_score = score;
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

                    api.getLevelData(questions[currentQuestion].category, questions[currentQuestion].subcategory, questions[currentQuestion].level).then((response) => {
                        if (!response.error) {
                            if (parseInt(response.data.level) <= parseInt(questions[currentQuestion].level)) {
                                api.setLevelData(questions[currentQuestion].category, questions[currentQuestion].subcategory, parseInt(questions[currentQuestion].level) + 1);
                            }
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
        }
    };

    // button option answer check
    const handleAnswerOptionClick = (selected_option) => {
        let { id, answer } = questions[currentQuestion];
        let user = getUserData();

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
        setTimeout(() => {
            setNextQuestion();
        }, 1000);
        onOptionClick(update_questions, result_score);
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

    const handleBookmarkClick = (question_id, isBookmarked) => {
        let type = 1;
        let bookmark = "0";

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

    const onTimerExpire = () => {
        setNextQuestion();
    };

    // const handleTimerReset = () => {
    //     child.current.resetTimer();
    // };

    const scrollToBottom = () => {
        window.scrollTo({
            top: scroll.current.scrollHeight,
            left: 0,
            behavior: "smooth",
        });
    };


        let currentTime = audioRef.current.currentTime;
        console.log("currentTime: " + currentTime)




    return (
        <React.Fragment>
            <div className="text-end p-2 pb-0">
                {showBookmark ? <Bookmark id={questions[currentQuestion].id} isBookmarked={questions[currentQuestion].isBookmarked ? questions[currentQuestion].isBookmarked : false} onClick={handleBookmarkClick} /> : ""}
            </div>
            <div className="questions audioQuestiondashboard" ref={scroll}>
                <div className="inner__headerdash">
                    {showQuestions ? (
                        <div className="leveldata">
                            <h5 className="inner-level__data ">
                                {t("level")} : {questions[currentQuestion].level}
                            </h5>
                        </div>
                    ) : (
                        ""
                    )}

                    <div className="inner__headerdash">{questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}</div>

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

                {/* Audio Questions Player */}
                <div className="audio_player text-center pb-5">
                    <audio src={questions[currentQuestion].audio} controls autoPlay controlsList="nodownload noplaybackrate" id="audio"
                        ref={audioRef}
                        onLoadedMetadata={onLoadedMetadata}
                    />
                </div>

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
            </div>
        </React.Fragment>
    );
}

AudioQuestionsDashboard.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

AudioQuestionsDashboard.defaultProps = {
    showBookmark: true,
    setCoinScoreOnEnd: true,
};

export default withTranslation()(AudioQuestionsDashboard);
