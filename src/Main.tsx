
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import { DataProvider } from './providers/Data.provider';
import { EditorProvider } from './providers/Editor.provider';
import '../static/styles.scss';

const Main = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.GoogleClientId || '' }>
    <DataProvider>
      <EditorProvider>
        <Provider store={store.store}>
          <PersistGate loading={null} persistor={store.persistor}>
            <ConnectedApp />
          </PersistGate>
        </Provider>
      </EditorProvider>
    </DataProvider>
    </GoogleOAuthProvider>
  );
};

const HotMain = hot(module)(Main);

const renderMain = (): void => {
  render(<HotMain />, document.getElementById('root'));
};

renderMain();