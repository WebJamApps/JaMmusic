const User_ = require('../../src/classes/User_.js');

// let ;
const mockStorage = {
  setItem() {
  // do nothing
  },
  getItem() {
  // do nothing
  },
  removeItem() {
  // do nothing
  }
};
window.localStorage = mockStorage;

document.body.innerHTML = '<div><div class="home"></div></div>';
let user = new User_();

test('generates a email varification form', () => {
  user.verifyEmail();
  expect(document.body.innerHTML).toMatch(/Verify Your Email Address/);
});

test('generates a change email varification form', () => {
  user.changeEmail = 'joe@smith.com';
  user.verifyEmail();
  expect(document.getElementsByClassName('email')[0].value).toBe('joe@smith.com');
});

test('generates a reset password form with email already filled in', () => {
  user.formType = 'reset';
  user.userEmail = 'joe@smith.com';
  user.verifyEmail();
  expect(document.body.innerHTML).toMatch(/Reset Your Password/);
});

test('it validates the reset password form', () => {
  user.formType = 'reset';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('code')[0].value = 12345;
  document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
  const evt = { target: { formType: 'reset' } };
  user.validateForm(evt);
  const sbutton = document.getElementsByClassName('regbutton')[0];
  expect(sbutton.style.display).toBe('block');
});

test('it validates the email varification form', () => {
  user.formType = 'email';
  const evt = { target: { formType: 'email' } };
  document.getElementsByClassName('email')[0].value = 'joe@smith.com';
  document.getElementsByClassName('code')[0].value = '12345';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('code')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
  user.validateForm(evt);
  const sbutton = document.getElementsByClassName('regbutton')[0];
  expect(sbutton.style.display).toBe('block');
});

test('it hides submit button if the email varification form is invalid', () => {
  user.formType = 'email';
  const evt = { target: { formType: 'email' } };
  document.getElementsByClassName('email')[0].value = 'joesmith.com';
  document.getElementsByClassName('code')[0].value = '12345';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return false; };
  document.getElementsByClassName('code')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
  user.validateForm(evt);
  const sbutton = document.getElementsByClassName('regbutton')[0];
  expect(sbutton.style.display).toBe('none');
  document.getElementsByClassName('email')[0].value = 'joesmith@joe.com';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('code')[0].checkValidity = function checkValidity() { return false; };
  document.getElementsByClassName('code')[0].value = '123459';
  user.validateForm(evt);
  expect(sbutton.style.display).toBe('none');
});

test('it hides submit button if the reset password form is invalid', () => {
  user.formType = 'reset';
  const evt = { target: { formType: 'reset' } };
  document.getElementsByClassName('email')[0].value = 'joesmith.com';
  document.getElementsByClassName('code')[0].value = '12345';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return false; };
  document.getElementsByClassName('code')[0].checkValidity = function checkValidity() { return false; };
  document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return false; };
  user.validateForm(evt);
  const sbutton = document.getElementsByClassName('regbutton')[0];
  expect(sbutton.style.display).toBe('none');
  document.getElementsByClassName('email')[0].value = 'joesmith@.com';
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('code')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('code')[0].value = '123459';
  user.validateForm(evt);
  expect(sbutton.style.display).toBe('none');
  document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
  document.getElementsByClassName('email')[0].checkValidity = function checkValidity() { return false; };
  user.validateForm(evt);
  expect(sbutton.style.display).toBe('none');
});

test('it resets the password', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({})
    });
  };
  user.fetch = mockfetch2;
  user.formType = 'reset';
  user.verifyEmail();
  document.getElementsByClassName('loginpass')[0].value = 'password1';
  document.getElementsByClassName('code')[0].value = '12345';
  document.getElementsByClassName('email')[0].value = 'joe@smith.com';
  const evt = { target: { formType: 'reset', fetchClient: mockfetch2, runFetch: user.runFetch } };
  user.resetPasswd(evt).then(() => {
    const messagediv = document.getElementsByClassName('loginerror')[0];
    expect(messagediv.innerHTML).toBe('');
  });
});

