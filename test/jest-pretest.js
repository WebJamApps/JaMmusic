import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

window.matchMedia = window.matchMedia || function match() {
  return {
    matches: false,
    addListener: function addlistener() {},
    removeListener: function rmlistener() {}
  };
};

configure({ adapter: new Adapter() });
