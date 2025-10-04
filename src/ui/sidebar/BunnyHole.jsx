import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import "./bunnyhole.css";

import { ButtonCancel } from "../widgets/Button.jsx";
import Tooltip from "../widgets/Tooltip.jsx";

import { useNodeEdits } from "./NodeEditBox.jsx";
import { useTheme } from "../themes/Theme.jsx";
import { useToasts, TOAST_DEACTIVATE } from "./ToastBox.jsx";

import BunnyHoleClass from "../../modules/bunny_hole.mjs"
import { MessageTypes, buildUIAddMessage, buildUIDeleteMessage, buildUINotesMessage, buildUISwapMessage } from "../../modules/messages.mjs";


/* ********* *
 * CONSTANTS *
 *************/

// FILE I/O
import BUTTON_ADD        from "../../../res/buttons/button-add.png";
import BUTTON_HERE       from "../../../res/buttons/button-here.png";
import BUTTON_EDIT       from "../../../res/buttons/button-edit.png";
import BUTTON_REPOSITION from "../../../res/buttons/button-reposition.png";
import BUTTON_DELETE     from "../../../res/buttons/button-delete.png";
import { ThemeElements } from "../themes/Theme.jsx";

// CLASS SELECTORS
const NEST_CLASS = ".bunnyHole > .nestMarker";
const SEPARATOR_CLASS = ".nodeSeparator";
const NODE_EDIT_CLASS = ".nodeEditModal";

// STATIC CLASS NAME BUILDING BLOCKS
const NODE_DEPTH_CLASSNAME = "nodeDepth";
const NODE_PATH_CLASSNAME = "nodePath";
const NODE_PATH_DELIMETER = "_";

// DYNAMIC CLASS NAME BUILDING BLOCKS
const REPOSITION_ACTIVE_MARKER = "repositionActive";
const REPOSITION_ELEMENT_MARKER = "repositioningThis";
const REPOSITION_TARGET_MARKER = "repositionTarget";

// ERROR MESSAGES
const ERROR_CONTEXT = "No context found. BunnyHole must be initialized within a BunnyHoleProvider JSX element.";

/* *************************** *
 * BUNNY HOLE STATE MANAGEMENT *
 *******************************/

const EMPTY_BUNNY_HOLE = {
    data: new BunnyHoleClass().jsObject,
    depth: 0,
    depthClassName: NODE_DEPTH_CLASSNAME,
    path: [],
    pathClassName: NODE_PATH_CLASSNAME
}
const BunnyHoleContext = createContext(EMPTY_BUNNY_HOLE);

// TODO: Seems like the full hole is re-rendered each time.
// Is it possible to cleverly use the reducer to prevent that?
function bunnyHoleReducer(_state, action) {
    return {
        ..._state,
        data: action
    };
}

function BunnyHoleProvider({ children }) {
    const [ bunnyHole, bunnyHoleDispatch ] = useReducer(bunnyHoleReducer, EMPTY_BUNNY_HOLE);
    return <BunnyHoleContext.Provider value={{ bunnyHole, bunnyHoleDispatch }}>
        {children}
    </BunnyHoleContext.Provider>
}

function useBunnyHole() {
    const bunnyHoleContext = useContext(BunnyHoleContext);
    if(!bunnyHoleContext) throw new Error(ERROR_CONTEXT);
    return bunnyHoleContext;
}

export { BunnyHoleContext, BunnyHoleProvider, useBunnyHole };

/* ******************** *
 * REPOSITION UTILITIES *
 ************************/

function getClassName(target, startingString) {
    for(const c of target.classList) {
        if(c.startsWith(startingString)) return c;
    }

    return null;
}

function buildDepthClassName(nodePath) {
    return `${NODE_DEPTH_CLASSNAME}${nodePath.length}`;
}

function buildPathClassName(nodePath) {
    return `${NODE_PATH_CLASSNAME}${nodePath.join(NODE_PATH_DELIMETER)}`;
}

function parsePath(target) {
    const pathClassName = getClassName(target, NODE_PATH_CLASSNAME);
    if(pathClassName === null) return [];
    const pathStrings = pathClassName.substring(NODE_PATH_CLASSNAME.length).split(NODE_PATH_DELIMETER);
    return pathStrings.map((str) => parseInt(str));
}

/* *********************** *
 * TWO-CLICK REPOSITIONING *
 ***************************/

