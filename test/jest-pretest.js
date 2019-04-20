<<<<<<< HEAD
import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';

Options.relativeToDir = path.join(__dirname, 'react-unit');
=======
>>>>>>> 41fe18346aca9ca41f4fa0768946e63244c2058b

window.matchMedia = window.matchMedia || function match() {
  return {
    matches: false,
    addListener: function addlistener() {},
    removeListener: function rmlistener() {}
  };
};
