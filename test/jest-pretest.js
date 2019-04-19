<<<<<<< HEAD
=======
import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';

Options.relativeToDir = path.join(__dirname, 'react-unit');
>>>>>>> 9c59d0887b1ee5747b88720138011f9c18296049

window.matchMedia = window.matchMedia || function match() {
  return {
    matches: false,
    addListener: function addlistener() {},
    removeListener: function rmlistener() {}
  };
};
