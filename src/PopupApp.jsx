import React from "react";
import ReactDOM from "react-dom"
import "./popup.css";

import Button, { ButtonType } from "./ui/input/Button.jsx";

import { buildIOMessage, IOCommands } from "./modules/messages.mjs";

function PopupApp() {
    const createNew = () => {
        const message = buildIOMessage(IOCommands.NEW);
        browser.runtime.sendMessage(message);
        browser.sidebarAction.open();
    }
    
    return (
        <div>
            <div className="popupMenu">
                <h1>Bunny Hole</h1>
                <Button onClick={createNew}>Create Bunny Hole</Button>
                <Button>Load Bunny Hole</Button>
                <Button buttonType={ButtonType.DANGEROUS}>Exit</Button>
            </div>
        </div>
    )
}

export default PopupApp;