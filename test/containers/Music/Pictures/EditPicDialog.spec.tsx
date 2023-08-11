import renderer from 'react-test-renderer';
import { EditPicDialog } from 'src/containers/Music/Pictures/EditPicDialog';
import utils from 'src/containers/Music/Pictures/pictures.utils';

describe('EditPicDialog', () => {
  it('handles onClose for EditPicDialog', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    epd.findByProps({ className: 'editPicDialog' }).props.onClose();
    expect(props.setEditPic).toHaveBeenCalled();
  });
  it('handles onChange with url', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    const evt = { target: { value: 'url' } };
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    const tree = epd.findByProps({ label: '* URL' }).props.onChange(evt);
    expect(tree).toBe('url');
  });
  it('handles onChange with title', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    const evt = { target: { value: 'title' } };
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    const tree = epd.findByProps({ label: '* Title' }).props.onChange(evt);
    expect(tree).toBe('title');
  });
  it('handles onClick with updatePic', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    utils.updatePic = jest.fn();
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    epd.findByProps({ variant: 'contained' }).props.onClick();
    expect(utils.updatePic).toHaveBeenCalled();
  });
  it('handles onClick with deletePic', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    utils.deletePic = jest.fn();
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    epd.findByProps({ id: 'delete' }).props.onClick();
    expect(utils.deletePic).toHaveBeenCalled();
  });
  it('handles onClick with setEditPic', () => {
    const props = {
      editPic: {
        title: '', type: '', comments: '', url: '', _id: undefined,
      },
      setShowTable: jest.fn(),
      setEditPic: jest.fn(),
    };
    const epd = renderer.create(<EditPicDialog {...props} />).root;
    epd.findByProps({ className: 'cancelPicButton' }).props.onClick();
    expect(props.setEditPic).toHaveBeenCalled();
  });
});
