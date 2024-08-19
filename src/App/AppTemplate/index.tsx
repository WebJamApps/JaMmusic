import {
  SetStateAction,
  // useContext, useEffect,
  useState,
} from 'react';
// import { AuthContext, Iauth } from 'src/providers/Auth.provider';
// import { jwtVerify } from 'jose';
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

export function handleKeyMenu(
  e: { key: string; },
  menuOpen: boolean,
  setMenuOpen: (arg0: boolean) => void,
): void {
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

// export async function checkIfTokenExpired(auth:Iauth) {
//   console.log(auth);
//   try {
//     const user = await jwtVerify(auth.token);
//     console.log(user);
//   } catch (err) { console.log(err); }
// }

interface IpageHostProps {
  userCount?: number, heartBeat?: string,
  children: React.ReactNode,
}
export function AppTemplate(props: IpageHostProps) {
  const {
    // userCount, heartBeat,
    children,
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const handleClose = makeHandleClose(setMenuOpen);
  const onClick = makeOnClick(menuOpen, setMenuOpen);
  const onKeyPress = makeOnKeyPress(menuOpen, setMenuOpen);
  const handleKeyPress = makeHandleKeyPress(setMenuOpen);
  // const { auth } = useContext(AuthContext);
  // check if token has expired
  // useEffect(() => {
  //   checkIfTokenExpired(auth);
  // });
  return (
    <div className="page-host">
      <DrawerContainer
        handleKeyPress={handleKeyPress}
        className={makeDrawerClass(menuOpen)}
        // userCount={userCount}
        // heartBeat={heartBeat}
        handleClose={handleClose}
      />
      <MainPanel children={children} onClick={onClick} onKeyPress={onKeyPress} />
    </div>
  );
}

