import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';

import App from './src';
import store from './src/store';


render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
