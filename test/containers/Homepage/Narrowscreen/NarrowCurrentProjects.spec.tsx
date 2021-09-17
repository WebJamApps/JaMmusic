import React from 'react';
import { shallow } from 'enzyme';
import NarrowCurrentProjects from '../../../../src/containers/Homepage/Narrowscreen/NarrowCurrentProjects';

const wrapper = shallow<typeof NarrowCurrentProjects>(<NarrowCurrentProjects/>);

describe('NarrowCurrentProjects', () => {
  it('Renders the NarrowCurrentProjects', () => {
    expect(wrapper.find('div.notWidescreen').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
