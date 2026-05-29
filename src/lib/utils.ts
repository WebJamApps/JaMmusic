import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    userRoles = JSON.parse(process.env.userRoles || '').roles;
  } catch (e) { userRoles = []; }
  return userRoles;
}

const delay = (seconds:number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

type NotificationType = 'success' | 'danger' | 'info' | 'default' | 'warning';

function notify(title: string, message: string, type: NotificationType) {
  const body = `${title}: ${message}`;
  const opts = { position: 'top-right' as const, autoClose: 5000 };
  switch (type) {
    case 'success': toast.success(body, opts); break;
    case 'danger': toast.error(body, opts); break;
    case 'warning': toast.warning(body, opts); break;
    case 'info': toast.info(body, opts); break;
    default: toast(body, opts);
  }
}

export default {
  setTitleAndScroll, getUserRoles, delay, notify,
};
