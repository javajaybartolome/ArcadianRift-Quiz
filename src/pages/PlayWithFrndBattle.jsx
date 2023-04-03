import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation, withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Footer from "../partials/footer/Footer";
import Header from "../partials/header/Header";
import { getSystemSettings, getUserData, updateUserData } from "../utils";
import * as api from "../utils/api";
import config from "../utils/config";
import Swal from "sweetalert2";
import { useHistory, useLocation } from "react-router-dom";
import { db, firebase } from "../firebase";
import { Modal, Tabs } from "antd";
import { useRef } from "react";
import { FacebookIcon, FacebookShareButton, WhatsappIcon, WhatsappShareButton } from "react-share";

const RandomBattle = ({ t }) => {
    //user data
    let user = getUserData();

    const TabPane = Tabs.TabPane;

    const [coninsUpdate, setCoinsUpdate] = useState(user.coins);

    const [category, setCategory] = useState({
        all: "",
        selected: "",
    });

    const [loading, setLoading] = useState(true);

    const [shouldGenerateRoomCode, setShouldGenerateRoomCode] = useState(false);

    const [selectedCoins, setSelectedCoins] = useState({ all: "", selected: "" });

    // console.log("shouldGenerateRoomCode", shouldGenerateRoomCode)

    const [playwithfriends, setPlaywithfriends] = useState(false);

    const [inputCode, setInputCode] = useState(false);

    const [showStart, setShowStart] = useState(false);

    const [dataLangCat, setDataLangCat] = useState({
        languageid: "",
        Categoryid: "",
    });

    // userdata
    const [userdata, setUserdata] = useState({
        userName: "",
        profile: "",
    });

    var { data } = useLocation();

    // console.log("userdata", userdata.userName)

    let history = useHistory();

    var user_selected_lang = localStorage.getItem("language");

    user_selected_lang = JSON.parse(user_selected_lang);

    let languageid = dataLangCat.languageid;

    let category_selected = dataLangCat.Categoryid;

    let username = user.name ? user.name : user.email;

    let userprofile = user.profile ? user.profile : "";

    let useruid = user.id;

    let usercoins = user.coins;

    let selectedcoins = selectedCoins.selected;

    let inputText = useRef(null);

    // language mode

    useEffect(() => {
        if (data) {
            setDataLangCat({ ...dataLangCat, languageid: data.language_id, Categoryid: data.category_id });
        }
    }, []);

    const { i18n } = useTranslation();

    const sysSettings = getSystemSettings();

    if (sysSettings.language_mode == "1") {
        const handleLanguageChanged = useCallback(() => {
            getAllData();
        }, []);

        useEffect(() => {
            i18n.on("languageChanged", handleLanguageChanged);
            return () => {
                i18n.off("languageChanged", handleLanguageChanged);
            };
        }, [handleLanguageChanged]);
    } else {
        useEffect(() => {
            getAllData();
        }, []);
    }

    // get category data
    const getAllData = () => {
        api.getCategories(1).then((response) => {
            let categoires = response.data;
            if (categoires) {
                setCategory({
                    ...category,
                    all: categoires,
                    selected: categoires[0].id,
                });
                setLoading(false);
            }
        });
    };

    // database collection
    const createBattleRoom = async (categoryId, name, profileUrl, uid, roomCode, roomType, entryFee, questionlanguageId) => {
        try {
            let documentreference = db.collection("battleRoom").add({
                categoryId: categoryId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: uid,
                entryFee: entryFee ? entryFee : 0,
                languageId: questionlanguageId,
                readyToPlay: false,
                roomCode: roomCode ? roomCode : "",
                user1: {
                    answers: [],
                    name: name,
                    points: 0,
                    profileUrl: profileUrl,
                    uid: uid,
                },
                user2: {
                    answers: [],
                    name: "",
                    points: 0,
                    profileUrl: "",
                    uid: "",
                },
            });

            // created id by user to check for result screen
            localStorage.setItem("createdby", uid);
            setShowStart(true);

            return await documentreference;
        } catch (error) {
            toast.error(error);
        }
    };

    // delete battle room
    const deleteBattleRoom = async (documentId) => {
        try {
            await db.collection("battleRoom").doc(documentId).delete();
        } catch (error) {
            toast.error(error);
        }
    };

    // find room
    const searchBattleRoom = async (languageId, categoryId) => {
        try {
            let userfind = await db.collection("battleRoom").where("languageId", "==", languageId).where("categoryId", "==", categoryId).where("roomCode", "==", "").where("user2.uid", "==", "").get();

            let userfinddata = userfind.docs;

            let index = userfinddata.findIndex((elem) => {
                return elem.data().createdBy == useruid;
            });

            if (index !== -1) {
                deleteBattleRoom(userfinddata[index].id);
                userfinddata.splice(userfinddata.length, index);
            }

            return userfinddata;
        } catch (err) {
            toast.error("Error getting document", err);

        }
    };

    // search room
    const searchRoom = async () => {
        try {
            let documents = await searchBattleRoom(languageid, category_selected);

            let roomdocid;

            if (documents.length !== 0) {
                let room = documents;

                roomdocid = room.id;
            } else {
                roomdocid = await createRoom();
            }

            subscribeToBattleRoom(roomdocid);
            localStorage.setItem("roomid", roomdocid);
        } catch (error) {
            toast.error(error);
            console.log(error);
        }
    };

    // redirect question screen
    const questionScreen = (roomcode) => {
        history.push({
            pathname: "/RandomPlay",
            data: {
                category_id: category_selected,
                room_id: roomcode,
                destroy_match: "0",
            },
        });
    };

    // subsscribebattle room
    const subscribeToBattleRoom = async (battleRoomDocumentId) => {
        let documentRef = db.collection("battleRoom").doc(battleRoomDocumentId);

        documentRef.onSnapshot(
            { includeMetadataChanges: true },
            (doc) => {
                if (doc.exists) {
                    let battleroom = doc.data();

                    // for user1
                    if (user.id === battleroom.user1.uid) {
                        setUserdata({ ...userdata, userName: battleroom.user2.name, profile: battleroom.user2.profileUrl });
                    } else {
                        setUserdata({ ...userdata, userName: battleroom.user1.name, profile: battleroom.user1.profileUrl });
                    }

                    let check = battleroom.readyToPlay;

                    let roomCode = battleroom.roomCode;

                    if (check) {
                        setTimeout(() => {
                            questionScreen(roomCode);
                        }, 3000);
                    }
                }
            },
            (error) => {
                console.log("err", error);
            }
        );
    };

    // room code generator
    const randomFixedInteger = (length) => {
        return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)).toString();
    };

    //create room for battle
    const createRoom = async () => {

        // battleroom joiing state
        if (usercoins < 0 || usercoins === "0") {
            toast.error("you dont have enough coins")
            return;
        }

        let roomCode = "";

        //genarate room code
        roomCode = randomFixedInteger(6);
        setShouldGenerateRoomCode(roomCode);
        localStorage.setItem("roomid", roomCode);

        let data = await createBattleRoom(category_selected, username, userprofile, useruid, roomCode, "public", selectedcoins, languageid);

        // popup user found with friend
        setPlaywithfriends(true);

        // coins api
        let status = 1;

        api.setUserCoinScore("-" + selectedcoins, null, null, "battle", status).then((response) => {
            if (!response.error) {
                updateUserData(response.data);
                setCoinsUpdate(response.data.coins);
            }
        });
        return data.id;
    };

    // joinroom
    const joinRoom = async (name, profile, usernameid, roomcode, coin) => {
        try {
            setPlaywithfriends(true);
            let result = await joinBattleRoomFrd(name, profile, usernameid, roomcode, coin);
            subscribeToBattleRoom(result.id);
            localStorage.setItem("roomid", result.id);
        } catch (e) {
            console.log("error", e);
        }
    };

    // get userroom
    const getMultiUserBattleRoom = async (roomcode) => {
        try {
            let typeBattle = await db.collection("battleRoom").where("roomCode", "==", roomcode).get();
            return typeBattle;
        } catch (e) {
            console.log("error", e);
        }
    };

    // joinBattleRoomFrd
    const joinBattleRoomFrd = async (name, profile, usernameid, roomcode, coin) => {
        try {
            // check roomcode is valid or not
            let mulituserbattle = await getMultiUserBattleRoom(roomcode);

            // invalid room code
            if (mulituserbattle.docs === "") {
                toast.error("Invalid Room Code");
            }

            // // game started code
            if (mulituserbattle.docs[0].data().readyToPlay) {
                toast.success("Game Staarted");
            }

            // // not enough coins
            // if (mulituserbattle.docs[0].data().entryFee > coin) {
            //     toast.error("Not enough coins");
            //     return;
            // }

            //user2 update
            let docRef = mulituserbattle.docs[0].ref;

            return db.runTransaction(async (transaction) => {
                let doc = await transaction.get(docRef);
                if (!doc.exists) {
                    toast.error("Document does not exist!");
                }

                let userdetails = doc.data();

                let user2 = userdetails.user2;

                if (user2.uid === "") {
                    transaction.update(docRef, {
                        "user2.name": name,
                        "user2.uid": usernameid,
                        "user2.profileUrl": profile,
                    });
                } else {
                    toast.error("room is full");
                }

                return doc;
            });

            //
        } catch (e) {
            console.log("error", e);
        }
    };

    // coins data
    const coinsdata = [
        { id: "1", num: "5" },
        { id: "2", num: "10" },
        { id: "3", num: "15" },
        { id: "4", num: "20" },
    ];

    // selected coins data
    const selectedCoinsdata = (data) => {
        setSelectedCoins({ ...selectedCoins, selected: data });
        inputText.current.value = "";
    };

    // inputfeild data
    const handlechange = (e) => {
        if (e === "") {
            toast.error("please enter code");
            return;
        } else {
            setInputCode(e.target.value);
        }
    };

    // start button
    const startGame = (e) => {
        let roomid = localStorage.getItem("roomid");

        let docRef = db.collection("battleRoom").doc(roomid);

        return db.runTransaction(async (transaction) => {
            let doc = await transaction.get(docRef);
            if (!doc.exists) {
                toast.error("Document does not exist!");
            }

            let userdetails = doc.data();

            let user2 = userdetails.user2;

            if (user2.uid !== "") {
                transaction.update(docRef, {
                    readyToPlay: true,
                });
                // subscribeToBattleRoom(roomid)
            } else {
                toast.error("room is full");
            }

            return doc;
        });
    };

    // snapshot listner
    useEffect(() => {
        subscribeToBattleRoom();
        setSelectedCoins({ ...selectedCoins, selected: coinsdata[0] });
    }, []);

    // get id from localstorage for start button
    let createdby = localStorage.getItem("createdby");

    return (
        <Fragment>
            <SEO title={t("1 vs 1 Battle")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("1 vs 1 Battle")} content={t("Home")} contentTwo={t("1 vs 1 Battle")} />
            <div className="SelfLearning battlequiz">
                <div className="container">
                    <div className="row morphisam">
                        {/* battle screen */}
                        <div className="col-md-6  col-xl-5 col-xxl-6 col-12">
                            <img src={process.env.PUBLIC_URL + "/images/battle/1vs1battle.webp"} alt="1vs1" className="onevsoneimg pb-3" />
                        </div>
                        <div className="col-md-6  col-xl-7 col-xxl-6 col-12 ">
                            <Tabs defaultActiveKey="1">
                                <TabPane tab={t("Create")} key="1">
                                    <div className="inner_content d-flex align-items-center flex-wrap">
                                        <ul className="coins_deduct d-flex ps-0 align-items-center flex-wrap my-3">
                                            {coinsdata.map((data, idx) => {
                                                return (
                                                    <li key={idx} className="list-unstyled me-5" onClick={(e) => selectedCoinsdata(data)}>
                                                        <button className={`btn btn-primary ${data.id === selectedCoins.selected.id ? "active-one" : "unactive-one"}`}>{data.num}</button>
                                                        <img src={process.env.PUBLIC_URL + "/images/battle/coin.png"} alt="coin" />
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        <div className="input_coins">
                                            <input type="number" placeholder="00" min="0" onChange={(e) => setSelectedCoins({ ...selectedCoins, selected: e.target.value })} ref={inputText} />
                                        </div>
                                    </div>

                                    {/* coins */}
                                    <div className="total_coins my-4 ml-0">
                                        <h5 className=" text-center ">{t("Current Coins")} : {user.coins}</h5>
                                    </div>

                                    {/* create room */}
                                    <div className="create_room">
                                        <button className="btn btn-primary" onClick={() => searchRoom()}>
                                            {t("Create Room")}
                                        </button>
                                    </div>
                                </TabPane>
                                <TabPane tab={t("Join")} key="2">
                                    <h5 className=" mb-4">{t("Enter room code here")}</h5>
                                    <div className="join_room_code">
                                        <input type="number" placeholder={t("Enter Code")} onChange={handlechange} className="join_input" min="0" />
                                    </div>
                                    <div className="join_btn mt-4">
                                        <button className="btn btn-primary" onClick={() => joinRoom(username, userprofile, useruid, inputCode, usercoins)}>
                                            {" "}
                                            {t("Join Room")}
                                        </button>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* play with friends modal */}

            <Modal centered visible={playwithfriends} onOk={() => setPlaywithfriends(false)} onCancel={() => setPlaywithfriends(false)} footer={null} className="custom_modal_notify retry-modal playwithfriend">
                {playwithfriends ? (
                    <>
                        <div className="randomplayer">
                            <div className="main_screen">
                                <div className="room_code_screen">
                                    <h3>{t("Room code")} : {shouldGenerateRoomCode}</h3>
                                    <p>{t("Share this room code to friends and ask them to join")}</p>
                                </div>

                                <div className="share">
                                    <FacebookShareButton
                                        className="me-2"
                                        url={"https://www.facebook.com/"}
                                        quote={`Hello,Join a group battle in Elite Quiz. Go to Group Battle in Quiz Play and join using the code : ${shouldGenerateRoomCode}`}
                                    >
                                        <FacebookIcon size="30" round="true" />
                                    </FacebookShareButton>
                                    <WhatsappShareButton url={"https://web.whatsapp.com/"} quote={`Hello,Join a group battle in Elite Quiz. Go to Group Battle in Quiz Play and join using the code : ${shouldGenerateRoomCode}`}>
                                        <WhatsappIcon size="30" round="true" />
                                    </WhatsappShareButton>
                                </div>

                                <div className="inner_Screen">
                                    <div className="user_profile">
                                        <img src={user.profile} alt="wrteam" />
                                        <p className="mt-3">{user.name ? user.name : user.email}</p>
                                    </div>
                                    <div className="vs_image">
                                        <img src={process.env.PUBLIC_URL + "/images/battle/vs.webp"} alt="versus" height={100} width={50} />
                                    </div>
                                    <div className="opponent_image">
                                        <img src={typeof userdata.profile === "undefined" ? "" : userdata.profile} alt="wrteam" />
                                        <p className="mt-3">{typeof userdata.userName === "undefined" ? "" : userdata.userName}</p>
                                    </div>
                                </div>
                                {(() => {
                                    if (user.id == createdby) {
                                        return (
                                            <>
                                                {showStart ? (
                                                    <div className="start_game">
                                                        <button className="btn btn-primary" onClick={(e) => startGame(e)}>
                                                            {t("Start Game")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    ""
                                                )}
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </>
                ) : (
                    ""
                )}
            </Modal>
        </Fragment>
    );
};

export default withTranslation()(RandomBattle);
