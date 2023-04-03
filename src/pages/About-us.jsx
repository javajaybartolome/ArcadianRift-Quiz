import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import * as api from "../utils/api";
import Footer from "../partials/footer/Footer";

const About_us = ({ t }) => {
    const [data, setData] = useState();
    useEffect(() => {
        api.getSettings("about_us").then((response) => {
            if (!response.error) {
                setData(response.data);
            } else {
                toast.error(response.message);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <SEO title={t("About US")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("About US")} content={t("Home")} contentTwo={t("About US")} />
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

export default withTranslation()(About_us);
