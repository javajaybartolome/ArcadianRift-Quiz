import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../partials/header/Header";
import SEO from "../components/SEO";
import SubCatslider from "../components/Quiz/subcat/SubCatslider";
import UnlockLevel from "../components/Quiz/subcat/UnlockLevel";
import * as api from "../utils/api";
import { toast } from "react-toastify";
import TopHeader from "../components/smalltopheader/TopHeader";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import { withTranslation, useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { scrollhandler, getSystemSettings } from "../utils";
import excla from "../assets/images/exclamation.png";
import Footer from "../partials/footer/Footer";
import { t } from "i18next";

const QuizZone = () => {
    const [category, setCategory] = useState({ all: "", selected: "" });
    const [subCategory, setsubCategory] = useState({ all: "", selected: "" });
    const [level, setLevel] = useState([]);
    const { i18n } = useTranslation();
    const sysSettings = getSystemSettings();
    const [loading, setLoading] = useState(true);
    const [subloading, setSubLoading] = useState(true);
    const [levelloading, setLevelLoading] = useState(true);

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
        setsubCategory([]);
        setLevel([]);

        api.getCategories(1).then((response) => {
            var categories = response.data;
            if (categories) {
                setCategory({ ...category, all: categories, selected: categories[0] });
                setLoading(false)
                if (categories[0].no_of !== "0") {
                    api.getSubcategories(categories[0].id).then((response) => {
                        var subcategories = response.data;
                        if (!response.error && subcategories) {
                            setsubCategory({
                                all: subcategories,
                                selected: subcategories[0],
                            });
                            setSubLoading(false)
                            api.getLevelData(categories[0].id, subcategories[0].id).then((response) => {
                                var level = response.data;
                                setLevel({
                                    count: subcategories[0].maxlevel,
                                    unlockedLevel: level.level,
                                });
                                setLevelLoading(false)
                            });
                        }
                    });
                } else {
                    setLevelLoading(true)
                    api.getLevelData(categories[0].id).then((response) => {
                        var level = response.data;
                        setLevel({
                            count: categories[0].maxlevel,
                            unlockedLevel: level.level,
                        });
                        setLevelLoading(false)
                    });
                }
            } else {
                toast.error(t("No Data found"));
            }
        });
    };

    //handle category
    const handleChangeCategory = async (data) => {
        setCategory({ ...category, selected: data });
        setsubCategory([]);
        setLevel([]);

        if (data.no_of !== "0") {
            setSubLoading(true)
            setLevelLoading(true)

            var response = await api.getSubcategories(data.id);
            var subcategories = response.data;
            if (!response.error && subcategories) {
                setsubCategory({ all: subcategories, selected: subcategories[0] });
                setSubLoading(false)
                var level_response = await api.getLevelData(data.id, subcategories[0].id);
                var level = level_response.data;
                if (!level_response.error && level) {
                    setLevel({
                        count: subcategories[0].maxlevel,
                        unlockedLevel: level.level,
                    });
                    setLevelLoading(false)
                } else {
                    toast.error(t("No Unlocked Levels Found"));
                }
            } else {
                toast.error(t("No Subcategories Found"));
            }
        } else {
            setLevelLoading(true)
            api.getLevelData(data.id).then((response) => {
                var level = response.data;
                setLevel({
                    count: data.maxlevel,
                    unlockedLevel: level.level,
                });
                setLevelLoading(false)

            });
        }

        //mobile device scroll handle
        scrollhandler(500);
    };

    //handle subcatgory
    const handleChangeSubCategory = async (subcategory_data) => {
        setsubCategory({ ...subCategory, selected: subcategory_data });
        setSubLoading(false)
        setLevel([]);
        setLevelLoading(true)
        var response = await api.getLevelData(category.selected.id, subcategory_data.id);
        var level = response.data;
        if (!response.error && level) {
            setLevel({
                count: subcategory_data.maxlevel,
                unlockedLevel: level.level,
            });
            setLevelLoading(false)
        } else {
            toast.error(t("No Unlocked Levels Found"));
        }

        scrollhandler(700);
    };

    //truncate text
    const truncate = (txtlength) => (txtlength?.length > 17 ? `${txtlength.substring(0, 17)}...` : txtlength);


    return (
        <React.Fragment>
            <SEO title={t("QuizPlay")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Quiz Play")} content={t("Home")} contentTwo={t("Quiz Play")} />
            <div className="quizplay mb-5">
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
                                                            <p className="text-dark">{t("No Category Data Found")}</p>
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
                                <SubCatslider data={subCategory.all} selected={subCategory.selected} onClick={handleChangeSubCategory} subloading={subloading} />
                            </div>

                            <div className="right__bottom cat__Box mt-4">
                                <span className="left-line"></span>
                                <h6 className="quizplay__title text-uppercase font-weight-bold">{t("levels")}</h6>
                                <span className="right-line"></span>
                            </div>

                            {/* levels sec */}
                            <div className="row custom_row">
                                <UnlockLevel count={level.count} category={category.selected} subcategory={subCategory.selected} unlockedLevel={level.unlockedLevel} url={`/DashboardPlay`} levelLoading={levelloading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(QuizZone);
