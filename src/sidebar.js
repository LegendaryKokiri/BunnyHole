import React from "react";
import { createRoot } from "react-dom/client";
import SidebarApp from "./SidebarApp.jsx";

/* ********* *
 * APP BUILD *
 *************/
const sidebar = createRoot(document.getElementById("sidebar-root"));
sidebar.render(
    <React.StrictMode>
        <SidebarApp />
    </React.StrictMode>,
);