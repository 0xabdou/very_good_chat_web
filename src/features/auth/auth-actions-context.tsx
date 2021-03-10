import React, {useContext} from "react";
import {authActions} from "./auth-slice";

export const AuthActionsContext = React.createContext(authActions);

export const useAuthActions = () => useContext(AuthActionsContext);

const AuthActionsProvider = ({children}: { children: React.ReactNode }) => {
  return (
    <AuthActionsContext.Provider value={authActions}>
      {children}
    </AuthActionsContext.Provider>
  );
};

export default AuthActionsProvider;
