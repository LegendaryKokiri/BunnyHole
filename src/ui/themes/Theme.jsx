import React, { createContext, useContext, useEffect, useReducer } from "react";

/* ********* *
 * CONSTANTS *
 *************/

const BACKGROUND_COLOR    = "--background-color";
const MAIN_COLOR          = "--main-color";
const MAIN_COLOR_ALT      = "--main-color-alt";
const MAIN_COLOR_TEXT     = "--main-color-text";
const ACCENT_COLOR        = "--accent-color";
const ACCENT_COLOR_TEXT   = "--accent-color-text"
const CANCEL_COLOR        = "--cancel-color";
const CANCEL_COLOR_ALT    = "--cancel-color-alt";
const CANCEL_COLOR_TEXT   = "--cancel-color-text";
const INPUT_COLOR         = "--input-color";
const INPUT_COLOR_TEXT    = "--input-color-text";
const TOOLTIP_COLOR       = "--tooltip-color";
const TOOLTIP_COLOR_TEXT  = "--tooltip-color-text";

/* ************* *
 * PRESET THEMES *
 *****************/

// TODO: Dynamically set text colors and alt colors
// TODO: Dynamically set SVG colors and apply them to filters
// User should control background color, main color, accent color, cancel color, input color, and tooltip color

export const THEME_DEFAULT = {
    [BACKGROUND_COLOR]:   "#e0e0e0",
    [MAIN_COLOR]:         "#7fffd4",
    [MAIN_COLOR_ALT]:     "#00694f",
    [MAIN_COLOR_TEXT]:    "#222222",
    [ACCENT_COLOR]:       "#c8ffed",
    [ACCENT_COLOR_TEXT]:  "#222222",
    [CANCEL_COLOR]:       "#9e1818",
    [CANCEL_COLOR_ALT]:   "#f16f6f",
    [CANCEL_COLOR_TEXT]:  "#dddddd",
    [INPUT_COLOR]:        "#fff5b7",
    [INPUT_COLOR_TEXT]:   "#222222",
    [TOOLTIP_COLOR]:      "#000000",
    [TOOLTIP_COLOR_TEXT]: "#dddddd"
};

export const THEME_DARK = {
    [BACKGROUND_COLOR]:   "#202020",
    [MAIN_COLOR]:         "#b62d2d",
    [MAIN_COLOR_ALT]:     "#9a5151",
    [MAIN_COLOR_TEXT]:    "#dddddd",
    [ACCENT_COLOR]:       "#735e24",
    [ACCENT_COLOR_TEXT]:  "#dddddd",
    [CANCEL_COLOR]:       "#b67432",
    [CANCEL_COLOR_ALT]:   "#84572a",
    [CANCEL_COLOR_TEXT]:  "#dddddd",
    [INPUT_COLOR]:        "#4c4c4c",
    [INPUT_COLOR_TEXT]:   "#dddddd",
    [TOOLTIP_COLOR]:      "#777777",
    [TOOLTIP_COLOR_TEXT]: "#dddddd"
};

export const THEME_DISPLAY_PARAMS = [
    [
        {name: "Background Color", key: BACKGROUND_COLOR},
    ],
    [
        {name: "Main Color", key: MAIN_COLOR},
        {name: "Main Color (Alternate)", key: MAIN_COLOR_ALT},
        {name: "Main Text Color", key: MAIN_COLOR_TEXT}
    ],
    [
        {name: "Accent Color", key: ACCENT_COLOR},
        {name: "Accent Text Color", key: ACCENT_COLOR_TEXT}
    ],
    [
        {name: "Cancel Color", key: CANCEL_COLOR},
        {name: "Cancel Color (Alternate)", key: CANCEL_COLOR_ALT},
        {name: "Cancel Text Color", key: CANCEL_COLOR_TEXT}
    ],
    [
        {name: "Input Color", key: INPUT_COLOR},
        {name: "Input Text Color", key: INPUT_COLOR_TEXT}
    ],
    [
        {name: "Tooltip Color", key: TOOLTIP_COLOR},
        {name: "Tooltip Text Color", key: TOOLTIP_COLOR_TEXT}
    ]
];

/* ********************** *
 * THEME STATE MANAGEMENT *
 **************************/

const ERROR_CONTEXT = "No context found. Theme must be initialized within a ThemeProvider JSX element.";

const ThemeContext = createContext(THEME_DEFAULT);

function themeReducer(_state, action) {
    // Extract theme variables
    for(const [key, value] of Object.entries(action)) {
        document.documentElement.style.setProperty(key, value);
    }

    // Set background color of full window according to theme
    if(Object.hasOwn(action, BACKGROUND_COLOR)) {
        document.body.style.setProperty(
            "background-color", action[BACKGROUND_COLOR]
        );
    }

    return action;
}

function ThemeProvider({ children }) {
    const [ theme, themeDispatch ] = useReducer(themeReducer, THEME_DEFAULT);
    return <ThemeContext.Provider value={{theme, themeDispatch}}>
        {children}
    </ThemeContext.Provider>
}

function useTheme() {
    const themeContext = useContext(ThemeContext);
    if(!themeContext) throw new Error(ERROR_CONTEXT);
    return themeContext;
}

export { ThemeContext, ThemeProvider, useTheme };

/* **************** *
 * REACT COMPONENTS *
 ********************/
function Theme({ children }) {
    // Subscribe to relevant contexts
    const { theme, themeDispatch } = useTheme();

    // Apply theme on render
    // TODO: Read saved theme from stored options
    themeDispatch(theme);

    // This component does not render anything in itself
    return <>{ children }</>
}

export default Theme;