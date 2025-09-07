import React, { useState, useEffect } from "react";
import BunnyHoleClass from "./modules/bunny_hole.mjs"
import BunnyHole from "./ui/BunnyHole.jsx";
import "./sidebar.css";
import { buildIOMessage, IOCommands, MessageTypes } from "./modules/messages.mjs";
import Toolbar from "./ui/Toolbar.jsx";
import PromptBox, {PromptProvider} from "./ui/PromptBox.jsx";
import NodeEditBox, { NodeEditProvider } from "./ui/NodeEditBox.jsx";
import Modal from "./ui/widgets/Modal.jsx";

function SidebarApp() {
    const [bunnyHole, setBunnyHole] = useState(new BunnyHoleClass().jsObject);

    const handleMessage = (message, _sender, _sendResponse) => {        
        if(message.type !== MessageTypes.BH) return;     
        setBunnyHole(message.content);
    }

    useEffect(() => {
        browser.runtime.onMessage.addListener(handleMessage);
        
        const message = buildIOMessage(IOCommands.LOAD);
        browser.runtime.sendMessage(message);

        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        }
    }, []);

    return (
        <div>
            <NodeEditProvider>
            <PromptProvider>
                <Toolbar />
                <NodeEditBox />
                <BunnyHole data={bunnyHole}/>
                <PromptBox />
            </PromptProvider>
            </NodeEditProvider>
        </div>
    )
}

export default SidebarApp;