test('it displays the error message from reset password PUT', () => {
  document.body.innerHTML = '<div><div class="home"></div></div>';
  user = new User_();
  user.formType = 'reset';
  user.userEmail = 'joe@smith.com';
  user.verifyEmail();
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({ message: 'incorrect email' })
    });
  };
  const evt = { target: { formType: 'reset', fetchClient: mockfetch2, runFetch: user.runFetch } };
  document.getElementsByClassName('loginpass')[0].value = 'password1';
  document.getElementsByClassName('code')[0].value = '12345';
  user.resetPasswd(evt).then(() => {
    const messagediv = document.getElementsByClassName('loginerror')[0];
    expect(messagediv.innerHTML).toMatch(/incorrect email/);
    messagediv.innerHTML = '';
  });
});

test('it catches the error from reset password PUT', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.reject(new Error({ error: 'server error' }))
    });
  };
  const evt = { target: { formType: 'reset', fetchClient: mockfetch2, runFetch: user.runFetch } };
  return user.resetPasswd(evt)
    .catch(e => expect(e).toBeTruthy());
});

test('it updates the user', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({})
    });
  };
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  user.updateUser(evt).then(() => {
    const messagediv = document.getElementsByClassName('loginerror')[0];
    expect(messagediv.innerHTML).toBe('');
  });
});

test('it displays error message on updates the user PUT', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({ message: 'wrong email' })
    });
  };
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  user.updateUser(evt).then(() => {
    const messagediv = document.getElementsByClassName('loginerror')[0];
    expect(messagediv.innerHTML).toMatch(/wrong email/);
    messagediv.innerHTML = '';
  });
});

test('it catches errors on update the user PUT', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.reject(new Error({ error: 'big problem' }))
    });
  };
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  return user.updateUser(evt)
    .catch(e => expect(e).toBeTruthy());
});

test('it hides the form', () => {
  document.body.innerHTML = '<div class="form" style="display:block"></div>';
  user.nevermind('form');
  expect(document.getElementsByClassName('form')[0].style.display).toBe('none');
});

test('it displays a email varification form for a change email request', () => {
  document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm"></div>';
  user.userEmail = '';
  user.changeEmail = 'bob@smith.com';
  user.verifyEmail();
  expect(document.getElementsByClassName('email')[0].value).toBe('bob@smith.com');
});

test('it sends PUT request to varify the changed email with pin', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({ success: true })
    });
  };
  user.fetch = mockfetch2;
  document.body.innerHTML = '<input class="email" value="new@email.com">'
  + '<input class="code" value="12345"><div class="loginerror"></div>';
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  return user.verifyChangeEmail(evt).then(() => {
    expect(document.getElementsByClassName('loginerror')[0].innerHTML).toBe('');
  });
});

test('it sends PUT request to varify the changed email with pin and displays error message', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve({ message: 'incorrect pin' })
    });
  };
  user.fetch = mockfetch2;
  document.body.innerHTML = '<input class="email" value="new@email.com">'
  + '<input class="code" value="12345"><div class="loginerror"></div>';
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  return user.verifyChangeEmail(evt).then(() => {
    expect(document.getElementsByClassName('loginerror')[0].innerHTML).toBe('<p style="text-align:left; padding-left:12px">incorrect pin</p>');
  });
});

test('it sends PUT request to varify the changed email with pin and catches error', () => {
  const mockfetch2 = function mockfetch2(url, data) {
    this.headers = {};
    this.headers.url = url;
    this.headers.method = data.method;
    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.reject(new Error({ error: 'big problem' }))
    });
  };
  user.fetch = mockfetch2;
  const evt = { target: { fetchClient: mockfetch2, runFetch: user.runFetch } };
  return user.verifyChangeEmail(evt)
    .catch(e => expect(e).toBeTruthy());
});
