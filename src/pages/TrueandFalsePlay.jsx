import React, { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import { withTranslation } from "react-i18next";
import ShowScore from "../components/Quiz/common/ShowScore";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import config from "../utils/config.js";
import { Spinner } from "react-bootstrap";
import Question from "../components/Quiz/common/Question";
import ReviewAnswer from "../components/Quiz/common/ReviewAnswer";
import { getBookmarkData, getSystemSettings } from "../utils";

const MySwal = withReactContent(Swal);

const sysSettings = getSystemSettings();

let timerseconds = parseInt(sysSettings.quiz_zone_duration);

const TIMER_SECONDS = timerseconds;

const TrueandFalsePlay = ({ t }) => {
    //questions
    const [questions, setQuestions] = useState([{ id: "", isBookmarked: false }]);

    //show score
    const [showScore, setShowScore] = useState(false);

    //score
    const [score, setScore] = useState(0);

    //reviewanswer
    const [reviewAnswers, setReviewAnswers] = useState(false);

    //coins
    const [coins, setCoins] = useState(0);

    //quizscore
    const [quizScore, setQuizScore] = useState(0);

    //location
    const history = useHistory();

    useEffect(() => {
        if (!showScore) {
            getTrueandFalseQuestions();
        }
    }, []);

    //api
    const getTrueandFalseQuestions = () => {
        api.trueandfalsequestions(2, 10).then((response) => {
            if (response.data && !response.data.error) {
                var bookmark = getBookmarkData();
                var questions_ids = Object.keys(bookmark).map((index) => {
                    return bookmark[index].question_id;
                });
                var questions = response.data.map((data) => {
                    var isBookmark = false;
                    if (questions_ids.indexOf(data.id) >= 0) {
                        isBookmark = true;
                    } else {
                        isBookmark = false;
                    }
                    return {
                        ...data,
                        isBookmarked: isBookmark,
                        selected_answer: "",
                        isAnswered: false,
                    };
                });
                setQuestions(questions);
                setShowScore(false);
                setReviewAnswers(false);
                setScore(0);
            } else {
                toast.error(t("No Questions Found"));
                history.replace("/Quizplay");
            }
        });
    };

    //answer option click
    const handleAnswerOptionClick = (questions, score) => {
        setQuestions(questions);
        setScore(score);
    };

    const onQuestionEnd = (coins, quizScore) => {
        setShowScore(true);
        setCoins(coins);
        setQuizScore(quizScore);
    };

    return (
        <React.Fragment>
            <SEO title={t("True and False")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("True & False")} content={t("Home")} contentTwo={t("True & False")} />
            <div className="true_and_false dashboard">
                <div className="container">
                    <div className="row ">
                        <div className="morphisam">
                            <div className="whitebackground pt-3">
                                {(() => {
                                    if (showScore) {
                                        return <ShowScore score={score} totalQuestions={questions.length} coins={coins} quizScore={quizScore} reviewAnswer={true} playAgain={true} nextlevel={false} />;
                                    } else if (reviewAnswers) {
                                        return <ReviewAnswer reportquestions={false} questions={questions} />;
                                    } else {
                                        return questions && questions.length >= 1 ? (
                                            <Question questions={questions} timerSeconds={TIMER_SECONDS} onOptionClick={handleAnswerOptionClick} onQuestionEnd={onQuestionEnd} showLifeLine={false} showQuestions={false} />
                                        ) : (
                                            <div className="text-center text-white">
                                                <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                    <span className="circleglass__after"></span>
                </div>
            </div>
        </React.Fragment>
    );
};

export default withTranslation()(TrueandFalsePlay);
