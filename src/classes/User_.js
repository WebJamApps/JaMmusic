require('url-search-params-polyfill');

const Fetch = require('isomorphic-fetch');

class User_ {
  constructor() {
    this.fetch = Fetch;
    this.searchParams = new URLSearchParams(window.location.search);
    this.userEmail = this.searchParams.get('email');
    this.changeEmail = this.searchParams.get('changeemail');
    this.formType = '';
    this.formType += this.searchParams.get('form');
    this.userToken = localStorage.getItem('aurelia_id_token');
    this.verifyEmail();
    // this.myForm = {};
  }

  createVerifyCodeForm() {
    let formTitle = '';
    const passInput = '<tr class="pwheader"><th style="border:none; text-align:left">New Password</th></tr>'
    + '<tr class="pwinput"><td><input class="loginpass" pattern=".{8,}" title="8 characters minimum" type="password"'
      + ' name="password" style="width:250px;min-width:0" value="" required></td></tr>';
    const emailVarifyForm = document.createElement('div');
    if (this.formType === 'reset') {
      formTitle = 'Reset Your Password';
    } else if (this.changeEmail !== '' && this.changeEmail !== null && this.changeEmail !== undefined) {
      formTitle = 'Verify Your New Email Address';
    } else {
      formTitle = 'Verify Your Email Address';
    }
    emailVarifyForm.className = 'RegistrationForm elevation2';
    emailVarifyForm.style.maxWidth = '3in';
    emailVarifyForm.innerHTML = `<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">${formTitle}</h2>
    <form style="min-height:3.25in">`
    + '<div style="padding:2px; margin:10px;"><table><tbody class="regformtbody"><tr><th style="text-align:left">Email</th></tr><tr><td>'
    + '<input class="email" type="email" name="email" style="width:250px;min-width:0" value="" required>'
    + `</td></tr>${passInput}<tr><td style="padding-bottom:0"><p class="codeNote" style="margin-bottom:0; font-size:10pt">
    <i>Check your email for a verification code.</i></p></td></tr>`
    + '<tr><th style="text-align:left; padding-top:0">5-digit Code</th></tr><tr><td>'
    + '<input type="number" title="5 digit code" name="code" class="code" style="width:150px;min-width:0" required" value=""></td></tr>'
    + '</tbody></table></div><div style="text-align:center;padding:2px;margin:10px;">'
    + '<div class="loginerror" style="color:red"></div>'
    + '<div><button style="display:none; margin-bottom:-30px;margin-left:12px" type="button" class="regbutton">Submit</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(emailVarifyForm, home[0].childNodes[0]);
    this.fillInEmail(this.userEmail, this.changeEmail);
    return formTitle;
  }

  fillInEmail(userEmail, changeEmail) {
    if (userEmail !== '' && userEmail !== null && userEmail !== undefined) {
      document.getElementsByClassName('email')[0].value = userEmail;
    } else if (changeEmail !== '' && changeEmail !== null && changeEmail !== undefined) {
      document.getElementsByClassName('email')[0].value = changeEmail;
    }
  }

  verifyEmail() {
    const formTitle = this.createVerifyCodeForm();
    const pWInput = document.getElementsByClassName('loginpass')[0];
    this.setEvents(pWInput);
    const emailInput = document.getElementsByClassName('email')[0];
    this.setEvents(emailInput);
    const verifyCode = document.getElementsByClassName('code')[0];
    this.setEvents(verifyCode);
    verifyCode.formType = this.formType;
    const submitButton = document.getElementsByClassName('regbutton')[0];
    submitButton.fetchClient = this.fetch;
    submitButton.runFetch = this.runFetch;
    if (formTitle === 'Verify Your Email Address') {
      submitButton.addEventListener('click', this.updateUser);
    }
    if (formTitle === 'Reset Your Password') {
      submitButton.addEventListener('click', this.resetPasswd);
    }
    if (formTitle === 'Verify Your New Email Address') {
      submitButton.addEventListener('click', this.verifyChangeEmail);
    }
    if (this.formType !== 'reset') {
      document.getElementsByClassName('pwheader')[0].style.display = 'none';
      document.getElementsByClassName('pwinput')[0].style.display = 'none';
    }
  }

  setEvents(element) {
    element.addEventListener('change', this.validateForm);
    element.addEventListener('focus', this.validateForm);
    element.addEventListener('keydown', this.validateForm);
    element.addEventListener('keyup', this.validateForm);
    element.formType = this.formType;
  }

