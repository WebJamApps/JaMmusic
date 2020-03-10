const setTitleAndScroll = (pageTitle, width) => {
  if (pageTitle !== '') pageTitle += ' | ';// eslint-disable-line no-param-reassign
  document.title = `${pageTitle}Web Jam LLC`;
  let getClass = 'page-content';
  if (width !== undefined && width < 1004)getClass = 'headercontent';
  const top = document.getElementsByClassName(getClass)[0];
  if (top !== undefined && typeof top.scrollIntoView === 'function') top.scrollIntoView();
};

export default { setTitleAndScroll };
