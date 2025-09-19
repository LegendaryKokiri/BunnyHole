import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./sidebar.css";

import Toolbar from "./ui/Toolbar.jsx";
import BunnyHole, { BunnyHoleProvider } from "./ui/BunnyHole.jsx";
import NodeEditBox, { NodeEditProvider } from "./ui/NodeEditBox.jsx";
import PromptBox, { PromptProvider } from "./ui/PromptBox.jsx";
import ToastBox, {ToastProvider} from "./ui/ToastBox.jsx";

import { buildIOLoadMessage } from "./modules/messages.mjs";

/* *************** *
 * REACT COMPONENT *
 *******************/

function SidebarApp() {
    useEffect(() => {
        const message = buildIOLoadMessage();
        browser.runtime.sendMessage(message);
    }, []);

    return (
        <div>
            <BunnyHoleProvider>
            <NodeEditProvider>
            <PromptProvider>
            <ToastProvider>
                <Toolbar />
                <BunnyHole />
                <NodeEditBox />
                <PromptBox />
                <ToastBox />
            </ToastProvider>
            </PromptProvider>
            </NodeEditProvider>
            </BunnyHoleProvider>
        </div>
    )
}

export default SidebarApp;