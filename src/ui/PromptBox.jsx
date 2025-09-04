import React, { createContext, useContext, useReducer } from "react";
import ReactDOM from "react-dom";

import "./promptbox.css";

/* ********* *
 * CONSTANTS *
 *************/

// PROMPTS
const PROMPT_DEACTIVATE = { active: false, prompt: "", buttons: [] };

// ERROR_MESSAGES
const ERROR_CONTEXT = "No context found. PromptBox must be initialized within a PromptProvider JSX element.";

export { PROMPT_DEACTIVATE };

/* *********************** *
 * PROMPT STATE MANAGEMENT *
 ***************************/

const PromptContext = createContext(PROMPT_DEACTIVATE);

/**
 * Reducer for activating and deactivating prompts.
 * The advantage to a reducer is that the text of the prompt box can
 * be maintained as it hides itself, since the text going away
 * when it scrolls offscreen looks visually tacky.
 * 
 * @param { Object } state   The current prompt being displayed. 
 * @param { Object } action  The new prompt to be displayed.
 * @returns 
 */
function promptReducer(state, action) {
    if(!action.active) return { ...state, active: false };
    return action;
}

function PromptProvider({ children }) {
    const [ prompt, promptDispatch ] = useReducer(promptReducer, PROMPT_DEACTIVATE);
    return <PromptContext.Provider value={{prompt, promptDispatch}}> {children} </PromptContext.Provider>
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

function PromptBox() {
    const { prompt } = usePrompts();
    const className = `promptBox ${prompt.active ? "active" : ""}`;

    return <div className={className}>
        {prompt.prompt}
        {
            prompt.buttons &&
            prompt.buttons.map((item) => item)
        }
    </div>
}

export default PromptBox;