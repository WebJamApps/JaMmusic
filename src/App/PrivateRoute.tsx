
import { useContext } from 'react';
import { Route } from 'react-router-dom';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import HomePage from '../containers/Homepage';
import commonUtils from '../lib/commonUtils';

// eslint-disable-next-line react/display-name
export const makeRender = (auth:Iauth, userRoles:string[], Container: React.ElementType) => () => {
  const isAllowed = !!(auth.isAuthenticated && auth.user.userType && userRoles.indexOf(auth.user.userType) !== -1);
  if (isAllowed) return <Container />;
  return <Route path="/"><HomePage /></Route>;
};

interface PProps {
  Container: React.ElementType,
  path: string
}
export function PrivateRoute({ Container, path }: PProps): JSX.Element {
  const { auth } = useContext(AuthContext);
  const userRoles = commonUtils.getUserRoles();
  const Component = makeRender(auth, userRoles, Container);
  // return <Route path={path} component={render} />;
  // return <Route path={path}>{makeRender(auth, userRoles, Container)}</Route>;
  return <Route path={path}><Component /></Route>;
}

