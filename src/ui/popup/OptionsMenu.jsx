import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router";
import "./optionsMenu.css";

import Button, { ButtonType } from "../widgets/Button.jsx";
import Toggle from "../widgets/Toggle.jsx";

import { PATH_ROOT } from "../../modules/routing.mjs";
import { THEME_DISPLAY_PARAMS, THEMES_BY_NAME, useTheme } from "../themes/Theme.jsx";
import { StorageKeys } from "../../modules/storage.mjs";
import { buildOptionMessage, OptionCommands } from "../../modules/messages.mjs";
import { DEFAULT_IGNORED_URLS } from "../../background_scripts/web_tracker.mjs";
import { isUndefined } from "../../modules/utils.mjs";

/* ********* * 
 * CONSTANTS *
 *************/

const OPTION_URLS = "ignoredUrls";
const OPTION_FREEZE = "toggleFreeze";

/* ***************** *
 * UTILITY FUNCTIONS *
 *********************/

function reportOption(option) {
    const message = buildOptionMessage(option);
    browser.runtime.sendMessage(message);
}

/* **************** *
 * REACT COMPONENTS *
 ********************/

function OptionFreeze() {
    // Declare refs
    const toggleRef = useRef(null);

    // Declare event handlers
    const onChange = useCallback((event) => {
        // TODO Spamming this button would cause race conditions.
        // We should modify the options page to save our changes at the very end.
        browser.storage.local.set({
            [StorageKeys.OPTION_FREEZE]: event.target.checked
        }).then(() => reportOption(StorageKeys.OPTION_FREEZE));
    })

    const freezeMenu = <div className="option">
        <label htmlFor={OPTION_FREEZE}>Freeze On Sidebar Close</label>
        <Toggle onChange={onChange} name={OPTION_FREEZE} ref={toggleRef} />
    </div>

    useEffect(() => {
        const freeze = StorageKeys.OPTION_FREEZE;
        browser.storage.local.get(freeze).then(
            (results) => {
                if(isUndefined(results[freeze])) return;
                if(!toggleRef.current) return;
                toggleRef.current.checked = results[freeze];
            }
        );
    }, [])

    return freezeMenu;
}

function OptionURLs() {
    // Declare state
    const [urls, setUrls] = useState(DEFAULT_IGNORED_URLS);

    // Declare refs
    const urlInputRef = useRef(null);

    // Declare handlers
    const updateUrlOption = useCallback((newUrls) => {
        setUrls(newUrls);
        browser.storage.local.set({
            [StorageKeys.OPTION_IGNORED]: newUrls
        }).then(() => reportOption(StorageKeys.OPTION_IGNORED));
    });

    const addUrl = () => {
        if(!urlInputRef.current) return;
        // TODO: Validate URL
        const newUrls = [urlInputRef.current.value, ...urls]; 
        updateUrlOption(newUrls);
    };

    const removeIndex = (targetIndex) => {
        const filteredUrls = urls.filter((_url, index) => {
            return index !== targetIndex;
        })
        updateUrlOption(filteredUrls);
    };

    // Build React component
    const urlMenu = <div className="option">
        <table className="ignoredURLs">
            <tr>
                <th colspan="2">Ignored URLs</th>
            </tr>
            <tr>
                <td>
                    <input className="ignoredUrlInput" ref={urlInputRef}/>
                </td>
                <td>
                    <Button onClick={addUrl}>Add URL</Button>
                </td>
            </tr>
            {
                urls && urls.map((url, index) => {
                    return <tr>
                        <td>
                            <p>{url}</p>
                        </td>
                        <td>
                            <Button
                                onClick={() => removeIndex(index)}
                                buttonType={ButtonType.DANGEROUS}
                            >
                                X
                            </Button>
                        </td>
                    </tr>
                })
            }
        </table>
    </div>

    // Initialize all displayed option settings from cookies on first render
    useEffect(() => {
        const ignored = StorageKeys.OPTION_IGNORED;
        browser.storage.local.get(ignored).then(
            (results) => {
                if(isUndefined(results[ignored])) return;
                setUrls(results[ignored]);
            }
        );
    }, []);

    return urlMenu;
}

function ThemeSelector({ themeEntry }) {
    // Precomputation
    const [name, theme] = themeEntry;
    const themeID = `themeSelect${name}`;

    // Subscribe to relevant contexts
    const { themeDispatch } = useTheme();

    // Declare event handlers
    // TODO Separate the displaying of the theme from the saving of changes. Ooh ooh and make it transition too (stretch goal)
    const handleChange = useCallback((event) => {
        // TODO Spamming this button would cause race conditions.
        // We should modify the options page to save our changes at the very end.
        if(!event.target.checked) return;
        browser.storage.local.set({
            [StorageKeys.OPTION_THEME]: name
        }).then(() => {
            reportOption(OptionCommands.THEME);
            themeDispatch(theme);
        });
    })

    return <>
        {/* TODO: Set and save theme selection */}
        <input onChange={handleChange} type="radio" name="theme" value={name} id={themeID} />
        <label className="themeSelect" htmlFor={themeID}>
            <p className="themeName">{name}</p>
            <div className="colorBar">
                {THEME_DISPLAY_PARAMS.flat().map((element) => {
                    return <div
                        className="color"
                        style={{backgroundColor: `${theme[element.key]}`}}
                    />
                })}
            </div>
        </label>
    </>
}

function OptionTheme() {
    // TODO: Also display buttons for preset themes
    // TODO: Display widgets to give visual preview as changes are being made
    // TODO: Send message events when we save our theme edits
    const { theme, themeDispatch } = useTheme();

    const previewTheme = useCallback((element, value) => {
        const previewedTheme = { ...theme };
        previewedTheme[element] = value;
        themeDispatch(previewedTheme);
    });

    const saveTheme = useCallback(() => {

    });

    return <div className="themeDisplay">
        {Object.entries(THEMES_BY_NAME).map((entry) => {
            return <ThemeSelector themeEntry={entry}/>
        })}
    </div>
}

function OptionsMenu() {
    return <div className="optionsMenu">
        <h1>Options</h1>

        <div className="optionsGroup">
            <h2 className="optionHeader">Bunny Hole</h2>
            <OptionFreeze />
            <OptionURLs />
        </div>

        <div className="optionsGroup">
            <h2 className="optionHeader">Themes</h2>
            <OptionTheme />
        </div>
        
        <h2 className="optionHeader">Keyboard Bindings</h2>
        
        <Link to={PATH_ROOT} viewTransition>
            <Button>Back</Button>
        </Link>
    </div>
}

export default OptionsMenu;