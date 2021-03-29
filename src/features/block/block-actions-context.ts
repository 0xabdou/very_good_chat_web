import React, {useContext} from "react";
import {blockActions} from "./block-slice";

export const BlockActionsContext = React.createContext(blockActions);

const useBlockActions = () => useContext(BlockActionsContext);
export default useBlockActions;