function unmarkRepositionTargets() {
    const targets = [...document.querySelectorAll(SEPARATOR_CLASS)];
    targets.forEach((item) => {
        item.classList.remove(REPOSITION_ACTIVE_MARKER);
    });
}

function beginReposition(pathClassName) {
    const moving = document.querySelector(`${SEPARATOR_CLASS}:is(.${pathClassName})`);
    moving.classList.add(REPOSITION_ELEMENT_MARKER);

    const descendantSelector = `[class^='${pathClassName}'], [class*=' ${pathClassName}']`;
    const targets = document.querySelectorAll(`${SEPARATOR_CLASS}:not(${descendantSelector})`);
    targets.forEach((item) => {
        item.classList.add(REPOSITION_ACTIVE_MARKER);
    });
}

function cancelReposition() {
    const moving = document.querySelector(`${SEPARATOR_CLASS}:is(.${REPOSITION_ELEMENT_MARKER})`);
    moving.classList.remove(REPOSITION_ELEMENT_MARKER);
    unmarkRepositionTargets();
}

function completeReposition(dstPath) {
    const moving = document.querySelector(`${SEPARATOR_CLASS}:is(.${REPOSITION_ELEMENT_MARKER})`);
    const srcPath = parsePath(moving);

    const uiMessage = buildUISwapMessage(srcPath, dstPath);
    browser.runtime.sendMessage(uiMessage);

    moving.classList.remove(REPOSITION_ELEMENT_MARKER);
    unmarkRepositionTargets();
}

/* **************************** *
 * CLICK-AND-DRAG REPOSITIONING *
 ********************************/

function markDragNesting(mouseX) {
    const targets = [...document.querySelectorAll(NEST_CLASS)];
    // const targets = [...document.querySelectorAll(`${DIVIDER_CLASS}:not(.${DRAG_MARKER})`)];

    const dragTarget = targets.reduce((closest, target) => {
        const bbox = target.getBoundingClientRect();
        const nestPoint = bbox.x;
        const offset = Math.abs(mouseX - nestPoint);

        if(offset >= closest.offset) return closest;
        return { offset: offset, target: target }
    }, { offset: Number.POSITIVE_INFINITY });

    if(Object.hasOwn(dragTarget, "target")) {
        dragTarget.target.classList.add(REPOSITION_TARGET_MARKER);
        for(const c of dragTarget.target.classList) {
            if(!c.startsWith(NODE_DEPTH_CLASSNAME)) continue;
            return `.${c}`;
        }
    }

    return "";
}

function markDragTarget(mouseY, depthClass) {
    const classTarget = `${SEPARATOR_CLASS}${depthClass}`;
    const draggedItem = document.querySelector(`.${REPOSITION_ELEMENT_MARKER}`);
    const pathClassName = getClassName(draggedItem, NODE_PATH_CLASSNAME);
    const descendantSelector = `[class^='${pathClassName}'], [class*=' ${pathClassName}']`;
    const targets = [...document.querySelectorAll(`${classTarget}:not(${descendantSelector})`)];
    // const targets = [...document.querySelectorAll(`${DIVIDER_CLASS}:not(.${DRAG_MARKER})`)];

    const dragTarget = targets.reduce((closest, target) => {
        const bbox = target.getBoundingClientRect();
        const midpoint = bbox.y + bbox.height / 2;
        const offset = Math.abs(mouseY - midpoint);

        if(offset >= closest.offset) return closest;
        return { offset: offset, target: target }
    }, { offset: Number.POSITIVE_INFINITY });

    if(Object.hasOwn(dragTarget, "target")) {
        dragTarget.target.classList.add(REPOSITION_TARGET_MARKER);
        return dragTarget.target;
    }

    return null;
}

function clearDragTargetMarkers() {
    document.querySelectorAll(NEST_CLASS).forEach((item) => {
        item.classList.remove(REPOSITION_TARGET_MARKER);
    });
    document.querySelectorAll(SEPARATOR_CLASS).forEach((item) => {
        item.classList.remove(REPOSITION_TARGET_MARKER);
    });
}

function dragStart(event) {
    event.target.classList.add(REPOSITION_ELEMENT_MARKER);
}

function dragOver(event) {
    clearDragTargetMarkers();

    const targetDepthClass = markDragNesting(event.clientX);
    markDragTarget(event.clientY, targetDepthClass);
}

