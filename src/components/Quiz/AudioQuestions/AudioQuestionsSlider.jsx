import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper.scss";
import "swiper/components/navigation/navigation.scss";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import AudioQuestionsIntro from "./AudioQuestionsIntro";


SwiperCore.use([Navigation]);

const AudioQuestionsSlider = (data) => {

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
            <div className="subcat__slider__context AudioQuestionslider">
                <div className="container">
                    <div className="row">
                        <div className="cat__Box">
                            <span className="left-line"></span>
                            <div className="sub_cat_title">
                                <h6 className="text-uppercase font-weight-bold font-smaller subcat__p">{data.t("sub categories")}</h6>
                            </div>
                            <span className="right-line"></span>
                        </div>

                        <div className="quizplay-slider">
                            {data.Questionsloader ? (
                                <div className="text-center">
                                    <Spinner animation="border" role="status" variant="secondary"></Spinner>
                                </div>
                            ) : (
                                <>
                                    {data.data ? (
                                        <Swiper {...swiperOption}>
                                            {data.data.length > 0 &&
                                                data.data.map((QuestionsData, key) => {
                                                    return (
                                                        <SwiperSlide key={key}>
                                                            <AudioQuestionsIntro data={QuestionsData} url={data.url} subcategoryid={QuestionsData.id} />
                                                        </SwiperSlide>
                                                    );
                                                })}
                                        </Swiper>
                                    ) : (
                                        <div className="text-center">
                                            <p>{"No Subcategories Data Found"}</p>
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

export default withTranslation()(AudioQuestionsSlider);
