exports.doubleCheckSignups = async function doubleCheckSignups(thisevent, module, doc) {
  // get this event, check if start date is in past, check if max signups are already reached
  const errorP = doc.getElementsByClassName('signupErrors')[0];
  let res, data;
  module.canSignup = true;
  try {
    res = await module.app.httpClient.fetch(`/volopp/get/${thisevent._id}`);
    data = await res.json();
  } catch (e) {
    module.canSignup = false;
    return Promise.reject(e);
  }
  if (data.voStartDate) {
    let today = new Date(), testDate = data.voStartDate.replace('-', '');
    testDate = testDate.replace('-', ''); // there are two - in the date, so need to do the twice
    testDate = Number(testDate);
    today = module.commonUtils.formatDate(today);
    today = Number(today);
    if (testDate < today) {
      errorP.innerHTML = 'this event has already started';
      module.canSignup = false;
      thisevent.past = true;
    }
  }
  if (data.voPeopleScheduled) {
    if (data.voPeopleScheduled.length >= data.voNumPeopleNeeded) {
      errorP.innerHTML = 'this event has already reached max volunteers needed';
      module.canSignup = false;
      thisevent.maxReached = true;
    }
  }
  return Promise.resolve(module.canSignup);
};

exports.signupEvent = async function signupEvent(thisevent, module, document) {
  let result;
  try {
    result = await this.doubleCheckSignups(thisevent, module, document);
  } catch (e) {
    return module.app.logout();
  }
  if (module.canSignup) {
    thisevent.voPeopleScheduled.push(module.uid);
    await module.app.updateById('/volopp/', thisevent._id, thisevent);
    await module.fetchAllEvents();
    module.checkScheduled();
    module.app.router.navigate('dashboard');
    return Promise.resolve(thisevent);
  }
  return Promise.resolve(result);
};

exports.updateUser = async function updateUser(module, win) {
  await module.app.updateById('/user/', module.uid, module.user);
  await module.activate();
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'test') {
    win.location.reload();
  }
  return Promise.resolve(true);
};

exports.attachVolPage = function attachVolPage(doc, module) {
  doc.getElementById('distanceInput').addEventListener('keydown', module.showButton);
  module.setupVolunteerUser();
  if (doc.documentElement.clientWidth < 766) doc.getElementsByClassName('checkboxes-div')[0].style.top = '124px';
  return Promise.resolve(true);
};
