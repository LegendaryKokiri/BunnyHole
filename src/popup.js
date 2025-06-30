import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import PopupApp from "./PopupApp.jsx";

/* ********* *
 * APP BUILD *
 *************/
const root = createRoot(document.getElementById("popup-root"));
// console.log(`popup-root`);
// console.log(root);
root && root.render(
    <React.StrictMode>
        <PopupApp />
    </React.StrictMode>
);