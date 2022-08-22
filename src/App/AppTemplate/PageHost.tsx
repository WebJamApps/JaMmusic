import { useState } from 'react';
import { DrawerContainer } from './DrawerContainer';
import { MainPanel } from './MainPanel';

export function toggleMobileMenu(menuOpen: boolean, setMenuOpen:(arg0:boolean)=>void): void {
  const mO = !menuOpen;
  setMenuOpen(mO);
}

export function handleKeyMenu(e: { key: string; }, menuOpen: boolean, setMenuOpen:(arg0:boolean)=>void): void {
  if (e.key === 'Enter') toggleMobileMenu(menuOpen, setMenuOpen);
}

export function handleEscapePress(e: { key: string; }, setMenuOpen:(arg0:boolean)=>void): (void) {
  if (e.key === 'Escape') setMenuOpen(false);
}

export const makeDrawerClass = (menuOpen:boolean) => {
  const className = `home-sidebar ${menuOpen ? 'open' : 'close'} drawer-container`;
  return className;
};

export const makeHandleClose = (setMenuOpen:any) => () => setMenuOpen(false);

export const makeOnClick = (menuOpen:boolean, setMenuOpen:any) => () => toggleMobileMenu(menuOpen, setMenuOpen);

export const makeOnKeyPress = (menuOpen:boolean, setMenuOpen:any) => (evt:any) => handleKeyMenu(evt, menuOpen, setMenuOpen);

export const makeHandleKeyPress = (setMenuOpen:any) => (evt:any) => handleEscapePress(evt, setMenuOpen);

export function PageHost({ userCount, heartBeat, auth, location, dispatch, children }: any) {
  const [menuOpen, setMenuOpen ] = useState(false);
  const handleClose  = makeHandleClose(setMenuOpen);
  const onClick = makeOnClick(menuOpen, setMenuOpen);
  const onKeyPress = makeOnKeyPress(menuOpen, setMenuOpen);
  const handleKeyPress = makeHandleKeyPress(setMenuOpen);
  return (
        <div className="page-host">
        <DrawerContainer handleKeyPress={handleKeyPress} className={makeDrawerClass(menuOpen)}
         userCount={userCount} heartBeat={heartBeat} auth={auth} location={location} 
         dispatch={dispatch} handleClose={handleClose}
         />
         <MainPanel children={children} onClick={onClick} onKeyPress={onKeyPress}/>
      </div>
  );
}
