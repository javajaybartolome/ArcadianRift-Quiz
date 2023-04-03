import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import { withTranslation } from "react-i18next";
import Footer from "../partials/footer/Footer";
import { getSystemSettings } from "../utils";
import { useEffect } from "react";

const Quizplay = ({ t }) => {
    const history = useHistory();

    // data show
    const [data, setData] = useState([
        {
            id: 0,
            image: "images/quizplay/quizzone.webp",
            quizname: "Quiz Zone",
            url: "/QuizZone",
            quizzonehide: 1,
        },
        {
            id: 1,
            image: "images/quizplay/dailyquiz.webp",
            quizname: "daily quiz",
            url: "/DailyQuizDashboard",
            dailyquizhide: "1",
        },
        {
            id: 2,
            image: "images/quizplay/truefalse.webp",
            quizname: "true & false",
            url: "/TrueandFalsePlay",
            truefalsehide: 1,
        },

        {
            id: 3,
            image: "images/quizplay/funlearn.webp",
            quizname: "fun & learn",
            url: "/Fun-and-Learn",
            funandlearnhide: "1",
        },
        {
            id: 4,
            image: "images/quizplay/guesstheword.webp",
            quizname: "Guess the word",
            url: "/Guess-the-Word",
            guessthewordhide: "1",
        },
        {
            id: 5,
            image: "images/quizplay/selfchellenge.webp",
            quizname: "self challenge",
            url: "/SelfLearning",
            selfchallengehide: "1",
        },
        {
            id: 6,
            image: "images/quizplay/contestplay.webp",
            quizname: "contest play",
            url: "/ContestPlay",
            contestplayhide: "1",
        },
        {
            id: 7,
            image: "images/quizplay/battlequiz.webp",
            quizname: "battle quiz",
            url: "/RandomBattle",
            battlequizhide: "1",
        },
        {
            id: 8,
            image: "images/quizplay/groupplay.webp",
            quizname: "group play",
            url:"/GroupBattle",
            groupplayhide: "1",
        },
    ]);

    // redirect to page
    const redirectdata = (data) => {
        if (!data.disabled) {
            history.push(data.url);
        } else {
            toast.error("Coming Soon");
        }
    };

    // system settings
    const sysSettings = getSystemSettings();

    // hide from system settings
    const checkDisabled = () => {
        if (sysSettings.daily_quiz_mode == "0") {
            let index = data.findIndex((o) => {
                return o.dailyquizhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.contest_mode == "0") {
            let index = data.findIndex((o) => {
                return o.contestplayhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.self_challenge_mode == "0") {
            let index = data.findIndex((o) => {
                return o.selfchallengehide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.fun_n_learn_question == "0") {
            let index = data.findIndex((o) => {
                return o.funandlearnhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.guess_the_word_question == "0") {
            let index = data.findIndex((o) => {
                return o.guessthewordhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.battle_mode_one == "0") {
            let index = data.findIndex((o) => {
                return o.battlequizhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.battle_mode_group == "0") {
            let index = data.findIndex((o) => {
                return o.groupplayhide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }
        if (sysSettings.audio_mode_question == "0") {
            let index = data.findIndex((o) => {
                return o.audioQuestionshide === "1";
            });
            if (index !== -1) data.splice(index, 1);
        }

    };

    useEffect(() => {
        checkDisabled();
    }, []);

    return (
        <React.Fragment>
            <SEO title={t("Quizplay")} />
            <TopHeader />
            <Header />

            <div className="Quizzone">
                <div className="container">
                    <ul className="row justify-content-center">
                        {data.map((quiz) => (
                            <li onClick={() => redirectdata(quiz)} className="col-xl-2 col-lg-3 col-md-3 col-sm-6 col-6 small__div" key={quiz.id}>
                                <div className="inner__Quizzone">
                                    {quiz.disabled ? (
                                        <div className="card_disabled">
                                            <div className="card__icon">
                                                <img src={quiz.image} alt="icon" />
                                            </div>
                                            <div className="title__card">
                                                <h5 className="inner__title">{t(quiz.quizname)}</h5>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="card">
                                            <div className="card__icon">
                                                <img src={quiz.image} alt="icon" />
                                            </div>
                                            <div className="title__card">
                                                <h5 className="inner__title">{t(quiz.quizname)}</h5>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(Quizplay);
