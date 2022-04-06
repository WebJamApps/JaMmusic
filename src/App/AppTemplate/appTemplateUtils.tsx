import { Link } from 'react-router-dom';
import type { AppTemplate } from '.';
import type { ImenuItem } from './menuConfig';
import { IconAndText } from './MenuItem';

const activeUsers = (heartBeat: string, userCount: number): JSX.Element => (
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

const makeLink = (menu: ImenuItem, index: number, type: string, view: AppTemplate): JSX.Element => {
  return (
    <div key={index} className="menu-item">
      {type === 'Link' ? (
        <Link to={menu.link} className="nav-link" onClick={view.close}>
          <IconAndText menu={menu}/>
        </Link>
      )
        : (
          <a href={menu.link} className="nav-link" onClick={view.close}>
            <IconAndText menu={menu}/>
          </a>
        )}
    </div>
  );
};

export default { activeUsers, makeLink };
