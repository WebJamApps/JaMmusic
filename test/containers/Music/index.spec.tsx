/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import { Music, checkIsAdmin, PhotosSection } from 'src/containers/Music';
import { ClickToListen } from 'src/containers/Music/intro';
import { BrowserRouter } from 'react-router-dom';

describe('/music', () => {
  it('renders the component', () => {
    const music = renderer.create(<BrowserRouter><Music /></BrowserRouter>).toJSON();
    expect(music).toMatchSnapshot();
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
  it('renders PhotosSection when showEditPicTable is true', () => {
    const props = {
      showEditPicTable: true,
      setShowEditPicTable: jest.fn(),
      isAdmin: true,
      setShowCreatePic: jest.fn(),
      showCreatePic: false,
    };
    const photosSection:any = renderer.create(<PhotosSection {...props} />).toJSON();
    expect(photosSection.children[0].children[0].props.className).toBe('editPicTable');
  });
});
