import React from 'react';
import { shallow } from 'enzyme';
import NarrowFacebookFeed from '../../../../src/containers/Homepage/Narrowscreen/NarrowFacebookFeed';

const wrapper = shallow<typeof NarrowFacebookFeed>(<NarrowFacebookFeed/>);

describe('NarrowFacebookFeed', () => {
  it('Renders the NarrowFacebookFeed', () => {
    expect(wrapper.find('div.notWidescreen').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
