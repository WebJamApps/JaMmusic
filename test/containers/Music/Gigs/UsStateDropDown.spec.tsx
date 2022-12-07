import renderer from 'react-test-renderer';
import { UsStateDropDown } from 'src/containers/Music/Gigs/UsStateDropDown';

describe('UsStateDropDown', () => {
  it('renders and handles onChange', () => {
    const props = {
      editGig: {} as any, setEditGig: jest.fn(), setEditChanged: jest.fn(),
    };
    const ud = renderer.create(<UsStateDropDown {...props} />).root;
    ud.findByProps({ id: 'edit-us-state' }).props.onChange({ target: { value: 'Virginia' } });
    expect(props.setEditGig).toHaveBeenCalled();
  });
});
