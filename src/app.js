import { PLATFORM } from 'aurelia-pal';
import { inject, bindable } from 'aurelia-framework';
import { AuthorizeStep, AuthService } from 'aurelia-auth';
import { json, HttpClient } from 'aurelia-fetch-client';
import 'isomorphic-fetch';
import 'whatwg-fetch';
import * as Hammer from 'hammerjs';
import { UserAccess } from './classes/UserAccess';
import { AppState } from './classes/AppState';

const appUtils = require('wj-common-front').appUtils;

@inject(AuthService, HttpClient)
export class App {
  constructor(auth, httpClient) {
    this.auth = auth;
    this.httpClient = httpClient;
    this.dashboardTitle = 'Dashboard';
    this.role = '';
    this.menuToggled = false;
    this.style = 'wj';
    this.appUtils = appUtils;
  }
  authenticated = false;

  @bindable
  drawerWidth = '182px';

  @bindable
  contentWidth = '0px';

  @bindable
  fullmenu = true;

  async activate() {
    this.configHttpClient();
    this.appState = new AppState(this.httpClient);
    this.userAccess = new UserAccess(this.appState);
    this.states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    this.states.sort();
    await this.appUtils.checkUser(this);
  }

  showTT(id) {
    document.getElementById(id).style.display = 'block';
  }

  hideTT(id) {
    document.getElementById(id).style.display = 'none';
  }

  showForm(appName, className) {
    className.startup(appName);
  }

  async authenticate(name) {
    let ret;
    try {
      ret = await this.auth.authenticate(name, false, { isOhafUser: this.appState.isOhafLogin });
    } catch (e) {
      localStorage.clear();
      return Promise.reject(e);
    }
    this.auth.setToken(ret.token);
    localStorage.setItem('origin', location.origin);
    return Promise.resolve(ret.token);
  }

