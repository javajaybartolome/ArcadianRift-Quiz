import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import * as api from "../utils/api";
import Footer from "../partials/footer/Footer";

const TermAndConditions = ({ t }) => {
    const [data, setData] = useState();
    useEffect(() => {
        api.getSettings("terms_conditions").then((response) => {
            if (!response.error) {
                setData(response.data);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <SEO title={t("Terms and Conditions")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Terms and Conditions")} content={t("Home")} contentTwo={t("Terms and Conditions")} />
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
export default withTranslation()(TermAndConditions);
