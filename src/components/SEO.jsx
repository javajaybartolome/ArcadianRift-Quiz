import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import config from "../utils/config.js";
import * as api from "../utils/api";

const SEO = ({ title }) => {

    const [appName, setAppName] = useState();

    useEffect(() => {
        api.getSettings("app_name").then((response) => {
            if (!response.error) {
                setAppName(response.data);
            } else {
                toast.error(response.message);
            }
        });
    }, [])

    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>{appName + " | " + title}</title>
            <meta name="robots" content="noindex, follow" />
            <meta name="description" content={config.metaDescription} />
            <meta name="keywords" content={config.metaKeyWords}></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta property="og:title" content={appName + " | " + title} />
            <meta property="og:type" content="website" />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
};

export default SEO;
