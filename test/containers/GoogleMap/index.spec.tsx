/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as React from 'react';
import { shallow } from 'enzyme';
import GoogleMap from '../../../src/containers/GoogleMap';

describe('GoogleMap container', () => {
  let wrapper;
  const mapFunc: (...args: any) => any = jest.fn();
  beforeEach(() => {
    global.google = {
      maps: {
        ...window.google.maps,
        // @ts-ignore
        Map: mapFunc,
      },
    };
    wrapper = shallow<GoogleMap>(<GoogleMap />);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
