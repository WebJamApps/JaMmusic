import renderer from 'react-test-renderer';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';

describe('CreateGigDialog', () => {
  it('handles onChange events', () => {
    const cgd = renderer.create(<CreateGigDialog showDialog setShowDialog={jest.fn()} />).root;
    expect(cgd.findByProps({ label: '* City' }).props.onChange({ target: { value: 'city' } })).toBe('city');
    expect(cgd.findByProps({ label: 'Tickets' }).props.onChange({ target: { value: 'tickets' } })).toBe('tickets');
  });
});
