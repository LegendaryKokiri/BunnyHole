import React, { useState } from "react";
import ReactDOM from "react-dom"

import { MESSAGE_NEW } from "../../modules/constants.mjs";

function PopupApp() {
    const createNew = () => {
        browser.runtime.sendMessage(MESSAGE_NEW);
    }
    
    return (
        <div>
            <h1>Bunny Hole</h1>
            <button class="button" onClick = {createNew}>
                Make New Bunny Hole
            </button>
        </div>
    )
}

export default PopupApp;