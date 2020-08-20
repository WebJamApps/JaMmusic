import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import ConnectedApp from './App/index';
import store from './redux/store/index';
import TourTableProvider from './providers/TourTable.provider';
import SongsProvider from './providers/Songs.provider';

import '../static/styles.scss';

render(
  <SongsProvider>
    <TourTableProvider>
      <Provider store={store.store}>
        <PersistGate loading={null} persistor={store.persistor}>
          <ConnectedApp />
        </PersistGate>
      </Provider>
    </TourTableProvider>
  </SongsProvider>, document.getElementById('root'),
);

/* istanbul ignore next */
if (process.env.NODE_ENV === 'development' && module.hot) module.hot.accept();
