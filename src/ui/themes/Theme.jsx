import React, { createContext, useContext, useEffect, useReducer } from "react";
import { StorageKeys } from "../../modules/storage.mjs";

/* ********* *
 * CONSTANTS *
 *************/

export const ThemeElements = Object.freeze({
    BACKGROUND_COLOR:   "--background-color",
    MAIN_COLOR:         "--main-color",
    MAIN_COLOR_ALT:     "--main-color-alt",
    MAIN_COLOR_TEXT:    "--main-color-text",
    ACCENT_COLOR:       "--accent-color",
    ACCENT_COLOR_TEXT:  "--accent-color-text",
    CANCEL_COLOR:       "--cancel-color",
    CANCEL_COLOR_ALT:   "--cancel-color-alt",
    CANCEL_COLOR_TEXT:  "--cancel-color-text",
    INPUT_COLOR:        "--input-color",
    INPUT_COLOR_TEXT:   "--input-color-text",
    TOOLTIP_COLOR:      "--tooltip-color",
    TOOLTIP_COLOR_TEXT: "--tooltip-color-text"
});

/* ************* *
 * PRESET THEMES *
 *****************/

// TODO: Dynamically set text colors and alt colors
// TODO: Dynamically set SVG colors and apply them to filters
// User should control background color, main color, accent color, cancel color, input color, and tooltip color

export const THEME_DEFAULT = {
    [ThemeElements.BACKGROUND_COLOR]:   "#e0e0e0",
    [ThemeElements.MAIN_COLOR]:         "#7fffd4",
    [ThemeElements.MAIN_COLOR_ALT]:     "#00694f",
    [ThemeElements.MAIN_COLOR_TEXT]:    "#222222",
    [ThemeElements.ACCENT_COLOR]:       "#c8ffed",
    [ThemeElements.ACCENT_COLOR_TEXT]:  "#222222",
    [ThemeElements.CANCEL_COLOR]:       "#9e1818",
    [ThemeElements.CANCEL_COLOR_ALT]:   "#f16f6f",
    [ThemeElements.CANCEL_COLOR_TEXT]:  "#dddddd",
    [ThemeElements.INPUT_COLOR]:        "#fff5b7",
    [ThemeElements.INPUT_COLOR_TEXT]:   "#222222",
    [ThemeElements.TOOLTIP_COLOR]:      "#000000",
    [ThemeElements.TOOLTIP_COLOR_TEXT]: "#dddddd"
};

export const THEME_DARK = {
    [ThemeElements.BACKGROUND_COLOR]:   "#202020",
    [ThemeElements.MAIN_COLOR]:         "#b62d2d",
    [ThemeElements.MAIN_COLOR_ALT]:     "#9a5151",
    [ThemeElements.MAIN_COLOR_TEXT]:    "#dddddd",
    [ThemeElements.ACCENT_COLOR]:       "#735e24",
    [ThemeElements.ACCENT_COLOR_TEXT]:  "#dddddd",
    [ThemeElements.CANCEL_COLOR]:       "#b67432",
    [ThemeElements.CANCEL_COLOR_ALT]:   "#84572a",
    [ThemeElements.CANCEL_COLOR_TEXT]:  "#dddddd",
    [ThemeElements.INPUT_COLOR]:        "#4c4c4c",
    [ThemeElements.INPUT_COLOR_TEXT]:   "#dddddd",
    [ThemeElements.TOOLTIP_COLOR]:      "#777777",
    [ThemeElements.TOOLTIP_COLOR_TEXT]: "#dddddd"
};

export const THEME_DISPLAY_PARAMS = [
    [
        {name: "Background Color", key: ThemeElements.BACKGROUND_COLOR},
    ],
    [
        {name: "Main Color", key: ThemeElements.MAIN_COLOR},
        {name: "Main Color (Alternate)", key: ThemeElements.MAIN_COLOR_ALT},
        {name: "Main Text Color", key: ThemeElements.MAIN_COLOR_TEXT}
    ],
    [
        {name: "Accent Color", key: ThemeElements.ACCENT_COLOR},
        {name: "Accent Text Color", key: ThemeElements.ACCENT_COLOR_TEXT}
    ],
    [
        {name: "Cancel Color", key: ThemeElements.CANCEL_COLOR},
        {name: "Cancel Color (Alternate)", key: ThemeElements.CANCEL_COLOR_ALT},
        {name: "Cancel Text Color", key: ThemeElements.CANCEL_COLOR_TEXT}
    ],
    [
        {name: "Input Color", key: ThemeElements.INPUT_COLOR},
        {name: "Input Text Color", key: ThemeElements.INPUT_COLOR_TEXT}
    ],
    [
        {name: "Tooltip Color", key: ThemeElements.TOOLTIP_COLOR},
        {name: "Tooltip Text Color", key: ThemeElements.TOOLTIP_COLOR_TEXT}
    ]
];

export const THEMES_BY_NAME = {
    "Light Mode": THEME_DEFAULT,
    "Dark Mode": THEME_DARK
}

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
    document.body.style.setProperty(
        "background-color", action[ThemeElements.BACKGROUND_COLOR]
    );

    // Set scrollbar color according to theme
    // TODO Other --webkit and whatnot analogues to scrollbar-color?
    // TODO Can we set scrollbar buttons?
    document.documentElement.style.setProperty(
        "scrollbar-color", `${action[ThemeElements.ACCENT_COLOR]} ${action[ThemeElements.MAIN_COLOR_ALT]}`
    );

    document.documentElement.style.setProperty("--font-family-1", "Helvetica");
    document.documentElement.style.setProperty("--font-family-2", "Trebuchet MS");
    document.documentElement.style.setProperty("--font-family-3", "sans-serif");


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
    const { themeDispatch } = useTheme();

    // This component does not render anything in itself
    const element = <>{ children }</>

    // Apply saved theme on initial render
    useEffect(() => {
        const key = StorageKeys.OPTION_THEME;
        browser.storage.local.get(key).then(
            (results) => {
                if(!(key in results)) themeDispatch(THEME_DEFAULT);
                else themeDispatch(THEMES_BY_NAME[results[key]]);
            }
        );
    }, [])

    return element;
}

export default Theme;