  configHttpClient() {
    this.backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') this.backend = process.env.BackendUrl;
    this.httpClient.configure((httpConfig) => {
      httpConfig.useStandardConfiguration()
        .withDefaults({ mode: 'cors', credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .withBaseUrl(this.backend)
        .withInterceptor(this.auth.tokenInterceptor); // Adds bearer token to every HTTP request.
    });
  }

  mapConfig(config) {
    return config.map([ // There is no way to refactor this that I can tell
      {
        route: ['', 'music'], name: 'music', moduleId: PLATFORM.moduleName('./music'), nav: true, title: 'music', settings: 'fa fa-music'
      },
      {
        route: 'buymusic', name: 'buymusic', moduleId: PLATFORM.moduleName('./music-child-routes/buymusic'), nav: true, title: 'Buy Music'
      }
    ]);
  }

  configureRouter(config, router) {
    config.title = 'Web Jam LLC';
    config.options.pushState = true;
    config.options.root = '/';
    config.addPipelineStep('authorize', AuthorizeStep);// Is the actually Authorization to get into the /dashboard
    config.addPipelineStep('authorize', this.userAccess);// provides access controls to prevent users from certain
    config.addPostRenderStep({
      run(routingContext, next) {
        if (!routingContext.config.settings.noScrollToTop) {
          const top = document.getElementsByClassName('material-header')[0];
          if (top !== null && top !== undefined) top.scrollIntoView();
        }
        return next();
      }
    });
    config = this.mapConfig(config);
    config.fallbackRoute('/');
    this.router = router;
  }

  toggleMobileMenu(toggle) {
    document.getElementsByClassName('page-host')[0].style.overflow = 'auto';
    if (toggle !== 'close') {
      document.getElementsByClassName('page-host')[0].style.overflow = 'hidden';
      document.getElementsByClassName('swipe-area')[0].style.width = '60px';
      document.getElementsByClassName('page-host')[0].addEventListener('click', this.appUtils.clickFunc);
    }
    this.menuToggled = true;
    const drawer = document.getElementsByClassName('drawer')[0];
    const toggleIcon = document.getElementsByClassName('mobile-menu-toggle')[0];
    if (drawer.style.display === 'none' && toggle !== 'close') {
      drawer.style.display = 'block';
      $(drawer).parent().css('display', 'block');
      toggleIcon.style.display = 'none';
    } else {
      drawer.style.display = 'none';
      $(drawer).parent().css('display', 'none');
      toggleIcon.style.display = 'block';
    }
    if (toggle === 'close') {
      document.getElementsByClassName('page-host')[0].removeEventListener('click', this.appUtils.clickFunc);
      document.getElementsByClassName('swipe-area')[0].style.width = '0px';
    }
  }

  close() {
    if (!this.widescreen) this.toggleMobileMenu('close');
  }

  toggleMenu() { // makes the widescreen side menu only display the icons and is only used for web-jam.com
    const dc = document.getElementsByClassName('drawer-container')[0];
    const nl = document.getElementsByClassName('nav-list')[0];
    if (this.fullmenu) {
      this.fullmenu = false;
      this.drawerWidth = '50px';
      this.contentWidth = '50px';
    } else {
      this.fullmenu = true;
      this.drawerWidth = '182px';
      this.contentWidth = '182px';
    }
    document.getElementsByClassName('main-panel')[0].style.marginRight = this.contentWidth;
    dc.style.width = this.drawerWidth;
    nl.style.width = this.drawerWidth;
  }

  setFooter() {
    const footer = document.getElementById('wjfooter');
    let color = '';
    if (footer !== null) {
      footer.style.backgroundColor = '#2a222a';
      if (this.style === 'ohaf') {
        footer.style.backgroundColor = '#565656';
        color = '#c09580';
      }
      footer.innerHTML = '<div style="text-align: center;padding:6px">'
      + `<a target="_blank" style="color:${color}; padding-right:5px" href="https://github.com/WebJamApps">`
      + '<i class="fa fa-github fa-2x footerIcon" aria-hidden="true">'
      + `</i></a><a target="_blank" style="color:${color};padding-right:5px" href="https://www.linkedin.com/company/webjam/">`
      + `<i class="fa fa-linkedin fa-2x footerIcon" aria-hidden="true"></i></a><a target="_blank" style="color:${color};padding-right:5px"`
      + 'href="https://twitter.com/WebJamLLC"><i class="fa fa-twitter fa-2x footerIcon" aria-hidden="true"></i></a>'
      + `<a target="_blank" style="color:${color};padding-right:5px" href="https://www.facebook.com/WebJamLLC/">`
      + '<i class="fa fa-facebook-square fa-2x footerIcon"'
      + `aria-hidden="true"></i></a><a target="_blank" style="color:${color};padding-right:5px"`
      + 'href="https://www.instagram.com/joshua.v.sherman/"><i class="fa fa-instagram fa-2x footerIcon" aria-hidden="true"></i></a>'
      + `<a target="_blank" style="color:${color};padding-right:5px" href="https://plus.google.com/u/1/109586499331294076292">`
      + '<i class="fa fa-google-plus-square fa-2x footerIcon" aria-hidden="true"></i></a><p style="color:white; font-size: 9pt;margin-bottom:0">'
      + 'Powered by <a class="wjllc" target="_blank" href="https://www.web-jam.com">Web Jam LLC</a></p></div>';
    }
  }

  get currentStyles() {
    let result = {};
    this.style = 'wj';
    if (this.Menu === 'charity' || this.Menu === 'ohaf' || this.Menu === 'volunteer' || this.role === 'Charity' || this.role === 'Volunteer') {
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
    this.setFooter();
    this.setOtherStyles();
    return result;
  }

  setOtherStyles() {
    const menuDrawer = document.getElementsByClassName('drawer')[0];
    const navList = document.getElementsByClassName('nav-list')[0];
    const mobilemenutoggle = document.getElementById('mobilemenutoggle');
    if (menuDrawer !== undefined) {
      if (this.style === 'ohaf') {
        menuDrawer.style.backgroundColor = '#c09580';
        navList.style.backgroundColor = '#c09580';
        if (mobilemenutoggle !== null) {
          mobilemenutoggle.style.backgroundColor = '#565656';
        }
      } else {
        if (menuDrawer !== null && menuDrawer !== undefined) {
          menuDrawer.style.backgroundColor = '#c0c0c0';
          navList.style.backgroundColor = '#c0c0c0';
        }
        if (mobilemenutoggle !== null) {
          mobilemenutoggle.style.backgroundColor = '#2a222a';
        }
      }
    }
  }

  selectPickedChange(selectorObj, thisObj, mainSelectedList, selectorOtherVariable, otherVariable, selectorUseThis = false, userVariable) {
    if (userVariable) {
      selectorObj[userVariable] = thisObj[mainSelectedList];
    }
    let exists = false;
    if (selectorUseThis === true) {
      if (thisObj[mainSelectedList].includes('other')) {
        exists = true;
      }
    } else if (selectorObj[mainSelectedList].includes('other')) {
      exists = true;
    }
    if (exists === true) {
      thisObj[otherVariable] = true;
    } else {
      thisObj[otherVariable] = false;
      selectorObj[selectorOtherVariable] = '';
    }
  }

  async updateById(route, id, dataObj) {
    try {
      const cb = await this.httpClient.fetch(route + id, {
        method: 'put',
        body: json(dataObj)
      });
      return cb.json();
    } catch (e) { return e; }
  }

  get widescreen() {
    return this.appUtils.handleScreenSize(this, document.documentElement.clientWidth > 900,
      $(document.getElementsByClassName('drawer')).parent(), 'returnIsWide');
  }

  attached() {
    this.manager = new Hammer.Manager(document.getElementsByClassName('swipe-area')[0], {
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
      ]
    });
    this.manager.on('swipe', this.close.bind(this));
    if (document.location.search.includes('oneplayer=true')) {
      document.getElementsByClassName('content-block')[0].style.overflow = 'hidden';
      document.getElementsByClassName('content-block')[0].style.marginTop = '0';
      document.getElementsByClassName('page-content')[0].style.borderRight = '0';
      const wms = document.getElementById('wholeMusicSection'); // .style.display = 'none';
      const h4 = document.getElementsByTagName('h4')[0];
      const header = document.getElementsByClassName('home-header')[0];
      const footer = document.getElementById('wjfooter');
      const i = document.getElementById('mobilemenutoggle');
      const child = document.getElementsByClassName('home-sidebar')[0];
      child.parentNode.removeChild(child);
      i.parentNode.removeChild(i);
      wms.parentNode.removeChild(wms);
      h4.parentNode.removeChild(h4);
      footer.parentNode.removeChild(footer);
      header.parentNode.removeChild(header);
    }
  }

  detached() {
    this.manager.off('swipe', this.close.bind(this));
    const ph = document.getElementsByClassName('page-host')[0];
    ph.removeEventListener('click', this.appUtils.clickFunc);
    ph.setAttribute('hasEvent', false);
  }
}
