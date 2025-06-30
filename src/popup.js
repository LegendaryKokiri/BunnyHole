import React from "react";
import { createRoot } from "react-dom/client";
import PopupApp from "./PopupApp.jsx";

/* ********* *
 * APP BUILD *
 *************/
const popup = createRoot(document.getElementById("popup-root"));
popup.render(
    <React.StrictMode>
        <PopupApp />
    </React.StrictMode>,
);