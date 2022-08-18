import type { Dispatch } from 'react';
import menuConfig from './menuConfig';
import { MakeLink, SideMenuItem } from './SideMenuItem';

export function ActiveUsers({ heartBeat, userCount }: { heartBeat: string, userCount: number }) {
  return (
            <div className="active-users">
              <div>
                <button
                  type="button"
                  style={{
                    cursor: 'none', marginLeft: '10px', height: '20px', width: '20px', marginTop: '10px', backgroundColor: heartBeat,
                  }}
                >
                  {' '}
                </button>
              </div>
              <div className="active-users-text" style={{ paddingLeft: '10px', marginTop: '8px' }}>
                <i>Active Users</i>
                :
                {' '}
                {userCount}
              </div>
            </div>
  );
}

interface InavLinksProps {
  userCount:number, heartBeat:any, auth:any, location:any, setState:(arg0:any)=>void, dispatch:Dispatch<unknown>
}
export function NavLinks(props: InavLinksProps) {
  const { userCount, heartBeat, auth, location, setState, dispatch } = props;
  return (
        <div className="nav-list" style={{ width: '180px' }}>
            {process.env.APP_NAME !== 'joshandmariamusic.com'
              ? (
                    <div
                        id="musTT"
                        style={{
                          display: 'none', position: 'absolute', top: '305px', right: '68px', backgroundColor: 'white',
                          padding: '3px',
                        }}
                    >
                        Music
                    </div>
              ) : null}
            {process.env.APP_NAME !== 'joshandmariamusic.com' ? menuConfig.wjNav.map(
              (menu, index) => <SideMenuItem
                    key={index} menu={menu} index={index}
                    auth={auth} location={location} setState={setState} dispatch={dispatch}
                />,
            )
              : menuConfig.jamNav.map((menu, index) => {
                return <MakeLink menu={menu} index={index} type="a" setState={setState}/>;
              })
            }
            <p style={{ margin: 0, padding: 0, fontSize: '6pt' }}>&nbsp;</p>
            {process.env.APP_NAME !== 'joshandmariamusic.com' ? <ActiveUsers heartBeat={heartBeat} userCount={userCount}/> : null}
        </div>
  );
}
