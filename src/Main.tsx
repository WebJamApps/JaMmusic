
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { AuthProvider } from './providers/Auth.provider';
import '../static/styles.scss';

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

const HotMain = hot(module)(Main);

const renderMain = (): void => {
  render(<HotMain />, document.getElementById('root'));
};

renderMain();
