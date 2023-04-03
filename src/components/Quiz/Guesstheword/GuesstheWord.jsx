import React, { Fragment, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { toast } from "react-toastify";
import { getUserData, updateUserData } from "../../../utils";
import config from "../../../utils/config";
import * as api from "../../../utils/api";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { t } from "i18next";

const GuesstheWord = ({ answer, guessthewordCheck,setInput,input,actIndex,setActIndex,clearallInput}) => {
  const [random, setRandom] = useState();
  const [input2, setInput2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [loading]);

  const btndisabled = false;

  let history = useHistory();

  const redirect = () => {
    history.push("/");
  };

  //suffle answer
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      let temp = arr[i];
      let j = Math.floor(Math.random() * (i + 1));
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

  useEffect(() => {
    setRandom(
      shuffle(
        answer
          .toUpperCase()
          .replace(/\s/g, "")
          .split("")
          .map((val, i) => {
            return { value: val, ansIndex: i };
          })
      )
    );

    setInput2(
      answer
        .toUpperCase()
        .replace(/\s/g, "")
        .split("")
        .map(() => {
          return { value: "", index: null };
        })
    );
  }, [answer]);

  //array to string convert
  const arrtostr = () => {
    let str = input.map((obj) => {
      return obj.value;
    });
    let newstr = str.join("");
    return newstr;
  };

  //focus input
  const useActiveElement = () => {
    const [active, setActive] = useState(document.activeElement);
    const handleFocusIn = (e) => {
      setActive(document.activeElement);
    };
    useEffect(() => {
      document.addEventListener("focusin", handleFocusIn);
      return () => {
        document.removeEventListener("focusin", handleFocusIn);
      };
    }, []);
    return active;
  };

  //user data
  let user = getUserData();

  //focus states and input states
  const focusedElement = useActiveElement();
  // const [actIndex, setActIndex] = useState(0);
  const [news, setNew] = useState(false);
  const [hintDisabled, setHintDisabled] = useState(0);
  const [coninsUpdate, setCoinsUpdate] = useState(user.coins);

  //focus useeffect
  useEffect(() => {
    if (focusedElement) {
      focusedElement.value;
      const val = parseInt(focusedElement.getAttribute("data-index"));
      if (!isNaN(val) && val !== null) {
        setActIndex(val);
      }
    }
  }, [focusedElement]);

  useEffect(() => {
    if (actIndex < 0) {
      setActIndex(0);
    }
    if (actIndex > answer.length) {
      setActIndex(answer.length - 1);
    }
    if (document.querySelector(`[data-index="${actIndex}"]`) != null) {
      document.querySelector(`[data-index="${actIndex}"]`).focus();
    }
  }, [actIndex]);

  // input field data
  const inputfield = () => {
    setNew((prevState) => false);
  };

  // button data
  const buttonAnswer = (e, item, btnId) => {
    if (input2 === null) {
      return;
    }
    let newVal = input2;
    // newVal[actIndex].value !== ""
    if (typeof !newVal[actIndex] === "undefined" && newVal[actIndex].value !== "") {
      if (document.getElementById(`btn-${newVal[actIndex].index}`) !== "undefined"){
        document.getElementById(`btn-${newVal[actIndex].index}`).disabled = false;
    }
    }
    newVal[actIndex].value = item;

    newVal[actIndex].index = btnId;
    document.getElementById(`btn-${btnId}`).disabled = true;
    const index = actIndex;
    setActIndex(index + 1);
    setInput((prevState) => [...newVal]);
    setNew((prevState) => true);
  };

  //backinput clear
  const backinputclear = (e) => {
    e.preventDefault();
    let newVal = input2;
    if (news) {
      newVal[actIndex - 1].value = "";
      document.getElementById(
        `btn-${newVal[actIndex - 1].index}`
      ).disabled = false;
      setNew((prevState) => false);
      newVal[actIndex - 1].value = "";
    } else {
      document.getElementById(`btn-${newVal[actIndex].index}`).disabled = false;
      newVal[actIndex].value = "";
    }
    setActIndex((prevState) => prevState - 1);
    setInput((prevState) => [...newVal]);
  };

  //random number for hint
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  // handle hints
  const handleHints = (e) => {
    if(coninsUpdate === "0") {
      return
    }

    let enabledBtnId = new Array();
    random.map((item, i) => {
      if (document.getElementById(`input-${i}`).value === "") {
        enabledBtnId.push(i);
      }
    });
    let ind = null;
    if (enabledBtnId.length != 0) {
      ind = shuffle(enabledBtnId)[0];
    }
    random.map((val, i) => {
      if (val.ansIndex == ind) {
        if (!document.getElementById(`btn-${i}`).disabled) {
          val.ansIndex, document.getElementById(`btn-${i}`).innerText;
          let newVal = input2;
          newVal[val.ansIndex].value = document.getElementById(
            `btn-${i}`
          ).innerText;
          newVal[val.ansIndex].index = i;
          const index = val.ansIndex;
          document.getElementById(`btn-${i}`).disabled = true;
          setActIndex(index + 1);
          setInput((prevState) => [...newVal]);
          setNew((prevState) => true);

          // button disabled
          setHintDisabled(hintDisabled + 1);
          e.currentTarget.disabled = hintDisabled >= 1 ? true : false;
          let coins = config.Guessthewordhintcoin;
          if (user.coins < coins) {
            toast.error(t("You Don't have enough coins"));
            return false;
          }
          let status = 1;
          api
            .setUserCoinScore("-" + coins, null, null, "Hint", status)
            .then((response) => {
              if (!response.error) {
                updateUserData(response.data);
                setCoinsUpdate(response.data.coins);
              } else {
                Swal.fire(t("OOps"), t("Please Try again"), "error");
              }
            });
        }
      }
    });
  };

  //check answer on submit
  const handleSubmit = () => {
    let inputstr = arrtostr();
    setHintDisabled(0);
    document.getElementById("hntBtn").disabled = false;
    clearallInput;
    guessthewordCheck(inputstr);
  };

  return (
    <Fragment>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" variant="secondary"></Spinner>
        </div>
      ) : (
        <>
          {answer ? (
            <div className="guess_the_word_comp">
              <div className="total_coins">
                <div className="inner_coins">
                  <p>{coninsUpdate}</p>
                </div>
              </div>
              <span className="input_box mt-5">
                {random &&
                    random.map((data, index) => {
                    return (
                      <input
                      key={index}
                      data-index={index}
                      type="text"
                      value={input2[index].value}
                      id={`input-${index}`}
                      onClick={() => inputfield()}
                      className="custom_input"
                      readOnly
                      />
                    );
                  })}
              </span>
              <div className="col-md-12 col-12 button_area my-4">
                <ul>
                  {random ? (
                    random.map((item, i) => {
                      return (
                        <li key={i}>
                          <button
                            className="btn btn-primary buttondata"
                            id={`btn-${i}`}
                            onClick={(e) => buttonAnswer(e, item.value, i)}
                          >
                            {item.value}
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <div className="text-center">
                      <Spinner animation="border" role="status" variant="secondary"></Spinner>
                    </div>
                  )}
                </ul>
              </div>
              <div className="bottom_button mb-4">
                <div className="clear_input">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => backinputclear(e)}
                  >
                    <IoArrowBack />
                  </button>
                </div>
                <div className="hint_button">
                  <button
                    id="hntBtn"
                    className="btn btn-primary"
                    disabled={btndisabled ? true : false}
                    onClick={(e) => handleHints(e)}
                  >
                      {t("Hint")}
                  </button>
                </div>
                <div className="submit_button">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSubmit()}
                  >
                      {t("Submit")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="setNoFound">
                <p>{"Please Add Data No Data Found"}</p>

                <button className="btn nobtn" onClick={redirect}>
                  {"Back"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Fragment>
  );
};
export default GuesstheWord;