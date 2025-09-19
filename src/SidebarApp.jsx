import React, { useState, useEffect } from "react";
import BunnyHoleClass from "./modules/bunny_hole.mjs"
import BunnyHole from "./ui/BunnyHole.jsx";
import "./sidebar.css";
import { buildIOLoadMessage, MessageTypes } from "./modules/messages.mjs";
import Toolbar from "./ui/Toolbar.jsx";
import PromptBox, {PromptProvider} from "./ui/PromptBox.jsx";
import NodeEditBox, { NodeEditProvider } from "./ui/NodeEditBox.jsx";
import PopupBox, { PopupProvider } from "./ui/PopupBox.jsx";

function SidebarApp() {
    const [bunnyHole, setBunnyHole] = useState(new BunnyHoleClass().jsObject);

    const handleMessage = (message, _sender, _sendResponse) => {        
        if(message.type !== MessageTypes.BH) return;     
        setBunnyHole(message.content);
    }

    useEffect(() => {
        browser.runtime.onMessage.addListener(handleMessage);
        
        const message = buildIOLoadMessage();
        browser.runtime.sendMessage(message);

        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        }
    }, []);

    return (
        <div>
            <NodeEditProvider>
            <PopupProvider>
            <PromptProvider>
                <Toolbar />
                <BunnyHole data={bunnyHole}/>
                <NodeEditBox />
                <PopupBox />
                <PromptBox />
            </PromptProvider>
            </PopupProvider>
            </NodeEditProvider>
        </div>
    )
}

export default SidebarApp;