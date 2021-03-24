import React, {useContext} from "react";
import {notificationActions} from "./notification-slice";

export const NotificationActionsContext = React.createContext(notificationActions);

export const useNotificationActions = () => useContext(NotificationActionsContext);