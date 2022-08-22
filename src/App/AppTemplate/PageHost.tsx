import { useState } from 'react';
import { DrawerContainer } from './DrawerContainer';
import { MainPanel } from './MainPanel';

function toggleMobileMenu(menuOpen: boolean, setMenuOpen:(arg0:boolean)=>void): void {
  const mO = !menuOpen;
  setMenuOpen(mO);
}

function handleKeyMenu(e: { key: string; }, menuOpen: boolean, setMenuOpen:(arg0:boolean)=>void): void {
  if (e.key === 'Enter') toggleMobileMenu(menuOpen, setMenuOpen);
}

function handleKeyPress(e: { key: string; }, setMenuOpen:(arg0:boolean)=>void): (void) {
  if (e.key === 'Escape') setMenuOpen(false);
}

export const makeDrawerClass = (menuOpen:boolean) => {
  const className = `home-sidebar ${menuOpen ? 'open' : 'close'} drawer-container`;
  return className;
};

export function PageHost({ userCount, heartBeat, auth, location, dispatch, children }: any) {
  const [menuOpen, setMenuOpen ] = useState(false);
  const handleClose  = () => setMenuOpen(false);
  const onClick = () => toggleMobileMenu(menuOpen, setMenuOpen);
  const onKeyPress = (evt:any) => handleKeyMenu(evt, menuOpen, setMenuOpen);
  return (
        <div className="page-host">
        <DrawerContainer handleKeyPress={(evt) => handleKeyPress(evt, setMenuOpen)} className={makeDrawerClass(menuOpen)}
         userCount={userCount} heartBeat={heartBeat} auth={auth} location={location} 
         dispatch={dispatch} handleClose={handleClose}
         />
         <MainPanel children={children} onClick={onClick} onKeyPress={onKeyPress}/>
      </div>
  );
}
