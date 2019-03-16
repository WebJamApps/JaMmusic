const Fetch = require('isomorphic-fetch');
const utils = require('../commons/utils.js');

class Register_ {
  constructor() {
    this.fetch = Fetch;
    this.appName = '';
    this.utils = utils;
  }

  createRegistrationForm(appName) {
    this.utils.nevermind('LoginForm');
    this.utils.nevermind('RegistrationForm');
    this.appName = appName;
    const regform = document.createElement('div');
    regform.className = 'RegistrationForm elevation2';
    regform.innerHTML = '<form><div style="" class="regformform"><table style=""><tbody class="regformtbody">'
    + '<tr class="primApSel" style="height:1px"><td><label class="primapplabel" style="display:none">Primary App </label>'
    + '<select class="pas" style="display:none"><option value=""> </option></select></td></tr>'
    + '<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr><tr><td width="50%">'
    + '<input class="firstname" type="text" name="first_name" style="width:100%;min-width:0" required>'
    + '</td><td><input class="lastname" type="text" name="last_name" style="width:100%;min-width:0" required>'
    + '</td></tr><tr><th colspan="1">Email Address <span style="color:red">*</span></th><th colspan="1">Password <span style="color:red">*</span>'
    + '</th></tr><tr><td colspan="1">'
    + '<input class="email" type="email" name="email" style="width:100%;min-width:0" required></td><td>'
    + '<input class="password" pattern=".{8,}" title="8 characters minimum" type="password" name="password" style="width:100%;min-width:0" required>'
    + '</td></tr><tr><td><p"><span style="color:red">*</span> <i>Required field</i></p></td>'
    + '<td style="vertical-align:top"><button type="button" class="registerbutton" style="display:none; margin-bottom:-22px; margin-left:76px">'
    + 'Register</button></td></tr></tbody></table></div><div style="text-align:center;margin-top:-20px">'
    + '<div class="registererror" style="color:red; margin:0; padding:6px; text-align:left"></div>'
    + '<div style="min-height:60px; text-align:left" class="regformform">'
    + '<button class="resetpass" type="button" style="display:none">Reset Password</button>'
    + '<button class="nevermind" type="button" style="margin-top:8px; margin-bottom:8px">Cancel</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(regform, home[0].childNodes[0]);
  }

