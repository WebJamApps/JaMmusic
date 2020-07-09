import React, { Dispatch } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline,
} from 'react-google-login';
import { connect } from 'react-redux';
import { Auth } from '../redux/mapStoreToProps';
import authUtils, { IauthUtils } from './authUtils';
import mapStoreToProps from '../redux/mapStoreToAllProps';
import appTemplateUtils from './appTemplateUtils';
import Footer from './Footer';
import menuUtils, { ImenuUtils } from './menuUtils';
import menuItems, { ImenuItem } from './menuItems';
import authActions from './authActions';

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
export class AppTemplate extends React.Component<AppTemplateProps, AppMainState> {
  static defaultProps = {
    dispatch: /* istanbul ignore next */(): void => { },
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
    userCount: 0,
    heartBeat: 'white',
  };

  menuUtils: ImenuUtils;

  authUtils: IauthUtils;

  appTemplateUtils: { activeUsers: (arg0: string, arg1: number) => React.ReactNode };

  menus: ImenuItem[];

  authenticate: typeof authActions;

  constructor(props: AppTemplateProps) {
    super(props);
    this.menuUtils = menuUtils;
    this.state = { menuOpen: false };
    this.close = this.close.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyMenu = this.handleKeyMenu.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.navLinks = this.navLinks.bind(this);
    this.responseGoogleLogin = this.responseGoogleLogin.bind(this);
    this.responseGoogleLogout = this.responseGoogleLogout.bind(this);
    this.googleButtons = this.googleButtons.bind(this);
    this.authUtils = authUtils;
    this.appTemplateUtils = appTemplateUtils;
    this.menus = menuItems;
    this.authenticate = authActions;
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

  toggleMobileMenu(): void {
    const { menuOpen } = this.state;
    const mO = !menuOpen;
    this.setState({ menuOpen: mO });
  }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogin(response: GoogleLoginResponseOffline | GoogleLoginResponse): Promise<string> {
    return this.authUtils.responseGoogleLogin(response, this);
  }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogout(): boolean { return this.authUtils.responseGoogleLogout(this.props.dispatch); }

  close(): boolean {
    this.setState({ menuOpen: false });
    return true;
  }

  handleKeyPress(e: { key: string; }): (void | null) {
    if (e.key === 'Escape') return this.setState({ menuOpen: false });
    return null;
  }

  handleKeyMenu(e: { key: string; }): (void | null) {
    if (e.key === 'Enter') return this.toggleMobileMenu();
    return null;
  }

  googleButtons(type: string, index: number): JSX.Element {
    const cId = process.env.GoogleClientId || /* istanbul ignore next */'';
    if (type === 'login') {
      return (
        <div key={index} className="menu-item googleLogin">
          <GoogleLogin
            // eslint-disable-next-line no-console
            onAutoLoadFinished={(good) => { console.log(good); return good; }}
            responseType="code"
            clientId={cId}
            buttonText="Login"
            accessType="offline"
            onSuccess={this.responseGoogleLogin}
            onFailure={this.authUtils.responseGoogleFailLogin}
            cookiePolicy="single_host_origin"
          />
        </div>
      );
    } return (
      <div key={index} className="menu-item googleLogout">
        <GoogleLogout clientId={cId} buttonText="Logout" onLogoutSuccess={this.responseGoogleLogout} />
      </div>
    );
  }

  makeMenuLink(menu: ImenuItem, index: number): JSX.Element {
    return (
      <div key={index} className="menu-item">
        <Link to={menu.link} className="nav-link" onClick={this.close}>
          <i className={`${menu.iconClass}`} />
          &nbsp;
          <span className="nav-item">{menu.name}</span>
        </Link>
      </div>
    );
  }

  navLinks(): JSX.Element {
    const { userCount, heartBeat } = this.props;
    return (
      <div className="nav-list" style={{ width: '180px' }}>
        <div
          id="musTT"
          style={{
            display: 'none', position: 'absolute', top: '305px', right: '68px', backgroundColor: 'white', padding: '3px',
          }}
        >
          Music
        </div>
        {this.menus.map((menu, index) => (this.menuUtils.menuItem(menu, index, this)))}
        <p style={{ margin: 0, padding: 0, fontSize: '6pt' }}>&nbsp;</p>
        {this.appTemplateUtils.activeUsers(heartBeat, userCount)}
      </div>
    );
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
    return (
      <div tabIndex={0} role="button" id="sidebar" onClick={this.close} onKeyPress={this.handleKeyPress} className={`${style} drawer-container`}>
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
          {this.navLinks()}
        </div>
      </div>
    );
  }

  render(): JSX.Element {
    const { menuOpen } = this.state;
    const { children } = this.props;
    const style = `${this.currentStyles.sidebarClass} ${menuOpen ? 'open' : 'close'}`;
    return (
      <div className="page-host">
        {this.drawerContainer(style)}
        <div className="main-panel">
          <span onClick={this.toggleMobileMenu} onKeyPress={this.handleKeyMenu} id="mobilemenutoggle" tabIndex={0} role="button">
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

export default withRouter(connect(mapStoreToProps, null)(AppTemplate));
