import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import * as api from "../utils/api";
import Footer from "../partials/footer/Footer";

const Contact_us = ({ t }) => {
    const [data, setData] = useState();
    useEffect(() => {
        api.getSettings("contact_us").then((response) => {
            if (!response.error) {
                setData(response.data);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <SEO title={t("Contact Us")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Contact Us")} content={t("Home")} contentTwo={t("Contact Us")} />
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
export default withTranslation()(Contact_us);
