import renderer from 'react-test-renderer';
import { EditPicTable } from 'src/containers/Music/Pictures/EditPicTable';

describe('EditPicTable', () => {
  it('handles click on Cancel button', () => {
    const setShowTable = jest.fn();
    const cancel = renderer.create(<EditPicTable setShowTable={setShowTable} />).root;
    cancel.findByProps({ className: 'cancelEditPicButton' }).props.onClick();
    expect(setShowTable).toHaveBeenCalledWith(false);
  });
});
