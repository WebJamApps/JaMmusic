
import { Redirect } from 'react-router-dom';

function FourOhFour(): JSX.Element {
  return (
    <div className="page-content">
      <div className="fof">
        404 - Page not available
      </div>
      <Redirect to="/" />
    </div>
  );
}
export default FourOhFour;
