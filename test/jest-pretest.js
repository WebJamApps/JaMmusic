
import * as path from 'path';

Options.relativeToDir = path.join(__dirname, 'react-unit');

window.matchMedia = window.matchMedia || function match() {
  return {
    matches: false,
    addListener: function addlistener() {},
    removeListener: function rmlistener() {}
  };
};

globalize();
