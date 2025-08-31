/* ************* *
 * MESSAGE TYPES *
 *****************/
export const MessageTypes = Object.freeze({
    BH:          1,
    IO:          2,
    UI:          4
});

export const IOCommands = Object.freeze({
    NEW:      1001,
    SAVE:     1002,
    LOAD:     1003,
    LOAD:     1004,
    COMPLETE: 1005
});

export const UICommands = Object.freeze({
    SWAP_BH_NODES:   2001,
    DELETE_BH_NODE:  2002
});

export function buildBHMessage(bunnyHoleJsObj) {
    return {
        type: MessageTypes.BH,
        content: bunnyHoleJsObj
    }
}

export function buildIOMessage(ioCommand) {
    return {
        type: MessageTypes.IO,
        command: ioCommand
    }
}

export function buildUIDeleteMessage(path) {
    return {
        type: MessageTypes.UI,
        command: UICommands.DELETE_BH_NODE,
        content: {path: path}
    }
}

export function buildUISwapMessage(srcPath, dstPath) {
    const msgContent = {
        srcPath: srcPath,
        dstPath: dstPath
    };

    return {
        type: MessageTypes.UI,
        command: UICommands.SWAP_BH_NODES,
        content: msgContent
    }
}

export function validateMessage(message, targetType) {
    if(!Object.hasOwn(message, "type")) return false;
    if((message.type & targetType) !== 0) return false;
    return true;
}
