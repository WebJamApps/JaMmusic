
import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { AuthProvider } from './providers/Auth.provider';
import '../static/styles.scss';

const root = createRoot(document.getElementById('root') as HTMLElement);
function Main() {
  return (
    <GoogleOAuthProvider clientId={process.env.GoogleClientId || ''}>
      <AuthProvider>
        <DataProvider>
          <Provider store={store.store}>
            <PersistGate loading={null} persistor={store.persistor}>
              <ConnectedApp showMap={false} />
            </PersistGate>
          </Provider>
        </DataProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const renderMain = (): void => {
  root.render(<React.StrictMode><Main /></React.StrictMode>);
};

renderMain();
