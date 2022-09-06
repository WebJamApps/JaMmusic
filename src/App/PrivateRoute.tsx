
import { Route, Redirect } from 'react-router-dom';
import commonUtils from '../lib/commonUtils';

interface PProps {
  Container:React.ElementType,
  path:string
}
export function PrivateRoute({ Container, path }:PProps): JSX.Element {
  const userRoles: string[] = commonUtils.getUserRoles();
  const authStr = sessionStorage.getItem('persist:root') || '{}';
  let a = { isAuthenticated: false, user: { userType: '' } };
  try {
    const { auth } = (JSON.parse(authStr) as { auth:string });
    a = JSON.parse(auth);
  // eslint-disable-next-line no-console
  } catch (e) { console.log((e as Error).message); }
  const isAllowed = !!(a.isAuthenticated && a.user.userType && userRoles.indexOf(a.user.userType) !== -1);
  return (
    <Route
      path={path}
      render={() => (isAllowed ? (
        <Container />
      ) : (
        <Redirect to="/" />
      ))}
    />
  );
}

