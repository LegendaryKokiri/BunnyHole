import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router";
import "./mainMenu.css";

import Button from "../widgets/Button.jsx";

import { PATH_OPTIONS } from "../../modules/routing.mjs";

/* *************** *
 * REACT COMPONENT *
 *******************/

function MainMenu() {
    const launch = useCallback(() => {
        browser.sidebarAction.open();
    }, []);

    const menu = <div className="mainMenu">
        <h1>Bunny Hole</h1>
        <Button onClick={launch}>Launch in Sidebar</Button>
        <Link to={PATH_OPTIONS} viewTransition>
            <Button>Options</Button>
        </Link>
    </div>

    return menu;
}

export default MainMenu;