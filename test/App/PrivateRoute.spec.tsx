/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserRouter } from 'react-router-dom';
import { PrivateRoute } from 'src/App/PrivateRoute';
import GoogleMap from 'src/containers/GoogleMap';
// import commonUtils from 'src/lib/commonUtils';
// import renderer from 'react-test-renderer';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';

describe('PrivateRoute', () => {
  it('renders and runs useEffect', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const props = {
      Container: GoogleMap, path: '/googlemap',
    };
    act(() => {
      ReactDom.render(<BrowserRouter><PrivateRoute {...props} /></BrowserRouter>, container);
    });
    const gMap:any = document.getElementById('googleMap');
    expect(gMap).toBeDefined();
    document.body.removeChild(container);
  });
});
