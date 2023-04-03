import React, { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Keyboard, Pagination, Navigation, Autoplay } from "swiper/core";
import { getSystemSettings } from "../../utils";
import { useTranslation } from "react-i18next";
import * as api from "../../utils/api";
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css";
import "swiper/components/navigation/navigation.min.css";
import Slider from "../../components/Intro/Slider";
SwiperCore.use([Keyboard, Pagination, Navigation, Autoplay]);

const IntroSlider = () => {
    const [sliders, setSliders] = useState([]);
    const { i18n } = useTranslation();

    const newSliders = () => {
        api.getSliders()
            .then((response) => {
                if (!response.error) {
                    setSliders(response.data);
                }
            })
            .catch(() => {});
    };

    // language
    const sysSettings = getSystemSettings();
    const handleLanguageChanged = useCallback(() => {
        newSliders();
    });

    useEffect(() => {
        if (sysSettings.language_mode == "1") {
            i18n.on("languageChanged", handleLanguageChanged);
            return () => {
                i18n.off("languageChanged", handleLanguageChanged);
            };
        } else {
            newSliders();
        }
    }, [handleLanguageChanged]);

    const swiperOption = {
        loop: true,
        speed: 750,
        spaceBetween: 0,
        slidesPerView: 1,
        navigation: true,
        autoplay: false,
    };
    return (
        <div className="intro-slider-wrap section">
            <Swiper effect="fade" className="mySwiper" {...swiperOption}>
                {sliders &&
                    sliders.map((data, key) => {
                        return (
                            <SwiperSlide key={key}>
                                <Slider data={data} />
                            </SwiperSlide>
                        );
                    })}
            </Swiper>
        </div>
    );
};

export default IntroSlider;
