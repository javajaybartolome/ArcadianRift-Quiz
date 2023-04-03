import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import Bookmark from "../../Common/Bookmark";
import { withTranslation } from "react-i18next";
import Timer from "../common/Timer";
import config from "../../../utils/config";
import { getUserData, decryptAnswer, calculateScore, calculateCoins, updateUserData, getAndUpdateBookmarkData, deleteBookmarkByQuestionID, getSystemSettings } from "../../../utils";
import GuesstheWord from "./GuesstheWord";

function GuessthewordQuestions({ t, questions: data, timerSeconds, onOptionClick, onQuestionEnd, showBookmark, setCoinScoreOnEnd, showQuestions }) {
    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [sysConfig, setSysConfig] = useState();
    const [input, setInput] = useState(null);
    const [actIndex, setActIndex] = useState(0);
    const child = useRef(null);
    const scroll = useRef(null);

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
            clearallInput();
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

    //guesstheword answer click
    const guessthewordCheck = (selected_option) => {
        let { id, answer } = questions[currentQuestion];

        let user = getUserData();

        let decryptedAnswer = decryptAnswer(answer, user.firebase_id).toUpperCase().replaceAll(/\s/g, "");
        let result_score = score;

        if (decryptedAnswer == selected_option) {
            result_score++;
            setScore(result_score);
            toast.success("Correct Answer");
        } else {
            toast.error("Incorrect Answer");
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

    const scrollToBottom = () => {
        window.scrollTo({
            top: scroll.current.scrollHeight,
            left: 0,
            behavior: "smooth",
        });
    };

    const clearallInput = () => {
        let v = input;
        v = v.map((obj) => {
            if (obj.index !== null) {
                if (document.getElementById(`btn-${obj.index}`) !== null) {
                    document.getElementById(`btn-${obj.index}`).disabled = false;
                }
            }
            return { ...obj, value: "" };
        });
        setInput(v);
        setActIndex(0);
    };

    return (
        <>
            <div className="questions guessthewordque" ref={scroll}>
                <div className="inner__headerdash">
                    <div className="total__out__leveldata">
                        <h5 className="inner__total-leveldata">
                            {currentQuestion + 1} | {questions.length}
                        </h5>
                    </div>

                    <div className="inner__headerdash">{questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}</div>

                    <div className=" p-2 pb-0">
                        {showBookmark ? <Bookmark id={questions[currentQuestion].id} isBookmarked={questions[currentQuestion].isBookmarked ? questions[currentQuestion].isBookmarked : false} onClick={handleBookmarkClick} /> : ""}
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

                {/* guess the word */}

                <GuesstheWord
                    answer={questions[currentQuestion].answer ? decryptAnswer(questions[currentQuestion].answer, user.firebase_id) : ""}
                    guessthewordCheck={guessthewordCheck}
                    input={input}
                    setInput={setInput}
                    actIndex={actIndex}
                    setActIndex={setActIndex}
                    clearallInput={clearallInput}
                />
            </div>
        </>
    );
}

GuessthewordQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

GuessthewordQuestions.defaultProps = {
    showBookmark: true,
    setCoinScoreOnEnd: true,
};

export default withTranslation()(GuessthewordQuestions);
