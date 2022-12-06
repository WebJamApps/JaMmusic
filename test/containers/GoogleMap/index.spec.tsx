/* eslint-disable max-classes-per-file */
import renderer from 'react-test-renderer';
import GoogleMap from 'src/containers/GoogleMap';

describe('GoogleMap container', () => {
  let lType = '';
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
  });
  it('renders correctly', () => {
    const gMap = renderer.create(<GoogleMap />).toJSON();
    expect(gMap).toMatchSnapshot();
    expect(lType).toBe('click');
  });
});
