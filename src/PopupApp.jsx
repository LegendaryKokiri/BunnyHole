import React from "react";
import ReactDOM from "react-dom"
import { StaticRouter as Router, Routes, Route } from "react-router";

import Theme, { ThemeProvider } from "./ui/themes/Theme.jsx";
import MainMenu from "./ui/popup/MainMenu.jsx";
import OptionsMenu from "./ui/popup/OptionsMenu.jsx";

/* ********* *
 * CONSTANTS *
 *************/

const PATH_ROOT = "/";
const PATH_OPTIONS = "/options"

/* *************** *
 * REACT COMPONENT *
 *******************/

function PopupApp() {
    return <div>
        <ThemeProvider>
            <Theme>
            <Router>
            <Routes>
                <Route path={PATH_ROOT} element={<OptionsMenu />} />
                <Route path={PATH_OPTIONS} element={<OptionsMenu />} />
                <Route path="*" element={<h1>Error: URL not found</h1>} />
            </Routes>
            </Router>
            </Theme>
        </ThemeProvider>
    </div>
    
}

export default PopupApp;