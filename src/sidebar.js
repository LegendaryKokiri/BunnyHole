import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import SidebarApp from "./SidebarApp.jsx";

/* ********* *
 * APP BUILD *
 *************/
const root = createRoot(document.getElementById("sidebar-root"));
// console.log(`sidebar-root`);
// console.log(root);
root && root.render(
    <React.StrictMode>
        <SidebarApp />
    </React.StrictMode>
);