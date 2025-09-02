import React, { useState, useEffect } from "react";
import BunnyHoleClass from "./modules/bunny_hole.mjs"
import BunnyHole from "./ui/BunnyHole.jsx";
import "./sidebar.css";
import { MessageTypes } from "./modules/messages.mjs";
import Toolbar from "./ui/Toolbar.jsx";
import PromptBox, {PromptProvider} from "./ui/PromptBox.jsx";

function SidebarApp() {
    const [bunnyHole, setBunnyHole] = useState(new BunnyHoleClass().jsObject);

    const handleMessage = (message, _sender, _sendResponse) => {        
        if(message.type !== MessageTypes.BH) return;     
        setBunnyHole(message.content);
    }

    useEffect(() => {
        browser.runtime.onMessage.addListener(handleMessage);
        return () => {
            browser.runtime.onMessage.removeListener(handleMessage);
        }
    }, []);

    return (
        <div>
            <PromptProvider>
                <Toolbar />
                <BunnyHole data={bunnyHole}/>
                <PromptBox />
            </PromptProvider>
        </div>
    )
}

export default SidebarApp;