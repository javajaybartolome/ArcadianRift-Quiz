import { useEffect, Suspense, lazy, useState } from "react";
import { Switch, useHistory } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import NavScrollTop from "./components/NavScrollTop";
import { useAuth } from "./context/AuthContext";
import language from "./utils/language";
import NotFound from "./pages/NotFound";
import config from "./utils/config";
import { getSystemSettings, setSystemSettings } from "./utils";
import * as api from "./utils/api";
import Spinner from 'react-bootstrap/Spinner';

// CSS File Here
import "antd/dist/antd.min.css";
import "./assets/css/fonts/fonts.css";
import "./assets/css/vendor/animate.css";
import "react-toastify/dist/ReactToastify.css";

//for LTR
import "./assets/css/bootstrap.min.css";
import "./assets/scss/style.scss";

// for RTL
// import "./assets/css/bootstrap.rtl.min.css";
// import "./assets/css/style.rtl.css";

const Home = lazy(() => import("./pages/Home"));
const Quizplay = lazy(() => import("./pages/Quizplay"));
const Login = lazy(() => import("./components/smalltopheader/Login"));
const SignUp = lazy(() => import("./components/smalltopheader/SignUp"));
const Otpverify = lazy(() => import("./components/smalltopheader/Otpverify"));
const QuizZone = lazy(() => import("./pages/QuizZone"));
const ResetPassword = lazy(() => import("./components/smalltopheader/ResetPassword"));
const DashboardPlay = lazy(() => import("./components/Quiz/DashboardPlay"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookmark = lazy(() => import("./pages/Bookmark"));
const Instruction = lazy(() => import("./pages/Instruction"));
const Invitefriends = lazy(() => import("./pages/Invitefriends"));
const PrivateRoute = lazy(() => import("./Routes/PrivateRoute"));
const PublicRoute = lazy(() => import("./Routes/PublicRoute"));
const LeaderBoard = lazy(() => import("./pages/LeaderBoard"));
const Contact_us = lazy(() => import("./pages/Contact-us"));
const About_us = lazy(() => import("./pages/About-us"));
const BookmarkPlay = lazy(() => import("./pages/BookmarkPlay"));
const TermAndConditions = lazy(() => import("./pages/TermAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Maintainance = lazy(() => import("./pages/Maintainance"));
const DailyQuizDashboard = lazy(() => import("./components/Quiz/DailyQuizDashboard"));
const TrueandFalsePlay = lazy(() => import("./pages/TrueandFalsePlay"));
const FunandLearn = lazy(() => import("./pages/Fun-and-Learn"));
const FunandLearnPlay = lazy(() => import("./components/Quiz/Fun_and_Learn/FunandLearnPLay"));
const GuesstheWord = lazy(() => import("./pages/Guess-the-Word"));
const GuesstheWordplay = lazy(() => import("./components/Quiz/Guesstheword/Guessthewordplay"));
const SelfLearning = lazy(() => import("./pages/SelfLearning"));
const SelfLearningplay = lazy(() => import("./components/Quiz/SelfLearning/SelfLearningplay"));
const ContestPlay = lazy(() => import("./pages/ContestPlay"));
const ContestPlayBoard = lazy(() => import("./components/Quiz/ContestPlay/ContestPlayBoard"));
const ContestLeaderBoard = lazy(() => import("./components/Quiz/ContestPlay/ContestLeaderBoard"));
const RandomBattle = lazy(() => import("./pages/RandomBattle"));
const RandomPlay = lazy(() => import("./components/Quiz/RandomBattle/RandomPlay"));
const PlayWithFriendBattle = lazy(() => import("./pages/PlayWithFrndBattle"));
const GroupBattle = lazy(() => import("./pages/GroupBattle"));
const GroupPlay = lazy(() => import("./components/Quiz/GroupBattle/GroupPlay"));
const GroupBattleScore = lazy(() => import("./components/Quiz/GroupBattle/GroupBattleScore"));
const AudioQuestions = lazy(() => import("./pages/AudioQuestions"));
const AudioQuestionsPlay = lazy(() => import("./components/Quiz/AudioQuestions/AudioQuetionsPlay"));
// const NotFound = lazy(() => import("./pages/NotFound"));

var i = 0;

const MySwal = withReactContent(Swal);

const App = () => {
    const { signout } = useAuth();
    const history = useHistory();

    const [spinner, setSpinner] = useState(true);

    useEffect(() => {
        api.getSystemConfigurations().then((response) => {
            if (!response.error) {
                setSystemSettings(response.data);
            }
        });

        const { app_maintenance } = getSystemSettings();

        if (app_maintenance === "1") {
            history.push("/Maintainance");
        } else {
            history.push("/");
        }
    }, []);

    axios.interceptors.response.use(function (response) {
        if (!config.demo && response.data && response.data.message === "129") {
            MySwal.fire({
                text: "Already logged in other device",
                icon: "warning",
                showCancelButton: false,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Logout",
            }).then((result) => {
                if (result.isConfirmed) {
                    signout();
                    localStorage.clear();
                    history.push("/");
                    return false;
                }
            });
        }
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    });


    useEffect(() => {
        if (spinner) {
          setTimeout(() => {
            setSpinner(false);
        }, 2000);
        }
      }, [spinner]);

    return (
        <I18nextProvider i18n={language}>
            <ToastContainer />
            <NavScrollTop>
                <Suspense fallback={<div className="loader-spinner">{spinner ? <Spinner animation="grow"></Spinner> : ""}</div>}>
                    <Switch>
                        <PublicRoute path={`${"/"}`} exact component={Home} />
                        <PublicRoute path={`${"/home"}`} exact component={Home} />
                        <PublicRoute restricted={true} path={`${"/Login"}`} exact component={Login} />
                        <PublicRoute restricted={true} path={`${"/SignUp"}`} exact component={SignUp} />
                        <PublicRoute restricted={true} path={`${"/Otpverify"}`} exact component={Otpverify} />
                        <PublicRoute restricted={true} path={`${"/ResetPassword"}`} exact component={ResetPassword} />
                        <PublicRoute path={`${"/Instruction"}`} exact component={Instruction} />
                        <PublicRoute path={`${"/Quizplay"}`} exact component={Quizplay} />
                        <PublicRoute path={`${"/contact-us"}`} exact component={Contact_us} />
                        <PublicRoute path={`${"/about-us"}`} exact component={About_us} />
                        <PublicRoute path={`${"/terms-conditions"}`} exact component={TermAndConditions} />
                        <PublicRoute path={`${"/privacy-policy"}`} exact component={PrivacyPolicy} />

                        <PrivateRoute path={`${"/LeaderBoard"}`} exact component={LeaderBoard} />
                        <PrivateRoute path={`${"/QuizZone"}`} exact component={QuizZone} />
                        <PrivateRoute path={`${"/DashboardPlay"}`} exact component={DashboardPlay} />
                        <PrivateRoute path={`${"/DailyQuizDashboard"}`} exact component={DailyQuizDashboard} />
                        <PrivateRoute path={`${"/Profile"}`} exact component={Profile} />
                        <PrivateRoute path={`${"/Bookmark"}`} exact component={Bookmark} />
                        <PrivateRoute path={`${"/play-bookmark-questions"}`} exact component={BookmarkPlay} />
                        <PrivateRoute path={`${"/Invitefriends"}`} exact component={Invitefriends} />
                        <PrivateRoute path={`${"/Maintainance"}`} exact component={Maintainance} />
                        <PrivateRoute path={`${"/TrueandFalsePlay"}`} exact component={TrueandFalsePlay} />
                        <PrivateRoute path={`${"/Fun-and-Learn"}`} exact component={FunandLearn} />
                        <PrivateRoute path={`${"/FunandLearnPlay"}`} exact component={FunandLearnPlay} />
                        <PrivateRoute path={`${"/Guess-the-Word"}`} exact component={GuesstheWord} />
                        <PrivateRoute path={`${"/guess-the-word-play"}`} exact component={GuesstheWordplay} />
                        <PrivateRoute path={`${"/SelfLearning"}`} exact component={SelfLearning} />
                        <PrivateRoute path={`${"/SelfLearningPlay"}`} exact component={SelfLearningplay} />
                        <PrivateRoute path={`${"/ContestPlay"}`} exact component={ContestPlay} />
                        <PrivateRoute path={`${"/ContestPlayBoard"}`} exact component={ContestPlayBoard} />
                        <PrivateRoute path={`${"/ContestLeaderBoard"}`} exact component={ContestLeaderBoard} />
                        <PrivateRoute path={`${"/RandomBattle"}`} exact component={RandomBattle} />
                        <PrivateRoute path={`${"/RandomPlay"}`} exact component={RandomPlay} />
                        <PrivateRoute path={`${"/PlaywithfreindBattle"}`} exact component={PlayWithFriendBattle} />
                        <PrivateRoute path={`${"/GroupBattle"}`} exact component={GroupBattle} />
                        <PrivateRoute path={`${"/GroupPlay"}`} exact component={GroupPlay} />
                        <PrivateRoute path={`${"/GroupBattleScore"}`} exact component={GroupBattleScore} />
                        <PrivateRoute path={`${"/AudioQuestions"}`} exact component={AudioQuestions} />
                        <PrivateRoute Path={`${"/AudioQuestionsPlay"}`} exact component={AudioQuestionsPlay} />
                        <PublicRoute exact component={NotFound} />
                    </Switch>
                </Suspense>
            </NavScrollTop>
        </I18nextProvider>
    );
};
export default App;
