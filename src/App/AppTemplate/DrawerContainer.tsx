import type { Dispatch } from 'react';
import { NavLinks } from './NavLinks';

interface IdrawerContainerProps {
  handleKeyPress: (arg0:any)=>void, className:any, userCount:number,
  heartBeat:any, auth:any, location:any, dispatch:Dispatch<unknown>, handleClose:()=>void
}
export function DrawerContainer(props:IdrawerContainerProps) {
  const {
    userCount, heartBeat, auth, location, dispatch, className, handleClose, handleKeyPress,
  } = props;
  return (
    <div
      tabIndex={0}
      role="button"
      id="sidebar"
      onClick={handleClose}
      onKeyPress={handleKeyPress}
      className={className}
    >
      <div
        className="drawer"
        style={{
          backgroundColor: '#c0c0c0', zIndex: -1, position: 'relative',
        }}
      >
        <div className="navImage">
          <img
            alt="wjsidelogo"
            id="webjamwidelogo"
            src="../static/imgs/webjamlogo1.png"
            style={{ width: '182px', marginRight: 0, marginLeft: 0 }}
          />
        </div>
        <NavLinks
          handleClose={handleClose}
          userCount={userCount}
          heartBeat={heartBeat}
          auth={auth}
          location={location}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
