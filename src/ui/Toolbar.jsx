import React, { useRef } from "react";
import ReactDOM from "react-dom";
import "./toolbar.css";
import Tooltip, { TooltipPosition } from "./widgets/Tooltip.jsx";
import { buildIONewMessage, buildIOOpenMessage, buildIOSaveMessage, IOCommands } from "../modules/messages.mjs";

function ToolbarButton({ onClick, path, op }) {
    const button = <svg
        onClick={onClick}
        className="toolbarButton"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="32"
        height="32"
    >
        <image width="100%" height="100%" href={path} filter={`url(#colorMask)`} />
    </svg>

    const tooltip = <Tooltip text={op} position={TooltipPosition.BELOW}>
        {button}        
    </Tooltip>

    return tooltip;
}

function Toolbar() {
    // Declare DOM references
    const inputRef = useRef(null);

    // Declare event handlers
    const newFile = () => {
        const message = buildIONewMessage();
        browser.runtime.sendMessage(message);
    }

    const openFile = () => {
        inputRef.current.click();
    }

    const fileSelected = () => {
        if(inputRef.current.files.length !== 1) return;

        const file = inputRef.current.files[0];
        if(!file) return;
        
        const message = buildIOOpenMessage(file);
        browser.runtime.sendMessage(message);
    }

    const saveFile = () => {
        const message = buildIOSaveMessage();
        browser.runtime.sendMessage(message);
    }

    const close = () => {

    }

    // Build React component
    const filters = <svg className="toolbarFilters" xmlns="http://www.w3.org/2000/svg" version="1.1" width="32" height="32">
        <defs>
            <filter id={`colorMask`}>
                <feFlood floodColor="#000000" result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
    </svg>

    const fileInput = <input type="file" onChange={fileSelected} className="fileInput" accept=".bh,application/json" ref={inputRef} />

    const toolbar = <div className="toolbar">
        {filters}
        {fileInput}
        <div className="logo">
            <h2>Bunny Hole</h2>
        </div>
        <div className="buttons">
            <ToolbarButton onClick={newFile} path="./buttons/button-new.png" op="New File" />
            <ToolbarButton onClick={openFile} path="./buttons/button-open.png" op="Open File" />
            <ToolbarButton onClick={saveFile} path="./buttons/button-save.png" op="Save File" />
            <ToolbarButton path="./buttons/button-delete.png" op="Exit" />
        </div>
    </div>

    return toolbar;
}

export default Toolbar;