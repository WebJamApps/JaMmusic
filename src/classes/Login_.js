const Fetch = require('isomorphic-fetch');
const utils = require('../commons/utils.js');

class Login_ {
  constructor() {
    this.fetch = Fetch;
    this.appName = '';
    this.utils = utils;
  }

  createLoginForm(appName) {
    this.utils.nevermind('LoginForm');
    this.utils.nevermind('RegistrationForm');
    const useremailinput = '<tr class="emailheader"><th style="border:none">Email</th></tr><tr class="emailinput"><td>'
    + '<input class="loginemail" type="email" name="email" style="width:300px;" value="" required></td></tr>';
    const loginform = document.createElement('div');
    loginform.className = 'LoginForm elevation2';
    loginform.innerHTML = `${'<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">'
      + 'User Login</h2>'
    + '<form><div style="padding:2px; margin:10px;"><table><tbody class="regformtbody">'}${useremailinput}`
    + '<tr><th style="border:none">Password</th></tr><tr><td>'
    + '<input class="loginpass" pattern=".{8,}" title="8 characters minimum" type="password" name="password" style="width:300px;" value="" required>'
      + '</td></tr>'
    + '</tbody></table></div><div style="text-align:center;padding:2px;margin:10px;">'
    + '<div class="loginerror" style="color:red"></div>'
    + '<div><button style="display:none; margin-bottom:-20px; margin-left:10px" type="button" class="loginbutton">Login</button>'
    + '<button style="display:none;margin-top:34px; margin-left:10px" class="resetpass" type="button">Reset Password</button></div></div></form>'
    + '<button class="nevermind" style="margin-left:70%;margin-top:19px; margin-bottom:15px" type="button">Cancel</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(loginform, home[0].childNodes[0]);
  }

  startup(appName) {
    this.createLoginForm(appName);
    const emailInput = document.getElementsByClassName('loginemail')[0];
    this.setEvents(emailInput, appName);
    const passwordInput = document.getElementsByClassName('loginpass')[0];
    this.setEvents(passwordInput, appName);
    const loginButton = document.getElementsByClassName('loginbutton')[0];
    loginButton.appName = appName;
    loginButton.fetchClient = this.fetch;
    loginButton.runFetch = this.runFetch;
    loginButton.generateSession = this.generateSession;
    loginButton.addEventListener('click', this.logMeIn);
    const resetPB = document.getElementsByClassName('resetpass')[0];
    resetPB.fetchClient = this.fetch;
    resetPB.appName = appName;
    resetPB.runFetch = this.runFetch;
    resetPB.addEventListener('click', this.resetpass);
    const cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', () => {
      document.getElementsByClassName('LoginForm')[0].style.display = 'none';
    });
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      document.getElementsByClassName('LoginForm')[0].scrollIntoView();
    }
  }

  setEvents(element, appName) {
    element.addEventListener('change', this.validateLogin);
    element.addEventListener('focus', this.validateLogin);
    element.addEventListener('keydown', this.validateLogin);
    element.addEventListener('keyup', this.validateLogin);
    element.appName = appName;
    element.buttonsErrors = this.buttonsErrors;
  }

  validateLogin(evt) {
    const appName = evt.target.appName;
    const buttonsErrors = evt.target.buttonsErrors;
    const validpass = document.getElementsByClassName('loginpass')[0].checkValidity();
    const emailValue = document.getElementsByClassName('loginemail')[0].value;
    let validemail = document.getElementsByClassName('loginemail')[0].checkValidity(), message = '';
    const edot = emailValue.split('.');
    if (edot.length === 1 || !validemail || emailValue === '') {
      validemail = false;
      message = '<p style="margin-bottom:0px">Invalid email format</p>';
    }
    if (emailValue.split('@gmail').length > 1 || emailValue.split('@vt.edu').length > 1 || emailValue.split('@bi.vt.edu').length > 1) {
      validemail = false;
      message = '<p style="margin-bottom:0px">Please click the Login with Google button</p>';
    }
    buttonsErrors(appName, message, validemail, validpass);
  }

  buttonsErrors(appName, message, validemail, validpass) {
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    logbutton.style.display = 'none';
    const loginErrorMessage = document.getElementsByClassName('loginerror')[0];
    loginErrorMessage.innerHTML = message;
    if (validemail && validpass) {
      logbutton.style.display = 'block';
      loginErrorMessage.innerHTML = '';
      resetpassButton.style.display = 'none';
    }
    if (!validpass) {
      logbutton.style.display = 'none';
      loginErrorMessage.innerHTML += '<p style="margin-bottom:0px">Invalid password</p>';
    }
    if (!validpass && validemail) {
      resetpassButton.style.display = 'block';
    }
  }

  resetpass(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;

    const loginEmail = document.getElementsByClassName('loginemail')[0].value.toLowerCase();
    let backend = '';

    const bodyData = { email: loginEmail };
    const fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      backend = process.env.BackendUrl;
    }
    return runFetch(fetchClient, backend, '/user/auth/resetpswd', fetchData, null, null, loginEmail);
  }

  logMeIn(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const appName = evt.target.appName;
    const generateSession = evt.target.generateSession;
    let backend = '', emailValue = '';
    const passwordValue = document.getElementsByClassName('loginpass')[0].value;

    emailValue = document.getElementsByClassName('loginemail')[0].value.toLowerCase();

    const bodyData = { email: emailValue, password: passwordValue };
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      backend = process.env.BackendUrl;
    }
    return runFetch(fetchClient, backend, '/user/auth/login', fetchData, generateSession, appName, null);
  }

  runFetch(fetchClient, url, route, fetchData) {
    const loginform1 = document.getElementsByClassName('LoginForm');
    const messagediv = document.getElementsByClassName('loginerror')[0];

    return fetchClient(url + route, fetchData)
      .then(response => response.json())
      .then((data) => {
        let feurl = 'http://localhost:9000';
        /* istanbul ignore if */
        if (process.env.frontURL !== undefined) {
          feurl = process.env.frontURL;
        }
        if (data.token !== undefined) {
          localStorage.setItem('aurelia_id_token', data.token);
          // localStorage.setItem('token', data.token);
          localStorage.setItem('userEmail', data.email);
          loginform1[0].style.display = 'none';
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.assign(`${feurl}/dashboard`);
          }
        }
        if (data.message) {
          messagediv.innerHTML = `<p style="text-align:left; padding-left:12px">${data.message}</p>`;
        }
        if (!data.message && !data.token && data.email) {
          loginform1[0].style.display = 'none';
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.assign(`${feurl}/userutil/?email=${data.email}&form=reset`);
          }
        }
      })
      .catch(() => {
        // console.log(error);
      });
  }
}
module.exports = Login_;
