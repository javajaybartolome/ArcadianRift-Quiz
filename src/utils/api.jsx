import axios from "axios";
import config from "./config.js";
const access_key = config.apiAccessKey;
const apiUrl = config.apiUrl;

/** API ROUTES */
const USER_SIGNUP = "user_signup";
const GET_CATEGORIES = "get_categories";
const GET_SUBCATEGORIES = "get_subcategory_by_maincategory";
const GET_LANGUAGES = "get_languages";
const GET_LEVEL_DATA = "get_level_data";
const GET_QUESTIONS = "get_questions_by_level";
const GET_USER = "get_user_by_id";
const UPDATE_PROFILE = "update_profile";
const UPDATE_PROFILE_IMAGE = "upload_profile_image";
const SET_BOOKMARK = "set_bookmark";
const GET_BOOKMARK = "get_bookmark";
const GET_DAILY_LEADERBOARD = "get_daily_leaderboard";
const GET_MONTHLY_LEADERBOARD = "get_monthly_leaderboard";
const GET_GLOBLE_LEADERBOARD = "get_globle_leaderboard";
const GET_NOTIFICATIONS = "get_notifications";
const GET_USER_STATISTICS = "get_users_statistics";
const DELETE_USER_ACCOUNT = "delete_user_account";
const GET_SETTINGS = "get_settings";
const SET_USER_COIN_SCORE = "set_user_coin_score";
const REPORT_QUESITON = "report_question";
const SET_LEVEL_DATA = "set_level_data";
const SET_USER_STATISTICS = "set_users_statistics";
const CHECK_USER_EXISTS = "check_user_exists";
const GET_SYSTEM_CONFIGURATIONS = "get_system_configurations";
const GET_SLIDERS = "get_sliders";
const Daily_Quiz = "get_daily_quiz";
const Fun_and_Learn = "get_fun_n_learn";
const Fun_and_Learn_Questions = "get_fun_n_learn_questions";
const True_and_False_Questions = "get_questions_by_type";
const GUESS_THE_WORD = "get_guess_the_word";
const GET_QUESTIONS_SELF_CHALLENGE = "get_questions_for_self_challenge";
const GET_CONTEST = "get_contest";
const GET_QUESTIONS_CONTEST = "get_questions_by_contest";
const SET_CONTEST_LEADERBOARD = "set_contest_leaderboard";
const GET_CONTEST_LEADERBOARD = "get_contest_leaderboard";
const GET_RANDOM_QUESTIONS = "get_random_questions";
const GET_RANDOM_QUESTIONS_ROOM_ID = "get_question_by_room_id";
const CREATE_ROOM = "create_room";
const GET_AUDIO_QUESTIONS = "get_audio_questions";

//get language from localstorage
const getLanguage = () => {
    var language = localStorage.getItem("language");
    var settings = localStorage.getItem("settings");
    if (language) {
        if (settings) {
            settings = JSON.parse(settings)
            if (settings.language_mode === "1") {
                return JSON.parse(language);
            } else {
                return JSON.parse(language);
            }
        } else {
            return false;
        }
    }
    return false;
};

//get user from localstorage
const getUser = () => {
    var user = localStorage.getItem("user");
    if (user) {
        try {
            return JSON.parse(user);
        } catch (error) {
            return false;
        }
    }
    return false;
};

//user auth
export async function userAuth(firebase_id, type, username, email, image_url, mobile, fcm_id, friends_code) {
    /**
     * @param
     * type : email / gmail / fb / mobile / apple
     */
    const requestOptions = {
        access_key: access_key,
        firebase_id: firebase_id,
        type: type,
        name: username,
        email: email,
        profile: image_url,
        mobile: mobile,
        fcm_id: fcm_id,
        friends_code: friends_code,
    };

    var response = await axios.post(apiUrl + USER_SIGNUP, requestOptions);

    return response.data;
}

