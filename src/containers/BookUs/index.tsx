import { Button } from '@mui/material';
import { Inquiry } from '../Homepage/Inquiry';

const songlistUrl = '/Josh-Maria-Songlist.pdf';
export function BookUs() {
  return (
    <div className="bookus" style={{ margin: 'auto', padding: '6px', paddingRight: '12px' }}>
      <div style={{ maxWidth: '800px' }}>
        <h3 style={{ textAlign: 'center' }}>Book Us</h3>
        <h4 style={{ fontWeight: 'normal' }}>
          We are always looking for regional performance opportunites,
          and would consider traveling even further away from our home in Salem, VA for just the right situation.
          <Button
            style={{ marginLeft: '8px' }}
            size="small"
            variant="contained"
            onClick={() => window.open(songlistUrl, '_blank', 'noopener,noreferrer')}
          >
            Current Songlist
          </Button>

        </h4>
        <p style={{ textAlign: 'center' }}>
          Please fill out this form and we will get back with you soon.
        </p>
        <Inquiry country="United States" hideTitle />
      </div>
    </div>
  );
}
