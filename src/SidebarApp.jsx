import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";

import Toolbar from "./ui/sidebar/Toolbar.jsx";
import BunnyHole, { BunnyHoleProvider } from "./ui/sidebar/BunnyHole.jsx";
import NodeEditBox, { NodeEditProvider } from "./ui/sidebar/NodeEditBox.jsx";
import PromptBox, { PromptProvider } from "./ui/sidebar/PromptBox.jsx";
import ToastBox, {ToastProvider} from "./ui/sidebar/ToastBox.jsx";

import { buildIOLoadMessage, MessageTypes, OptionCommands } from "./modules/messages.mjs";
import Theme, { ThemeProvider, useTheme } from "./ui/themes/Theme.jsx";

/* *************** *
 * REACT COMPONENT *
 *******************/

function SidebarApp() {
    // Build React component
    const sidebar = <div>
        <ThemeProvider>
        <BunnyHoleProvider>
        <NodeEditProvider>
        <PromptProvider>
        <ToastProvider>
            <Theme>
                <Toolbar />
                <BunnyHole />
                <NodeEditBox />
                <PromptBox />
                <ToastBox />
            </Theme>
        </ToastProvider>
        </PromptProvider>
        </NodeEditProvider>
        </BunnyHoleProvider>
        </ThemeProvider>
    </div>

    useEffect(() => {
        const message = buildIOLoadMessage();
        browser.runtime.sendMessage(message);
    }, []);

    return sidebar;
}

export default SidebarApp;