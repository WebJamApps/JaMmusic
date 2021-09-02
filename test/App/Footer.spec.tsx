/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import Footer from '../../src/App/Footer';

describe('Footer', () => {
  const wrapper = shallow(<Footer/>);
  it('renders', () => {
    expect(wrapper.find('div#wjfooter').exists()).toBe(true);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  // it('does not fetch the images or songs if they already exist', () => {
  //   const images: any[] = [{}];
  //   const wrapper2 = shallow(<App dispatch={dp} images={images} />);
  //   expect(wrapper2.find('div#App').exists()).toBe(true);
  // });
  // it('renders when dispatch is not defined', () => {
  //   const wrapper2 = shallow(<App />);
  //   expect(wrapper2).toBeDefined();
  // });
  // it('renders correctly when APP_NAME is missing', () => {
  //   delete process.env.APP_NAME;
  //   const wrapper2 = shallow(<App />);
  //   expect(wrapper2).toBeDefined();
  // });
  // it('renders correctly when APP_NAME is joshandmariamusic.com', () => {
  //   process.env.APP_NAME = 'joshandmariamusic.com';
  //   const wrapper2 = shallow(<App />);
  //   expect(wrapper2).toBeDefined();
  // });
});
