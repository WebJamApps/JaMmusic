import { Dispatch, SetStateAction, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import type { Iauth } from 'src/providers/Auth.provider';
import { DrawerContainer } from './DrawerContainer';
import { MainPanel } from './MainPanel';

export const makeDrawerClass = (menuOpen: boolean) => {
  const className = `home-sidebar ${menuOpen ? 'open' : 'close'} drawer-container`;
  return className;
};

export const makeHandleClose = (setMenuOpen: (value: SetStateAction<boolean>) => void) => () => setMenuOpen(false);

export function toggleMobileMenu(menuOpen: boolean, setMenuOpen: (arg0: boolean) => void): void {
  const mO = !menuOpen;
  setMenuOpen(mO);
}

export const makeOnClick = (
  menuOpen: boolean,
  setMenuOpen: (value: SetStateAction<boolean>) => void,
) => () => toggleMobileMenu(menuOpen, setMenuOpen);

export function handleKeyMenu(e: { key: string; }, menuOpen: boolean, setMenuOpen: (arg0: boolean) => void): void {
  if (e.key === 'Enter') toggleMobileMenu(menuOpen, setMenuOpen);
}

export const makeOnKeyPress = (
  menuOpen: boolean,
  setMenuOpen: (value: SetStateAction<boolean>) => void,
) => (evt: { key: string; }) => handleKeyMenu(evt, menuOpen, setMenuOpen);

export function handleEscapePress(e: { key: string; }, setMenuOpen: (arg0: boolean) => void): (void) {
  if (e.key === 'Escape') setMenuOpen(false);
}

export const makeHandleKeyPress = (
  setMenuOpen: (value: SetStateAction<boolean>) => void,
) => (evt: { key: string; }) => handleEscapePress(evt, setMenuOpen);

interface IpageHostProps {
  userCount: number, heartBeat: string, auth: Iauth, location: RouteComponentProps['location'], dispatch: Dispatch<unknown>,
  children: React.ReactNode,
}
export function PageHost(props: IpageHostProps) {
  const {
    userCount, heartBeat, auth, location, dispatch, children,
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClose = makeHandleClose(setMenuOpen);
  const onClick = makeOnClick(menuOpen, setMenuOpen);
  const onKeyPress = makeOnKeyPress(menuOpen, setMenuOpen);
  const handleKeyPress = makeHandleKeyPress(setMenuOpen);
  return (
    <div className="page-host">
      <DrawerContainer
        handleKeyPress={handleKeyPress}
        className={makeDrawerClass(menuOpen)}
        userCount={userCount}
        heartBeat={heartBeat}
        auth={auth}
        location={location}
        dispatch={dispatch}
        handleClose={handleClose}
      />
      <MainPanel children={children} onClick={onClick} onKeyPress={onKeyPress} />
    </div>
  );
}