function dragEnd(event) {
    const targetDepthClass = markDragNesting(event.clientX);
    const target = markDragTarget(event.clientY, targetDepthClass);

    if(target !== null) {
        const srcPath = parsePath(event.target);
        const dstPath = parsePath(target);

        const uiMessage = buildUISwapMessage(srcPath, dstPath);
        browser.runtime.sendMessage(uiMessage);
    }

    event.target.classList.remove(REPOSITION_ELEMENT_MARKER);
    clearDragTargetMarkers();
}

/* **************** *
 * REACT COMPONENTS *
 ********************/

function NodeButton({handleClick, href, buttonClassName="nodeButton", filterName="controlMask", tooltipText=""}) {
    const svg = <svg
        onClick={handleClick}
        className={buttonClassName}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="24"
        height="24"
    >
        <image width="100%" height="100%" href={href} filter={`url(#${filterName})`} />
    </svg>

    const tooltip = tooltipText === "" ? svg : <Tooltip text={tooltipText}>{svg}</Tooltip>

    return tooltip
}


function NodeTitle({ children }) {
    // Render main title on root node
    const { bunnyHole: bh } = useBunnyHole();
    if(bh.depth === 0) return <p className="mainTitle">{ children }</p>
    
    // Otherwise render standard title
    return <p className="title">{ children }</p>;
}

function NodeButtonBar() {
    const { bunnyHole: bh } = useBunnyHole();
    if(bh.depth === 0) return <></>;

    // Subscribe to relevant contexts
    const { nodeEditDispatch } = useNodeEdits();
    const { toastDispatch } = useToasts();

    // Declare event handlers
    const editNode = () => {
        nodeEditDispatch({ path: bh.path, title: bh.data.title, url: bh.data.url });
        const modal = document.querySelector(NODE_EDIT_CLASS);
        modal.showModal();
    }

    const deleteNode = () => {
        browser.runtime.sendMessage(
            buildUIDeleteMessage(bh.path)
        );
    }

    const unpromptReposition = () => {
        cancelReposition();
        toastDispatch(TOAST_DEACTIVATE);
    }

    const promptReposition = () => {
        const cancelButton = <ButtonCancel onClick={unpromptReposition}>Cancel</ButtonCancel>;
        const movePrompt = { active: true, prompt: "Move to where?", buttons: [cancelButton] };
        beginReposition(bh.pathClassName);
        toastDispatch(movePrompt);
    }

    // TODO: Standardize user-facing language around "nodes"
    return <div className="buttonBar">
        <NodeButton handleClick={editNode} href={BUTTON_EDIT} tooltipText="Edit" />
        <NodeButton handleClick={promptReposition} href={BUTTON_REPOSITION} tooltipText="Move" />
        <NodeButton handleClick={deleteNode} href={BUTTON_DELETE} filterName={"dangerMask"} tooltipText="Delete" />
    </div>
}

function NodeURL({ href }) {
    // Don't render URL on the root node
    const { bunnyHole: bh } = useBunnyHole();
    if(bh.depth === 0) return <></>;

    // Render URL on all other nodes
    return <a href={href} className="url">{href}</a>;
}

function NodeSeparator({ handleAddClick, handleRepositionClick }) { // TODO Eliminate depthClassNode too
    // Subscribe to context
    const { bunnyHole: bh } = useBunnyHole();

    // Declare refs
    const separatorRef = useRef(null);

    // Precomputation
    const isRoot = bh.depth === 0;

    // Create event handlers
    const handleAdd = () => {
        // Disable the add button while repositioning nodes
        if(separatorRef.current.className.includes(REPOSITION_ACTIVE_MARKER)) return;
        handleAddClick();
    }

    const handleReposition = () => {
        // Deactivate the reposition button while not repositioning nodes
        if(!separatorRef.current.className.includes(REPOSITION_ACTIVE_MARKER)) return;
        handleRepositionClick();
    }

    // Build React component
    return <div onClick={handleReposition} className={`nodeSeparator ${bh.depthClassName} ${bh.pathClassName}`} ref={separatorRef}>
        <NodeButton href={BUTTON_HERE} buttonClassName="repositionButton" />
        <div className={`divider`}></div>
        {/* TODO: Once again standardize user-facing language around "Nodes" */}
        {isRoot ? <></> : <NodeButton href={BUTTON_ADD} handleClick={handleAdd} buttonClassName="addButton" tooltipText="Add Here" />}
        <div className={`divider`}></div>
    </div>
}

