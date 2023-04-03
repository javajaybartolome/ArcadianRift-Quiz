import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Header from "../../../partials/header/Header";
import SEO from "../../SEO";
import TopHeader from "../../smalltopheader/TopHeader";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import * as api from "../../../utils/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ShowScore from "../common/ShowScore";
import ReviewAnswer from "../common/ReviewAnswer";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import config from "../../../utils/config.js";
import { getUserData, updateUserData, getBookmarkData } from "../../../utils";
import SelfLearningQuestions from "./SelfLearningQuestions";
const MySwal = withReactContent(Swal);


const SelfLearningplay = ({ t }) => {
  const history = useHistory();
  var { data } = useLocation();

  const TIMER_SECONDS = data.timer;

  const [questions, setQuestions] = useState([{ id: "", isBookmarked: false }]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState(false);
  const [coins, setCoins] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!showScore && data) {
      getNewQuestions(data.category_id, data.subcategory_id, data.limit);
    }
  }, []);

  const getNewQuestions = (category_id, subcategory_id, limit) => {
    api.selfQuestions(category_id, subcategory_id, limit).then((response) => {
      if (!response.error) {
        var bookmark = getBookmarkData();
        var questions_ids = Object.keys(bookmark).map((index) => {
          return bookmark[index].question_id;
        });

        var questions = response.data.map((data) => {
          var isBookmark = false;
          if (questions_ids.indexOf(data.id) >= 0) {
            isBookmark = true;
          } else {
            isBookmark = false;
          }
          return {
            ...data,
            isBookmarked: isBookmark,
            selected_answer: "",
            isAnswered: false,
          };
        });
        setQuestions(questions);
        setShowScore(false);
        setReviewAnswers(false);
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

  const playAgain = () => {
    if (showScore && data) {
      getNewQuestions(data.category, data.subcategory, level);
    }
  };

  const nextLevel = () => {
    if (showScore && data) {
      var temp_level = level + 1;
      setLevel(temp_level);
      getNewQuestions(data.category, data.subcategory, temp_level);
    }
  };

  const handleReviewAnswers = () => {
    MySwal.fire({
      title: t("Are you sure"),
      text:
        config.deductReviewAnswerCoins +
        " " +
        t("Coins will deducted from your account"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("Continue"),
      cancelButtonText: t("Cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        var user = getUserData();
        var coins = config.deductReviewAnswerCoins;
        if (user.coins < coins) {
          toast.error(t("You Don't have enough coins"));
          return false;
        }
        var status = 1;
        api
          .setUserCoinScore("-" + coins, null, null, "Review Answer", status)
          .then((response) => {
            if (!response.error) {
              setReviewAnswers(true);
              setShowScore(false);
              updateUserData(response.data);
            } else {
              Swal.fire(t("OOps"), t("Please Try again"), "error");
            }
          });
      }
    });
  };

  const handleReviewAnswerBack = () => {
    setShowScore(true);
    setReviewAnswers(false);
  };

  return (
    <React.Fragment>
      <SEO title={t("Self Learning")} />
      <TopHeader />
      <Header />
      <Breadcrumb
        title={t("Self Learning")}
        content={t("Home")}
        contentTwo={t("Self Learning")}
      />
      <div className="dashboard selflearnig-play">
        <div className="container">
          <div className="row ">
            <div className="morphisam">
              <div className="whitebackground pt-3">
                {(() => {
                  if (showScore) {
                    return (
                      <ShowScore
                        score={score}
                        totalQuestions={questions.length}
                        onPlayAgainClick={playAgain}
                        onReviewAnswersClick={handleReviewAnswers}
                        onNextLevelClick={nextLevel}
                        coins={coins}
                        quizScore={quizScore}
                        showQuestions={true}
                        reviewAnswer={true}
                        playAgain={false}
                      />
                    );
                  } else if (reviewAnswers) {
                    return (
                      <ReviewAnswer
                        reportquestions={true}
                        questions={questions}
                        goBack={handleReviewAnswerBack}
                      />
                    );
                  } else {
                    return questions && questions.length >= 0 ? (
                      <SelfLearningQuestions
                        questions={questions}
                        timerSeconds={TIMER_SECONDS}
                        customMinutes={true}
                        onOptionClick={handleAnswerOptionClick}
                        onQuestionEnd={onQuestionEnd}
                        showQuestions={true}
                      />
                    ) : (
                      <div className="text-center text-white">
                        <p>{"No Questions Found"}</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
          <span className="circleglass__after"></span>
        </div>
      </div>
    </React.Fragment>
  );
};
export default withTranslation()(SelfLearningplay);
