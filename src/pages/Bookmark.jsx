import React, { useEffect, useState } from "react";
import { Tab } from "react-bootstrap";
import SEO from "../components/SEO";
import Header from "../partials/header/Header";
import { FaRegTrashAlt } from "react-icons/fa";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import TopHeader from "../components/smalltopheader/TopHeader";
import { Link } from "react-router-dom";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { decryptAnswer, deleteBookmarkData, getUserData } from "../utils";
import Footer from "../partials/footer/Footer";
import { IoArrowBack, IoPlaySharp } from "react-icons/io5";

const Bookmark = ({ t }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        var type = 1;
        var user = getUserData();
        api.getBookmark(type).then((response) => {
            if (!response.error) {
                var questions = response.data.map((data) => {
                    data.textAnswer = decryptAnswer(data.answer, user.firebase_id);
                    return data;
                });
                setQuestions(response.data);
                setLoading(false);
            }
        });
    }, []);

    const deleteBookmark = (question_id, bookmark_id) => {
        var bookmark = "0";
        var type = 1;
        api.setBookmark(question_id, bookmark, type).then((response) => {
            var old_questions = questions;
            var new_questions = questions.filter((data) => {
                return data.question_id !== question_id;
            });
            setQuestions(new_questions);
            if (!response.error) {
                toast.success(t("Question removed from Bookmark"));
                deleteBookmarkData(bookmark_id);
            } else {
                setQuestions(old_questions);
            }
        });
    };

    return (
        <React.Fragment>
            <SEO title={t("bookmark")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("bookmark")} content={t("Home")} contentTwo={t("bookmark")} />
            <div className="Bookmark">
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                    <div className="container">
                        <div className="row morphisam">
                            <div className="col-12 col-md-12 col-12 px-0">
                                {loading ? (
                                    <div className="text-center ">
                                        <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                    </div>
                                ) : questions.length > 0 ? (
                                    questions.map((question, key) => {
                                        return (
                                            <div className="outer__stage bookmark-box" key={key}>
                                                <div className="three__stage">
                                                    <div className="number_stage">
                                                        <span>{key + 1}</span>
                                                    </div>
                                                    <div className="content_stage">
                                                        <p>{question.question}</p>
                                                        <span>
                                                            {t("Answer")}: <span className="text-uppercase">{question.textAnswer ? question["option" + question.textAnswer] : t("Not Attempted")}</span>
                                                        </span>
                                                    </div>
                                                    <div className="delete__stage">
                                                        <button className="btn btn-primary" onClick={() => deleteBookmark(question.question_id, question.id)}>
                                                            <FaRegTrashAlt />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <h4 className="text-center ">{t("No Data Found")}</h4>
                                        <div className="play__button">
                                            <Link to={"/"} className="btn btn-primary d-block">
                                                {t("Back")}
                                            </Link>
                                        </div>
                                    </>
                                )}
                                {questions.length > 0 ? (
                                    <div className="play__button d-flex justify-content-between">
                                        <Link to={"/"} className="btn btn-primary d-flex align-items-center">
                                            <IoArrowBack /> {t("Back")}
                                        </Link>
                                        <Link to={"/play-bookmark-questions"} className="btn btn-primary d-flex align-items-center">
                                            {t("Play Bookmark")} <IoPlaySharp />
                                        </Link>
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </div>
                </Tab.Container>
            </div>
            <Footer />
        </React.Fragment>
    );
};

export default withTranslation()(Bookmark);
