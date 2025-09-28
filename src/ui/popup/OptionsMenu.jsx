import React, { useCallback, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router";
import "./optionsMenu.css";

import Button, { ButtonType } from "../widgets/Button.jsx";
import Toggle from "../widgets/Toggle.jsx";

import { PATH_ROOT } from "../../modules/routing.mjs";
import { THEME_DEFAULT, THEME_DISPLAY_PARAMS, useTheme } from "../themes/Theme.jsx";

/* ********* * 
 * CONSTANTS *
 *************/

const OPTION_URLS = "ignoredUrls";
const OPTION_FREEZE = "toggleFreeze";

/* **************** *
 * REACT COMPONENTS *
 ********************/

function OptionFreeze() {
    return <div className="option">
        <label htmlFor={OPTION_FREEZE}>Freeze On Sidebar Close</label>
        <Toggle name={OPTION_FREEZE} />
    </div>
}

function OptionURLs() {
    // Declare state
    const [urls, setUrls] = useState(["google.com", "bing.com", "duckduckgo.com"]);

    // Declare refs
    const urlInputRef = useRef(null);

    // Declare handlers
    const addUrl = () => {
        if(!urlInputRef.current) return;
        // TODO: Validate URL
        setUrls([urlInputRef.current.value, ...urls]);
    };

    const removeIndex = (targetIndex) => {
        const filteredUrls = urls.filter((_url, index) => {
            return index !== targetIndex;
        })
        setUrls(filteredUrls);
    };

    // Build React component
    return <div className="option">
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
}

function OptionsTheme() {
    // TODO: Also display buttons for preset themes
    // TODO: Display visual examples of changes being made
    // TODO: Send message events to sidebar when we save our work
    const { theme, themeDispatch } = useTheme();

    const previewTheme = useCallback((element, value) => {
        const previewedTheme = { ...theme };
        previewedTheme[element] = value;
        themeDispatch(previewedTheme);
    });

    const saveTheme = useCallback(() => {

    });

    return <table>
        {THEME_DISPLAY_PARAMS.map((themeGroup) => {
        return <>
            {themeGroup.map((element) => {
                const elementID = `themeElement${element.key}`;

                return <tr className="themeElement">
                    <td>
                        <label htmlFor={elementID}>{element.name}</label>
                    </td>
                    {/* TODO Set default value to actual current theme */}
                    <td>
                    <input
                        onInput={(event) => previewTheme(element.key, event.target.value)}
                        type="color"
                        id={elementID}
                        defaultValue={THEME_DEFAULT[element.key]}
                    />
                    </td>
                </tr>
            })}
        </>
        })}
    </table>
}

function OptionsMenu() {
    console.log("Attempting to render OptionsMenu");

    return <div className="optionsMenu">
        <h1>Options</h1>

        <h2 className="optionHeader">Bunny Hole</h2>
        <OptionFreeze />
        <OptionURLs />
        
        <h2 className="optionHeader">Themes</h2>
        <OptionsTheme />
        
        <h2 className="optionHeader">Keyboard Bindings</h2>
        
        <Link to={PATH_ROOT}>
            <Button>Back</Button>
        </Link>
    </div>
}

export default OptionsMenu;