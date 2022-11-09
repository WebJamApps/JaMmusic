
import { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from 'src/providers/Auth.provider';
import commonUtils from '../lib/commonUtils';

interface PProps {
  Container:React.ElementType,
  path:string
}
export function PrivateRoute({ Container, path }:PProps): JSX.Element {
  const { auth } = useContext(AuthContext);
  const userRoles: string[] = commonUtils.getUserRoles();
  const isAllowed = !!(auth.isAuthenticated && auth.user.userType && userRoles.indexOf(auth.user.userType) !== -1);
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

