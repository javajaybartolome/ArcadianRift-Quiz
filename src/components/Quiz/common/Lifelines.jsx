import React, { useState } from "react";
import { FaUsers, FaRegPlayCircle, FaRegClock } from "react-icons/fa";
import PropTypes from "prop-types";
import * as api from "../../../utils/api";
import config from "../../../utils/config";
import { getUserData, updateUserData } from "../../../utils";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
function Lifelines({ handleFiftFifty, handleAudiencePoll, handleResetTime, handleSkipQuestion, t, showFiftyFifty, audiencepoll }) {
    const [status, setStatus] = useState({ fifty_fifty: false, audience_poll: false, reset_time: false, skip_question: false });
    const lifeLineClick = (type) => {
        var update;
        if (type === "Fifty Fifty") {
            if (!status.fifty_fifty) {
                if (checkIfUserhasCoins() && handleFiftFifty()) {
                    if (deductCoins()) {
                        update = { ...status, fifty_fifty: true };
                        setStatus(update);
                    }
                }
            } else {
                toast.error(t("lifeline_already_used"));
            }
        } else if (type === "Audience Poll") {
            if (!status.audience_poll) {
                if (deductCoins()) {
                    update = { ...status, audience_poll: true };
                    handleAudiencePoll();
                    setStatus(update);
                }
            } else {
                toast.error(t("lifeline_already_used"));
            }
        } else if (type === "Reset Time") {
            if (!status.reset_time) {
                if (deductCoins()) {
                    update = { ...status, reset_time: true };
                    handleResetTime();
                    setStatus(update);
                }
            } else {
                toast.error(t("lifeline_already_used"));
            }
        } else if (type === "Skip Question") {
            if (!status.skip_question) {
                if (deductCoins()) {
                    update = { ...status, skip_question: true };
                    handleSkipQuestion();
                    setStatus(update);
                }
            } else {
                toast.error(t("lifeline_already_used"));
            }
        }
    };

    const deductCoins = () => {
        if (checkIfUserhasCoins()) {
            var coins = "-" + config.deductLifeLineCoins;
            api.setUserCoinScore(coins, null, null, "Lifeline", "1").then((response) => {
                if (!response.error) {
                    updateUserData(response.data);
                }
            });
            return true;
        } else {
            return false;
        }
    };

    const checkIfUserhasCoins = () => {
        var user = getUserData();
        if (user.coins < config.deductLifeLineCoins) {
            toast.error(t("You Don't have enough coins"));
            return false;
        } else {
            return true;
        }
    };
    return (
        <div className="dashoptions row">
            {showFiftyFifty ? (
                <div className="fifty__fifty col-3 col-sm-3 col-md-2 custom-life-btn">
                    <button className={`btn btn-primary p-2 ${status.fifty_fifty && "bg-secondary"}`} onClick={() => lifeLineClick("Fifty Fifty")}>
                        50/50
                    </button>
                </div>
            ) : (
                ""
            )}

            {audiencepoll ? (
                <div className="audience__poll col-3 col-sm-3 col-md-2 custom-life-btn">
                    <button className={`btn btn-primary p-2 ${status.audience_poll && "bg-secondary"}`} onClick={() => lifeLineClick("Audience Poll")}>
                        <FaUsers />
                    </button>
                </div>
            ) : (
                ""
            )}
            <div className="resettimer col-3 col-sm-3 col-md-2 custom-life-btn">
                <button className={`btn btn-primary p-2 ${status.reset_time && "bg-secondary"}`} onClick={() => lifeLineClick("Reset Time")}>
                    <FaRegClock />
                </button>
            </div>
            <div className="skip__questions col-3 col-sm-3 col-md-2 custom-life-btn">
                <button className={`btn btn-primary p-2 ${status.skip_question && "bg-secondary"}`} onClick={() => lifeLineClick("Skip Question")}>
                    <FaRegPlayCircle />
                </button>
            </div>
        </div>
    );
}
Lifelines.propTypes = {
    handleFiftFifty: PropTypes.func.isRequired,
    handleAudiencePoll: PropTypes.func.isRequired,
    handleResetTime: PropTypes.func.isRequired,
    handleSkipQuestion: PropTypes.func.isRequired,
};
export default withTranslation()(Lifelines);
