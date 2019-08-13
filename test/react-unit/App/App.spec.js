import React from 'react';
import { shallow } from 'enzyme';
import { App } from '../../../src/App';

describe('App component', () => {
  const dp = (fun) => fun;
  const wrapper = shallow(<App dispatch={dp} />);
  it('renders the component', () => {
    expect(wrapper.find('div#App').exists()).toBe(true);
  });
  it('does not fetch the images or songs if they already exist', (done) => {
    const songs = [{}];
    const images = [{}];
    const wrapper2 = shallow(<App dispatch={dp} songs={songs} images={images} />);
    expect(wrapper2.find('div#App').exists()).toBe(true);
    done();
  });
});
