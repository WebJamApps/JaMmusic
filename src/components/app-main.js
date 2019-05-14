import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import throttle from '../commons/utils';
import authUtils from './AppTemplate/authUtils';

export class AppTemplate extends Component {
  constructor(props) {
    super(props);
    this.children = props.children;
    this.state = { menuOpen: false };
    this.close = this.close.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyMenu = this.handleKeyMenu.bind(this);
    this.dispatchWindowResize = this.dispatchWindowResize.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.changeNav = this.changeNav.bind(this);
    this.footerLinks = this.footerLinks.bind(this);
    this.navLinks = this.navLinks.bind(this);
    this.responseGoogleLogin = this.responseGoogleLogin.bind(this);
    this.responseGoogleLogout = this.responseGoogleLogout.bind(this);
    this.googleButtons = this.googleButtons.bind(this);
    this.authUtils = authUtils;
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.dispatchWindowResize, 100, { leading: false }), false);
    const username = localStorage.getItem('username');
    if (typeof username === 'string') {
      document.getElementsByClassName('googleLogin')[0].style.display = 'none';
      document.getElementsByClassName('googleLogout')[0].style.display = 'block';
    }
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
        className: 'originals', type: 'link', iconClass: 'far fa-lightbulb', link: '/music/originals', name: 'Originals',
      },
      {
        className: 'mission', type: 'button', iconClass: 'fas fa-crosshairs', link: '', name: 'Mission Music',
      },
      {
        className: 'pub', type: 'button', iconClass: 'fas fa-beer', link: '', name: 'Pub Songs',
      },
      {
        className: 'home', type: 'button', iconClass: 'fas fa-home', link: '', name: 'Web Jam LLC',
      },
      {
        className: 'login', type: 'googleLogin', iconClass: 'fas fa-login', link: '', name: 'Login',
      },
      {
        className: 'logout', type: 'googleLogout', iconClass: 'fas fa-logout', link: '', name: 'Logout',
      },
    ];
  }

  toggleMobileMenu() {
    const { menuOpen } = this.state;
    const mO = !menuOpen;
    this.setState({ menuOpen: mO });
  }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogin(response) { return this.authUtils.responseGoogleLogin(response, this.props.dispatch); }

  // eslint-disable-next-line react/destructuring-assignment
  responseGoogleLogout(response) { return this.authUtils.responseGoogleLogout(response, this.props.dispatch); }

  close(e) {
    this.setState({ menuOpen: false });
    if (e.target.classList.contains('out-link')) return this.changeNav(e.target.classList[1]);
    if (e.target.classList.contains('loginGoogle')) return this.loginGoogle();
    return true;
  }

  dispatchWindowResize() { // eslint-disable-line class-methods-use-this
    console.log(window.innerWidth);// eslint-disable-line no-console
  }

  changeNav(where) { // eslint-disable-line class-methods-use-this
    let subpath = '/wj-music/';
    if (where === 'home') subpath = '/';
    return window.location.assign(`${process.env.BackendUrl}${subpath}${where}`);
  }

  handleKeyPress(e) { // eslint-disable-line class-methods-use-this
    if (e.key === 'Escape') this.setState({ menuOpen: false });
  }

  handleKeyMenu(e) { // eslint-disable-line class-methods-use-this
    if (e.key === 'Enter') this.toggleMobileMenu();
  }

  googleButtons(type, index) {
    if (type === 'login') {
      return (
        <div key={index} className="menu-item googleLogin">
          <GoogleLogin
            responseType="code"
            clientId={process.env.GoogleClientId}
            buttonText="Login"
            onSuccess={this.responseGoogleLogin}
            onFailure={this.authUtils.responseGoogleFailLogin}
            cookiePolicy="single_host_origin"
          />
        </div>
      );
    } return (
      <div key={index} className="menu-item googleLogout" style={{ display: 'none' }}>
        <GoogleLogout
          clientId={process.env.GoogleClientId}
          buttonText="Logout"
          onLogoutSuccess={this.responseGoogleLogout}
          cookiePolicy="single_host_origin"
        />
      </div>
    );
  }

  menuItem(menu, index) {
    if (menu.type === 'link') {
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
    if (menu.type === 'googleLogin') return this.googleButtons('login', index);
    if (menu.type === 'googleLogout') return this.googleButtons('logout', index);
    return (
      <div key={index} className="menu-item">
        <button type="button" className={`nav-link ${menu.className} loginGoogle`} onClick={this.close}>
          <i className={`${menu.iconClass}`} />
          &nbsp;
          <span className={`nav-item ${menu.className} out-link`}>{menu.name}</span>
        </button>
      </div>
    );
  }

  navLinks() {
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
        {this.menus.map((menu, index) => (
          this.menuItem(menu, index)
        ))}
      </div>
    );
  }

  footerLinks() { // eslint-disable-line class-methods-use-this
    const color = '#c09580';
    const links = [
      { href: 'https://github.com/WebJamApps', name: 'github' },
      { href: 'https://www.linkedin.com/company/webjam/', name: 'linkedin' },
      { href: 'https://www.instagram.com/joshua.v.sherman/', name: 'instagram' },
      { href: 'https://twitter.com/WebJamLLC', name: 'twitter' },
      { href: 'https://www.facebook.com/WebJamLLC/', name: 'facebook' },
    ];
    return (
      <div style={{ textAlign: 'center', padding: '6px' }}>
        {
          links.map(link => (
            <a key={Math.random().toString()} target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href={link.href}>
              <span>
                <i className={`fab fa-${link.name}`} />
              </span>
            </a>
          ))
        }
        <p style={{ color: 'white', fontSize: '9pt', marginBottom: 0 }}>
          Powered by
          {' '}
          <a className="wjllc" target="_blank" rel="noopener noreferrer" href="https://www.web-jam.com">Web Jam LLC</a>
        </p>
      </div>
    );
  }

  render() {
    const { menuOpen } = this.state;
    const style = `${this.currentStyles.sidebarClass} ${menuOpen ? 'open' : 'close'}`;
    return (
      <div className="page-host">
        <div tabIndex={0} role="button" onClick={this.close} onKeyPress={this.handleKeyPress} className={`${style} drawer-container`}>
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
            <div className={`material-header ${this.currentStyles.headerClass}`}>
              <div id="ohaflogo" className="headercontent">
                <img alt="ohaflogo" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
              </div>
              <div className="headercontent header-text-card">
                <h3 className="header-text" style={{ marginTop: 0 }}>
                  {this.currentStyles.headerText1}
                </h3>
              </div>
            </div>
            <div style={{ width: 'auto' }} className="content-block">
              { this.children }
              <div id="wjfooter" className="footer" style={{ backgroundColor: '#565656' }}>
                { this.footerLinks() }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

AppTemplate.defaultProps = {
  dispatch: () => {},
  auth: { isAuthenticated: false },
};

AppTemplate.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
  }),
  dispatch: PropTypes.func,
  children: PropTypes.element.isRequired,
};

const mapStoreToProps = store => ({ auth: store.auth });

export default connect(mapStoreToProps)(AppTemplate);
