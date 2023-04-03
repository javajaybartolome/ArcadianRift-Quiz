import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper.scss";
import "swiper/components/navigation/navigation.scss";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import FunandLearnIntro from "./FunandLearnIntro";

SwiperCore.use([Navigation]);

const FunandLearnSlider = (data) => {

    const swiperOption = {
        loop: false,
        speed: 750,
        spaceBetween: 20,
        slidesPerView: 6,
        navigation: true,
        breakpoints: {
            0: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 3,
            },
            992: {
                slidesPerView: 4,
            },
            1200: {
                slidesPerView: 5,
            },
        },
        autoplay: false,
    };
    return (
        <React.Fragment>
            <div className="subcat__slider__context">
                <div className="container">
                    <div className="row">
                        <div className="quizplay-slider">
                            {data.subloading ? (
                                <div className="text-center">
                                    <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                </div>
                            ) : (
                                <>
                                    {data.data ? (
                                        <Swiper {...swiperOption}>
                                            {data.data.length > 0 &&
                                                data.data.map((Fundata, key) => {
                                                    return (
                                                        <SwiperSlide key={key}>
                                                            <FunandLearnIntro data={Fundata} url={data.url} funandlearn={Fundata.id} />
                                                        </SwiperSlide>
                                                    );
                                                })}
                                        </Swiper>
                                    ) : (
                                        <div className="text-center">
                                            <p>{t("No Data Found")}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
export default withTranslation()(FunandLearnSlider);
