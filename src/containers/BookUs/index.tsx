import { Inquiry } from '../Homepage/Inquiry';

export function BookUs() {
  return (
    <div className="bookus" style={{ margin: 'auto' }}>
      <div style={{ maxWidth: '990px' }}>
        <h3 style={{ textAlign: 'center' }}>Book Us</h3>
        <h4 style={{ fontWeight: 'normal' }}>
          We are always looking for regional performance opportunites,
          and would consider traveling even further away from our home in Salem, VA for just the right situation.
        </h4>
        <p style={{ textAlign: 'center' }}>Please fill out this form and we will get back with you soon.</p>
        <Inquiry country="United States" hideTitle />
      </div>
    </div>
  );
}
