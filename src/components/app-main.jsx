
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { throttle } from '../commons/utils';


export class AppTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
    this.close = this.close.bind(this);
    this.dispatchWindowResize = this.dispatchWindowResize.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
  }

  close(e) {
    const menuOpen = false;
    if (!e.target.classList.contains('nav-list')) {
      this.setState({ menuOpen });
    }
  }

  toggleMobileMenu() {
    const menuOpen = !this.state.menuOpen;
    this.setState({ menuOpen });
  }

  get currentStyles() {
    let result = {};
    this.style = 'wj';
    if (['charity', 'ohaf', 'volunteer'].includes(this.props.menu) || ['Charity', 'Volunteer'].includes(this.props.role)) {
      this.style = 'ohaf';
      result = {
        headerImagePath: '../static/imgs/ohaf/charitylogo.png',
        headerText1: 'Our',
        headerText2: 'Hands And',
        headerText3: 'Feet',
        headerClass: 'ohaf-header',
        headerImageClass: 'ohaf-header-image',
        sidebarClass: 'ohaf-sidebar',
        menuToggleClass: 'ohaf-menu-toggle'
      };
      result.sidebarImagePath = '../static/imgs/ohaf/butterfly.png';
    } else {
      result = {
        headerImagePath: '../static/imgs/webjamicon7.png',
        headerText1: 'Web Jam LLC',
        headerClass: 'home-header',
        headerImageClass: 'home-header-image',
        sidebarClass: 'home-sidebar',
        menuToggleClass: 'home-menu-toggle'
      };
      result.sidebarImagePath = '../static/imgs/webjamlogo1.png';
    }
    return result;
  }

  dispatchWindowResize() {
    console.log(window.innerWidth);//eslint-disable-line no-console
  }

  componentDidMount() {
    window.addEventListener('resize', throttle(this.dispatchWindowResize, 100, { leading: false }), false);
  }

  render() {
    const color = '#c09580';
    return (
      <div className="page-host">
        <div onClick={ this.close } className={`${this.currentStyles.sidebarClass} ${this.state.menuOpen ? 'open' : 'close'} drawer-container`}>
          <div className="drawer" style={{ backgroundColor: '#c0c0c0' }}>
            <div className="navImage">
              {
                ['charity', 'volunteer', 'ohaf'].includes(this.props.menu) && ['Volunteer', 'Charity'].includes(this.props.role)
                  ? <img
                    alt="wjsidelogo"
                    id="webjamwidelogo"
                    src={`${this.currentStyles.sidebarImagePath}`}
                    style={{ width: '182px', marginRight: 0 }}
                  />
                  : <img
                    alt="ohafwidelogo"
                    id="ohafbutterflies"
                    src={`${this.currentStyles.sidebarImagePath}`}
                    style={{ width: '183px', marginRight: 0, marginTop: 0 }}
                  />
              }
            </div>

            <div className="nav-list">
              <div id="musTT" style={{ display: 'none', position: 'absolute', top: '305px', right: '68px', backgroundColor: 'white', padding: '3px' }}> Music </div>
              <div className="menu-item">
                <Link to="/music" className="nav-link" onClick={this.close}>
                  <i onMouseOver={ this.showTT } onMouseOut={this.hideTT} className="fas fa-music"/>&nbsp;
                  <span className="nav-item">Music</span>
                </Link>
              </div>
              <div className="menu-item">
                <Link to="/music/buymusic" className="nav-link" onClick={this.close}>
                  <i className="far fa-money-bill-alt"/>&nbsp;
                  <span className="nav-item">Buy Music</span>
                </Link>
              </div>
              <div className="menu-item">
                <a rel="noopener noreferrer" target="_blank" href="http://web-jam.com/music/originals" className="nav-link" onClick={this.close}>
                  <i className="far fa-lightbulb"/>&nbsp;
                  <span className="nav-item">Originals</span>
                </a>
              </div>
              <div className="menu-item">
                <a rel="noopener noreferrer" target="_blank" href="http://web-jam.com/music/mission" className="nav-link" onClick={this.close}>
                  <i className="fas fa-crosshairs"/>&nbsp;
                  <span className="nav-item">Mission Music</span>
                </a>
              </div>
              <div className="menu-item">
                <a rel="noopener noreferrer" target="_blank" href="http://web-jam.com/music/pub" className="nav-link" onClick={this.close}>
                  <i className="fas fa-beer"/>&nbsp;
                  <span className="nav-item">Pub Songs</span>
                </a>
              </div>
              <div className="menu-item">
                <a rel="noopener noreferrer" target="_blank" href="http://web-jam.com" className="nav-link" onClick={this.close}>
                  <i className="fas fa-home"/>&nbsp;
                  <span className="nav-item">Web Jam LLC</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="main-panel">
          <span onClick={ this.toggleMobileMenu } id="mobilemenutoggle">
            <i className="fas fa-bars"/>
          </span>

          <div className="mainPanel">
            <div className="swipe-area"/>
            <div className={`material-header ${this.currentStyles.headerClass}`}>

              {
                ['charity', 'volunteer', 'ohaf'].includes(this.props.menu) && ['Volunteer', 'Charity'].includes(this.props.role)
                  ? <div className="headercontent">
                    <img alt="ohafHeader" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
                  </div>
                  : <div id="ohaflogo" className="headercontent">
                    <img alt="ohaflogo" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
                  </div>
              }
              {
                ['charity', 'volunteer', 'ohaf'].includes(this.props.menu) && ['Volunteer', 'Charity'].includes(this.props.role)
                  ? <div className="headercontent header-text-card">
                    <h3 className="header-text">
                      {this.currentStyles.headerText1}
                      <br/> {this.currentStyles.headerText2}
                      <br/> {this.currentStyles.headerText3}
                    </h3>
                  </div>
                  : <div className="headercontent header-text-card">
                    <h3 className="header-text" style={{ marginTop: 0 }}>
                      {this.currentStyles.headerText1}
                    </h3>
                  </div>
              }

            </div>

            <div style={{ width: 'auto' }} className="content-block">

              { this.props.children }

              <div id="wjfooter" className="footer" style={{ backgroundColor: '#565656' }}>
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
                  <a target="_blank" rel="noopener noreferrer" style={{ color, paddingRight: '5px' }} href="https://www.instagram.com/joshua.v.sherman/">
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
                    Powered by <a className="wjllc" target="_blank" rel="noopener noreferrer" href="https://www.web-jam.com">Web Jam LLC</a>
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  ...state
});

export default connect(mapStateToProps)(AppTemplate);
