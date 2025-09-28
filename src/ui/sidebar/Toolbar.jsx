import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import "./toolbar.css";

import Tooltip, { TooltipPosition } from "../widgets/Tooltip.jsx";

import { usePrompts, PromptType } from "./PromptBox.jsx";

import { buildIONewMessage, buildIOOpenMessage, buildIOSaveMessage, buildUIFreezeMessage } from "../../modules/messages.mjs";

/* ********* *
 * CONSTANTS *
 *************/

// FILE I/O
import BUTTON_NEW      from "../../../res/buttons/button-new.png";
import BUTTON_OPEN     from "../../../res/buttons/button-open.png";
import BUTTON_SAVE     from "../../../res/buttons/button-save.png";
import BUTTON_FREEZE   from "../../../res/buttons/button-pause.png";
import BUTTON_UNFREEZE from "../../../res/buttons/button-play.png";

// ELEMENT SELECTORS
const POPUP_CLASS = ".promptModal"; // TODO Import this from the Prompt class

// PROMPT TEXT
const CONFIRM_NEW_PROMPT = "Any unsaved progress on your current Bunny Hole will be lost. Are you sure?";
const CONFIRM_OPEN_PROMPT = "Any unsaved progress on your current Bunny Hole will be lost. Are you sure?";

// FREEZE BUTTON TOGGLE
const FREEZE_DISPLAY_OPTIONS = Object.freeze({
    true: BUTTON_UNFREEZE,
    false: BUTTON_FREEZE
});

/* **************** *
 * REACT COMPONENTS *
 ********************/

function ToolbarButton({ onClick, href, op, ref=null }) {
    const button = <svg
        onClick={onClick}
        className="toolbarButton"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="32"
        height="32"
    >
        <image width="100%" height="100%" href={href} filter={"url(#colorMask)"} ref={ref} />
    </svg>

    // TODO: Use another ref to swap the tooltip on the freeze button, or use a selector on this outer tooltip ref
    const tooltip = <Tooltip text={op} position={TooltipPosition.BELOW}>
        {button}        
    </Tooltip>

    return tooltip;
}

function Toolbar() {
    // Declare DOM references
    const inputRef = useRef(null);
    const freezeRef = useRef(null);

    // Subscribe to relevant contexts
    const { promptDispatch } = usePrompts();

    // Declare event handlers
    const displayPrompt = useCallback(() => {
        const modal = document.querySelector(POPUP_CLASS);
        modal.showModal();
    }, []);

    const newFile = useCallback(() => {
        const message = buildIONewMessage();
        browser.runtime.sendMessage(message);
    }, []);

    const confirmNewFile = useCallback(() => {
        promptDispatch({ type: PromptType.CONFIRM, text: CONFIRM_NEW_PROMPT, onConfirm: newFile });
        displayPrompt();
    }, []);

    const openFile = useCallback(() => {
        inputRef.current.click();
    }, []);

    const confirmOpenFile = useCallback(() => {
        promptDispatch({ type: PromptType.CONFIRM, text: CONFIRM_OPEN_PROMPT, onConfirm: openFile });
        displayPrompt();
    }, []);

    const fileSelected = useCallback(() => {
        if(inputRef.current.files.length !== 1) return;

        const file = inputRef.current.files[0];
        if(!file) return;
        
        const message = buildIOOpenMessage(file);
        browser.runtime.sendMessage(message);
    }, [inputRef]);

    const saveFile = useCallback(() => {
        const message = buildIOSaveMessage();
        browser.runtime.sendMessage(message);
    }, []);

    const toggleFreeze = useCallback(() => {
        const message = buildUIFreezeMessage();
        browser.runtime.sendMessage(message).then(
            (response) => freezeRef.current.setAttribute(
                "href",
                FREEZE_DISPLAY_OPTIONS[response.content]
            ),
            (error) => console.error(error)
        );
    }, []);

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
            <ToolbarButton onClick={confirmNewFile} href={BUTTON_NEW} op="New File" />
            <ToolbarButton onClick={confirmOpenFile} href={BUTTON_OPEN} op="Open File" />
            <ToolbarButton onClick={saveFile} href={BUTTON_SAVE} op="Save File" />
            {/* TODO Set the href of the freeze button according to the actual freeze state when the sidebar opens */}
            <ToolbarButton onClick={toggleFreeze} href={BUTTON_FREEZE} op="Freeze" ref={freezeRef} />
        </div>
    </div>

    return toolbar;
}

export default Toolbar;