import renderer from 'react-test-renderer';
import { CreateSongDialog } from 'src/containers/Songs/CreateSongDialog';

describe('CreateSongDialog', () => {
  it('handles onClose for CreateSongDialog', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    result.findByProps({ className: 'createNewPicDialog' }).props.onClose();
    expect(setShowDialog).toHaveBeenCalledWith(false);
  });
  it('handles onChange with url', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'song';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: '* Url' }).props.onChange(evt);
    expect(tree).toBe('song');
  });
  it('handles onChange with title', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'title';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: '* Title' }).props.onChange(evt);
    expect(tree).toBe('title');
  });
  it('handles onChange with artist', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'artist';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: '* Artist' }).props.onChange(evt);
    expect(tree).toBe('artist');
  });
  it('handles onChange with category', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'category';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: 'Category' }).props.onChange(evt);
    expect(tree).toBe('category');
  });
  it('handles onChange with composer', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'composer';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: 'Composer' }).props.onChange(evt);
    expect(tree).toBe('composer');
  });
  it('handles onChange with album', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'album';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: 'Album' }).props.onChange(evt);
    expect(tree).toBe('album');
  });
  it('handles onChange with image', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = 'image';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: 'Image' }).props.onChange(evt);
    expect(tree).toBe('image');
  });
  it('handles onChange with year', () => {
    const showDialog = true;
    const setShowDialog = jest.fn();
    const value = '2';
    const evt = { target: { value } };
    const result = renderer.create(<CreateSongDialog showDialog={showDialog} setShowDialog={setShowDialog} />).root;
    const tree = result.findByProps({ label: '* Year' }).props.onChange(evt);
    expect(tree).toBe(2);
  });
});
