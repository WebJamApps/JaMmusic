
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';


export class AppTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.close = this.close.bind(this);
  }

  close() {
    console.log('close');
  }

  showTT(selector) {
    console.log(selector);
  }

  hideTT(selector) {
    console.log(selector);
  }

  toggleMobileMenu() {
    console.log('somehting american');
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

  componentDidMount() {
    console.log(this.props);
  }

  render() {
    return (
      <div className="page-host">
        <div className={`${this.currentStyles.sidebarClass} drawer-container`} style={{ display: 'none' }}>
          <div className="drawer" style={{ backgroundColor: '#c0c0c0' }}>
            <div className="navImage">
              <img
                alt="wjsidelogo"
                id="webjamwidelogo"
                src={`${this.currentStyles.sidebarImagePath}`}
                style={{ width: '182px', marginRight: 0 }}
                bind="Menu !== 'charity' && Menu !== 'volunteer' && Menu !== 'ohaf' && role !== 'Charity' && role !=='Volunteer'"
              />
              <img
                alt="ohafwidelogo"
                id="ohafbutterflies"
                src={`${this.currentStyles.sidebarImagePath}`}
                style={{ width: '182px', marginRight: 0, marginTop: '-4px' }}
                bind="Menu === 'charity' || Menu === 'volunteer' || Menu === 'ohaf' || role === 'Charity' || role ==='Volunteer'"
              />
            </div>

            <div
              bind="!fullmenu && (Menu !== 'charity' && Menu !== 'volunteer' && Menu !== 'ohaf' && role !== 'Charity' && role !=='Volunteer')"
              style={{ backgroundColor: '#2a222a', width: '50px', height: '91px' }}
              className="navImage"
            />

            <div
              bind="!fullmenu && (Menu === 'charity' || Menu === 'volunteer' || Menu === 'ohaf' || role === 'Charity' || role ==='Volunteer')"
              style={{ backgroundColor: '#565656', width: '50px', height: '91px' }}
              className="navImage"
            />

            <div
              bind="!fullmenu"
              className={`material-header ${this.currentStyles.headerClass}`}
              style={{ width: '63px', height: '91px' }}
            />

            <div className="nav-list">

              <p bind="fullmenu" style={{ fontSize: '1px' }}> &nbsp; </p>

              <div id="musTT" style={{ display: 'none', position: 'absolute', top: '305px', right: '68px', backgroundColor: 'white', padding: '3px' }}> Music </div>
              <div className="menu-item">
                <Link to="/" className="nav-link" onClick={this.close}>
                  <span onMouseOver={ this.showTT('musTT') } onMouseOut={this.hideTT('musTT')} className="fa fa-music"/>
                  { this.props.fullMenu && <span className="nav-item">Music</span> }
                </Link>
              </div>
              <div className="menu-item">
                <Link to="/buymusic" className="nav-link" onClick={this.close}>
                  <span className="fa fa-money"/>
                  <span className="nav-item" bind="fullmenu">Buy Music</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="main-panel">
          <i
            onClick={ this.toggleMobileMenu }
            id="mobilemenutoggle"
            className="fa fa-bars pull-right fa-1.5x mobile-menu-toggle"
            aria-hidden="true"
            bind="!widescreen"
          />

          <div className="mainPanel">
            <div className="swipe-area"/>
            <div className={`material-header ${this.currentStyles.headerClass}`}>

              <div
                bind="Menu !== 'charity' && Menu !== 'volunteer' && Menu !== 'ohaf' && role !== 'Charity' && role !=='Volunteer'"
                className="headercontent">
                <img alt="ohafHeader" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
              </div>

              <div
                id="ohaflogo"
                bind="Menu === 'charity' || Menu === 'volunteer' || Menu === 'ohaf' || role === 'Charity' || role ==='Volunteer'"
                className="headercontent"
                style={{ top: '-23px', left: '3px' }}>
                <img alt="ohaflogo" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
              </div>

              <div
                className={`headercontent ${this.currentStyles.headerClass} header-text-card`}
                style={{ top: '7px', height: '10px', bottom: 0 }}
                bind="Menu !== 'charity' && Menu !== 'volunteer' && Menu !== 'ohaf' && role !== 'Charity' && role !=='Volunteer'">
                <h3 className="header-text">
                  {this.currentStyles.headerText1}
                </h3>
              </div>

              <div
                className={`headercontent ${this.currentStyles.headerClass} header-text-card`}
                style={{ top: '7px', height: '81px', paddingLeft: '2px' }}
                bind="Menu === 'charity' || Menu === 'volunteer' || Menu === 'ohaf' || role === 'Charity' || role ==='Volunteer'">
                <h3 className="header-text" style={{ marginTop: 0 }}>
                  {this.currentStyles.headerText1}
                  <br/> {this.currentStyles.headerText2}
                  <br/> {this.currentStyles.headerText3}
                </h3>
              </div>

            </div>

            <div style={{ width: 'auto' }} className="content-block">

              { this.props.children }

              <div id="wjfooter" className="footer"/>
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
