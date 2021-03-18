import {friendProfileActions} from "./friend-profile-slice";
import React, {useContext} from "react";

export const FriendProfileActionsContext =
  React.createContext(friendProfileActions);

export const useFriendActions = () => useContext(FriendProfileActionsContext);

const FriendProfileActionsProvider =
  ({children}: { children: React.ReactNode }) => {
    return (
      <FriendProfileActionsContext.Provider value={friendProfileActions}>
        {children}
      </FriendProfileActionsContext.Provider>
    );
  };

export default FriendProfileActionsProvider;