import React, { Fragment, useCallback, useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Live from "../components/Quiz/ContestPlay/Live";
import Past from "../components/Quiz/ContestPlay/Past";
import Upcoming from "../components/Quiz/ContestPlay/Upcoming";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Footer from "../partials/footer/Footer";
import Header from "../partials/header/Header";
import * as api from "../utils/api";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { getSystemSettings } from "../utils";

const ContestPlay = () => {
    //states
    const [livecontest, setLiveContest] = useState();

    const [pastcontest, setPastContest] = useState();

    const [upcoming, setUpComing] = useState();

    let history = useHistory();

    const { i18n } = useTranslation();

    const sysSettings = getSystemSettings();

    if (sysSettings.language_mode == "1") {
        const handleLanguageChanged = useCallback(() => {
            AllData();
        }, []);

        useEffect(() => {
            i18n.on("languageChanged", handleLanguageChanged);
            return () => {
                i18n.off("languageChanged", handleLanguageChanged);
            };
        }, [handleLanguageChanged]);
    } else {
        useEffect(() => {
            AllData();
        }, []);
    }

    const AllData = () => {
        // live data
        api.getContest()
            .then((response) => {
                let contestData = response.live_contest.data;
                setLiveContest(contestData);
            })
            .catch(() => {});

        //past data
        api.getContest()
            .then((response) => {
                let contestData = response.past_contest.data;
                setPastContest(contestData);
            })
            .catch(() => {});

        //upcoming data
        api.getContest()
            .then((response) => {
                let contestData = response.upcoming_contest.data;
                setUpComing(contestData);
            })
            .catch(() => {});
    };

    useEffect(() => {
        AllData();
    }, []);

    //live play btn
    const playBtn = (contestid) => {
        history.push({
            pathname: "/ContestPlayBoard",
            data: {
                contest_id: contestid,
            },
            contest_id: {
                contest_id: contestid,
            },
        });
    };

    //past leaderboard btn
    const LeaderBoard = (contest_id) => {
        history.push({
            pathname: "/ContestLeaderBoard",
            past_id: {
                past_id: contest_id,
            },
        });
    };

    return (
        <Fragment>
            <SEO title={t("Contest Play")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("Contest Play")} content={t("Home")} contentTwo={t("Contest Play")} />
            <div className="contestPlay mb-5">
                <div className="container">
                    <div className="row morphisam mb-5">
                        <div className="col-md-12 col-12">
                            <div className="contest_tab_contest">
                                <Tabs defaultActiveKey="live" id="fill-tab-example" className="mb-3" fill>
                                    <Tab eventKey="past" title={t("Past")}>
                                        <Past data={pastcontest} onClick={LeaderBoard} />
                                    </Tab>
                                    <Tab eventKey="live" title={t("Live")}>
                                        <Live data={livecontest} onClick={playBtn} />
                                    </Tab>
                                    <Tab eventKey="upcoming" title={t("Upcoming")}>
                                        <Upcoming data={upcoming} />
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
};

export default ContestPlay;
