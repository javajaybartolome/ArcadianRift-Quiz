import React, { Fragment, useState } from "react";
import { IoGlobeOutline, IoLogoFacebook, IoLogoInstagram, IoLogoLinkedin } from "react-icons/io5";
import { Redirect } from "react-router-dom";
import Logo from "../../components/logo/Logo";
import config from "../../utils/config";
import { withTranslation } from "react-i18next";

const Footer = ({ t }) => {
    //policy state
    const [redirect, setRedirect] = useState();

    //company state
    const [comredirect, setcomRedirect] = useState();

    //policy data
    const policydata = [
        {
            id: 1,
            policytext: t("Privacy Policy"),
        },
        {
            id: 2,
            policytext: t("Terms and Conditions"),
        },
    ];

    if (redirect === 1) {
        return <Redirect to={{ pathname: "/privacy-policy" }} />;
    } else if (redirect === 2) {
        return <Redirect to={{ pathname: "/terms-conditions" }} />;
    }

    const redirectdata = (data) => {
        if (data) {
            setRedirect(data.id);
        }
    };

    //company data
    const companydata = [
        {
            id: 1,
            cdata: t("About Us"),
        },
        {
            id: 2,
            cdata: t("Contact Us"),
        },
    ];

    if (comredirect === 1) {
        return <Redirect to={{ pathname: "/about-us" }} />;
    } else if (comredirect === 2) {
        return <Redirect to={{ pathname: "/contact-us" }} />;
    }

    const companyData = (data) => {
        setcomRedirect(data.id);
    };

    //social media data
    const socialdata = [
        {
            id: 1,
            sodata: <IoLogoFacebook />,
            link: config.facebooklink,
        },
        {
            id: 2,
            sodata: <IoLogoInstagram />,
            link: config.instagramlink,
        },
        {
            id: 3,
            sodata: <IoLogoLinkedin />,
            link: config.linkedinlink,
        },
        {
            id: 4,
            sodata: <IoGlobeOutline />,
            link: config.weblink,
        },
    ];

    return (
        <Fragment>
            <div className="footer_wrapper">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 col-lg-3  col-12 footer_left">
                            <div className="footer_logo">
                                <Logo image={process.env.PUBLIC_URL + `/images/logo/footerlogo.webp`} />
                            </div>
                            <div className="footer_left_text">
                                <p>{t(`${config.companytext}`)}</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3  col-12 footer_left_second">
                            <div className="footer_title">
                                <h4 className="footer_heading">{t("Policy")}</h4>
                            </div>
                            <ul className="footer_policy">
                                {policydata.map((data) => (
                                    <li onClick={() => redirectdata(data)} className="footer_list" key={data.id}>
                                        {data.policytext}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6 col-lg-3  col-12 footer_right">
                            <div className="footer_title">
                                <h4 className="footer_heading">{t("Company")}</h4>
                            </div>
                            <ul className="footer_policy">
                                {companydata.map((data) => (
                                    <li onClick={() => companyData(data)} className="footer_list" key={data.id}>
                                        {data.cdata}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-md-6 col-lg-3 col-12 footer_right">
                            <div className="footer_title">
                                <h4 className="footer_heading">{t("Find Us Here")}</h4>
                            </div>
                            <ul className="footer_policy">
                                <li className="footer_list_address">{t(`${config.addresstext}`)}</li>
                                <li className="footer_list_email">
                                    <a href={`mailto:${config.email}`}>{t(`${config.email}`)}</a>
                                </li>
                                <li className="footer_list_number">
                                    <a href={`tel:${config.phonenumber}`}>{t(`${config.phonenumber}`)}</a>
                                </li>
                            </ul>
                            <ul className="footer_social">
                                {socialdata.map((data) => (
                                    <li className="footer_social_list" key={data.id}>
                                        <a href={data.link}>
                                            <i>{data.sodata}</i>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <hr />

                    <div className="footer_copyright text-center">
                        <p>
                            {t("Copyright")} © {new Date().getFullYear()} {t("Made By")}{" "}
                            <a href={`${config.weblink}`} target="_blank">
                                {t(`${config.companyname}`)}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default withTranslation()(Footer);
