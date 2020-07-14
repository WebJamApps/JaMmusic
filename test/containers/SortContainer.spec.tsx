import React from 'react';
import { shallow } from 'enzyme';
import Sort from '../../src/containers/SortContainer';

describe('sort container', () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(<Sort />);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
