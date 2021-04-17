import {useMediaQuery} from "@material-ui/core";

export const useMobileMQ = () => useMediaQuery("(max-width: 650px)");
export const useLargeMQ = () => useMediaQuery("(min-width: 1000px)");
