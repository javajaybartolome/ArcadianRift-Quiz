import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import Bookmark from "../../Common/Bookmark";
import Lifelines from "../common/Lifelines";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getAndUpdateBookmarkData, deleteBookmarkByQuestionID, getSystemSettings } from "../../../utils";
import { useLocation } from "react-router-dom";

function ContestPlayQuestions({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, showLifeLine, showBookmark, setCoinScoreOnEnd, showQuestions }) {
    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [sysConfig, setSysConfig] = useState();
    const child = useRef(null);
    const scroll = useRef(null);
    let { contest_id } = useLocation();

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
            let newScore = JSON.stringify(userScore);
            let correctAnswer = JSON.stringify(result_score);
            api.setContestLeaderboard(contest_id.contest_id, questions.length, correctAnswer, newScore);
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

    const handleFiftyFifty = () => {
        let update_questions = [...questions];
        if (update_questions[currentQuestion].question_type === "2") {
            toast.error(t("This Lifeline is not allowed"));
            return false;
        }
        let all_option = ["optiona", "optionb", "optionc", "optiond", "optione"];

        //Identify the correct answer option and add that to visible option array
        let user = getUserData();
        let decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
        let index = all_option.indexOf("option" + decryptedAnswer);
        let visible_option = [all_option[index]];

        //delete correct option from all option array
        all_option.splice(index, 1);

        //Remove Options that are empty
        all_option.map((data, key) => {
            if (questions[currentQuestion][data] === "") {
                all_option.splice(key, 1);
            }
            return data;
        });

        //Generate random key to select the second option from all option array
        let random_number = Math.floor(Math.random() * all_option.length);

        visible_option.push(all_option[random_number]);

        //delete that option from all option array
        all_option.splice(random_number, 1);

        //at the end delete option from the current question that are available in all options
        all_option = all_option.map((data) => {
            delete update_questions[currentQuestion][data];
            return data;
        });

        setQuestions(update_questions);
        return true;
    };

    function generate(max, thecount) {
        let r = [];
        let currsum = 0;
        for (let i = 0; i < thecount - 1; i++) {
            r[i] = randombetween(1, max - (thecount - i - 1) - currsum);
            currsum += r[i];
        }
        r[thecount - 1] = max - currsum;
        return r;
    }

    function randombetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const handleAudiencePoll = () => {
        let update_questions = [...questions];
        let { answer, optione, question_type } = update_questions[currentQuestion];
        let user = getUserData();
        let decryptedAnswer = decryptAnswer(answer, user.firebase_id);
        let all_option = [];
        if (question_type === "2") {
            all_option = ["a", "b"];
        } else {
            all_option = ["a", "b", "c", "d"];
            if (optione !== "") {
                all_option.push("e");
            }
        }

        //Generate Random % for all the options
        let numbers = generate(100, all_option.length);

        //Get the Maximum number and assign that number to correct number
        let maximum = Math.max(...numbers);
        update_questions[currentQuestion]["probability_" + [decryptedAnswer]] = maximum + " %";

        //Remove correct option and maximum number from the array
        all_option.splice(all_option.indexOf(decryptedAnswer), 1);
        numbers.splice(numbers.indexOf(maximum), 1);

        //apply map function and assign the remaining numbers to incorrect options
        all_option = all_option.map((data, key) => {
            update_questions[currentQuestion]["probability_" + [data]] = numbers[key] + " %";
            return data;
        });
        setQuestions(update_questions);
    };

    const handleSkipQuestion = () => {
        setNextQuestion();
    };

    const onTimerExpire = () => {
        setNextQuestion();
    };

    const handleTimerReset = () => {
        child.current.resetTimer();
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: scroll.current.scrollHeight,
            left: 0,
            behavior: "smooth",
        });
    };

    return (
        <React.Fragment>
            <div className="questions contestque" ref={scroll}>
                <div className="inner__headerdash ">


                    {questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}

                    <div className="total__out__leveldata">
                        <h5 className="text-white inner__total-leveldata">
                            {currentQuestion + 1} | {questions.length}
                        </h5>
                    </div>

                    {/* <div className=" p-2 pb-0">
                        {showBookmark ? <Bookmark id={questions[currentQuestion].id} isBookmarked={questions[currentQuestion].isBookmarked ? questions[currentQuestion].isBookmarked : false} onClick={handleBookmarkClick} /> : ""}
                    </div> */}
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
                {showLifeLine ? (
                    <Lifelines
                        handleFiftFifty={handleFiftyFifty}
                        handleAudiencePoll={handleAudiencePoll}
                        handleResetTime={handleTimerReset}
                        handleSkipQuestion={handleSkipQuestion}
                        showFiftyFifty={questions[currentQuestion]["question_type"] == 2 ? false : true}
                        audiencepoll={questions[currentQuestion]["question_type"] == 2 ? false : true}
                    />
                ) : (
                    ""
                )}
            </div>
        </React.Fragment>
    );
}

ContestPlayQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

ContestPlayQuestions.defaultProps = {
    showLifeLine: true,
    showBookmark: true,
    setCoinScoreOnEnd: true,
};

export default withTranslation()(ContestPlayQuestions);
