import React, { Fragment, useState, useEffect, useCallback } from "react";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import { withTranslation } from "react-i18next";
import Footer from "../partials/footer/Footer";
import { Spinner } from "react-bootstrap";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getSystemSettings } from "../utils";
import excla from "../assets/images/exclamation.png";
import Guessthewordslider from "../components/Quiz/Guesstheword/Guessthewordslider";
import { useHistory } from "react-router-dom";

const Guess_the_Word = ({ t }) => {
    const [loading, setLoading] = useState(true);
    const [subloading, setSubLoading] = useState(true);
    const [category, setCategory] = useState({ all: "", selected: "" });
    const [subCategory, setsubCategory] = useState({ all: "", selected: "" });
    const { i18n } = useTranslation();
    const sysSettings = getSystemSettings();
    let history = useHistory();

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

    const getAllData = () => {
        setCategory([]);

        api.getCategories(3).then((response) => {
            var categories = response.data;
            if (categories) {
                setCategory({ ...category, all: categories, selected: categories[0] });
                setLoading(false)
                if (categories[0].no_of !== "0") {
                    api.getSubcategories(categories[0].id).then((response) => {
                        if (!response.error) {
                            setsubCategory(response.data);
                            setSubLoading(false)
                        }
                    });
                }
            } else {
                toast.error(t("No Data found"));
            }
        });
    };

    const handleChangeCategory = async (data) => {
        setCategory({ ...category, selected: data });
        setLoading(false)
        if (data.no_of !== "0") {
            api.getSubcategories(data.id).then((response) => {
                if (!response.error) {
                    setsubCategory(response.data);
                    setSubLoading(false)
                }
            });
        } else {
            history.push({
                pathname: "/guess-the-word-play",
                data: {
                    category_id: data.id,
                },
            });
        }
    };

    const truncate = (txtlength) => (txtlength?.length > 17 ? `${txtlength.substring(0, 17)}...` : txtlength);

    return (
        <Fragment>
            <SEO title={t("Guess the Word")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Guess the Word")} content={t("Home")} contentTwo={t("Guess the Word")} />
            <div className="Guesstheword mb-5">
                <div className="container">
                    <div className="row morphisam mb-5">
                        <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-12">
                            <div className="left-sec">
                                {/* left category sec*/}
                                <div className="bottom__left">
                                    <div className="cat__Box">
                                        <span className="left-line"></span>
                                        <h3 className="quizplay__title text-uppercase font-weight-bold">{t("Categories")}</h3>
                                        <span className="right-line"></span>
                                    </div>
                                    <div className="bottom__cat__box">
                                        <ul className="inner__Cat__box">
                                            {loading ? (
                                                <div className="text-center">
                                                    <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                                </div>
                                            ) : (
                                                <>
                                                    {category.all ? (
                                                        category.all.map((data, key) => {
                                                            return (
                                                                <li className="d-flex" key={key} onClick={(e) => handleChangeCategory(data)}>
                                                                    <div className={`w-100 button ${category.selected && category.selected.id === data.id ? "active-one" : "unactive-one"}`}>
                                                                        <span className="Box__icon">
                                                                            <img src={data.image ? data.image : `${excla}`} alt="image" />
                                                                        </span>
                                                                        <p className="Box__text">{truncate(data.category_name)}</p>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center">
                                                            <p>{t("No Category Data Found")}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* sub category middle sec */}
                        <div className="col-xxl-9 col-xl-8 col-lg-8 col-md-12 col-12">
                            <div className="right-sec">
                                <Guessthewordslider data={subCategory} url={`/guess-the-word-play`} guessloader={subloading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
};

export default withTranslation()(Guess_the_Word);
