import React, { createContext, useContext, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import "./nodeEditBox.css";

import Button, { ButtonType } from "../widgets/Button.jsx";
import Modal from "../widgets/Modal.jsx";

import { buildUIEditMessage } from "../../modules/messages.mjs";

/* ********* *
 * CONSTANTS *
 *************/

// EDIT OBJECT
const EMPTY_EDIT = { path: [], title: "", url: "" };

/* ************************** *
 * NODE EDIT STATE MANAGEMENT *
 ******************************/

const ERROR_CONTEXT = "No context found. NodeEditBox must be initialized within a NodeEditProvider JSX element.";

const NodeEditContext = createContext(EMPTY_EDIT);

function nodeEditReducer(_state, action) {
    return action;
}

function NodeEditProvider({ children }) {
    const [ nodeEdit, nodeEditDispatch ] = useReducer(nodeEditReducer, EMPTY_EDIT);
    return <NodeEditContext.Provider value={{nodeEdit, nodeEditDispatch}}>
        {children}
    </NodeEditContext.Provider>
}

function useNodeEdits() {
    const nodeEditContext = useContext(NodeEditContext);
    if(!nodeEditContext) throw new Error(ERROR_CONTEXT);
    return nodeEditContext;
}

export { NodeEditContext, NodeEditProvider, useNodeEdits };

/* *************** *
 * REACT COMPONENT *
 *******************/

function NodeEditBox() {
    // Declare DOM refs
    const titleRef = useRef(null);
    const urlRef = useRef(null);

    // Subscribe to context
    const { nodeEdit } = useNodeEdits();

    // Declare event handlers
    const handleConfirmClick = () => {
        if(!titleRef.current) return;
        if(!urlRef.current) return;

        const path = nodeEdit.path;
        const title = titleRef.current.value;
        const url = urlRef.current.value;
        const message = buildUIEditMessage(path, title, url);
        browser.runtime.sendMessage(message);
    }

    // Build React component
    const nodeEditForm = <Modal className={"nodeEditModal"}>
        <form className="nodeEditBox" method="dialog">
            <div className="nodeEditRow">
                {/* TODO: Make consistent with user-facing terminology around nodes */}
                <p>Edit Node</p> 
            </div>
            {/* TODO: defaultValue for the button should be reflected every time the dialog opens */}
            <div className="nodeEditRow">
                <p>Title:</p>
                <input type="text" className="editTitle" defaultValue={nodeEdit.title} ref={titleRef} autoFocus />
            </div>
            <div className="nodeEditRow">
                <p>URL:</p>
                <input type="text" className="editURL" defaultValue={nodeEdit.url} ref={urlRef} />
            </div>
            <div className="nodeEditRow">
                {/* Note: Confirm MUST be the first button to automatically respond to an "Enter" press */}
                <Button onClick={handleConfirmClick}>Confirm</Button>
                <Button buttonType={ButtonType.DANGEROUS}>Cancel</Button>
            </div>  
        </form>
    </Modal>

    return nodeEditForm;
}

export default NodeEditBox;