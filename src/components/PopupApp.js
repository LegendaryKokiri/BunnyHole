import React from "react";
import ReactDOM from "react-dom"

import { MESSAGE_NEW } from "../modules/constants.mjs";

function createNewBunnyHole() {
    browser.runtime.sendMessage(MESSAGE_NEW);
}

// const newButton = document.getElementById("button-new");
// newButton.addEventListener("click", createNewBunnyHole);

function PopupApp() {
    // const newButton = <button id="button-new">Make New Bunny Hole</button>;
    return (
        <div>
            <h1>Bunny Hole</h1>
        </div>
    )
}

export default PopupApp;