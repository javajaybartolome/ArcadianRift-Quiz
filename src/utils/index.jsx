import cryptoJs from "crypto-js";
import config from "./config";
import * as api from "./api";
function flatDeep(arr, d = 1) {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) : arr.slice();
}

const slugify = function (text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
};

const getSiblings = function (elem) {
    var siblings = [];
    var sibling = elem.parentNode.firstChild;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== elem) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

const getClosest = function (elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem;
    }
    return null;
};

function slideUp(element, duration = 500) {
    return new Promise(function (resolve) {
        element.style.height = element.offsetHeight + "px";
        element.style.transitionProperty = `height, margin, padding`;
        element.style.transitionDuration = duration + "ms";
        // element.offsetHeight;
        element.style.overflow = "hidden";
        element.style.height = 0;
        element.style.paddingTop = 0;
        element.style.paddingBottom = 0;
        element.style.marginTop = 0;
        element.style.marginBottom = 0;
        window.setTimeout(function () {
            element.style.display = "none";
            element.style.removeProperty("height");
            element.style.removeProperty("padding-top");
            element.style.removeProperty("padding-bottom");
            element.style.removeProperty("margin-top");
            element.style.removeProperty("margin-bottom");
            element.style.removeProperty("overflow");
            element.style.removeProperty("transition-duration");
            element.style.removeProperty("transition-property");
            resolve(false);
        }, duration);
    });
}

function slideDown(element, duration = 500) {
    return new Promise(function () {
        element.style.removeProperty("display");
        let display = window.getComputedStyle(element).display;

        if (display === "none") display = "block";

        element.style.display = display;
        let height = element.offsetHeight;
        element.style.overflow = "hidden";
        element.style.height = 0;
        element.style.paddingTop = 0;
        element.style.paddingBottom = 0;
        element.style.marginTop = 0;
        element.style.marginBottom = 0;
        // element.offsetHeight;
        element.style.transitionProperty = `height, margin, padding`;
        element.style.transitionDuration = duration + "ms";
        element.style.height = height + "px";
        element.style.removeProperty("padding-top");
        element.style.removeProperty("padding-bottom");
        element.style.removeProperty("margin-top");
        element.style.removeProperty("margin-bottom");
        window.setTimeout(function () {
            element.style.removeProperty("height");
            element.style.removeProperty("overflow");
            element.style.removeProperty("transition-duration");
            element.style.removeProperty("transition-property");
        }, duration);
    });
}

function slideToggle(element, duration = 500) {
    if (window.getComputedStyle(element).display === "none") {
        return slideDown(element, duration);
    } else {
        return slideUp(element, duration);
    }
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].slug === obj.slug) {
            return i;
        }
    }
    return -1;
}

export function isLogin() {
    var user = localStorage.getItem("user");
    if (user) {
        try {
            user = JSON.parse(user);
            if (user.api_token) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }
    return false;
}

export function logout() {
    localStorage.clear();
    return true;
}

export function getUserData() {
    var user = localStorage.getItem("user");
    if (user) {
        return JSON.parse(user);
    }
    return false;
}

export function updateUserData(updatedDataObj) {
    var user = JSON.parse(localStorage.getItem("user"));
    var data = { ...user };
    Object.keys(updatedDataObj).forEach((element) => {
        data[element] = updatedDataObj[element];
    });
    localStorage.setItem("user", JSON.stringify(data));
    return data;
}

export function decryptAnswer(encrypted_json_string, key) {
    var obj_json = encrypted_json_string;
    var encrypted = obj_json.ciphertext;
    var iv = cryptoJs.enc.Hex.parse(obj_json.iv);
    key += "0000";
    key = cryptoJs.enc.Utf8.parse(key);
    try {
        var decrypted = cryptoJs.AES.decrypt(encrypted, key, {
            iv: iv,
        }).toString(cryptoJs.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.log(error);
    }
}
//                               4      5
export function calculateCoins(score, totalQuestions) {
    //This method will determine how much coins will user get after
    //completing the quiz
    //if percentage is more than maxCoinsWinningPercentage then user will earn maxWinningCoins
    //
    //if percentage is less than maxCoinsWinningPercentage
    //coin value will deduct from maxWinning coins
    //earned coins = (maxWinningCoins - ((maxCoinsWinningPercentage - percentage)/ 10))
    //For example: if percentage is 70 then user will
    //earn 3 coins if maxWinningCoins is 4

    let sysSettings = getSystemSettings();

    var percentage = (score * 100) / totalQuestions; // 400/5 = 80
    var earnedCoins = 0;
    if (percentage >= sysSettings.maximum_coins_winning_percentage) {
        //80 >= 30
        earnedCoins = sysSettings.maximum_winning_coins; // 4
    } else {
        earnedCoins = sysSettings.maximum_winning_coins - (sysSettings.maximum_coins_winning_percentage - percentage) / 10; // 4 - (30 - 80) / 10 => 34/10 => 5.4
    }
    if (earnedCoins < 0) {
        earnedCoins = 0;
    }
    return earnedCoins;
}
//                              1         2
export function calculateScore(score, totalQuestions) {

    let sysSettings = getSystemSettings();

    var correctAnswer = score; // 1
    var incorrectAnswer = totalQuestions - score; // 2 - 1 => 1
    var correctAnswerScore = correctAnswer * sysSettings.score; // 1 * 2 => 2 // sysSettings.score = addingcorrectscore
    var incorrectAnswerScore = incorrectAnswer * config.deductIncorrectAnswerScore; // 1 * 1 => 1
    var finalScore = correctAnswerScore - incorrectAnswerScore; // 2 - 1 => 1
    return finalScore; // 1
}

export function getAndUpdateBookmarkData() {
    api.getBookmark(1).then((response) => {
        if (!response.error) {
            localStorage.setItem("bookmark", JSON.stringify(response.data));
        }
    });
}

export function getBookmarkData() {
    var data = localStorage.getItem("bookmark");
    if (data) {
        return JSON.parse(data);
    }
    return false;
}

export function deleteBookmarkData(bookmark_id) {
    var data = localStorage.getItem("bookmark");
    if (data) {
        data = JSON.parse(data);
        data = Object.values(data).filter((bookmark) => {
            return bookmark.id !== bookmark_id;
        });
        localStorage.setItem("bookmark", JSON.stringify(data));
        return data;
    }
    return false;
}

export function deleteBookmarkByQuestionID(question_id) {
    var data = localStorage.getItem("bookmark");
    if (data) {
        data = JSON.parse(data);
        data = Object.values(data).filter((bookmark) => {
            return bookmark.question_id !== question_id;
        });
        localStorage.setItem("bookmark", JSON.stringify(data));
        return data;
    }
    return false;
}

export function setSystemSettings(data) {
    localStorage.setItem("settings", JSON.stringify(data));
}

export function getSystemSettings() {
    var data = localStorage.getItem("settings");
    if (data) {
        return JSON.parse(data);
    }
    return false;
}

//scrollhandler in mobile device
export function scrollhandler(top) {
    const scrollTohowItWorks = () =>
        window.scroll({
            top: top,
            left: 0,
            behavior: "smooth",
        });
    if (window.innerWidth <= 600) {
        scrollTohowItWorks();
    }
    return false;
}

 // server image error
export const imgError = (e) => {
    e.target.src = "/images/user.webp"
}

export { containsObject, flatDeep, slugify, getSiblings, getClosest, slideUp, slideDown, slideToggle };
