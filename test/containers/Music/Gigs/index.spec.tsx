/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import {
  Gigs, columns, EditText, VenueEditor,
} from 'src/containers/Music/Gigs';
import utils from 'src/containers/Music/Gigs/gigs.utils';

describe('Gigs', () => {
  it('renders correctly when not isAdmin', () => {
    const gigs = renderer.create(<Gigs isAdmin={false} />);
    expect(JSON.stringify(gigs.toJSON()).includes('gigsDiv')).toBe(true);
  });
  it('renders when isAdmin and handles clicks', () => {
    utils.clickToEdit = jest.fn();
    utils.updateGig = jest.fn();
    utils.deleteGig = jest.fn();
    const gigs = renderer.create(<Gigs isAdmin />).root;
    const result = gigs.findByProps({ className: 'showCreateDialog' }).props.onClick();
    expect(result).toBe(true);
    expect(gigs.findByProps({ className: 'createNewGigDialog' }).props.onClose()).toBe(false);
    expect(gigs.findByProps({ className: 'cancelCreateButton' }).props.onClick()).toBe(false);
    expect(gigs.findByProps({ className: 'createGigButton' }).props.onClick()).toBe(true);
    const dtPicker = gigs.findByProps({ className: 'createDatetime' });
    expect(dtPicker.props.onChange(null)).toBeNull();
    expect(dtPicker.props.renderInput().props.className).toBe('dateTimeInput');
    const venueEditor = gigs.findByProps({ id: 'create-venue' });
    expect(venueEditor.props.onEditorChange('venue')).toBe('venue');
    const stateEditor = gigs.findByProps({ id: 'create-us-state' });
    expect(stateEditor.props.onChange({ target: { value: 'Georgia' } })).toBe('Georgia');
    gigs.findByProps({ className: 'adminGrid' }).props.onRowClick({ row: {} });
    expect(utils.clickToEdit).toHaveBeenCalled();
    expect(gigs.findByProps({ className: 'editGigDialog' }).props.onClose()).toBe(false);
    const editDateTime = gigs.findByProps({ className: 'editDateTime' });
    expect(editDateTime.props.onChange(null)).toBe(null);
    expect(editDateTime.props.renderInput({}).props.className).toBe('dateTimeInput');
    expect(gigs.findByProps({ id: 'edit-us-state' }).props.onChange({ target: { value: 'Virginia' } })).toBe('Virginia');
    gigs.findByProps({ className: 'updateGigButton' }).props.onClick();
    expect(utils.updateGig).toHaveBeenCalled();
    gigs.findByProps({ className: 'deleteGigButton' }).props.onClick();
    expect(utils.deleteGig).toHaveBeenCalled();
    expect(gigs.findByProps({ className: 'cancelEditGigButton' }).props.onClick()).toBe(false);
  });
  it('renders the location cell with city, state', () => {
    const location:any = columns[2];
    const params:any = { row: { location: '', city: 'Salem', usState: 'Virginia' } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('Salem, Virginia');
  });
  it('renders the location cell with location', () => {
    const location:any = columns[2];
    const params:any = { row: { location: 'location', city: 'Salem', usState: 'Virginia' } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('location');
  });
  it('renders the location cell when undefined', () => {
    const location:any = columns[2];
    const params:any = { row: { } };
    const cell:any = location.renderCell(params);
    expect(cell).toBe('');
  });
  it('makeTickets', () => {
    const tickets:any = columns[4];
    const params:any = { value: '<a></a>' };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeTickets defaults to Free', () => {
    const tickets:any = columns[4];
    const params:any = { value: undefined };
    const cell:any = tickets.renderCell(params);
    expect(cell.type).toBe('span');
  });
  it('makeDateValue', () => {
    const date:any = columns[0];
    const params:any = { row: { datetime: new Date().toISOString() } };
    const cell:any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeDateValue when null', () => {
    const date:any = columns[0];
    const params:any = { row: { datetime: null } };
    const cell:any = date.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue', () => {
    const time:any = columns[1];
    const params:any = { row: { datetime: new Date().toISOString() } };
    const cell:any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('makeTimeValue when null', () => {
    const time:any = columns[1];
    const params:any = { row: { datetime: null } };
    const cell:any = time.renderCell(params);
    expect(typeof cell).toBe('string');
  });
  it('renders EditText and handles onChange', () => {
    const props = {
      objKey: 'city' as any, editGig: {} as any, setEditGig: jest.fn(), setEditChanged: jest.fn(), required: true,
    };
    const editText = renderer.create(<EditText {...props} />).root;
    editText.findByProps({ type: 'text' }).props.onChange({ target: { value: 'city' } });
    expect(props.setEditGig).toHaveBeenCalledWith({ city: 'city' });
  });
  it('renders VenueEditor and handles change event', () => {
    const props = {
      editGig: { _id: 'id' } as any, setEditGig: jest.fn(), setEditChanged: jest.fn(),
    };
    const venueEditor = renderer.create(<VenueEditor {...props} />).root;
    expect(venueEditor.findByProps({ id: 'edit-venue' }).props.onEditorChange('venue')).toBe('');
    expect(venueEditor.findByProps({ id: 'edit-venue' }).props.onEditorChange('venue')).toBe('venue');
  });
  it('renders VenueEditor as null', () => {
    const props = {
      editGig: { } as any, setEditGig: jest.fn(), setEditChanged: jest.fn(),
    };
    const venueEditor = renderer.create(<VenueEditor {...props} />).toJSON();
    expect(venueEditor).toBeNull();
  });
});
