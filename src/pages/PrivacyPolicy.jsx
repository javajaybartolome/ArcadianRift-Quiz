import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import * as api from "../utils/api";
import Footer from "../partials/footer/Footer";

const PrivacyPolicy = ({ t }) => {
    const [data, setData] = useState();
    useEffect(() => {
        api.getSettings("privacy_policy").then((response) => {
            if (!response.error) {
                setData(response.data);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <SEO title={t("Privacy Policy")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Privacy Policy")} content={t("Home")} contentTwo={t("Privacy Policy")} />
            <div className="Instruction">
                <div className="container">
                    <div className="row morphisam">
                        {data ? (
                            <div className="col-12 " dangerouslySetInnerHTML={{ __html: data }}></div>
                        ) : (
                            <div className="text-center text-white">
                                <Spinner animation="border" role="status" variant="secondary"></Spinner>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(PrivacyPolicy);
