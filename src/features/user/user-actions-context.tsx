import React, {useContext} from "react";
import {userActions} from "./user-slice";

export const UserActionsContext = React.createContext(userActions);

export const useUserActions = () => useContext(UserActionsContext);

const UserActionsProvider = ({children}: { children: React.ReactNode }) => {
  return (
    <UserActionsContext.Provider value={userActions}>
      {children}
    </UserActionsContext.Provider>
  );
};

export default UserActionsProvider;