// get categories
export const getCategories = async (type) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        type: type, //type : Quiz Zone
    };

    let response = await axios.post(apiUrl + GET_CATEGORIES, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//getsubcategories slider middle sec
export const getSubcategories = async (category_id, subcategory_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        category: category_id,
        subcategory: subcategory_id,
    };
    let response = await axios.post(apiUrl + GET_SUBCATEGORIES, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//Get Languages
export const getLanguages = async (language_id) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
    };
    let response = await axios.post(apiUrl + GET_LANGUAGES, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get leveldata
export const getLevelData = async (category_id, subcategory_id) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        category: category_id,
        subcategory: subcategory_id,
    };
    let response = await axios.post(apiUrl + GET_LEVEL_DATA, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get questions bottom sec
export const getQuestions = async (category_id, subcategory_id, level) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        category: category_id,
        subcategory: subcategory_id,
        level: level,
    };
    let request = axios.post(apiUrl + GET_QUESTIONS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return request;
};

//get user profile
export const getUserProfile = async () => {
    var { api_token, id, firebase_id } = getUser();
    const requestOptions = {
        access_key: access_key,
        get_user_by_id: id,
        firebase_id: firebase_id,
    };

    let response = await axios.post(apiUrl + GET_USER, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

// user update profile
export const updateUserProfile = async (name, mobile) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        name: name,
        mobile: mobile,
    };

    let response = await axios.post(apiUrl + UPDATE_PROFILE, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    if (!response.data.error) {
        return getUserProfile();
    } else {
        return response.data;
    }
};

//user update profile image
export const updateUserProfileImage = async (image) => {
    var { api_token } = getUser();
    //To upload the file formdata is used
    let requestOptions = new FormData();
    requestOptions.append("access_key", access_key);
    // requestOptions.append('user_id', user.id);
    requestOptions.append("image", image);
    let response = await axios.post(apiUrl + UPDATE_PROFILE_IMAGE, requestOptions, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//set bookmark
export const setBookmark = async (question_id, bookmark, type) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        question_id: question_id,
        status: bookmark, //1-bookmark,0-unmark
        type: type, //1-quiz_zone, 3-guess_the_word, 4-audio_question
    };

    let response = await axios.post(apiUrl + SET_BOOKMARK, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get bookmark
export const getBookmark = async (type) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        type: type, //1-quiz_zone, 3-guess_the_word, 4-audio_question
    };

    let response = await axios.post(apiUrl + GET_BOOKMARK, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get dailyleaderboard data
export const getDailyLeaderBoard = async (offset, limit) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        offset: offset, // {optional} - starting position
        limit: limit, // {optional} - Number of records per page
    };

    let response = await axios.post(apiUrl + GET_DAILY_LEADERBOARD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

// get monthly leaderboard
export const getMonthlyLeaderBoard = async (offset, limit) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        offset: offset, // {optional} - starting position
        limit: limit, // {optional} - Number of records per page
    };

    let response = await axios.post(apiUrl + GET_MONTHLY_LEADERBOARD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get global leaderboard
export const getGlobleLeaderBoard = async (offset, limit) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        offset: offset, // {optional} - starting position
        limit: limit, // {optional} - Number of records per page
    };

    let response = await axios.post(apiUrl + GET_GLOBLE_LEADERBOARD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get notification
export const getNotifications = async (id, order, offset, limit) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        sort: id, // {optional} - id / users / type
        order: order, // {optional} - DESC / ASC
        offset: offset, // {optional} - Starting position
        limit: limit, // {optional} - number of records per page
    };
    let response = await axios.post(apiUrl + GET_NOTIFICATIONS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get user statistics
export const getUserStatistics = async () => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
    };

    let response = await axios.post(apiUrl + GET_USER_STATISTICS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//delete user account
export const deleteUserAccount = async () => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
    };

    let response = await axios.post(apiUrl + DELETE_USER_ACCOUNT, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get settings
export const getSettings = async (type) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        type: type, //about_us / privacy_policy / terms_conditions / contact_us / instructions
    };

    let response = await axios.post(apiUrl + GET_SETTINGS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//set user coin store
export const setUserCoinScore = async (coins, score, type, title, status) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        coins: coins, //if deduct coin than set with minus sign -2
        score: score,
        type: type, // (dashing_debut, combat_winner, clash_winner, most_wanted_winner, ultimate_player, quiz_warrior, super_sonic, flashback, brainiac, big_thing, elite, thirsty, power_elite, sharing_caring, streak)
        title: title,
        status: status, //0-add coin, 1-deduct coin
    };

    let response = await axios.post(apiUrl + SET_USER_COIN_SCORE, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//report questions
export const reportQuestion = async (question_id, message) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        question_id: question_id,
        message: message,
    };

    let response = await axios.post(apiUrl + REPORT_QUESITON, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//setlevel data
export const setLevelData = async (category_id, subcategory_id, level) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        category: category_id,
        subcategory: subcategory_id,
        level: level,
    };

    let response = await axios.post(apiUrl + SET_LEVEL_DATA, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//set user statistics
export const setUserStatistics = async (questions_answered, correct_answers, category_id, percentage) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        questions_answered: questions_answered,
        correct_answers: correct_answers,
        category_id: category_id, //(id of category which user played)
        ratio: percentage, // (In percenatge)
    };

    let response = await axios.post(apiUrl + SET_USER_STATISTICS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//check user exists
export const checkUserExists = async (firebase_id) => {
    var { api_token } = getUser();
    const requestOptions = {
        access_key: access_key,
        firebase_id: firebase_id,
    };

    let response = await axios.post(apiUrl + CHECK_USER_EXISTS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get system configurations
export const getSystemConfigurations = async () => {
    const requestOptions = {
        access_key: access_key,
    };

    let response = await axios.post(apiUrl + GET_SYSTEM_CONFIGURATIONS, requestOptions);
    return response.data;
};

//get sliders
export const getSliders = async () => {
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
    };

    let response = await axios.post(apiUrl + GET_SLIDERS, requestOptions);

    return response.data;
};

// dailyquiz
export const dailyQuiz = async () => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
    };

    let response = await axios.post(apiUrl + Daily_Quiz, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//get fun and learn
export const funandlearn = async (type, type_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        type: type,
        type_id: type_id,
    };

    let response = await axios.post(apiUrl + Fun_and_Learn, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//get fun and learn questions
export const funandlearnquestions = async (fun_n_learn_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        fun_n_learn_id: fun_n_learn_id,
    };

    let response = await axios.post(apiUrl + Fun_and_Learn_Questions, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//get true and false questions
export const trueandfalsequestions = async (type, limit) => {
    var { api_token } = getUser();
    // var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        type: type,
        limit: limit,
    };

    let response = await axios.post(apiUrl + True_and_False_Questions, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//guess the word
export const guesstheword = async (type, type_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id, //{optional}
        type: type, //category or subcategory
        type_id: type_id, //{if type:category then type_id:category id}
    };

    let response = await axios.post(apiUrl + GUESS_THE_WORD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//self chellenge
export const selfQuestions = async (category, subcategory, limit) => {
    let { api_token } = getUser();
    let { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        category: category,
        subcategory: subcategory,
        limit: limit,
        language_id: language_id, //optional
    };

    let response = await axios.post(apiUrl + GET_QUESTIONS_SELF_CHALLENGE, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//get contest
export const getContest = async () => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
    };

    let response = await axios.post(apiUrl + GET_CONTEST, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });
    return response.data;
};

//contest questions
export const contestQuestions = async (contest_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        contest_id: contest_id,
    };

    let response = await axios.post(apiUrl + GET_QUESTIONS_CONTEST, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//set contest leaderboard
export const setContestLeaderboard = async (contest_id, questions_attended, correct_answers, score) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        contest_id: contest_id,
        questions_attended: questions_attended,
        correct_answers: correct_answers,
        score: score,
    };

    let response = await axios.post(apiUrl + SET_CONTEST_LEADERBOARD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//get contest leaderboard
export const getContestLeaderboard = async (contest_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        contest_id: contest_id,
    };

    let response = await axios.post(apiUrl + GET_CONTEST_LEADERBOARD, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//get random questions
export const getRandomQuestions = async (match_id, category, destroy_match) => {
    let { api_token } = getUser();
    let { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        match_id: match_id,
        category: category,  // required if battle category enable form panel
        destroy_match:destroy_match  // 0 - don't destroy | 1 - destroy the battle
    };

    let response = await axios.post(apiUrl + GET_RANDOM_QUESTIONS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

// get questions from room id for group battle

export const getQuestionsByRoomId = async (room_id) => {
    let { api_token } = getUser();
    let { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        room_id:room_id
    };

    let response = await axios.post(apiUrl + GET_RANDOM_QUESTIONS_ROOM_ID, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

// create room for Groupbattle in sql database entry
export const createMultiRoom = async (room_id,room_type,category,no_of_que) => {
    let { api_token } = getUser();
    let { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id,
        room_id: room_id,
        room_type: room_type,// private or public
        category: category, // required if room category enable form panel
        no_of_que:no_of_que
    };

    let response = await axios.post(apiUrl + CREATE_ROOM, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};

//guess the word
export const Audioquestions = async (type, type_id) => {
    var { api_token } = getUser();
    var { id: language_id } = getLanguage();
    const requestOptions = {
        access_key: access_key,
        language_id: language_id, //{optional}
        type: type, //category or subcategory
        type_id: type_id, //{if type:category then type_id:category id}
    };

    let response = await axios.post(apiUrl + GET_AUDIO_QUESTIONS, requestOptions, {
        headers: {
            Authorization: "Bearer " + api_token,
        },
    });

    return response.data;
};