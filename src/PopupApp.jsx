import React from "react";
import ReactDOM from "react-dom"
import "./popup.css";

import Button, { ButtonType } from "./ui/input/Button.jsx";

import { MESSAGE_NEW } from "./modules/constants.mjs";

function PopupApp() {
    const createNew = () => {
        browser.runtime.sendMessage(MESSAGE_NEW);
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