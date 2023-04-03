import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isLogin } from "../utils";

const PublicRoute = ({ component: Component, restricted = false, ...rest }) => {
    return <Route {...rest} render={(props) => (isLogin() && restricted ? <Redirect to={"/home"} /> : <Component {...props} />)} />;
};

export default PublicRoute;
