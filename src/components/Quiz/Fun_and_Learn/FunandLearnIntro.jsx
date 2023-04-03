import React from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const FunandLearnIntro = ({ data, active, t, url, funandlearn }) => {
  return (
    <div className="subcatintro__sec">
      <Link
        to={{
          pathname: url,
          data: {
            funandlearn: funandlearn,
            details:data.detail
          },
        }}
      >
        <div className={`card spandiv ${active}`}>
          <div className="card__name m-auto">
            <p className="text-center m-auto d-block">
              {data.title}
            </p>
            <p className="text-center m-auto d-block fun_learn_hide">
              {t("Questions")} : {data.no_of_que}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default withTranslation()(FunandLearnIntro);
