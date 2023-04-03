import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Header from "../partials/header/Header";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import Question from "../components/Quiz/common/Question";
import { withTranslation } from "react-i18next";
import config from "../utils/config";
import Footer from "../partials/footer/Footer";
import { getSystemSettings } from "../utils";

const sysSettings = getSystemSettings();

let timerseconds = parseInt(sysSettings.quiz_zone_duration);

const TIMER_SECONDS = timerseconds;

const BookmarkPlay = ({ t }) => {
    const history = useHistory();

    const [questions, setQuestions] = useState([{ id: "", isBookmarked: false }]);
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        getNewQuestions();
    }, []);

    // bookmark api
    const getNewQuestions = () => {
        api.getBookmark(1).then((response) => {
            if (!response.error) {
                var questions = response.data.map((data) => ({
                    ...data,
                    isBookmarked: false,
                    selected_answer: "",
                    isAnswered: false,
                }));
                setQuestions(questions);
                if (questions.length === 0) {
                    toast.error(t("No Data Found"));
                    history.push("/");
                }
            } else {
                toast.error(t("No Questions Found"));
            }
        });
    };

    //answer option click
    const handleAnswerOptionClick = (questions, score) => {
        setQuestions(questions);
    };

    //back button question end
    const onQuestionEnd = () => {
        setShowBackButton(true);
    };

    //go back button
    const goBack = () => {
        history.replace("/Bookmark");
    };

    return (
        <React.Fragment>
            <SEO title={t("DashboardPlay")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("BookmarkPlay")} content={t("Home")} contentTwo={t("BookmarkPlay")} />
            <div className="dashboard">
                <div className="container">
                    <div className="row morphisam">
                        <div className="whitebackground">
                            {(() => {
                                if (showBackButton) {
                                    return (
                                        <div className="dashoptions">
                                            <div className="resettimer">
                                                <button className="btn" onClick={goBack}>
                                                    {t("Back")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return questions && questions.length > 0 ? (
                                        <Question
                                            questions={questions}
                                            timerSeconds={TIMER_SECONDS}
                                            onOptionClick={handleAnswerOptionClick}
                                            onQuestionEnd={onQuestionEnd}
                                            showLifeLine={false}
                                            showBookmark={false}
                                            setCoinScoreOnEnd={false}
                                        />
                                    ) : (
                                        <div className="text-center text-white">
                                            <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                    <span className="circleglass__after"></span>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(BookmarkPlay);
