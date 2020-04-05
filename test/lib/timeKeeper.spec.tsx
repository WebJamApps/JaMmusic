import React from 'react';
import { shallow } from 'enzyme';
import AddTime from '../../src/lib/timeKeeper';

describe('timeKeeper component', () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(<AddTime setFormTime />);
  });
  it('is defined', () => {
    expect(AddTime).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
