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
    nav: 'jam', className: 'bookus', type: 'link', iconClass: 'far fa-calendar-alt', link: 'https://web-jam.com/music/bookus', name: 'Book Us',
  },
  {
    nav: 'jam',
    className: 'buymusic',
    type: 'link',
    iconClass: 'far fa-money-bill-alt',
    link: 'https://web-jam.com/music/buymusic',
    name: 'Buy Music',
  },
  {
    nav: 'jam', className: '', type: 'link', iconClass: 'fab fa-gratipay', link: 'https://web-jam.com/music/tipjar', name: 'Tip Jar',
  },
  {
    nav: 'jam', className: '', type: 'link', iconClass: 'fas fa-home', link: 'https://web-jam.com', name: 'Web Jam LLC',
  },
  {
    nav: 'jam', className: 'theme', type: 'themeToggle', iconClass: '', link: '', name: 'Dark Mode',
  },

];

const wjNav = [
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-music', link: '/music', name: 'Music',
  },
  {
    nav: 'wj', className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: '/music/songs', name: 'Songs',
  },
  {
    nav: 'wj', className: 'bookus', type: 'link', iconClass: 'far fa-calendar-alt', link: '/music/bookus', name: 'Book Us',
  },
  {
    nav: 'wj', className: 'buymusic', type: 'link', iconClass: 'far fa-money-bill-alt', link: '/music/buymusic', name: 'Buy Music',
  },
  {
    nav: 'wj', className: 'tipjar', type: 'link', iconClass: 'fab fa-gratipay', link: '/music/tipjar', name: 'Tip Jar',
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-users-cog', link: '/admin/users', name: 'Admin Users', auth: true,
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-store', link: '/admin/venues', name: 'Admin Venues', auth: true,
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-paper-plane', link: '/admin/outreach', name: 'Batch Outreach', auth: true,
  },
  {
    nav: 'wj', className: '', type: 'link', iconClass: 'fas fa-envelope-open-text', link: '/admin/templates', name: 'Admin Templates', auth: true,
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
  {
    nav: 'wj', className: 'theme', type: 'themeToggle', iconClass: '', link: '', name: 'Dark Mode',
  },
];
export default { wjNav, jamNav };
