import React from 'react';
import { shallow } from 'enzyme';
import Home from '../../../src/containers/Homepage';
import WideAboutUs from '../../../src/containers/Homepage/Widescreen/WideAbout';
import WideCurrentProjects from '../../../src/containers/Homepage/Widescreen/WideCurrentProjects';
import WideFacebookFeed from '../../../src/containers/Homepage/Widescreen/WideFacebookFeed';

const wrapper = shallow(<Home />);

describe('Home', () => {
  it('Renders the homepage', () => {
    wrapper.instance().setState({ width: 1009 });
    wrapper.instance().forceUpdate();
    expect(wrapper.find(WideAboutUs).exists()).toBe(true);
    expect(wrapper.find(WideAboutUs).dive().find('div.widescreenHomepage').exists()).toBe(true);
    expect(wrapper.find(WideCurrentProjects).dive().find('div.widescreenHomepage').exists()).toBe(true);
    expect(wrapper.find(WideCurrentProjects).dive().find(WideFacebookFeed).dive()
      .find('div.col-md-6')
      .exists()).toBe(true);
  });
  it('Resizes the page', () => {
    wrapper.instance().onResize(100);
    expect(wrapper.instance().state.width).toBe(100);
  });
});
