export interface ImenuItem {
  className: string,
  type: string,
  iconClass: string,
  link: string,
  name: string,
  auth?: boolean,
  nav: string,
}

const jamNav = [
  {
    nav: 'jam', className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: 'https://web-jam.com/music/songs', name: 'Songs',
  },
  {
    nav: 'jam', className: '', type: 'link', iconClass: 'far fa-money-bill-alt', link: 'https://web-jam.com/music/buymusic', name: 'Buy Music',
  },
];

const wjNav = [
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-music', link: '/music', name: 'Music',
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'far fa-money-bill-alt', link: '/music/buymusic', name: 'Buy Music',
  },
  {
    nav: 'wj', className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: '/music/songs', name: 'Songs',
  },
  {
    nav: 'wj', className: 'dashboard', type: 'link', iconClass: 'fas fa-user-secret', link: '/music/dashboard', name: 'Dashboard', auth: true,
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-map-marker', link: '/map', name: 'Map', auth: true,
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-sort', link: '/sort', name: 'Sort', auth: true,
  },
  {
    nav: 'wj', className: 'home', type: 'link', iconClass: 'fas fa-home', link: '/', name: 'Web Jam LLC',
  },
  {
    nav: 'wj', className: 'login', type: 'googleLogin', iconClass: 'fas fa-login', link: '', name: 'Login',
  },
  {
    nav: 'wj', className: 'logout', type: 'googleLogout', iconClass: 'fas fa-logout', link: '', name: 'Logout', auth: true,
  },
];
export default { wjNav, jamNav };
