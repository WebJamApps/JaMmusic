import './polyfills';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import { App } from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { AuthProvider } from './providers/Auth.provider';
import { ThemeProvider } from './providers/Theme.provider';
import { MuiThemeProvider } from './providers/MuiThemeProvider';
import './styles/styles.scss';

const root = createRoot(document.getElementById('root') as HTMLElement);
function Main() {
  return (
    <GoogleOAuthProvider clientId={process.env.GoogleClientId || ''}>
      <ThemeProvider>
        <MuiThemeProvider>
          <AuthProvider>
            <DataProvider>
              <Provider store={store.store}>
                <PersistGate loading={null} persistor={store.persistor}>
                  <App />
                </PersistGate>
              </Provider>
            </DataProvider>
          </AuthProvider>
        </MuiThemeProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

const renderMain = (): void => {
  root.render(<StrictMode><Main /></StrictMode>);
};

renderMain();
