import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';

import App from '.';
import store from './store';

import '../static/styles.css';

render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production') module.hot.accept();
