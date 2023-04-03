import React, { Fragment, useCallback, useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import { useTranslation, withTranslation } from "react-i18next";
import Form from "react-bootstrap/Form";
import QuestionSlider from "../components/Quiz/SelfLearning/QuestionSlider";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import Questionsdata from "../components/Quiz/SelfLearning/Questionsdata";
import TimerSlider from "../components/Quiz/SelfLearning/TimerSlider";
import { useHistory } from "react-router-dom";
import { getSystemSettings } from "../utils";

const SelfLearning = ({ t }) => {
    const [loading, setLoading] = useState(true);

    const [subloading, setSubLoading] = useState(true);

    //category
    const [category, setCategory] = useState({
        all: "",
        selected: "",
    });

    // subcategory
    const [subcategory, setSubCategory] = useState({
        all: "",
        selected: "",
    });

    // hide
    const [showed, setShowed] = useState(false);

    // questions
    const [totalquestions, setTotalQuestions] = useState({
        selected: "",
    });

    //timer
    const [timerseconds, setTimerseconds] = useState({
        selected: "",
    });

    // active elenment for questions
    const [activeIndex, setActiveIndex] = useState(0);

    // active element for timer
    const [timeractiveIndex, setTimerActiveIndex] = useState(0);

    let history = useHistory();
    const { i18n } = useTranslation();
    const sysSettings = getSystemSettings();

    if (sysSettings.language_mode == "1") {
        const handleLanguageChanged = useCallback(() => {
            getAllData();
        }, []);

        useEffect(() => {
            i18n.on("languageChanged", handleLanguageChanged);
            return () => {
                i18n.off("languageChanged", handleLanguageChanged);
            };
        }, [handleLanguageChanged]);
    } else {
        useEffect(() => {
            getAllData();
        }, []);
    }

    // all data
    const getAllData = () => {
        setCategory([]);
        setSubCategory([]);

        api.getCategories(1).then((response) => {
            let categories = response.data;
            if (categories) {
                setCategory({ ...category, all: categories, selected: categories[0] });
                setLoading(false)
                if (categories[0].no_of !== "0") {
                    api.getSubcategories(categories[0].id).then((response) => {
                        let subCategories = response.data;
                        if (!response.error && subCategories) {
                            setSubCategory({
                                all: subCategories,
                                selected: subCategories[0],
                            });
                            setSubLoading(false)
                        }
                    });
                }
            } else {
                toast.error("No Data Found");
            }
        });
    };

    // change category data
    const handleChangeCategory = async (e) => {
        const index = e.target.selectedIndex;
        const el = e.target.childNodes[index];
        setCategory({ ...category, selected: index });
        setSubCategory([]);

        //subcategories check
        let cat_id = el.getAttribute("id");
        let no_of = el.getAttribute("no_of");

        if (no_of !== "0") {
            let response = await api.getSubcategories(cat_id);
            let subcategories = response.data;
            setShowed(false);
            if (!response.error && subcategories) {
                setSubCategory({ all: subcategories, selected: subcategories[0] });
                setSubLoading(false)
            }
        } else {
            setShowed(true);
        }
    };

    useEffect(() => {
        getAllData();
    }, []);

    // questionsclick
    const handleQuestionsClick = (selecteddata) => {
        setActiveIndex(selecteddata);
        setTotalQuestions({ ...totalquestions, selected: selecteddata });
    };

    // timerclick
    const handleTimerClick = (selecteddata) => {
        setTimerActiveIndex(selecteddata);
        setTimerseconds({ ...timerseconds, selected: selecteddata });
    };

    //start
    const handleStart = () => {
        if (!totalquestions.selected) {
            toast.error("Please select Number of Questions");
        } else if (!timerseconds.selected) {
            toast.error("Please select Number of Timer");
        } else {
            history.push({
                pathname: "/SelfLearningplay",
                data: {
                    category_id: category.selected.id,
                    subcategory_id: subcategory.selected.id,
                    limit: totalquestions.selected,
                    timer: timerseconds.selected,
                },
            });
        }
    };

    return (
        <Fragment>
            <SEO title={t("Self Learning")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Self Learning")} content={t("Home")} contentTwo={t("Self Learning")} />
            <div className="SelfLearning mb-5">
                <div className="container">
                    <div className="row morphisam mb-5">
                        <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-12">
                            <div className="left-sec">
                                {/* category */}
                                <div className="cat__Box">
                                    <span className="left-line"></span>
                                    <h3 className="quizplay__title text-uppercase  font-weight-bold">{t("Select Category")}</h3>
                                    <span className="right-line"></span>
                                </div>
                                <div className="bottom__cat__box">
                                    <Form.Select aria-label="Default select example" size="lg" className="selectform" onChange={(e) => handleChangeCategory(e)}>
                                        {loading ? (
                                            <div className="text-center">
                                                <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                            </div>
                                        ) : (
                                            <>
                                                {category.all ? (
                                                    category.all.map((cat_data, key) => {
                                                        // console.log("",cat_data)
                                                        const { category_name } = cat_data;
                                                        return (
                                                            <option key={key} value={cat_data.key} id={cat_data.id} no_of={cat_data.no_of}>
                                                                {category_name}
                                                            </option>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center">
                                                        <p>{t("No Category Data Found")}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Form.Select>
                                </div>

                                {/* sub category */}
                                <div style={showed ? { display: "none" } : { display: "block" }}>
                                    <div className="cat__Box sub_Cat_box">
                                        <span className="left-line"></span>
                                        <h3 className="quizplay__title text-uppercase  font-weight-bold">{t("Select SubCategory")}</h3>
                                        <span className="right-line"></span>
                                    </div>

                                    <div className="bottom__cat__box">
                                        <Form.Select aria-label="Default select example" size="lg" className="selectform">
                                            {subloading ? (
                                                <div className="text-center">
                                                    <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                                </div>
                                            ) : (
                                                <>
                                                    {subcategory.all ? (
                                                        subcategory.all.map((subcat_data, key) => {
                                                            const { subcategory_name } = subcat_data;
                                                            return (
                                                                <option key={key} value={subcat_data.key}>
                                                                    {subcategory_name}
                                                                </option>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center">
                                                            <p>{t("No Subcategories Data Found")}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Form.Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* questions */}
                        <div className="col-xxl-9 col-xl-8 col-lg-8 col-md-12 col-12">
                            <div className="right-sec">
                                {/* questions slider */}
                                <QuestionSlider quetions={Questionsdata} onClick={handleQuestionsClick} activeIndex={activeIndex} />
                                {/* timer slider */}
                                <TimerSlider  onClick={handleTimerClick} timeractiveIndex={timeractiveIndex} />
                            </div>
                        </div>

                        {/* Start button */}
                        <div className="row">
                            <div className="start_button justify-content-center align-items-center d-flex">
                                <button className="btn btn-primary" onClick={() => handleStart()}>
                                    {t("Let`s Start")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default withTranslation()(SelfLearning);
