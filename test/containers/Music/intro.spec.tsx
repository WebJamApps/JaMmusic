import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { ClickToListen } from 'src/containers/Music/intro';

describe('Intro', () => {
  it('renders ClickToListen when isAdmin and handles events', () => {
    const props = {
      appName: 'app', isAdmin: true, setShowCreatePic: jest.fn(), setShowEditPic: jest.fn(),
    };
    const ctl = renderer.create(<BrowserRouter><ClickToListen {...props} /></BrowserRouter>).root;
    ctl.findByProps({ className: 'createPicButton' }).props.onClick();
    expect(props.setShowCreatePic).toHaveBeenCalledWith(true);
    ctl.findByProps({ className: 'editPicButton' }).props.onClick();
    expect(props.setShowEditPic).toHaveBeenCalledWith(true);
  });
});