function BunnyNode() {
    // Subscribe to relevant contexts
    const { bunnyHole: bh } = useBunnyHole();
    const { toastDispatch } = useToasts();

    // Precomputation
    const isRoot = bh.depth === 0;

    // Declare refs
    const nodeRef = useRef(null);
    const notesRef = useRef(null);

    // Declare event handlers
    const addNode = useCallback(() => {
        const message = buildUIAddMessage(bh.path);
        browser.runtime.sendMessage(message);
    }, [bh]);

    const confirmReposition = useCallback(() => {
        completeReposition(bh.path);
        toastDispatch(TOAST_DEACTIVATE)
    }, [bh]);

    const handleBlur = useCallback((event) => {
        const message = buildUINotesMessage(bh.path, event.target.value);
        browser.runtime.sendMessage(message);
    }, [bh])

    // Build React component
    const node = <div className="bunnyNode">        
        <div className={`body ${bh.pathClassName}`} ref={nodeRef} draggable="true"> 
            <div className="heading">
                <NodeTitle>{ bh.data.title }</NodeTitle>
                <NodeButtonBar />
            </div>
            <NodeURL href={ bh.data.url } />
            <textarea onBlur={handleBlur} className="input" name="Notes" rows="4" cols="40" ref={notesRef} />
            <NodeSeparator
                handleAddClick={addNode}
                handleRepositionClick={confirmReposition}
            />
        </div>
    </div>
    
    // Initialize per-node drag listeners on non-root nodes
    useEffect(() => {
        if(notesRef.current) notesRef.current.value = bh.data.notes;

        if(isRoot || !nodeRef.current) return;
        nodeRef.current.addEventListener("dragstart", dragStart);

        return () => {
            if(!nodeRef.current) return;
            nodeRef.current.removeEventListener("dragstart", dragStart);
        }
    }) // TODO: Dependency on bh?

    return node;
}

function BunnyHole() {
    // Subscribe to context
    const { bunnyHole: bh, bunnyHoleDispatch } = useBunnyHole();
    const { theme } = useTheme();

    // Precomputation
    const isRoot = bh.depth === 0;
    const indent = `${Math.max(bh.depth - 1, 0) * 24}px`;

    // Create event handlers
    const handleMessage = useCallback((message, _sender, _sendResponse) => {        
        if(message.type !== MessageTypes.BH) return;     
        bunnyHoleDispatch(message.content);
    }, []);

    // Define SVG filters for the BunnyHole (added to root node only)
    // TODO: These filters should be using theme colors
    const svgFilters = isRoot ? <svg className="svgFilters" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
            <filter id="dangerMask">
                <feFlood floodColor={theme[ThemeElements.CANCEL_COLOR]} result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
        <defs>
            <filter id="controlMask">
                <feFlood floodColor={theme[ThemeElements.MAIN_COLOR_ALT]} result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
    </svg> : <></>

    // Recursively generate the BunnyHole
    const bunnyHole = <div className="bunnyHole" style={{marginLeft: indent}}>
        {svgFilters}
        <div className={`nestMarker ${bh.depthClassName}`}></div>
        <div className="content">
            <BunnyNode />
            {
                bh.data.children &&
                bh.data.children.map((child, index) => {
                    const childPath = bh.path.concat([index]);
                    const childDepth = childPath.length;
                    const childPathName = buildPathClassName(childPath);
                    const childDepthName = buildDepthClassName(childPath);
                    const childBunnyHole = {
                        data: child,
                        depth: childDepth,
                        depthClassName: childDepthName,
                        path: childPath,
                        pathClassName: childPathName
                    }
                    const value = { bunnyHole: childBunnyHole, bunnyHoleReducer: bunnyHoleReducer };
                    return <BunnyHoleContext value={value}>
                        <BunnyHole key={child.reactKey} />
                    </BunnyHoleContext>
                })
            }
        </div>
    </div>

    // Initialize drag listeners on document when initializing the root node
    useEffect(() => {
        if(!isRoot) return;

        document.addEventListener("dragover", dragOver);
        document.addEventListener("dragend", dragEnd);
        browser.runtime.onMessage.addListener(handleMessage);

        return () => {
            document.removeEventListener("dragover", dragOver);
            document.removeEventListener("dragend", dragEnd);
            browser.runtime.onMessage.removeListener(handleMessage);
        }
    });

    return bunnyHole;
}

export default BunnyHole