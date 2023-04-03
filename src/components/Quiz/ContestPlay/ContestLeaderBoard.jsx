import React, { useEffect, useState } from "react";
import * as api from "../../../utils/api";
import DataTable from "react-data-table-component";
import { withTranslation } from "react-i18next";
import SEO from "../../SEO";
import TopHeader from "../../smalltopheader/TopHeader";
import Header from "../../../partials/header/Header";
import Breadcrumb from "../../Breadcrumb/Breadcrumb";
import Footer from "../../../partials/footer/Footer";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ContestLeaderBoard = ({ t }) => {
  const [leaderBoard, setLeaderBoard] = useState({
    myRank: "",
    data: "",
    total: "",
  });

  let { past_id } = useLocation();

  let pastcontest = past_id.past_id

  const columns = [
    {
      name: t("Rank"),
      selector: (row) => `${row.user_rank}`,
      sortable: true,
    },
    {
      name: t("Profile"),
      selector: (row) =>
        row.profile ? (
          <div className="leaderboard-profile">
            <img src={row.profile} className="w-100" alt={row.name} onError={imgError}></img>
          </div>
        ) : (
          <div className="leaderboard-profile">
            <img
              src={process.env.PUBLIC_URL + "/images/user.webp"}
              className="w-25"
              alt={row.name}
            ></img>
          </div>
        ),
      sortable: true,
    },
    {
      name: t("Player"),
      selector: (row) => `${row.name}`,
      sortable: true,
    },
    {
      name: t("Score"),
      selector: (row) => `${row.score}`,
    },
  ];

  const getcontestleaderboard = () => {
    api.getContestLeaderboard(pastcontest).then((response) => {
      if (!response.error) {
        setTableData(response, response.total);
      }
    }).catch(() => {
      toast.error("No Data Found")
    })
  }

  const setTableData = (data, total) => {
    setLeaderBoard({ myRank: data.my_rank, data: data.data, total: total });
  };

  useEffect(() => {
    getcontestleaderboard()
  }, []);

   // server image error
   const imgError = (e) => {
    e.target.src = "/images/user.webp"
  }

  return (
    <React.Fragment>
      <SEO title={t("Contest LeaderBoard")} />
      <TopHeader />
      <Header />
      <Breadcrumb title={t("Contest LeaderBoard")} content={t("Home")} contentTwo={t("Contest LeaderBoard")}/>

      <div className="LeaderBoard">
        <div className="container">
          <div className="row morphisam">
            <div className="table_content mt-3">
              <DataTable
                title=""
                columns={columns}
                data={leaderBoard && leaderBoard.data}
                pagination={false}
                highlightOnHover
                paginationServer
                paginationTotalRows={leaderBoard && leaderBoard.total}
                paginationComponentOptions={{
                  noRowsPerPage: true,
                }}
                className="dt-center"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
};
export default withTranslation()(ContestLeaderBoard);
