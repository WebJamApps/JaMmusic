const setTitleAndScroll = (pageTitle) => {
  if (pageTitle !== '') pageTitle += ' | ';// eslint-disable-line no-param-reassign
  document.title = `${pageTitle}Web Jam LLC`;
  const top = document.getElementsByClassName('page-content')[0];
  if (top !== undefined && typeof top.scrollIntoView === 'function') top.scrollIntoView();
};

export default { setTitleAndScroll };
