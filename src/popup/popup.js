import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import PopupApp from "../components/PopupApp";

/* ********* *
 * APP BUILD *
 *************/
const root = createRoot(document.getElementById("popup-root"));
root.render(
    <React.StrictMode>
        <PopupApp />
    </React.StrictMode>
);