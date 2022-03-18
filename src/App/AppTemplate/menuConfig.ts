export interface ImenuItem {
  className: string,
  type: string,
  iconClass: string,
  link: string,
  name: string,
  auth?: boolean,
}

const jamNav = [
  {
    className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: 'https://web-jam.com/music/songs', name: 'Songs',
  },
  {
    className: '', type: 'link', iconClass: 'far fa-money-bill-alt', link: 'https://web-jam.com/music/buymusic', name: 'Buy Music',
  },
];

const wjNav = [
  {
    className: '', type: 'link', iconClass: 'fas fa-music', link: '/music', name: 'Music',
  },
  {
    className: '', type: 'link', iconClass: 'far fa-money-bill-alt', link: '/music/buymusic', name: 'Buy Music',
  },
  {
    className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: '/music/songs', name: 'Songs',
  },
  {
    className: 'dashboard', type: 'link', iconClass: 'fas fa-user-secret', link: '/music/dashboard', name: 'Dashboard', auth: true,
  },
  {
    className: '', type: 'link', iconClass: 'fas fa-map-marker', link: '/map', name: 'Map', auth: true,
  },
  {
    className: '', type: 'link', iconClass: 'fas fa-sort', link: '/sort', name: 'Sort', auth: true,
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
export default { wjNav, jamNav };
