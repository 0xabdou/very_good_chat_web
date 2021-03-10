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
import PhotoUtilsProvider from "./utils/photo-utils";
import RootScreen from "./features/auth/ui/root-screen";


const App = () => {
  // Fixes some visual bugs in some mobile browsers
  useDimensionsFix();
  // Hook for dependency injection
  const ready = useDependencies();

  return (
    <>
      {ready &&
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <PhotoUtilsProvider>
            <Provider store={sl.get<AppStore>(TYPES.AppStore)}>
              <RootScreen/>
            </Provider>
          </PhotoUtilsProvider>
        </ThemeProvider>
      </StylesProvider>
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
