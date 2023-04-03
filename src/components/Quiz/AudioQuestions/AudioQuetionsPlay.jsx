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
import ShowScore from "./../common/ShowScore";
import ReviewAnswer from "./../common/ReviewAnswer";
import { withTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import config from "../../../utils/config";
import { getUserData, updateUserData, getBookmarkData, getSystemSettings } from "../../../utils";
import AudioQuestionsDashboard from "./AudioQuestionsDashboard";

const MySwal = withReactContent(Swal);

const AudioQuestionsPlay = ({ t }) => {

  const history = useHistory();

  var { data } = useLocation();

  if (!data) {
    // data = { category: 7, subcategory: 8, level: 1,maxlevel:2 };
    history.push("/QuizZone");
  }

  const [questions, setQuestions] = useState([{ id: "", isBookmarked: false }]);

  const [showScore, setShowScore] = useState(false);

  const [score, setScore] = useState(0);

  const [reviewAnswers, setReviewAnswers] = useState(false);

  const [quizScore, setQuizScore] = useState(0);

  const sysSettings = getSystemSettings();

  const timerseconds = parseInt(sysSettings.fun_and_learn_time_in_seconds);

  const TIMER_SECONDS = timerseconds;

  useEffect(() => {
      if (data) {
        if (data.subcategoryid) {
          getNewQuestions("subcategory", data.subcategoryid);
        } else {
          getNewQuestions("category", data.category_id);
        }
      }
  }, []);

  const getNewQuestions = (type, type_id) => {
      api.Audioquestions(type, type_id).then((response) => {
        console.log("response==>",response)
        if (!response.data.error) {
          let bookmark = getBookmarkData();
          let questions_ids = Object.keys(bookmark).map((index) => {
            return bookmark[index].question_id;
          });
          let questions = response.data.map((data) => {
            let isBookmark = false;
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
          console.log("questions==>",questions)
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
    setQuizScore(quizScore);
  };

  const handleReviewAnswers = () => {
    MySwal.fire({
      title: t("Are you sure"),
      text: config.deductReviewAnswerCoins + " " + t("Coins will deducted from your account"),
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
        api.setUserCoinScore("-" + coins, null, null, "Review Answer", status)
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
      <SEO title={t("AudioQuestionsPlay")} />
      <TopHeader />
      <Header />
      <Breadcrumb title={t("AudioQuestionsPlay")} content={t("Home")} contentTwo={t("AudioQuestionsPlay")} />
        <div className="funandlearnplay AudioQuestionsPlay dashboard">
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
                            onReviewAnswersClick={handleReviewAnswers}
                            quizScore={quizScore}
                            showQuestions={true}
                            reviewAnswer={true}
                            playAgain={false}
                            nextlevel={false}
                          />
                        );
                      } else if (reviewAnswers) {
                        return (
                          <ReviewAnswer
                            reportquestions={false}
                            questions={questions}
                            goBack={handleReviewAnswerBack}
                          />
                        );
                      } else {
                        return questions && questions.length > 0 ? (
                          <AudioQuestionsDashboard
                            questions={questions}
                            timerSeconds={TIMER_SECONDS}
                            onOptionClick={handleAnswerOptionClick}
                            onQuestionEnd={onQuestionEnd}
                            showQuestions={false}

                          />
                        ) : (
                          <div className="text-center text-white">
                            <Spinner animation="border" role="status" variant="secondary"></Spinner>
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
export default withTranslation()(AudioQuestionsPlay);
