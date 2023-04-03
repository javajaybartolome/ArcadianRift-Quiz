import React, { Fragment, useEffect } from "react";
import SEO from "../components/SEO";
import Header from "../partials/header/Header";
import ScrollToTop from "../components/ScrollToTop";
import TopHeader from "../components/smalltopheader/TopHeader";
import IntroSlider from "../container/IntroSlider/IntroSlider";
import { getAndUpdateBookmarkData, isLogin } from "../utils";
// import Adsense from '../components/adsense/Adsense';
import Footer from "../partials/footer/Footer";
import { t } from "i18next";

const Home = () => {
    useEffect(() => {
        if (isLogin()) {
            getAndUpdateBookmarkData();
        }
    }, []);
    return (
        <Fragment>
            <SEO title={t("Home")} />
            {/* <Adsense /> */}
            <TopHeader />
            <Header />
            <IntroSlider />
            <Footer />
            <ScrollToTop />
        </Fragment>
    );
};

export default Home;
