import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

window.matchMedia = window.matchMedia || function match() {
  return {
    matches: false,
    addListener: function addlistener() {},
    removeListener: function rmlistener() {},
  };
};

configure({ adapter: new Adapter() });
document.body.innerHTML = '<div id="root"></div><div id="mAndP"></div>';

window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.addTextTrack = () => { /* do nothing */ };
window.location = {
  href: '',
  reload: jest.fn(),
  search: {
    get: () => '?oneplayer=true&id=28ru9weis2309urihw9098ewuis',
    set: (data) => data,
  },
};
