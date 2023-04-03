import React, { Fragment, useCallback, useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import { withTranslation, useTranslation } from "react-i18next";
import Footer from "../partials/footer/Footer";
import { Spinner } from "react-bootstrap";
import { getSystemSettings } from "../utils";
import { toast } from "react-toastify";
import * as api from "../utils/api";
import FunandLearnSlider from "../components/Quiz/Fun_and_Learn/FunandLearnSlider";
import { Link, Redirect, useHistory } from "react-router-dom";
import excla from "../assets/images/exclamation.png";

const Fun_and_Learn = ({ t }) => {
    const [category, setCategory] = useState({ all: "", selected: "" });

    const [funandlearn, setFunandLearn] = useState();

    const [loading, setLoading] = useState(true);

    const [subloading, setSubLoading] = useState(true);

    const { i18n } = useTranslation();

    const history = useHistory();

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

    const getAllData = () => {
        setCategory([]);
        setFunandLearn([]);
        api.getCategories(2).then((response) => {
            var categories = response.data;
            if (categories) {
                setCategory({
                    ...categories,
                    all: categories,
                    selected: categories[0],
                });
                setLoading(false)
                api.funandlearn("category", categories[0].id).then((response) => {
                    if (!response.error) setFunandLearn(response.data);
                    setSubLoading(false)
                });
            }
        });
    };

    const handleChangeCategory = async (data) => {
        setCategory({ ...category, selected: data });
        setFunandLearn([]);
        setSubLoading(true)
        var funandlearn_response = await api.funandlearn("category", data.id);
        var funandlearn_data = funandlearn_response.data;
        if (!funandlearn_response.error && funandlearn_data) {
            setFunandLearn(funandlearn_data);
            setSubLoading(false)
        } else {
            toast.error(t("No Fun and Learn Questions Found"));
        }
    };

    //truncate text
    const truncate = (txtlength) => (txtlength?.length > 17 ? `${txtlength.substring(0, 17)}...` : txtlength);

    return (
        <Fragment>
            <SEO title={t("Fun and Learn")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Fun and Learn")} content={t("Home")} contentTwo={t("Fun and Learn")} />
            <div className="funandlearn mb-5">
                <div className="container">
                    <div className="row morphisam mb-5">
                        <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-12">
                            <div className="left-sec">
                                {/* left category sec*/}
                                <div className="bottom__left">
                                    <div className="cat__Box">
                                        <span className="left-line"></span>
                                        <h3 className="funandlearn__title text-uppercase  font-weight-bold">{t("Categories")}</h3>
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
                                                                <li className="d-flex" key={key} onClick={() => handleChangeCategory(data)}>
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
                        {/* right sec  */}
                        <div className="col-xxl-9 col-xl-8 col-lg-8 col-md-12 col-12">
                            <div className="bottom_card">
                                <FunandLearnSlider data={funandlearn} url={`/FunandLearnPlay`} subloading={subloading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
};

export default withTranslation()(Fun_and_Learn);
