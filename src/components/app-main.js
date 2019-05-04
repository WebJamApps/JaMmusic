import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import throttle from '../commons/utils';

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
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.dispatchWindowResize, 100, { leading: false }), false);
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
      menuToggleClass: 'home-menu-toggle'
    };
    result.sidebarImagePath = '../static/imgs/webjamlogo1.png';
    return result;
  }

  toggleMobileMenu() {
    const { menuOpen } = this.state;
    const mO = !menuOpen;
    this.setState({ menuOpen: mO });
  }

  close(e) {
    this.setState({ menuOpen: false });
    if (e.target.classList.contains('out-link')) return this.changeNav(e.target.classList[1]);
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

  navLinks() {
    return (
      <div className="nav-list">
        <div
          id="musTT"
          style={{
            display: 'none', position: 'absolute', top: '305px', right: '68px', backgroundColor: 'white', padding: '3px'
          }}
        >
          Music
        </div>
        <div className="menu-item">
          <Link to="/music" className="nav-link" onClick={this.close}>
            <i className="fas fa-music" />
            &nbsp;
            <span className="nav-item">Music</span>
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/music/buymusic" className="nav-link" onClick={this.close}>
            <i className="far fa-money-bill-alt" />
            &nbsp;
            <span className="nav-item">Buy Music</span>
          </Link>
        </div>
        <div className="menu-item">
          <button type="button" className="nav-link originals out-link" onClick={this.close}>
            <i className="far fa-lightbulb" />
            &nbsp;
            <span className="nav-item originals out-link">Originals</span>
          </button>
        </div>
        <div className="menu-item">
          <button type="button" className="nav-link mission out-link" onClick={this.close}>
            <i className="fas fa-crosshairs" />
            &nbsp;
            <span className="nav-item mission out-link">Mission Music</span>
          </button>
        </div>
        <div className="menu-item">
          <button type="button" className="nav-link pub out-link" onClick={this.close}>
            <i className="fas fa-beer" />
            &nbsp;
            <span className="nav-item pub out-link">Pub Songs</span>
          </button>
        </div>
        <div className="menu-item">
          <button type="button" className="nav-link home out-link" onClick={this.close}>
            <i className="fas fa-home" />
            &nbsp;
            <span className="nav-item home out-link">Web Jam LLC</span>
          </button>
        </div>
      </div>
    );
  }

  footerLinks() { // eslint-disable-line class-methods-use-this
    const color = '#c09580';
    return (
      <div style={{ textAlign: 'center', padding: '6px' }}>
        <a target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href="https://github.com/WebJamApps">
          <span>
            <i className="fab fa-github" />
          </span>
        </a>
        <a target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href="https://www.linkedin.com/company/webjam/">
          <span>
            <i className="fab fa-linkedin" />
          </span>
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          style={{ color, paddingRight: '5px' }}
          href="https://www.instagram.com/joshua.v.sherman/"
        >
          <span>
            <i className="fab fa-instagram" />
          </span>
        </a>
        <a target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href="https://twitter.com/WebJamLLC">
          <span>
            <i className="fab fa-twitter" />
          </span>
        </a>
        <a target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href="https://www.facebook.com/WebJamLLC/">
          <span>
            <i className="fab fa-facebook" />
          </span>
        </a>
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

AppTemplate.propTypes = {
  children: PropTypes.element.isRequired
};

const mapStateToProps = state => ({
  ...state
});

export default connect(mapStateToProps)(AppTemplate);
