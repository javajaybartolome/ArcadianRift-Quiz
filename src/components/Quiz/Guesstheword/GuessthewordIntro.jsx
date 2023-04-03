import React from 'react'
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const GuessthewordIntro = ({ data, active, t, url, subcategoryid }) => {
  return (
    <div className="subcatintro__sec">
    <Link
      to={{
        pathname: url,
        data: {
            subcategoryid: subcategoryid,
        },
      }}
    >
      <div className={`card spandiv ${active}`}>
        <div className="card__name m-auto">
          <p className="text-center m-auto d-block">
            {data.subcategory_name}
          </p>
        </div>
      </div>
    </Link>
  </div>
  )
}

export default withTranslation()(GuessthewordIntro)