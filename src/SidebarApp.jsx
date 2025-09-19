import React, { useEffect } from "react";
import BunnyHole, { BunnyHoleProvider } from "./ui/BunnyHole.jsx";
import "./sidebar.css";
import { buildIOLoadMessage } from "./modules/messages.mjs";
import Toolbar from "./ui/Toolbar.jsx";
import NodeEditBox, { NodeEditProvider } from "./ui/NodeEditBox.jsx";
import PromptBox, { PromptProvider } from "./ui/PromptBox.jsx";
import ToastBox, {ToastProvider} from "./ui/ToastBox.jsx";

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