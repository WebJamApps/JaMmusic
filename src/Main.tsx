
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import SongsProvider from './providers/Songs.provider';
import GigsProvider from './providers/Gigs.provider';
import '../static/styles.scss';
import { EditorProvider } from './providers/Editor.provider';

const Main = () => {
  return (
    <SongsProvider>
      <EditorProvider>
        <GigsProvider>
          <Provider store={store.store}>
            <PersistGate loading={null} persistor={store.persistor}>
              <ConnectedApp />
            </PersistGate>
          </Provider>
        </GigsProvider>
      </EditorProvider>
    </SongsProvider>);
};

const HotMain = hot(module)(Main);

export const renderMain = (): void => {
  render(<HotMain />, document.getElementById('root'));
};