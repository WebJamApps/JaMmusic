import { useContext, useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { AuthContext } from 'src/providers/Auth.provider';
import facebookUtils, { WEBJAMLLC_PAGE_ID } from './facebook.utils';

// Shown on the homepage only to a signed-in admin and only when the feed is
// stalled (FacebookFeed gates it). Logs in as the WebJamLLC page admin and
// refreshes the stored page token via web-jam-back.
export function ReconnectFacebook() {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  useEffect(() => { facebookUtils.loadFbSdk(); }, []);
  const handleReconnect = async () => {
    setLoading(true);
    try {
      await facebookUtils.reconnectFacebookAPI(auth, WEBJAMLLC_PAGE_ID);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="material-content elevation3"
      style={{ maxWidth: '8in', margin: '20px auto auto auto', textAlign: 'center' }}
      data-testid="reconnect-facebook"
    >
      <h5>Homepage Facebook Feed</h5>
      <p style={{ fontSize: '10pt' }}>
        The Facebook feed has stopped updating. Click below and log in as the page admin to
        refresh the connection — keep both the WebJamLLC and CollegeLutheran pages checked.
      </p>
      <Button
        size="small"
        variant="contained"
        className="reconnectFbButton"
        disabled={loading}
        onClick={handleReconnect}
      >
        {loading ? <CircularProgress size={20} color="inherit" className="reconnectFbSpinner" /> : 'Reconnect Facebook'}
      </Button>
    </div>
  );
}

export default ReconnectFacebook;
