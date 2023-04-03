import React, { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import * as api from "../../../utils/api";
import { getUserData, decryptAnswer } from "../../../utils";
const MySwal = withReactContent(Swal);
function RandomReviewAnswer({ questions, goBack, t, reportquestions }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [sysConfig, setSysConfig] = useState();
    const [disablePrev, setDisablePrev] = useState(true);
    const [disableNext, setDisableNext] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            var response = await api.getSystemConfigurations();
            if (!response.error) {
                setSysConfig(response.data);
            }
        };
        fetchData();
    }, []);

    const reportQuestion = (question_id) => {
        MySwal.fire({
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("Continue"),
            input: "textarea",
            inputLabel: t("Reason"),
            inputPlaceholder: t("Enter your Reason"),
            inputAttributes: {
                "aria-label": t("Enter your Reason"),
            },
        }).then((result) => {
            if (result.isConfirmed) {
                api.reportQuestion(question_id, result.value).then((response) => {
                    if (!response.error) {
                        Swal.fire(t("Success"), t("Question Reported successfully"), "success");
                    } else {
                        Swal.fire(t("OOps"), t("Please Try again"), "error");
                    }
                });
            }
        });
    };

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

    const setAnswerStatusClass = (option) => {
        var user = getUserData();
        var decryptedAnswer = decryptAnswer(questions[currentQuestion].answer, user.firebase_id);
        if (decryptedAnswer === option) {
            return "bg-success";
        } else if (questions[currentQuestion].selected_answer === option) {
            return "bg-danger";
        }
    };

    return (
        <React.Fragment>
            <div className="text-center">
                <h4 className="">{t("Review Answers")}</h4>
            </div>
            <div className="inner__headerdash">
                <div className="total__out__leveldata coinsdata">
                    <h5 className="inner__total-leveldata ">
                        {currentQuestion + 1} | {questions.length}
                    </h5>
                </div>
                {reportquestions ? (
                    <div className="bookmark_area">
                        <button title="Report Question" className="btn bookmark_btn  " onClick={() => reportQuestion(questions[currentQuestion].id)}>
                            <FaExclamationTriangle className="fa-2x" />
                        </button>
                    </div>
                ) : (
                    false
                )}
            </div>
            <div className="content__text">
                <p className="question-text">{questions[currentQuestion].question}</p>
            </div>

            {questions[currentQuestion].image ? (
                <div className="imagedash">
                    <img src={questions[currentQuestion].image} alt="" />
                </div>
            ) : (
                ""
            )}

            <div className="row">
                {questions[currentQuestion].optiona ? (
                    <div className="col-md-6 col-12">
                        <div className="inner__questions">
                            <button className={`btn button__ui w-100 ${setAnswerStatusClass("a")}`}>{questions[currentQuestion].optiona}</button>
                        </div>
                    </div>
                ) : (
                    ""
                )}
                {questions[currentQuestion].optionb ? (
                    <div className="col-md-6 col-12">
                        <div className="inner__questions">
                            <button className={`btn button__ui w-100 ${setAnswerStatusClass("b")}`}>{questions[currentQuestion].optionb}</button>
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
                                    <button className={`btn button__ui w-100 ${setAnswerStatusClass("c")}`}>{questions[currentQuestion].optionc}</button>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                        {questions[currentQuestion].optiond ? (
                            <div className="col-md-6 col-12">
                                <div className="inner__questions">
                                    <button className={`btn button__ui w-100 ${setAnswerStatusClass("d")}`}>{questions[currentQuestion].optiond}</button>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                        {sysConfig && sysConfig.option_e_mode && questions[currentQuestion].optione ? (
                            <div className="row d-flex justify-content-center">
                                <div className="col-md-6 col-12">
                                    <div className="inner__questions">
                                        <button className={`btn button__ui w-100 ${setAnswerStatusClass("e")}`}>
                                            <div className="row">
                                                <div className="col">{questions[currentQuestion].optione}</div>
                                                {questions[currentQuestion].probability_e ? <div className="col text-end">{questions[currentQuestion].probability_e}</div> : ""}
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
                {!questions[currentQuestion].selected_answer ? (
                    <div className="text-end">
                        <span className="">*{t("Not Attempted")}</span>
                    </div>
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
                    <button className="btn btn-primary" onClick={goBack}>
                        {t("Back")}
                    </button>
                </div>
                <div className="skip__questions">
                    <button className="btn btn-primary" onClick={nextQuestion} disabled={disableNext}>
                        &gt;
                    </button>
                </div>
            </div>
            <div className="text-center ">
                <small>{questions[currentQuestion].note ? <p>{t("Note") + " : " + questions[currentQuestion].note}</p> : ""}</small>
            </div>
        </React.Fragment>
    );
}

RandomReviewAnswer.propTypes = {
    questions: PropTypes.array.isRequired,
    goBack: PropTypes.func,
};

export default withTranslation()(RandomReviewAnswer);
