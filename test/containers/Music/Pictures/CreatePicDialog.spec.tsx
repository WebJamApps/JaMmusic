import renderer from 'react-test-renderer';
import { CreatePicDialog, makeShowHideCaption } from 'src/containers/Music/Pictures/CreatePicDialog';
import utils from 'src/containers/Music/Pictures/pictures.utils';

describe('CreatePicDialog', () => {
  it('renders correctly and handles events', () => {
    utils.createPic = jest.fn();
    const setShowDialog = jest.fn();
    const cpd = renderer.create(<CreatePicDialog showDialog setShowDialog={setShowDialog} />).root;
    cpd.findByProps({ className: 'createNewPicDialog' }).props.onClose();
    expect(setShowDialog).toHaveBeenCalledWith(false);
    cpd.findByProps({ className: 'cancelPicButton' }).props.onClick();
    expect(setShowDialog).toHaveBeenCalledTimes(2);
    expect(cpd.findByProps({ label: '* URL' }).props.onChange({ target: { value: 'value' } })).toBe('value');
    expect(cpd.findByProps({ label: '* Title' }).props.onChange({ target: { value: 'title' } })).toBe('title');
    cpd.findByProps({ className: 'createPicButton' }).props.onClick();
    expect(utils.createPic).toHaveBeenCalled();
  });
  it('makeShowHideCaption and runs it', () => {
    const setPic = jest.fn();
    const showHide = makeShowHideCaption(setPic, {} as any);
    showHide({ target: { checked: true } });
    expect(setPic).toHaveBeenCalledWith({ comments: 'showCaption' });
    showHide({ target: { checked: false } });
    expect(setPic).toHaveBeenCalledWith({ comments: '' });
  });
});
