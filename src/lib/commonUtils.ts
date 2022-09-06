const setTitleAndScroll = (pageTitle: string, width: number): void => {
  if (pageTitle !== '') pageTitle += ' | ';// eslint-disable-line no-param-reassign
  document.title = `${pageTitle}Web Jam LLC`;
  let getClass = 'page-content';
  if (width !== undefined && width < 1004) getClass = 'headercontent';
  const top = document.getElementsByClassName(getClass)[0];
  if (top !== undefined && typeof top.scrollIntoView === 'function') top.scrollIntoView();
};

function getUserRoles(): string[] {
  let userRoles: string[] = [];
  try {
    userRoles = JSON.parse(process.env.userRoles || /* istanbul ignore next */'').roles;
  } catch (e) { /* istanbul ignore next */userRoles = []; }
  return userRoles;
}

const delay = (seconds:number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export default { setTitleAndScroll, getUserRoles, delay };
