/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this, max-classes-per-file,  */
import { shallow, ShallowWrapper } from 'enzyme';
import GoogleMap from '../../../src/containers/GoogleMap';

describe('GoogleMap container', () => {
  let lType = '', wrapper: ShallowWrapper<Readonly<any> & Readonly<{ children?: React.ReactNode; }>, Readonly<any>, GoogleMap>;
  const fakeFunc: any = jest.fn();
  class Marker { addListener(type: string, cb: () => void) { lType = type; cb(); } }
  class InfoWindow { open() { } }
  const fakeMarker: any = Marker;
  const fakeInfoWindow: any = InfoWindow;
  beforeEach(() => {
    global.google = {
      maps: {
        ...window.google.maps,
        Marker: fakeMarker,
        Map: fakeFunc,
        InfoWindow: fakeInfoWindow,
      },
    };
    wrapper = shallow<GoogleMap>(<GoogleMap />);
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
    expect(lType).toBe('click');
  });
  it('does not render the map', () => {
    document.body.innerHTML = '<div></div>';
    const wrapper2 = shallow<GoogleMap>(<GoogleMap />);
    expect(wrapper2.instance().gMap).toBe(null);
  });
});
