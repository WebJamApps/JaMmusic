/* eslint-disable @typescript-eslint/no-explicit-any */

import { shallow } from 'enzyme';
import env from 'dotenv';
import { App } from 'src/App';

env.config();
describe('App component', () => {
  const dp = (fun: any) => fun;
  const wrapper = shallow<App>(<App dispatch={dp} />);
  it('renders the component', () => {
    expect(wrapper.find('div#App').exists()).toBe(true);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('does not fetch the images or songs if they already exist', () => {
    const images: any[] = [{}];
    const wrapper2 = shallow(<App dispatch={dp} images={images} />);
    expect(wrapper2.find('div#App').exists()).toBe(true);
  });
  it('renders when dispatch is not defined', () => {
    const wrapper2 = shallow(<App />);
    expect(wrapper2).toBeDefined();
  });
  it('renders correctly when APP_NAME is missing', () => {
    delete process.env.APP_NAME;
    const wrapper2 = shallow(<App />);
    expect(wrapper2).toBeDefined();
  });
  it('renders correctly when APP_NAME is joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const wrapper2 = shallow(<App />);
    expect(wrapper2).toBeDefined();
  });
  it('renders Google Map API when localhost', () => {
    process.env.BackendUrl = 'http://localhost:7000';
    expect('/map').toBeDefined();
  });
  it('doesn\'t render Google Map API when localhost null', () => {
    delete process.env.BackendUrl;
    expect(wrapper.instance().loadMap()).toBe(null);
  });
});
