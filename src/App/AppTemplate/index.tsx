/* eslint-disable react/sort-comp */
import React, { Dispatch } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Auth } from 'src/redux/mapStoreToProps';
import mapStoreToATemplateProps from 'src/redux/mapStoreToAppTemplateProps';
import { DrawerContainer } from './DrawerContainer';
import { MainPanel } from './MainPanel';
import { PageHost } from './PageHost';

export interface AppTemplateProps extends RouteComponentProps {
  heartBeat: string;
  userCount: number;
  auth: Auth;
  dispatch: Dispatch<unknown>;
  children?: React.ReactNode;
}

// interface AppMainState { menuOpen: boolean }
// interface CurrentStyles {
//   headerImagePath: string;
//   headerText1: string;
//   headerClass: string;
//   headerImageClass: string;
//   sidebarClass: string;
//   menuToggleClass: string;
//   sidebarImagePath: string;
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultDispatch = (_arg0: Record<string, unknown>): void => { };

// export const makeDrawerClass = (menuOpen:boolean) => {
//   const className = `home-sidebar ${menuOpen ? 'open' : 'close'} drawer-container`;
//   return className;
// };

export class AppTemplate extends React.Component<AppTemplateProps> {
  static defaultProps = {
    dispatch: defaultDispatch,
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
    userCount: 0,
    heartBeat: 'white',
  };

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: AppTemplateProps) {
    super(props);
    // this.state = { menuOpen: false };
    // this.handleKeyPress = this.handleKeyPress.bind(this);
    // this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    // this.handleKeyMenu = this.handleKeyMenu.bind(this);
  }

  // get currentStyles(): CurrentStyles { // eslint-disable-line class-methods-use-this
  //   const result = {
  //     headerImagePath: '../static/imgs/webjamicon7.png',
  //     headerText1: 'Web Jam LLC',
  //     headerClass: 'home-header',
  //     headerImageClass: 'home-header-image',
  //     sidebarClass: 'home-sidebar',
  //     menuToggleClass: 'home-menu-toggle',
  //     sidebarImagePath: '../static/imgs/webjamlogo1.png',
  //   };
  //   return result;
  // }

  // headerSection(): JSX.Element {
  //   return (
  //     <div id="header" className={`material-header ${this.currentStyles.headerClass}`}>
  //       <div id="ohaflogo" className="headercontent">
  //         <img alt="ohaflogo" src={`${this.currentStyles.headerImagePath}`} className={`${this.currentStyles.headerImageClass}`} />
  //       </div>
  //       <div className="headercontent header-text-card">
  //         <h3 className="header-text" style={{ marginTop: 0 }}>{this.currentStyles.headerText1}</h3>
  //       </div>
  //     </div>
  //   );
  // }

  // toggleMobileMenu(menuOpen: boolean): void {
  //   const mO = !menuOpen;
  //   console.log(mO);
  //   this.setState({ menuOpen: mO });
  // }

  // handleKeyMenu(e: { key: string; }, menuOpen: boolean): void {
  //   if (e.key === 'Enter') this.toggleMobileMenu(menuOpen);
  // }

  // handleKeyPress(e: { key: string; }): (void) {
  //   if (e.key === 'Escape') return this.setState({ menuOpen: false });
  // }

  render(): JSX.Element {
    // const { menuOpen } = this.state;
    const { children, userCount, heartBeat, auth, location, dispatch } = this.props;
    // const handleClose  = () => this.setState({ menuOpen: false });
    // const onClick = () => this.toggleMobileMenu(menuOpen);
    // const onKeyPress = (evt:any) => this.handleKeyMenu(evt, menuOpen);
    return <PageHost  children={children} userCount={userCount} heartBeat={heartBeat} auth={auth} 
    location={location} dispatch={dispatch}
    />;
    // (
    // <div className="page-host">
    //   <DrawerContainer handleKeyPress={this.handleKeyPress} className={makeDrawerClass(menuOpen)}
    //    userCount={userCount} heartBeat={heartBeat} auth={auth} location={location} 
    //    dispatch={dispatch} handleClose={handleClose}
    //    />
    //    <MainPanel children={children} onClick={onClick} onKeyPress={onKeyPress}/>
    // </div>
    // );
  }
}

export default withRouter(connect(mapStoreToATemplateProps, null)(AppTemplate));
