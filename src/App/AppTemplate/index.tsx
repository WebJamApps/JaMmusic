/* eslint-disable react/sort-comp */
import React, { Dispatch } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Auth } from 'src/redux/mapStoreToProps';
import mapStoreToATemplateProps from 'src/redux/mapStoreToAppTemplateProps';
import { Footer } from './Footer';
//import { MenuItem } from './SideMenuItem';
import { NavLinks } from './NavLinks';

export interface AppTemplateProps extends RouteComponentProps {
  heartBeat: string;
  userCount: number;
  auth: Auth;
  dispatch: Dispatch<unknown>;
  children?: React.ReactNode;
}

interface AppMainState { menuOpen: boolean }
interface CurrentStyles {
  headerImagePath: string;
  headerText1: string;
  headerClass: string;
  headerImageClass: string;
  sidebarClass: string;
  menuToggleClass: string;
  sidebarImagePath: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultDispatch = (_arg0: Record<string, unknown>): void => { };
export class AppTemplate extends React.Component<AppTemplateProps, AppMainState> {
  static defaultProps = {
    dispatch: defaultDispatch,
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
    userCount: 0,
    heartBeat: 'white',
  };

  constructor(props: AppTemplateProps) {
    super(props);
    this.state = { menuOpen: false };
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.handleKeyMenu = this.handleKeyMenu.bind(this);
  }

  handleKeyPress(e: { key: string; }): (void | null) {
    if (e.key === 'Escape') return this.setState({ menuOpen: false });
    return null;
  }

  get currentStyles(): CurrentStyles { // eslint-disable-line class-methods-use-this
    const result = {
      headerImagePath: '../static/imgs/webjamicon7.png',
      headerText1: 'Web Jam LLC',
      headerClass: 'home-header',
      headerImageClass: 'home-header-image',
      sidebarClass: 'home-sidebar',
      menuToggleClass: 'home-menu-toggle',
      sidebarImagePath: '../static/imgs/webjamlogo1.png',
    };
    return result;
  }

  headerSection(): JSX.Element {
    return (
      <div id="header" className={`material-header ${this.currentStyles.headerClass}`}>
        <div id="ohaflogo" className="headercontent">
          <img alt="ohaflogo" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
        </div>
        <div className="headercontent header-text-card">
          <h3 className="header-text" style={{ marginTop: 0 }}>{this.currentStyles.headerText1}</h3>
        </div>
      </div>
    );
  }

  drawerContainer(style: string): JSX.Element {
    const { userCount, heartBeat, auth, location, dispatch } = this.props;
    const handleClose = () => this.setState({ menuOpen: false });
    return (
      <div tabIndex={0} role="button" id="sidebar" onClick={()=> this.setState({ menuOpen:false })} onKeyPress={this.handleKeyPress}
        className={`${style} drawer-container`}
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
              src={`${this.currentStyles.sidebarImagePath}`}
              style={{ width: '182px', marginRight: 0, marginLeft: 0 }}
            />
          </div>
          <NavLinks 
          handleClose={handleClose} userCount={userCount} 
          heartBeat={heartBeat} auth={auth} location={location} 
          dispatch={dispatch}/>
        </div>
      </div>
    );
  }

  toggleMobileMenu(menuOpen: boolean): void {
    const mO = !menuOpen;
    console.log(mO);
    this.setState({ menuOpen: mO });
  }

  handleKeyMenu(e: { key: string; }, menuOpen: boolean): void {
    if (e.key === 'Enter') this.toggleMobileMenu(menuOpen);
  }

  render(): JSX.Element {
    const { menuOpen } = this.state;
    const { children } = this.props;
    const style = `${this.currentStyles.sidebarClass} ${menuOpen ? 'open' : 'close'}`;
    return (
      <div className="page-host">
        {this.drawerContainer(style)}
        <div className="main-panel">
          <span
            onClick={() => this.toggleMobileMenu(menuOpen)}
            onKeyPress={(evt) => this.handleKeyMenu(evt, menuOpen)}
            id="mobilemenutoggle" tabIndex={0} role="button">
              <i className="fas fa-bars" />
          </span>
          <div className="mainPanel">
            <div className="swipe-area" />
            {this.headerSection()}
            <div style={{ width: 'auto' }} id="contentBlock" className="content-block">
              {children}
              <Footer />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
