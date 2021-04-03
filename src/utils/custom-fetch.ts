import sl from "../dependencies/service-locator";
import {AppStore} from "../store/store";
import TYPES from "../dependencies/types";
import {authActions} from "../features/auth/auth-slice";

let refreshingPromise: Promise<string> | null;

export const customFetch: WindowOrWorkerGlobalScope['fetch'] = async (uri, options) => {
  const response = await fetch(uri, options);
  const json = await response.json();
  if (json && json.errors) {
    const code = json.errors[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED') {
      if (!refreshingPromise) {
        refreshingPromise = new Promise<string>(async (resolve, reject) => {
          const response = await fetch(
            `${viteEnv.VITE_BACKEND_URL}/auth/refresh_token`,
            {credentials: 'include'}
          );
          const json = await response.json();
          if (response.ok) {
            resolve(json.accessToken);
          } else {
            sl.get<AppStore>(TYPES.AppStore).dispatch(authActions.signOut());
            reject(new Error("Couldn't refresh the token"));
          }
        });
      }
      const accessToken = await refreshingPromise;
      refreshingPromise = null;
      options!.headers = {
        ...options!.headers,
        authorization: `Bearer ${accessToken}`
      };
      return fetch(uri, options);
    }
  }
  response.json = () => new Promise<any>(r => r(json));
  response.text = () => new Promise<string>(r => r(JSON.stringify(json)));
  return response;
};