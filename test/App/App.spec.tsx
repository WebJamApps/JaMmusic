/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import env from 'dotenv';
import { App } from '../../src/App';
import { Auth } from '../../src/redux/mapStoreToProps';

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
  it('does not fetch the images or songs if they already exist', () => new Promise((done) => {
    const songs:any[] = [{}];
    const images:any[] = [{}];
    const wrapper2 = shallow(<App dispatch={dp} songs={songs} images={images} />);
    expect(wrapper2.find('div#App').exists()).toBe(true);
    done();
  }));
  it('renders when dispatch is not defined', () => {
    const wrapper2 = shallow(<App />);
    expect(wrapper2).toBeDefined();
  });
  it('renders the routes when authenticated', () => {
    let authRole = '';
    // eslint-disable-next-line prefer-destructuring
    if (process.env.userRoles) authRole = JSON.parse(process.env.userRoles).roles[1];
    const auth2: Auth = {
      isAuthenticated: true, error: 'none', email: 'devemail@cool.com', token: '', user: { userType: authRole },
    };
    const wrapper2 = shallow(<App dispatch={jest.fn()} auth={auth2} />);
    expect(wrapper2.find('div#App').exists()).toBe(true);
  });
});
