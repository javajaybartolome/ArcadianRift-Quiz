import React, { Fragment } from "react";
import { withTranslation } from "react-i18next";
import SEO from "../components/SEO";
import Lottie from "lottie-react";
import maint from "../assets/images/data.json";
import Footer from "../partials/footer/Footer";

const Maintainance = ({ t }) => {
    return (
        <Fragment>
            <SEO title={t("Maintainance")} />
            <div className="Maintainance">
                <div className="container">
                    <div className="row">
                        <div className="morphisam">
                            <div className="left_image">
                                <Lottie animationData={maint} loop={true} autoplay={true} className="lottie" />
                            </div>
                            <div className="right_text">
                                <p>{t("We Apologize for the inconvenience, but we are performing some mainttenance. We will back soon")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
};

export default withTranslation()(Maintainance);