  // setupValidationForm(evt) {
  //   this.formType = evt.target.formType;
  //   this.myForm.newpasswd = document.getElementsByClassName('loginpass')[0];
  //   this.myForm.isemailvalid = document.getElementsByClassName('email')[0].checkValidity();
  //   this.myForm.emValue = document.getElementsByClassName('email')[0].value;
  //   this.myForm.edot = this.myForm.emValue.split('.');
  //   this.myForm.isvalidcode = document.getElementsByClassName('code')[0].value;
  //   this.myForm.submitbutton = document.getElementsByClassName('regbutton')[0];
  //   this.myForm.submitbutton.style.display = 'none';
  //   document.getElementsByClassName('loginerror')[0].innerHTML = '';
  // }

  validateForm(evt) {
    const formType = evt.target.formType;
    const myForm = {};
    myForm.newpasswd = document.getElementsByClassName('loginpass')[0];
    myForm.isemailvalid = document.getElementsByClassName('email')[0].checkValidity();
    myForm.emValue = document.getElementsByClassName('email')[0].value;
    myForm.edot = myForm.emValue.split('.');
    myForm.isvalidcode = document.getElementsByClassName('code')[0].value;
    myForm.submitbutton = document.getElementsByClassName('regbutton')[0];
    myForm.submitbutton.style.display = 'none';
    document.getElementsByClassName('loginerror')[0].innerHTML = '';
    // this.setupValidationForm(evt);
    let errorMessage = '<ul style="margin-right:0; margin-top:0; margin-bottom:20px; text-align:left; padding-left:20px; font-size:10pt">';
    if (formType === 'reset') {
      const validPassword = myForm.newpasswd.checkValidity();
      if (validPassword && myForm.isemailvalid && myForm.edot.length > 1
        && myForm.isvalidcode > 9999 && myForm.isvalidcode < 100000) {
        myForm.submitbutton.style.display = 'block';
        return true;
      }
      if (!validPassword) {
        errorMessage += '<li>Password is not >= 8 characters</li>';
      }
    }
    if (!(myForm.isvalidcode > 9999 && myForm.isvalidcode < 100000)) {
      errorMessage += '<li>Invalid passcode</li>';
    }
    if (!myForm.isemailvalid || !(myForm.edot.length > 1)) {
      errorMessage += '<li>Invalid email address</li>';
    }
    if (errorMessage !== '<ul style="margin-right:0; margin-top:0; margin-bottom:20px; text-align:left; padding-left:20px; font-size:10pt">') {
      errorMessage += '</ul><p>&nbsp;</p>';
      document.getElementsByClassName('loginerror')[0].innerHTML = errorMessage;
      return false;
    }
    myForm.submitbutton.style.display = 'block';
    return null;
  }

  updateUser(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const bodyData = { email: document.getElementsByClassName('email')[0].value, resetCode: document.getElementsByClassName('code')[0].value };
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
    return runFetch(fetchClient, backend, '/user/auth/validateemail', fetchData);
  }

  resetPasswd(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const bodyData = {
      email: document.getElementsByClassName('email')[0].value,
      resetCode: document.getElementsByClassName('code')[0].value,
      password: document.getElementsByClassName('loginpass')[0].value
    };
    const fetchData = { method: 'PUT', body: JSON.stringify(bodyData), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } };
    let backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      backend = process.env.BackendUrl;
    }
    return runFetch(fetchClient, backend, '/user/auth/pswdreset', fetchData);
  }

  runFetch(fetchClient, url, route, fetchData) {
    return fetchClient(url + route, fetchData)
      .then(response => response.json())
      .then((data) => {
        if (data.message) {
          const messagediv = document.getElementsByClassName('loginerror')[0];
          messagediv.innerHTML = `<p style="text-align:left; padding-left:12px">${data.message}</p>`;
        } else {
          localStorage.setItem('userEmail', document.getElementsByClassName('email')[0].value);
          const regform1 = document.getElementsByClassName('RegistrationForm');
          regform1[0].style.display = 'none';
          let feurl = 'http://localhost:9000';
          /* istanbul ignore if */
          if (process.env.frontURL !== undefined) {
            feurl = process.env.frontURL;
          }
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.href = `${feurl}/login?email=${document.getElementsByClassName('email')[0].value}`;
          }
        }
      })
      .catch(() => {
        // console.log(error);
      });
  }

  nevermind(className) {
    let regform1 = [],
      feurl = 'http://localhost:9000';
    regform1 = document.getElementsByClassName(className);
    regform1[0].style.display = 'none';
    /* istanbul ignore if */
    if (process.env.frontURL !== undefined) {
      feurl = process.env.frontURL;
    }
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.href = `${feurl}/`;
    }
  }

  verifyChangeEmail(evt) {
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const bodyData = {
      changeemail: document.getElementsByClassName('email')[0].value,
      resetCode: document.getElementsByClassName('code')[0].value,
      email: localStorage.getItem('userEmail')
    };
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
    return runFetch(fetchClient, backend, '/user/auth/updateemail', fetchData);
  }
}

module.exports = User_;
