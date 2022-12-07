/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserRouter } from 'react-router-dom';
import { PrivateRoute, makeRender } from 'src/App/PrivateRoute';
import GoogleMap from 'src/containers/GoogleMap';
import renderer from 'react-test-renderer';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Music } from 'src/containers/Music';

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
  it('makeRender returns the Container', () => {
    const Mr = makeRender({ isAuthenticated: true, user: { userType: 'test' } } as any, ['test'], Music);
    const rendered:any = renderer.create(<Mr />).toJSON();
    expect(rendered.props.className).toBe('page-content music');
  });
  it('makeRender returns the Redirect', () => {
    const Mr = makeRender({ isAuthenticated: true, user: { userType: 'test' } } as any, ['test2'], Music);
    const rendered:any = renderer.create(<BrowserRouter><Mr /></BrowserRouter>).toJSON();
    expect(rendered).toBeNull();
  });
});
