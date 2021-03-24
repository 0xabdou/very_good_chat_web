import React, {useContext} from "react";
import {badgeActions} from "./badge-slice";

export const BadgeActionsContext = React.createContext(badgeActions);

export const useBadgeActions = () => useContext(BadgeActionsContext);

const BadgeActionsProvider = ({children}: { children: React.ReactNode }) => {
  return (
    <BadgeActionsContext.Provider value={badgeActions}>
      {children}
    </BadgeActionsContext.Provider>
  );
};