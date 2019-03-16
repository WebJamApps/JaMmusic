const Login_ = require('../../src/classes/Login_.js');

describe('The Login_ Class', () => {
  let login_;
  beforeEach((done) => {
    login_ = new Login_();
    done();
  });
  it('does nothing', (done) => {
    done();
  });
  it('generates a login form', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('');
    const regform = document.getElementsByClassName('LoginForm');
    expect(regform[0]).toBeDefined();
  });
  it('hides a login form with click Cancel button', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup();
    document.getElementsByClassName('nevermind')[0].click();
    const regform = document.getElementsByClassName('LoginForm');
    expect(regform[0].style.display).toBe('none');
  });
  it('initiates a reset password request', async () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('');
    login_.runFetch = function runFetch() { return Promise.resolve(true); };
    const mockfetch = function mockfetch(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ email: 'joe@smith.com' })
      });
    };
    const evt = { target: { fetchClient: mockfetch, appName: '', runFetch: login_.runFetch } };
    let data;
    try {
      data = await login_.resetpass(evt);
      expect(data).toBe(true);
    } catch (e) { throw e; }
  });
  it('it catches error on reset password', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('');
    const mockfetch = function mockfetch(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({ error: 'rejected' }))
      });
    };
    const evt = { target: { fetchClient: mockfetch, appName: '', runFetch: login_.runFetch } };
    return login_.resetpass(evt)
      .catch(e => expect(e).toBeTruthy());
  });
  it('validates a valid login form', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = 'joe@smith.com';
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return true; };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    const loginbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpass = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(loginbutton.style.display).toBe('block');
    expect(resetpass.style.display).toBe('none');
  });
  it('validates a login form with invalid email (missing period)', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = 'joe@smithcom';
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return true; };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('none');
  });
  it('validates a login form with invalid email (Google)', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = 'joe@gmail.com';
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return true; };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('none');
  });
  it('validates a login form with invalid email (missing @)', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = 'joegma.com';
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return false; };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('none');
  });
  it('does not display the login button with invalid password and valid email', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = 'joe@smith.com';
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return false; };
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return true; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('block');
  });
  it('It does not display reset password button', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('');
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return false; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: '', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('none');
  });
  it('login and reset buttons do not display when email is not valid format', () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('OtherApp');
    document.getElementsByClassName('loginemail')[0].value = '33333';
    document.getElementsByClassName('loginemail')[0].checkValidity = function checkValidity() { return false; };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    document.getElementsByClassName('loginpass')[0].checkValidity = function checkValidity() { return true; };
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const evt = { target: { appName: 'OtherApp', buttonsErrors: login_.buttonsErrors } };
    login_.validateLogin(evt);
    expect(logbutton.style.display).toBe('none');
    expect(resetpassButton.style.display).toBe('none');
    document.body.innerHTML = '';
  });
  it('logs in the user', async () => {
    document.body.innerHTML = '<div class="home"></div>';
    login_.startup('');
    login_.runFetch = function runFetch() { return Promise.resolve(true); };
    document.getElementsByClassName('loginpass')[0].value = '123456789';
    const mockfetch = function mockfetch(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ token: 'lsdfldjflsdjlfdjfsjdlf', email: 'joe@smith.com' })
      });
    };
    const evt = {
      target: {
        fetchClient: mockfetch, appName: '', runFetch: login_.runFetch, checkIfLoggedIn() {}, generateSession() {}
      }
    };
    const mockStorage = {
      setItem() {
        // do nothing
      },
      getItem() {
        // do nothing
      }
    };
    window.localStorage = mockStorage;
    document.body.innerHTML += '<div class="ShowWAuth"></div><div class="HideWAuth"></div>';
    let data;
    try {
      data = await login_.logMeIn(evt);
      expect(data).toBe(true);
    } catch (e) { throw e; }
  });
  it('runs fetch and returns a token', async () => {
    const mockStorage = {
      setItem(name, data) {
        expect(data).toBe('booya');
      },
      getItem() {
        // do nothing
      }
    };
    window.localStorage = mockStorage;
    document.body.innerHTML += '<div class="loginForm"></div><div class="loginerror"></div>';
    const fc = function fc() { return Promise.resolve({ json() { return Promise.resolve({ token: 'booya' }); } }); };
    try {
      await login_.runFetch(fc, '', '', {});
    } catch (e) { throw e; }
  });
  it('runs fetch and returns an email to reset password', async () => {
    const mockStorage = {
      setItem() {
      },
      getItem() {
        // do nothing
      }
    };
    window.localStorage = mockStorage;
    document.body.innerHTML += '<div class="loginForm"></div><div class="loginerror"></div>';
    const fc = function fc() { return Promise.resolve({ json() { return Promise.resolve({ email: 'booya@boo.com' }); } }); };
    try {
      await login_.runFetch(fc, '', '', {});
      expect(document.getElementsByClassName('LoginForm')[0].style.display).toBe('none');
    } catch (e) { throw e; }
  });
  it('runs fetch and returns an error message', async () => {
    const mockStorage = {
      setItem() {
      },
      getItem() {
        // do nothing
      }
    };
    window.localStorage = mockStorage;
    document.body.innerHTML += '<div class="loginForm"></div><div class="loginerror"></div>';
    const fc = function fc() { return Promise.resolve({ json() { return Promise.resolve({ message: 'bad' }); } }); };
    try {
      await login_.runFetch(fc, '', '', {});
      expect(document.getElementsByClassName('loginerror')[0].innerHTML).toBe('<p style="text-align:left; padding-left:12px">bad</p>');
    } catch (e) { throw e; }
  });
});
