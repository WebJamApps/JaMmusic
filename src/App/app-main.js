import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import authUtils from './authUtils';
import mapStoreToProps from '../redux/mapStoreToAllProps';
import appMainUtils from './appMainUtils';
import Footer from './Footer';
import menuUtils from './menuUtils';

export class AppTemplate extends Component {
  constructor(props) {
    super(props);
    this.menuUtils = menuUtils;
    this.children = props.children;
    this.state = { menuOpen: false };// eslint-disable-line
    this.close = this.close.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyMenu = this.handleKeyMenu.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.navLinks = this.navLinks.bind(this);
    this.responseGoogleLogin = this.responseGoogleLogin.bind(this);
    this.responseGoogleLogout = this.responseGoogleLogout.bind(this);
    this.googleButtons = this.googleButtons.bind(this);
    this.authUtils = authUtils;
    this.appMainUtils = appMainUtils;
  }

  get currentStyles() {
    let result = {};
    this.style = 'wj';
    result = {
      headerImagePath: '../static/imgs/webjamicon7.png',
      headerText1: 'Web Jam LLC',
      headerClass: 'home-header',
      headerImageClass: 'home-header-image',
      sidebarClass: 'home-sidebar',
      menuToggleClass: 'home-menu-toggle',
    };
    result.sidebarImagePath = '../static/imgs/webjamlogo1.png';
    return result;
  }

  get menus() { // eslint-disable-line class-methods-use-this
    return [
      {
        className: '', type: 'link', iconClass: 'fas fa-music', link: '/music', name: 'Music',
      },
      {
        className: '', type: 'link', iconClass: 'far fa-money-bill-alt', link: '/music/buymusic', name: 'Buy Music',
      },
      {
        className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: '/music/originals', name: 'Songs',
      },
      {
        className: 'dashboard', type: 'link', iconClass: 'fas fa-user-secret', link: '/music/dashboard', name: 'Dashboard',
      },
      {
        className: 'shop', type: 'link', iconClass: 'fas fa-shopping-cart', link: '/shop', name: 'Web Jam Shop',
      },
      {
        className: 'home', type: 'link', iconClass: 'fas fa-home', link: '/', name: 'Web Jam LLC',
      },
      {
        className: 'login', type: 'googleLogin', iconClass: 'fas fa-login', link: '', name: 'Login',
      },
      {
        className: 'logout', type: 'googleLogout', iconClass: 'fas fa-logout', link: '', name: 'Logout', auth: true,
      },
    ];
  }

  toggleMobileMenu() {
    const { menuOpen } = this.state;
    const mO = !menuOpen;
    this.setState({ menuOpen: mO });
  }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogin(response) { return this.authUtils.responseGoogleLogin(response, this); }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogout(response) { return this.authUtils.responseGoogleLogout(response, this.props.dispatch); }

  close(e) {
    this.setState({ menuOpen: false });
    if (e.target.classList.contains('loginGoogle')) return this.loginGoogle();
    return true;
  }

  handleKeyPress(e) {
    if (e.key === 'Escape') return this.setState({ menuOpen: false });
    return null;
  }

  handleKeyMenu(e) {
    if (e.key === 'Enter') return this.toggleMobileMenu();
    return null;
  }

  googleButtons(type, index) {
    const cId = process.env.GoogleClientId;
    if (type === 'login') {
      return (
        <div key={index} className="menu-item googleLogin">
          <GoogleLogin
            responseType="code"
            clientId={cId}
            buttonText="Login"
            onSuccess={this.responseGoogleLogin}
            onFailure={this.authUtils.responseGoogleFailLogin}
            cookiePolicy="single_host_origin"
          />
        </div>
      );
    } return (
      <div key={index} className="menu-item googleLogout">
        <GoogleLogout clientId={cId} buttonText="Logout" onLogoutSuccess={this.responseGoogleLogout} cookiePolicy="single_host_origin" />
      </div>
    );
  }

  makeMenuLink(menu, index) {
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

  navLinks() {
    const { userCount, heartBeat } = this.props;
    return (
      <div className="nav-list">
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
        {this.appMainUtils.activeUsers(heartBeat, userCount)}
      </div>
    );
  }

  headerSection() {
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

  render() {
    const { menuOpen } = this.state;
    const style = `${this.currentStyles.sidebarClass} ${menuOpen ? 'open' : 'close'}`;

    return (
      <div className="page-host">
        <div tabIndex={0} role="button" id="sidebar" onClick={this.close} onKeyPress={this.handleKeyPress} className={`${style} drawer-container`}>
          <div className="drawer" style={{ backgroundColor: '#c0c0c0' }}>
            <div className="navImage">
              <img alt="wjsidelogo" id="webjamwidelogo" src={`${this.currentStyles.sidebarImagePath}`} style={{ width: '182px', marginRight: 0 }} />
            </div>
            { this.navLinks() }
          </div>
        </div>
        <div className="main-panel">
          <span onClick={this.toggleMobileMenu} onKeyPress={this.handleKeyMenu} id="mobilemenutoggle" tabIndex={0} role="button">
            <i className="fas fa-bars" />
          </span>
          <div className="mainPanel">
            <div className="swipe-area" />
            {this.headerSection()}
            <div style={{ width: 'auto' }} id="contentBlock" className="content-block">
              { this.children }
              <Footer />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
/* istanbul ignore next */
AppTemplate.defaultProps = {
  dispatch: () => {}, auth: { isAuthenticated: false, user: { userType: '' } }, userCount: 0, heartBeat: 'white',
};

AppTemplate.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  heartBeat: PropTypes.string,
  userCount: PropTypes.number,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    user: PropTypes.shape({ userType: PropTypes.string }),
  }),
  dispatch: PropTypes.func,
  children: PropTypes.element.isRequired,
};
export default withRouter(connect(mapStoreToProps, null)(AppTemplate));
