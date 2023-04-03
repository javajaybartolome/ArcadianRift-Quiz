import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Header from "../../../partials/header/Header";
import SEO from "../../SEO";
import TopHeader from "../../smalltopheader/TopHeader";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import * as api from "../../../utils/api";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import config from "../../../utils/config";
import GroupQuestions from "../GroupBattle/GroupQuestions";
import GroupBattleScore from "./GroupBattleScore";

const TIMER_SECONDS = config.randomBattleSeconds;

const GroupPlay = ({ t }) => {

  const history = useHistory();

  let { data } = useLocation();

  const [questions, setQuestions] = useState([{ id: "", isBookmarked: false }]);

  const [showScore, setShowScore] = useState(false);

  const [score, setScore] = useState(0);

  const [quizScore, setQuizScore] = useState(0);

  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (data) {
      getNewQuestions(data.roomCode);
    }
  }, []);

  const getNewQuestions = (match_id) => {
    api.getQuestionsByRoomId(match_id).then((response) => {
        if (!response.data.error) {
          var questions = response.data.map((data) => {
            return {
              ...data,
              selected_answer: "",
              isAnswered: false,
            };
          });
          setQuestions(questions);
          setShowScore(false);
          setScore(0);
        } else {
          toast.error(t("No Questions Found"));
          history.replace("/Quizzone");
        }
      });
  };

  const handleAnswerOptionClick = (questions, score) => {
    setQuestions(questions);
    setScore(score);
  };

  const onQuestionEnd = (coins, quizScore) => {
    setShowScore(true);
    setCoins(coins);
    setQuizScore(quizScore);
  };


  return (
    <React.Fragment>
      <SEO title={t("GroupBattle")} />
      <TopHeader />
      <Header />
      <Breadcrumb
        title={t("GroupBattle")}
        content={t("Home")}
        contentTwo={t("GroupBattle")}
      />
      <div className="funandlearnplay dashboard battlerandom">
        <div className="container">
          <div className="row ">
            <div className="morphisam">
              <div className="whitebackground pt-3">
                <>
                  {(() => {
                    if (showScore) {
                      return (
                        <GroupBattleScore
                          score={score}
                          totalQuestions={questions.length}
                          quizScore={quizScore}
                          playAgain={false}
                          coins={coins}
                        />
                      );
                    }else {
                      return questions && questions.length > 0 && questions[0].id !== "" ? (
                        <GroupQuestions
                          questions={questions}
                          timerSeconds={TIMER_SECONDS}
                          onOptionClick={handleAnswerOptionClick}
                          onQuestionEnd={onQuestionEnd}
                        />
                      ) : (
                        <div className="text-center text-white">
                          <Spinner animation="border" role="status" variant="secondary"></Spinner>
                        </div>
                      );
                    }
                  })()}
                </>
              </div>
            </div>
          </div>
          <span className="circleglass__after"></span>
        </div>
      </div>
    </React.Fragment>
  );
};
export default withTranslation()(GroupPlay);
