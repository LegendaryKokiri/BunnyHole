import React, { createContext, useContext, useReducer } from "react";
import ReactDOM from "react-dom";

import "./popupbox.css";
import Modal from "./widgets/Modal.jsx";
import Button, { ButtonType } from "./widgets/Button.jsx";

/* ********* *
 * CONSTANTS *
 *************/

// POPUPS
const PopupType = Object.freeze({
    ALERT:   1,
    CONFIRM: 2
});

const EMPTY_POPUP = { type: PopupType.ALERT, text: "", onConfirm: () => {} };

// ERROR MESSAGES
const ERROR_CONTEXT = "No context found. PopupBox must be initialized within a PopupProvider JSX element.";

export { PopupType };

/* ********************** *
 * POPUP STATE MANAGEMENT *
 **************************/

const PopupContext = createContext(EMPTY_POPUP);

// A full-on reducer isn't necessary, but it makes it consistent with our other custom hooks.
function popupReducer(_state, action) {
    return {...action};
}

function PopupProvider({ children }) {
    const [ popup, popupDispatch ] = useReducer(popupReducer, EMPTY_POPUP);
    return <PopupContext.Provider value={{ popup, popupDispatch }}>
        {children}
    </PopupContext.Provider>
}

function usePopups() {
    const popupContext = useContext(PopupContext);
    if(!popupContext) throw new Error(ERROR_CONTEXT);
    return popupContext;
}

export { PopupContext, PopupProvider, usePopups };

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

function PopupButtons() {
    const { popup } = usePopups();

    switch(popup.type) {
        case PopupType.CONFIRM:
            return <ConfirmButtons onConfirm={popup.onConfirm} />;
        case PopupType.ALERT:
        default:
            return <AlertButtons />;
    }
}

function PopupBox() {
    const { popup } = usePopups();

    return <Modal className="popupModal">
        <form className="popupBox" method="dialog">
            {popup.text}
            <div className="options">
                <PopupButtons />
            </div>
        </form>
    </Modal>
}

export default PopupBox;