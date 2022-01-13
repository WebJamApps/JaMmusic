/* eslint-disable @typescript-eslint/no-explicit-any */

import { Route } from 'react-router-dom';
import { shallow } from 'enzyme';
import { PrivateRoute } from '../../src/App/PrivateRoute';
import GoogleMap from '../../src/containers/GoogleMap';
import commonUtils from '../../src/lib/commonUtils';

describe('PrivateRoute', () => {
  const wrapper = shallow(<PrivateRoute Container={GoogleMap} path="/map" />);
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('renders the redirect', () => {
    const route = wrapper.find(Route).get(0);
    const result = route.props.render();
    expect(result.props.to).toBe('/');
  });
  it('renders the component', () => {
    const userRoles: string[] = commonUtils.getUserRoles();
    const authJson = JSON.stringify({ isAuthenticated: true, user: { userType: userRoles[0] } });
    sessionStorage.setItem('persist:root', JSON.stringify({ auth: authJson }));
    const wrapper2 = shallow(<PrivateRoute Container={GoogleMap} path="/map" />);
    const route = wrapper2.find(Route).get(0);
    const result = route.props.render();
    expect(result.type).toBeDefined();
  });
});
