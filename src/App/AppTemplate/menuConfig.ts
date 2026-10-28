export interface ImenuItem {
  className: string,
  type: string,
  iconClass: string,
  link: string,
  name: string,
  auth?: boolean,
  nav: string,
  roles?: string[],
  children?: ImenuItem[],
}

const jamNav = [
  {
    nav: 'jam', className: 'songs', type: 'link', iconClass: 'far fa-lightbulb', link: 'https://web-jam.com/music/songs', name: 'Songs',
  },
  {
    nav: 'jam', className: 'setlist', type: 'link', iconClass: 'fas fa-list-ol', link: 'https://web-jam.com/music/setlist', name: 'Setlist',
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
    nav: 'wj', className: 'setlist', type: 'link', iconClass: 'fas fa-list-ol', link: '/music/setlist', name: 'Setlist',
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
    nav: 'wj',
    className: 'admin',
    type: 'group',
    iconClass: 'fas fa-user-secret',
    link: '',
    name: 'Admin',
    auth: true,
    children: [
      {
        nav: 'wj',
        className: 'users',
        type: 'link',
        iconClass: 'fas fa-users-cog',
        link: '/admin/users',
        name: 'Users',
        auth: true,
      },
      {
        nav: 'wj',
        className: 'venues',
        type: 'link',
        iconClass: 'fas fa-store',
        link: '/admin/venues',
        name: 'Venues',
        auth: true,
      },
      {
        nav: 'wj',
        className: 'outreach',
        type: 'link',
        iconClass: 'fas fa-paper-plane',
        link: '/admin/outreach',
        name: 'Batch Outreach',
        auth: true,
      },
      {
        nav: 'wj',
        className: 'templates',
        type: 'link',
        iconClass: 'fas fa-envelope-open-text',
        link: '/admin/templates',
        name: 'Templates',
        auth: true,
      },
      {
        nav: 'wj',
        className: 'database',
        type: 'link',
        iconClass: 'fas fa-database',
        link: '/admin/database',
        name: 'Database',
        auth: true,
        roles: ['Developer'],
      },
      {
        nav: 'wj',
        className: 'api',
        type: 'link',
        iconClass: 'fas fa-code',
        link: '/admin/api',
        name: 'API',
        auth: true,
        roles: ['JaM-admin', 'Developer'],
      },
    ],
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
