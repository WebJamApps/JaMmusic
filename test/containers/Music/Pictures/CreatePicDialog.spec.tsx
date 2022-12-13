import renderer from 'react-test-renderer';
import { CreatePicDialog } from 'src/containers/Music/Pictures/CreatePicDialog';

describe('CreatePicDialog', () => {
  it('renders correctly and handles events', () => {
    const setShowDialog = jest.fn();
    const cpd = renderer.create(<CreatePicDialog showDialog setShowDialog={setShowDialog} />).root;
    cpd.findByProps({ className: 'createNewPicDialog' }).props.onClose();
    expect(setShowDialog).toHaveBeenCalledWith(false);
    cpd.findByProps({ className: 'cancelPicButton' }).props.onClick();
    expect(setShowDialog).toHaveBeenCalledTimes(2);
  });
});
