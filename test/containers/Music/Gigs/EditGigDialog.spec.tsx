import renderer from 'react-test-renderer';
import {
  ButtonsSection, EditGigDialog, EditText, VenueEditor,
} from 'src/containers/Music/Gigs/EditGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import { defaultGig } from 'src/providers/fetchGigs';

describe('EditGigDialog', () => {
  it('renders and handles events', () => {
    const props = {
      editGig: {} as any,
      setEditGig: jest.fn(),
      setShowDialog: jest.fn(),
      setEditChanged: jest.fn(),
      editChanged: false,
      getGigs: jest.fn(),
      auth: {} as any,
    };
    const egd = renderer.create(<EditGigDialog {...props} />).root;
    egd.findByProps({ className: 'editGigDialog' }).props.onClose();
    expect(props.setShowDialog).toHaveBeenCalledWith(false);
    const editDateTime = egd.findByProps({ className: 'editDateTime' });
    editDateTime.props.onChange(null);
    expect(props.setEditGig).toHaveBeenCalledWith({ datetime: null });
    expect(editDateTime.props.renderInput().props.className).toBe('dateTimeInput');
  });
  it('renders ButtonSection and handles clicks', () => {
    utils.updateGig = jest.fn();
    utils.deleteGig = jest.fn();
    const props = {
      editGig: {} as any,
      editChanged: true,
      getGigs: jest.fn(),
      setEditGig: jest.fn(),
      setEditChanged: jest.fn(),
      auth: {} as any,
    };
    const bs = renderer.create(<ButtonsSection {...props} />).root;
    bs.findByProps({ className: 'updateGigButton' }).props.onClick();
    expect(utils.updateGig).toHaveBeenCalled();
    bs.findByProps({ className: 'deleteGigButton' }).props.onClick();
    expect(utils.deleteGig).toHaveBeenCalled();
    bs.findByProps({ className: 'cancelEditGigButton' }).props.onClick();
    expect(props.setEditGig).toHaveBeenCalledWith(defaultGig);
  });
  it('renders the VenueEditor and handles event', () => {
    const props = {
      editGig: { _id: 'uuid' } as any, setEditChanged: jest.fn(), setEditGig: jest.fn(),
    };
    const ve = renderer.create(<VenueEditor {...props} />).root;
    ve.findByProps({ id: 'edit-venue' }).props.onEditorChange('text');
    expect(props.setEditGig).toHaveBeenCalledWith({ _id: 'uuid', venue: 'text' });
  });
  it('renders EditText and handles onChange', () => {
    const props = {
      objKey: 'tickets' as any, editGig: {} as any, setEditChanged: jest.fn(), setEditGig: jest.fn(), required: true,
    };
    const editText = renderer.create(<EditText {...props} />).root;
    editText.findByProps({ type: 'text' }).props.onChange({ target: { value: 'value' } });
    expect(editText).toHaveBeenCAlledWith({ tickets: 'value' });
  });
});
