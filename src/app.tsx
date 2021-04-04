import React from "react";
import './styles/globals.scss';
import useDimensionsFix from "./utils/mobile/useDimensionsFix";
import {Provider} from 'react-redux';
import sl from "./dependencies/service-locator";
import {AppStore} from "./store/store";
import TYPES from "./dependencies/types";
import useDependencies from "./dependencies/use-dependencies";
import {StylesProvider, ThemeProvider} from "@material-ui/styles";
import {unstable_createMuiStrictModeTheme as createMuiTheme} from "@material-ui/core";
import FileUtilsProvider from "./utils/file-utils";
import RootScreen from "./features/auth/ui/root-screen";
import {BrowserRouter} from "react-router-dom";


const App = () => {
  // Fixes some visual bugs in some mobile browsers
  useDimensionsFix();
  // Hook for dependency injection
  const ready = useDependencies();

  return (
    <>
      {ready &&
      <BrowserRouter>
        <StylesProvider injectFirst>
          <ThemeProvider theme={theme}>
            <FileUtilsProvider>
              <Provider store={sl.get<AppStore>(TYPES.AppStore)}>
                <RootScreen/>
              </Provider>
            </FileUtilsProvider>
          </ThemeProvider>
        </StylesProvider>
      </BrowserRouter>
      }
      {!ready && <div role='splash'/>}
    </>
  );
};

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#212121'
    }
  }
});

export default App;
