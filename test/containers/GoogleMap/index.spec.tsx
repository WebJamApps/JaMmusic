/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import GoogleMap from '../../../src/containers/GoogleMap';

describe('GoogleMap container', () => {
  let wrapper: ShallowWrapper<Readonly<any> & Readonly<{ children?: React.ReactNode; }>, Readonly<any>, GoogleMap>;
  const fakeFunc: (...args: any) => any = jest.fn();
  beforeEach(() => {
    global.google = {
      maps: {
        ...window.google.maps,
        // @ts-ignore
        Marker: fakeFunc,
        // @ts-ignore
        Map: fakeFunc,
      },
    };
    wrapper = shallow<GoogleMap>(<GoogleMap />);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
