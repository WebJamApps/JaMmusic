/* eslint-disable react/sort-comp */
import React, { Dispatch } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Auth } from '../../redux/mapStoreToProps';
import mapStoreToATemplateProps from '../../redux/mapStoreToAppTemplateProps';
import appTemplateUtils from './appTemplateUtils';
import Footer from '../Footer';
import MenuUtils from '../menuUtils';
import MenuItems, { ImenuItem } from '../menuItems';

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

  menuUtils = MenuUtils;

  menuItems = MenuItems;

  utils = appTemplateUtils;

  constructor(props: AppTemplateProps) {
    super(props);
    this.state = { menuOpen: false };
    this.close = this.close.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyMenu = this.handleKeyMenu.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.navLinks = this.navLinks.bind(this);
  }

  handleKeyPress(e: { key: string; }): (void | null) {
    if (e.key === 'Escape') return this.setState({ menuOpen: false });
    return null;
  }

  handleKeyMenu(e: { key: string; }): (void | null) {
    if (e.key === 'Enter') return this.toggleMobileMenu();
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

  toggleMobileMenu(): void {
    const { menuOpen } = this.state;
    const mO = !menuOpen;
    this.setState({ menuOpen: mO });
  }

  close(): boolean {
    this.setState({ menuOpen: false });
    return true;
  }

  makeLink(menu: ImenuItem, index: number, type: string): JSX.Element {
    return (
      <div key={index} className="menu-item">
        {type === 'Link' ? (
          <Link to={menu.link} className="nav-link" onClick={this.close}>
            {this.menuUtils.makeIconAndText(menu)}
          </Link>
        )
          : (
            <a href={menu.link} className="nav-link" onClick={this.close}>
              {this.menuUtils.makeIconAndText(menu)}
            </a>
          )}
      </div>
    );
  }

  makeMenuLink(menu: ImenuItem, index: number): JSX.Element {
    return this.makeLink(menu, index, 'Link');
  }

  makeExternalLink(menu: ImenuItem, index: number): JSX.Element {
    return this.makeLink(menu, index, 'a');
  }

  navLinks(): JSX.Element {
    const { userCount, heartBeat } = this.props;
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
        {process.env.APP_NAME !== 'joshandmariamusic.com' ? this.menuItems.wjNav.map((menu, index) => (this.menuUtils.menuItem(menu, index, this)))
          : this.menuItems.jamNav.map((menu, index) => (this.makeExternalLink(menu, index)))}
        <p style={{ margin: 0, padding: 0, fontSize: '6pt' }}>&nbsp;</p>
        {process.env.APP_NAME !== 'joshandmariamusic.com' ? this.utils.activeUsers(heartBeat, userCount) : null}
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
      <div tabIndex={0} role="button" id="sidebar" onClick={this.close} onKeyPress={this.handleKeyPress}
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

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
