
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { EditorProvider } from './providers/Editor.provider';
import { AuthProvider } from './providers/Auth.provider';
import '../static/styles.scss';

function Main() {
  return (
    <GoogleOAuthProvider clientId={process.env.GoogleClientId || ''}>
      <AuthProvider>
        <DataProvider>
          <EditorProvider>
            <Provider store={store.store}>
              <PersistGate loading={null} persistor={store.persistor}>
                <ConnectedApp images={[]} showMap={false} />
              </PersistGate>
            </Provider>
          </EditorProvider>
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
