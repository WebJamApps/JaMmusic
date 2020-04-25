const continueMenuItem = (menu, index, location, auth, controller) => {
  if (location.pathname === '/shop' && (menu.link === '/shop' || menu.link === '/')) {
    return controller.makeMenuLink(menu, index);
  }
  if (menu.type === 'googleLogin' && !auth.isAuthenticated) return controller.googleButtons('login', index);
  if (menu.type === 'googleLogout' && auth.isAuthenticated) return controller.googleButtons('logout', index);
  return null;
};

const menuItem = (menu, index, controller) => {
  const { location, auth } = controller.props;
  if (location.pathname.includes('/music') && (menu.link.includes('/music') || menu.name === 'Web Jam LLC')) {
    if ((menu.type === 'link' && ((menu.auth && auth.isAuthenticated && auth.user.userType === 'Developer') || !menu.auth))) {
      return controller.makeMenuLink(menu, index);
    }
  }
  if (location.pathname === '/' && (menu.link === '/shop' || menu.link === '/music' || menu.link === '/')) {
    return controller.makeMenuLink(menu, index);
  }
  return continueMenuItem(menu, index, location, auth, controller);
};

export default { continueMenuItem, menuItem };
