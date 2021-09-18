import React from 'react';
import { shallow } from 'enzyme';
import AppersonAutomotive from '../../../src/containers/Homepage/AppersonAutomotive';

const wrapper = shallow<typeof AppersonAutomotive>(<AppersonAutomotive/>);

describe('AppersonAutomotive', () => {
  it('Renders the AppersonAutomotive', () => {
    expect(wrapper.find('div.elevation2.project.apperson').exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });
});
