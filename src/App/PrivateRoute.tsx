
import { useContext, useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import commonUtils from '../lib/commonUtils';

interface IpRouteProps {
  auth: Iauth, userRoles: string[], path: string, Container: React.ElementType,
}
const PRoute = (props: IpRouteProps) => {
  const {
    auth, userRoles, path, Container,
  } = props;
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
};
interface PProps {
  Container: React.ElementType,
  path: string
}
export function PrivateRoute({ Container, path }: PProps): JSX.Element {
  const { auth } = useContext(AuthContext);
  const [userRoles, setUserRoles] = useState([] as string[]);
  useEffect(() => {
    setUserRoles(commonUtils.getUserRoles());
  }, []);
  return <PRoute auth={auth} userRoles={userRoles} path={path} Container={Container} />;
}

