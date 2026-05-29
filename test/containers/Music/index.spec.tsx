/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Music, checkIsAdmin, PhotosSection } from 'src/containers/Music';
import { ClickToListen } from 'src/containers/Music/intro';
import { BrowserRouter } from 'react-router-dom';

describe('/music', () => {
  it('renders the component', () => {
    const { container } = render(<BrowserRouter><Music /></BrowserRouter>);
    expect(container).toMatchSnapshot();
  });
  it('renders ClickToListen and handles click when joshandmariamusic.com', () => {
    window.open = vi.fn();
    render(
      <BrowserRouter>
        <ClickToListen
          appName="joshandmariamusic.com"
          isAdmin={false}
          setShowCreatePic={vi.fn()}
          setShowEditPic={vi.fn()}
        />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when web-jam.com', () => {
    window.open = vi.fn();
    render(
      <BrowserRouter>
        <ClickToListen appName="web-jam.com" isAdmin={false} setShowCreatePic={vi.fn()} setShowEditPic={vi.fn()} />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when undefined appName', () => {
    window.open = vi.fn();
    render(
      <BrowserRouter>
        <ClickToListen isAdmin={false} setShowCreatePic={vi.fn()} setShowEditPic={vi.fn()} />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /listen/i }));
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
  it('checkIsAdmin when true', () => {
    const setIsAdmin = vi.fn();
    const userRoles = process.env.userRoles || '{}';
    const { roles } = JSON.parse(userRoles);
    const auth: any = { isAuthenticated: true, user: { userType: roles[0] } };
    checkIsAdmin(auth, setIsAdmin);
    expect(setIsAdmin).toHaveBeenCalledWith(true);
  });
  it('renders PhotosSection when showEditPicTable is true', () => {
    const props = {
      showEditPicTable: true,
      setShowEditPicTable: vi.fn(),
      isAdmin: true,
      setShowCreatePic: vi.fn(),
      showCreatePic: false,
    };
    const { container } = render(<PhotosSection {...props} />);
    expect(container.querySelector('.editPicTable')).toBeInTheDocument();
  });
});
