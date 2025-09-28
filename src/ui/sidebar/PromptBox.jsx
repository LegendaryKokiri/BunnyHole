import React, { createContext, useContext, useReducer } from "react";
import ReactDOM from "react-dom";
import "./promptBox.css";

import Modal from "../widgets/Modal.jsx";
import Button, { ButtonType } from "../widgets/Button.jsx";

/* ********* *
 * CONSTANTS *
 *************/

// PROMPTS
const PromptType = Object.freeze({
    ALERT:   1,
    CONFIRM: 2
});

const EMPTY_PROMPT = { type: PromptType.ALERT, text: "", onConfirm: () => {} };

export { PromptType };

/* ********************** *
 * POPUP STATE MANAGEMENT *
 **************************/

const ERROR_CONTEXT = "No context found. PromptBox must be initialized within a PromptProvider JSX element.";

const PromptContext = createContext(EMPTY_PROMPT);

// A full-on reducer isn't necessary, but it makes it consistent with our other custom hooks.
function promptReducer(_state, action) {
    return {...action};
}

function PromptProvider({ children }) {
    const [ prompt, promptDispatch ] = useReducer(promptReducer, EMPTY_PROMPT);
    return <PromptContext.Provider value={{ prompt, promptDispatch }}>
        {children}
    </PromptContext.Provider>
}

function usePrompts() {
    const promptContext = useContext(PromptContext);
    if(!promptContext) throw new Error(ERROR_CONTEXT);
    return promptContext;
}

export { PromptContext, PromptProvider, usePrompts };

/* *************** *
 * REACT COMPONENT *
 *******************/
function AlertButtons() {
    return <div className="options">
        <Button>OK</Button>
    </div>
}

function ConfirmButtons({ onConfirm }) {
    return <div className="options">
        <Button onClick={onConfirm}>OK</Button>
        <Button buttonType={ButtonType.DANGEROUS}>Cancel</Button>
    </div>
}

function PromptButtons() {
    const { prompt } = usePrompts();

    switch(prompt.type) {
        case PromptType.CONFIRM:
            return <ConfirmButtons onConfirm={prompt.onConfirm} />;
        case PromptType.ALERT:
        default:
            return <AlertButtons />;
    }
}

function PromptBox() {
    const { prompt } = usePrompts();

    return <Modal className="promptModal">
        <form className="promptBox" method="dialog">
            {prompt.text}
            <div className="options">
                <PromptButtons />
            </div>
        </form>
    </Modal>
}

export default PromptBox;