import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.render(
    // basename="/web"
    <Router>
        <AuthProvider>
            <App />
        </AuthProvider>
    </Router>,
    document.getElementById("root")
);

// document.getElementsByTagName('html')[0].setAttribute("dir", "rtl");
