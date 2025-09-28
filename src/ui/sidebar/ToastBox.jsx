import React, { createContext, useContext, useReducer } from "react";
import ReactDOM from "react-dom";
import "./toastBox.css";

/* ********* *
 * CONSTANTS *
 *************/

// PROMPTS
const TOAST_DEACTIVATE = { active: false, prompt: "", buttons: [] };

export { TOAST_DEACTIVATE };

/* ********************** *
 * TOAST STATE MANAGEMENT *
 **************************/

const ERROR_CONTEXT = "No context found. ToastBox must be initialized within a ToastProvider JSX element.";

const ToastContext = createContext(TOAST_DEACTIVATE);

/**
 * Reducer for activating and deactivating toasts.
 * The advantage to a reducer is that the text of the toast box can
 * be maintained as it hides itself, since the text going away
 * when it scrolls offscreen looks visually tacky.
 * 
 * @param { Object } state   The current prompt being displayed. 
 * @param { Object } action  The new prompt to be displayed.
 * @returns 
 */
function toastReducer(state, action) {
    if(!action.active) return { ...state, active: false };
    return action;
}

function ToastProvider({ children }) {
    const [ toast, toastDispatch ] = useReducer(toastReducer, TOAST_DEACTIVATE);
    return <ToastContext.Provider value={{ toast, toastDispatch }}> {children} </ToastContext.Provider>
}

function useToasts() {
    const toastContext = useContext(ToastContext);
    if(!toastContext) throw new Error(ERROR_CONTEXT);
    return toastContext;
}

export { ToastContext , ToastProvider, useToasts };

/* *************** *
 * REACT COMPONENT *
 *******************/

function ToastBox() {
    const { toast } = useToasts();
    const className = `toastBox ${toast.active ? "active" : ""}`;

    return <div className={className}>
        {toast.prompt}
        {
            toast.buttons &&
            toast.buttons.map((item) => item)
        }
    </div>
}

export default ToastBox;