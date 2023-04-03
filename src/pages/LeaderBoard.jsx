import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";
import TopHeader from "../components/smalltopheader/TopHeader";
import Header from "../partials/header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import { Select } from "antd";
import * as api from "../utils/api";
import DataTable from "react-data-table-component";
import { withTranslation } from "react-i18next";
import Footer from "../partials/footer/Footer";
const { Option } = Select;
const LeaderBoard = ({ t }) => {
    const [leaderBoard, setLeaderBoard] = useState({
        myRank: "",
        data: "",
        total: "",
    });

    const [category, setCategory] = useState("Daily");
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

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
                        <img src={process.env.PUBLIC_URL + "/images/user.webp"} className="w-25" alt={row.name}></img>
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

    const getDailyLeaderBoard = (offset, limit) => {
        api.getDailyLeaderBoard(offset, limit).then((response) => {
            if (!response.error) {
                setTableData(response.data, response.total);
            }
        });
    };

    const getMonthlyLeaderBoard = (offset, limit) => {
        api.getMonthlyLeaderBoard(offset, limit).then((response) => {
            if (!response.error) {
                setTableData(response.data, response.total);
            }
        });
    };

    const getGlobleLeaderBoard = (offset, limit) => {
        api.getGlobleLeaderBoard(offset, limit).then((response) => {
            if (!response.error) {
                setTableData(response.data, response.total);
            }
        });
    };

    const fetchData = (category, limit, offset) => {
        limit = limit ? limit : 10;
        offset = offset ? offset : 0;
        if (category === "Daily") {
            getDailyLeaderBoard(offset, limit);
        } else if (category === "Monthly") {
            getMonthlyLeaderBoard(offset, limit);
        } else {
            getGlobleLeaderBoard(offset, limit);
        }
    };

    const setTableData = (data, total) => {
        var myRank = data[0];
        data = data.slice(1);
        setLeaderBoard({ myRank: myRank, data: data, total: total });
    };

    const handleCategoryChange = (category) => {
        setCategory(category);
        setLimit(10);
        setOffset(0);
        fetchData(category, limit, offset);
    };

    const changePage = (page) => {
        var offset = limit * page - limit;
        fetchData(category, limit, offset);
    };

    useEffect(() => {
        getDailyLeaderBoard(0, 10);
    }, []);

    // server image error
    const imgError = (e) => {
        e.target.src = "/images/user.webp"
    }

    return (
        <React.Fragment>
            <SEO title={t("LeaderBoard")} />
            <TopHeader />
            <Header />
            <Breadcrumb title={t("LeaderBoard")} content={t("Home")} contentTwo={t("LeaderBoard")} />

            <div className="LeaderBoard">
                <div className="container">
                    <div className="row morphisam">
                        <div className="col-md-4 col-12 d-flex align-items-center">
                            <h5>{t("LeaderBoard")}</h5>
                        </div>
                        <div className="col-md-8 col-12">
                            <div className="row">
                                <div className="two_content_data">
                                    <div className="sorting_area">
                                        {/* <span>{t("Sort")} :</span> */}
                                        <Select defaultValue="Daily" className="selectvalue" onChange={handleCategoryChange}>
                                            <Option value="Daily">{t("Daily")}</Option>
                                            <Option value="Monthly">{t("Monthly")}</Option>
                                            <Option value="Global">{t("Global")}</Option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table_content mt-3">
                            <ul className="first_three_data row">
                                <div className="col-lg-4 col-md-4 col-12">
                                    {/* third winner */}
                                    {leaderBoard.data &&
                                        leaderBoard.data.slice(2, 3).map((data, index) => {
                                            return (
                                                <>
                                                    <li className="third_data" key={index}>
                                                        <div className="Leaf_img">
                                                            <img className="leftleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/smallleftleaf.webp"} alt="leaf" />
                                                            <img className="data_profile" src={data.profile} alt="third" onError={imgError} />
                                                            <img className="rightleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/smallrightleaf.webp"} alt="leaf" />
                                                        </div>

                                                        <h5 className="data_nam">{data.name}</h5>
                                                        <p className="data_score">{data.score}</p>
                                                        <span className="data_rank">{data.user_rank}</span>
                                                    </li>
                                                </>
                                            );
                                        })}
                                </div>

                                <div className="col-lg-4 col-md-4 col-12">
                                    {/* first winner */}
                                    {leaderBoard.data &&
                                        leaderBoard.data.slice(0, 1).map((data, index) => {
                                            return (
                                                <>
                                                    <li className="first_data" key={index}>
                                                        <img className="crown" src={process.env.PUBLIC_URL + "/images/leaderboard/crown.webp"} alt="" />
                                                        <div className="Leaf_img">
                                                            <img className="leftleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/bigleafleft.webp"} alt="leaf" />
                                                            <img className="data_profile" src={data.profile} alt="first" onError={imgError}/>
                                                            <img className="rightleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/bigrightleaf.webp"} alt="leaf" />
                                                        </div>
                                                        <h5 className="data_nam">{data.name}</h5>
                                                        <p className="data_score">{data.score}</p>
                                                        <span className="data_rank">{data.user_rank}</span>
                                                    </li>
                                                </>
                                            );
                                        })}
                                </div>
                                <div className="col-lg-4 col-md-4 col-12">
                                    {/* second winner */}
                                    {leaderBoard.data &&
                                        leaderBoard.data.slice(1, 2).map((data, index) => {
                                            return (
                                                <>
                                                    <li className="second_data" key={index}>
                                                        <div className="Leaf_img">
                                                            <img className="leftleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/smallleftleaf.webp"} alt="leaf" />
                                                            <img className="data_profile" src={data.profile} alt="second" onError={imgError}/>
                                                            <img className="rightleaf" src={process.env.PUBLIC_URL + "/images/leaderboard/smallrightleaf.webp"} alt="leaf" />
                                                        </div>
                                                        <h5 className="data_nam">{data.name}</h5>
                                                        <p className="data_score">{data.score}</p>
                                                        <span className="data_rank">{data.user_rank}</span>
                                                    </li>
                                                </>
                                            );
                                        })}
                                </div>
                            </ul>

                            <DataTable
                                title=""
                                columns={columns}
                                data={leaderBoard && leaderBoard.data}
                                pagination
                                highlightOnHover
                                paginationServer
                                paginationTotalRows={leaderBoard && leaderBoard.total}
                                paginationPerPage={limit}
                                paginationComponentOptions={{
                                    noRowsPerPage: true,
                                }}
                                className="dt-center"
                                onChangePage={(page) => changePage(page)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
};
export default withTranslation()(LeaderBoard);
