import React from 'react';
import { shallow } from 'enzyme';
import { DashNavigationButtons } from '../../../src/components/DashNavigationButtons';

describe('Dash Navigation Buttons', () => {
  let compStub:any = {};
  beforeEach(() => {
    compStub = {
      state: { songState: {} },
      props: { editSong: {}, auth: {}, dispatch: jest.fn() },
      controller: {},
      setState: jest.fn(),
    };
  });

  it('Photo Button renders to Dashboard', () => {
    const wrapper = shallow(<DashNavigationButtons comp={compStub} />);
    expect(wrapper.find('Photos-Button')).toBeDefined();
  });
  it('Song Button renders to Dashboard', () => {
    const wrapper = shallow(<DashNavigationButtons comp={compStub} />);
    expect(wrapper.find('Songs-Button')).toBeDefined();
  });
  it('Tour Button renders to Dashboard', () => {
    const wrapper = shallow(<DashNavigationButtons comp={compStub} />);
    expect(wrapper.find('Tours-Button')).toBeDefined();
  });
});
