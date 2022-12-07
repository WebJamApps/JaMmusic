import renderer from 'react-test-renderer';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';

describe('CreateGigDialog', () => {
  it('renders and handles events', () => {
    utils.createGig = jest.fn();
    const setShowDialog = jest.fn();
    const cgd = renderer.create(<CreateGigDialog showDialog setShowDialog={setShowDialog} />).root;
    expect(cgd.findByProps({ label: '* City' }).props.onChange({ target: { value: 'city' } })).toBe('city');
    expect(cgd.findByProps({ label: 'Tickets' }).props.onChange({ target: { value: 'tickets' } })).toBe('tickets');
    cgd.findByProps({ className: 'createNewGigDialog' }).props.onClose();
    expect(setShowDialog).toHaveBeenCalledWith(false);
    const dtp = cgd.findByProps({ className: 'createDatetime' });
    expect(dtp.props.onChange(null)).toBeNull();
    expect(dtp.props.renderInput({}).props.className).toBe('dateTimeInput');
    expect(cgd.findByProps({ id: 'create-venue' }).props.onEditorChange('text')).toBe('text');
    expect(cgd.findByProps({ id: 'create-us-state' }).props.onChange({ target: { value: 'New York' } })).toBe('New York');
    cgd.findByProps({ className: 'createGigButton' }).props.onClick();
    expect(utils.createGig).toHaveBeenCalled();
    cgd.findByProps({ className: 'cancelCreateButton' }).props.onClick();
    expect(setShowDialog).toHaveBeenCalledTimes(2);
  });
});
