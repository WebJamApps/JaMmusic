/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Music, checkIsAdmin } from 'src/containers/Music';
import { ClickToListen } from 'src/containers/Music/intro';
import { BrowserRouter } from 'react-router-dom';

describe('/music', () => {
  it('renders the component', () => {
    const music = renderer.create(<BrowserRouter><Music /></BrowserRouter>).toJSON();
    expect(music).toMatchSnapshot();
  });
  it('renders and runs useEffect', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      ReactDom.render(<BrowserRouter><Music /></BrowserRouter>, container);
    });
    const musicSlider: any = document.getElementById('musicSlide1');
    expect(musicSlider).toBeDefined();
    document.body.removeChild(container);
  });
  it('renders ClickToListen and handles click when joshandmariamusic.com', () => {
    window.open = jest.fn();
    const ctl = renderer.create(
      <BrowserRouter>
        <ClickToListen
          appName="joshandmariamusic.com"
          isAdmin={false}
          setShowCreatePic={jest.fn()}
          setShowEditPic={jest.fn()}
        />
      </BrowserRouter>,
    ).root;
    ctl.findByProps({ variant: 'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when web-jam.com', () => {
    window.open = jest.fn();
    const ctl = renderer.create(
      <BrowserRouter>
        <ClickToListen appName="web-jam.com" isAdmin={false} setShowCreatePic={jest.fn()} setShowEditPic={jest.fn()} />
      </BrowserRouter>,
    ).root;
    ctl.findByProps({ variant: 'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when undefined appName', () => {
    window.open = jest.fn();
    const ctl = renderer.create(
      <BrowserRouter>
        <ClickToListen isAdmin={false} setShowCreatePic={jest.fn()} setShowEditPic={jest.fn()} />
      </BrowserRouter>,
    )
      .root;
    ctl.findByProps({ variant: 'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
  it('checkIsAdmin when true', () => {
    const setIsAdmin = jest.fn();
    const userRoles = process.env.userRoles || '{}';
    const { roles } = JSON.parse(userRoles);
    const auth: any = { isAuthenticated: true, user: { userType: roles[0] } };
    checkIsAdmin(auth, setIsAdmin);
    expect(setIsAdmin).toHaveBeenCalledWith(true);
  });
});
