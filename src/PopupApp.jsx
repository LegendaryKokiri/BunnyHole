import React from "react";
import ReactDOM from "react-dom"
import "./popup.css";

import Button, { ButtonType } from "./ui/widgets/Button.jsx";

/* *************** *
 * REACT COMPONENT *
 *******************/

function PopupApp() {
    const launch = () => {
        browser.sidebarAction.open();
    }
    
    return (
        <div>
            <div className="popupMenu">
                <h1>Bunny Hole</h1>
                <Button onClick={launch}>Launch in Sidebar</Button>
                <Button>Load Bunny Hole</Button>
                <Button buttonType={ButtonType.DANGEROUS}>Exit</Button>
            </div>
        </div>
    )
}

export default PopupApp;