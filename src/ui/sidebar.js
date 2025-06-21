import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import SidebarApp from "./components/SidebarApp.jsx";

const root = createRoot(document.getElementById("sidebar-root"));
root.render(
    <React.StrictMode>
        <SidebarApp />
    </React.StrictMode>
);