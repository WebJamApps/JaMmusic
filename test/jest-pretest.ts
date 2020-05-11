import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { config } from 'dotenv';

config();
window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));

configure({ adapter: new Adapter() });
document.body.innerHTML = '<div id="root"></div><div id="mAndP"></div>';

window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };
window.location = {
  ...window.location,
  href: '',
  reload: jest.fn(),
  assign: jest.fn(),
};
