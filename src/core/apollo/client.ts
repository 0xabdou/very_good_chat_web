import TYPES from "../../dependencies/types";
import {ApolloClient, ApolloLink, InMemoryCache} from "@apollo/client";
import {AppStore} from "../redux/store";
import {createUploadLink} from "apollo-upload-client";
import {customFetch} from "./custom-fetch";
import {WebSocketLink} from "@apollo/client/link/ws";
import {getMainDefinition} from "@apollo/client/utilities";
import {onError} from "@apollo/client/link/error";
import sl from "../../dependencies/service-locator";

const authLink = new ApolloLink((operation, forward) => {
  const token = sl.get<AppStore>(TYPES.AppStore).getState().auth.accessToken;
  operation.setContext({
    headers: {authorization: token ? `Bearer ${token}` : '',}
  });
  return forward(operation);
});

const uploadLink = createUploadLink({
  uri: `${processEnv.VITE_SERVER_URL_HTTP}/graphql`,
  credentials: 'include',
  fetch: customFetch,
});

const httpLink = ApolloLink.from([authLink, uploadLink]);

const wsLink = new WebSocketLink({
  uri: `${processEnv.VITE_SERVER_URL_WS}`,
  options: {
    reconnect: true,
    connectionParams: () => ({
      accessToken: sl.get<AppStore>(TYPES.AppStore).getState().auth.accessToken,
    })
  }
});

const operationsLink = ApolloLink.split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const errorLink = onError(({graphQLErrors, networkError}) => {
  if (graphQLErrors) {
    console.log('graphQLErrors', JSON.stringify(graphQLErrors));
  }
  if (networkError) {
    console.log('networkError', JSON.stringify(networkError));
  }
});

const apolloLink = ApolloLink.from([errorLink, operationsLink]);

const apolloClient = new ApolloClient({
  link: apolloLink,
  cache: new InMemoryCache({}),
  connectToDevTools: import.meta.env.DEV,
});

export default apolloClient;