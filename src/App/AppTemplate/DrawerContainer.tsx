import { NavLinks } from './NavLinks';

interface IdrawerContainerProps {
  handleKeyPress: (arg0: any) => void, className: any, userCount?: number,
  heartBeat?: string, handleClose: () => void
}
export function DrawerContainer(props: IdrawerContainerProps) {
  const {
    userCount, heartBeat, className, handleClose, handleKeyPress,
  } = props;
  return (
    // Click/Escape-to-close conveniences only — the drawer wrapper is not a
    // widget itself (its nav links are the interactive controls; a
    // role="button" wrapper violates axe nested-interactive). Escape key
    // events bubble up here from the focused links inside.
    <div role="presentation" id="sidebar" onClick={handleClose} onKeyPress={handleKeyPress} className={className}>
      <div
        className="drawer"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div className="navImage">
          <img
            alt="wjsidelogo"
            id="webjamwidelogo"
            src="/imgs/webjamlogo1.png"
            style={{ width: '182px', marginRight: 0, marginLeft: 0 }}
          />
        </div>
        <NavLinks
          handleClose={handleClose}
          userCount={userCount}
          heartBeat={heartBeat}
        />
      </div>
    </div>
  );
}
