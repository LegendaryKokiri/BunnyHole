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
                <Button text="Create Bunny Hole" onClick={createNew}/>
                <Button text="Load Bunny Hole" />
                <Button text="Exit" type={ButtonType.DANGEROUS}/>
            </div>
        </div>
    )
}

export default PopupApp;