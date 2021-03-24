import React, {useContext} from "react";
import {searchActions} from "./search-slice";

export const SearchActionsContext = React.createContext(searchActions);
export const useSearchActions = () => useContext(SearchActionsContext);

const SearchActionsProvider = ({children}: { children: React.ReactNode }) => {
  return (
    <SearchActionsContext.Provider value={searchActions}>
      {children}
    </SearchActionsContext.Provider>
  );
};

export default SearchActionsProvider;