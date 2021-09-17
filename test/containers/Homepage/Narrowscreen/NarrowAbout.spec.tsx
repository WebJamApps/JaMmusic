import React from 'react';
import { shallow } from 'enzyme';
import NarrowAbout from '../../../../src/containers/Homepage/Narrowscreen/NarrowAbout';

const wrapper = shallow<typeof NarrowAbout>(<NarrowAbout/>);

describe('NarrowAbout', () => {
  it('Renders the NarrowAbout', () => {
    expect(wrapper.find('div.notWidescreen').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