  startup(appName) {
    this.appName = appName;
    this.createRegistrationForm(this.appName);
    const firstNameInput = document.getElementsByClassName('firstname')[0];
    this.setEvents(firstNameInput, appName);
    const lastNameInput = document.getElementsByClassName('lastname')[0];
    this.setEvents(lastNameInput, appName);
    const emailInput = document.getElementsByClassName('email')[0];
    this.setEvents(emailInput, appName);
    const passInput = document.getElementsByClassName('password')[0];
    this.setEvents(passInput, appName);
    const registerEventButton = document.getElementsByClassName('registerbutton')[0];
    registerEventButton.fetchClient = this.fetch;
    registerEventButton.runFetch = this.runFetch;
    registerEventButton.addEventListener('click', this.createUser);
    const resetPB = document.getElementsByClassName('resetpass')[0];
    resetPB.fetchClient = this.fetch;
    resetPB.runFetch = this.runFetch;
    resetPB.addEventListener('click', this.resetpass);
    const cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', () => { document.getElementsByClassName('RegistrationForm')[0].style.display = 'none'; });
    const pas2 = document.getElementsByClassName('pas')[0];
    pas2.addEventListener('change', this.updateRegForm);
    pas2.addEventListener('change', this.validateReg);
    pas2.displayError = this.displayRegError;
    pas2.validateGoogle = this.validateGoogle;
    pas2.appName = appName;
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      document.getElementsByClassName('RegistrationForm')[0].scrollIntoView();
    }
  }

  setEvents(element, appName) {
    element.addEventListener('change', this.validateReg);
    element.addEventListener('focus', this.validateReg);
    element.addEventListener('keydown', this.validateReg);
    element.addEventListener('keyup', this.validateReg);
    element.displayError = this.displayRegError;
    element.validateGoogle = this.validateGoogle;
    element.appName = appName;
  }

  validateReg(evt) {
    const displayError = evt.target.displayError;
    const validateGoogle = evt.target.validateGoogle;
    const appName = evt.target.appName;
    const fname = document.getElementsByClassName('firstname')[0].value;
    const fspace = fname.split(' ');
    const lname = document.getElementsByClassName('lastname')[0].value;
    const lspace = lname.split(' ');
    const email = document.getElementsByClassName('email')[0].value;
    const edot = email.split('.');
    const validemail = document.getElementsByClassName('email')[0];
    const password = document.getElementsByClassName('password')[0].value;
    const pspace = password.split(' ');
    const googleAccount = validateGoogle(email, appName);
    const validpass = document.getElementsByClassName('password')[0];
    let nameError = false,
      pwError = false,
      emError = false;
    if (fname === '' || lname === '' || fspace.length > 1 || lspace.length > 1) {
      nameError = true;
    }
    if (pspace.length > 1 || !validpass.checkValidity() || password === '') {
      pwError = true;
    }
    if (!validemail.checkValidity() || edot.length === 1 || email === '') {
      emError = true;
    }
    displayError(nameError, emError, pwError, googleAccount);
  }

  validateGoogle(email, appName) {
    let googleAccount = false;
    if (email.split('@gmail').length > 1 || email.split('@vt.edu').length > 1 || email.split('@bi.vt.edu').length > 1) {
      googleAccount = true;
    }
    return googleAccount;
  }


  displayRegError(nameError, emError, pwError, googleAccount) {
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    const regError = document.getElementsByClassName('registererror')[0];
    if (!nameError && !emError && !pwError && !googleAccount) {
      registbutton.style.display = 'block';
    } else {
      registbutton.style.display = 'none';
    }
    if (googleAccount) {
      regError.innerHTML = '<p>The email address entered indicates that you already have a Google account. Please click the above '
        + '<strong>Register with Google</strong> button.</p>';
    } else if (nameError) {
      regError.innerHTML = '<p>Name format is not valid</p>';
    } else if (emError) {
      regError.innerHTML = '<p>Email format is not valid</p>';
    } else if (pwError) {
      regError.innerHTML = '<p>Password must be minimum 8 characters</p>';
    } else { regError.innerHTML = ''; }
  }

  createUser(evt) {
    const fetchClient = evt.target.fetchClient;
    const firstname = document.getElementsByClassName('firstname')[0].value;
    const runFetch = evt.target.runFetch;
    const lastname = document.getElementsByClassName('lastname')[0].value;
    const bodyData = {
      name: `${firstname} ${lastname}`,
      email: document.getElementsByClassName('email')[0].value.toLowerCase(),
      password: document.getElementsByClassName('password')[0].value,
      first_name: firstname,
      last_name: lastname,
    };
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    let backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      backend = process.env.BackendUrl;
    }
    return runFetch(fetchClient, backend, '/user/auth/signup', fetchData);
  }

  resetpass(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const loginEmail = document.getElementsByClassName('email')[0].value.toLowerCase();
    const bodyData = { email: loginEmail };
    const fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    let backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      backend = process.env.BackendUrl;
    }
    return runFetch(fetchClient, backend, '/user/auth/resetpswd', fetchData);
  }

  runFetch(fetchClient, url, route, fetchData) {
    const messagediv = document.getElementsByClassName('registererror')[0];
    return fetchClient(url + route, fetchData)
      .then(response => response.json())
      .then((data) => {
        if (data.message) {
          messagediv.innerHTML = `<p style="text-align:left;padding-left:12px; margin-bottom:0">${data.message}`;
          document.getElementsByClassName('resetpass')[0].style.display = 'block';
        } else {
          document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
          if (data.email) {
            let front = window.location.href;
            front = front.replace('/register', '');
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'test') {
              if (route === '/user/auth/resetpswd') {
                window.location.assign(`${front}/userutil?email=${data.email}&form=reset`);
              } else {
                window.location.assign(`${front}/userutil?email=${data.email}`);
              }
            }
          }
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      })
      .catch(() => {
        // console.log(error);
      });
  }
}

module.exports = Register_;
