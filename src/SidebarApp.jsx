import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import BunnyHoleClass from "./modules/bunny_hole.mjs"
import BunnyHole from "./ui/BunnyHole.jsx";
import "./sidebar.css";

function SidebarApp() {
    const [bunnyHole, setBunnyHole] = useState(new BunnyHoleClass().jsObject);

    // TODO: Can we validate the object more cleanly than this?
    // Perhaps a function in the bunny_hole.mjs module would be better suited for this.
    const handleMessage = (message, sender, sendResponse) => {
        console.log("SidebarApp.handleMessage(): Handing!")
        console.log(message);
        if(!BunnyHoleClass.validateJsObject(message)) return;        
        setBunnyHole(message);
    }

    useEffect(() => {
        console.log("SidebarApp.useEffect(): Mounted sidebar app");
        browser.runtime.onMessage.addListener(handleMessage);
        return browser.runtime.onMessage.removeListener(handleMessage);
    }, []);

    return (
        <div>
            <BunnyHole bunnyHoleRootNode={bunnyHole}/>
        </div>
    )
}

export default SidebarApp;