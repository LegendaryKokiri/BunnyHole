import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { buildUIAddMessage, buildUIDeleteMessage, buildUISwapMessage } from "../modules/messages.mjs";
import "./bunnyhole.css";
import { usePrompts, PROMPT_DEACTIVATE, PROMPT_MOVE } from "./PromptBox.jsx";
import Button, { ButtonCancel } from "./widgets/Button.jsx";
import Tooltip from "./widgets/Tooltip.jsx";
import { useNodeEdits } from "./NodeEditBox.jsx";
import { usePopups } from "./PopupBox.jsx";

/* ********* *
 * CONSTANTS *
 *************/

// FILE I/O
import BUTTON_ADD        from "../../res/buttons/button-add.png";
import BUTTON_HERE       from "../../res/buttons/button-here.png";
import BUTTON_EDIT       from "../../res/buttons/button-edit.png";
import BUTTON_REPOSITION from "../../res/buttons/button-reposition.png";
import BUTTON_DELETE     from "../../res/buttons/button-delete.png";

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

/* ******************** *
 * REPOSITION UTILITIES *
 ************************/

function getClassName(target, startingString) {
    for(const c of target.classList) {
        if(c.startsWith(startingString)) return c;
    }

    return null;
}

function buildNodeDepthClassName(nodePath) {
    return `${NODE_DEPTH_CLASSNAME}${nodePath.length}`;
}

function buildNodePathClassName(nodePath) {
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


function NodeTitle({children, isRoot}) {
    if(isRoot) return <p className="mainTitle">{children}</p>
    return <p className="title">{children}</p>;
}

function NodeButtonBar({isRoot, data, nodePath, nodePathClassName}) {
    if(isRoot) return <></>;

    // Subscribe to relevant contexts
    const { nodeEditDispatch } = useNodeEdits();
    const { promptDispatch } = usePrompts();

    // Declare event handlers
    const editNode = () => {
        nodeEditDispatch({ path: nodePath, title: data.title, url: data.url });
        const modal = document.querySelector(NODE_EDIT_CLASS);
        modal.showModal();
    }

    const deleteNode = () => {
        browser.runtime.sendMessage(
            buildUIDeleteMessage(nodePath)
        );
    }

    const unpromptReposition = () => {
        cancelReposition();
        promptDispatch(PROMPT_DEACTIVATE);
    }

    const promptReposition = () => {
        const cancelButton = <ButtonCancel onClick={unpromptReposition}>Cancel</ButtonCancel>;
        const movePrompt = { active: true, prompt: "Move to where?", buttons: [cancelButton] };
        beginReposition(nodePathClassName);
        promptDispatch(movePrompt);
    }

    // TODO: Standardize user-facing language around "nodes"
    return <div className="buttonBar">
        <NodeButton handleClick={editNode} href={BUTTON_EDIT} tooltipText="Edit" />
        <NodeButton handleClick={promptReposition} href={BUTTON_REPOSITION} tooltipText="Move" />
        <NodeButton handleClick={deleteNode} href={BUTTON_DELETE} filterName={"dangerMask"} tooltipText="Delete" />
    </div>
}

function NodeURL({children, isRoot}) {
    if(isRoot) return <></>
    return <a className="url">{children}</a>;
}

function NodeSeparator({isRoot, handleAddClick, handleRepositionClick, depthClassName, nodePathClassName}) {
    const separatorRef = useRef(null);

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

    return <div onClick={handleReposition} className={`nodeSeparator ${depthClassName} ${nodePathClassName}`} ref={separatorRef}>
        <NodeButton href={BUTTON_HERE} buttonClassName="repositionButton" />
        <div className={`divider`}></div>
        {/* TODO: Once again standardize user-facing language around "Nodes" */}
        {isRoot ? <></> : <NodeButton href={BUTTON_ADD} handleClick={handleAdd} buttonClassName="addButton" tooltipText="Add Here" />}
        <div className={`divider`}></div>
    </div>
}

function BunnyNode({data, nodePath=[]}) {
    // Precomputation
    const depth = nodePath.length;
    const isRoot = depth === 0;
    const depthClassName = buildNodeDepthClassName(nodePath);
    const nodeRef = useRef(null);
    const nodePathClassName = buildNodePathClassName(nodePath);

    // Subscribe to relevant contexts
    const { promptDispatch } = usePrompts();

    // Declare event handlers
    const addNode = () => {
        const message = buildUIAddMessage(nodePath);
        browser.runtime.sendMessage(message);
    }

    const confirmReposition = () => {
        completeReposition(nodePath);
        promptDispatch(PROMPT_DEACTIVATE)
    }

    // Build React component
    const node = <div className="bunnyNode">        
        <div className={`body ${nodePathClassName}`} ref={nodeRef} draggable="true"> 
            <div className="heading">
                <NodeTitle isRoot={isRoot}>{data.title}</NodeTitle>
                <NodeButtonBar isRoot={isRoot} data={data} nodePath={nodePath} nodePathClassName={nodePathClassName} />
            </div>
            <NodeURL isRoot={isRoot}>{data.url}</NodeURL>
            <textarea className="input" name="Notes" rows="4" cols="88"></textarea>
            <NodeSeparator
                isRoot={isRoot}
                handleAddClick={addNode}
                handleRepositionClick={confirmReposition}
                depthClassName={depthClassName}
                nodePathClassName={nodePathClassName}
            />
        </div>
    </div>
    
    // Initialize per-node drag listeners on non-root nodes
    useEffect(() => {
        if(isRoot || !nodeRef.current) return;
        nodeRef.current.addEventListener("dragstart", dragStart);

        return () => {
            if(!nodeRef.current) return;
            nodeRef.current.removeEventListener("dragstart", dragStart);
        }
    })

    return node;
}

// TODO: nodePath should really be moved into context
function BunnyHole({data, nodePath=[]}) {
    // Precomputation
    const depth = nodePath.length;
    const isRoot = depth === 0;
    const indent = `${Math.max(depth - 1, 0) * 24}px`;
    const depthClassName = buildNodeDepthClassName(nodePath);

    // Define SVG filters for the BunnyHole
    const svgFilters = isRoot ? <svg className="svgFilters" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
            <filter id="dangerMask">
                <feFlood floodColor="#ff0000" result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
        <defs>
            <filter id="controlMask">
                <feFlood floodColor="#00630dff" result="flood" />
                <feComposite in="flood" in2="SourceAlpha" operator="atop" />
            </filter>
        </defs>
    </svg> : <></>

    // Recursively generate the BunnyHole
    // TODO: Seems like the full hole is re-rendered each time. Is there a way to prevent that with React?
    const bunnyHole = <div className="bunnyHole" style={{marginLeft: indent}}>
        {svgFilters}
        <div className={`nestMarker ${depthClassName}`}></div>
        <div className="content">
            <BunnyNode data={data} nodePath={nodePath} />
            {
                data.children &&
                data.children.map((child, index) => {
                    return <BunnyHole key={child.reactKey}
                        data={child}
                        nodePath={nodePath.concat([index])}
                    />
                })
            }
        </div>
    </div>

    // Initialize drag listeners on document when initializing the root node
    useEffect(() => {
        if(!isRoot) return;

        document.addEventListener("dragover", dragOver);
        document.addEventListener("dragend", dragEnd);

        return () => {
            document.removeEventListener("dragover", dragOver);
            document.removeEventListener("dragend", dragEnd);
        }
    });

    return bunnyHole;
}

export default BunnyHole