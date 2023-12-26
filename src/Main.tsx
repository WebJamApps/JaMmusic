
import { StrictMode } from 'react';
import {
  ApolloClient, InMemoryCache, ApolloProvider,
} from '@apollo/client';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import { App } from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { AuthProvider } from './providers/Auth.provider';
import '../static/styles.scss';

export const client = new ApolloClient({
  uri: `${process.env.BackendUrl}/graphql`, // TODO use same backendurl here
  cache: new InMemoryCache(),
});

const root = createRoot(document.getElementById('root') as HTMLElement);
function Main() {
  return (
    <GoogleOAuthProvider clientId={process.env.GoogleClientId || ''}>
      <AuthProvider>
        <DataProvider>
          <Provider store={store.store}>
            <PersistGate loading={null} persistor={store.persistor}>
              <ApolloProvider client={client}>
                <App />
              </ApolloProvider>
            </PersistGate>
          </Provider>
        </DataProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const renderMain = (): void => {
  root.render(<StrictMode><Main /></StrictMode>);
};

renderMain();
