import { createContext, useContext } from "react";

/* **************** *
 * PROMPT CONSTANTS *
 ********************/
export const PROMPT_DEACTIVATE = { active: false, prompt: "" };
export const PROMPT_MOVE = { active: true, prompt: "Move to where?" };

/* ************** *
 * EXPORT CONTEXT *
 ******************/
const PromptContext = createContext(PROMPT_DEACTIVATE);
export default PromptContext;