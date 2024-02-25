// import '@babel/polyfill';
// import showAlert from('./alerts/showAlert')

const login = async (email, password) => {
  const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
  };

  const showAlert = (type, msg, time = 7) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
  };
  const myHeaders = new Headers();
  // console.log(email, password);
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    email: email,
    password: password,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('/api/v1/users/login', requestOptions)
    .then(async (response) => {
      const result = await response.json();
      // console.log(result);
      if (result.status === 'success') {
        showAlert(
          result.status,
          `${result.data.user.name.split(' ')[0]} Your Logged in Successfully!`
        );
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      } else {
        showAlert('error', result.message);
      }
    })
    .catch(async (error) => {
      const result = await error.response.json();
      // console.log(result);
    });
};

const loginForm = document.querySelector('.form--login');
// document.querySelector('.form--login').addEventListener('submit', (e) => {
//   e.preventDefault(); //Prevents form from loading any other page
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

const logout = () => {
  // console.log('Logging Out');
  const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
  };

  const showAlert = (type, msg, time = 7) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
  };
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  fetch('/api/v1/users/logout', requestOptions)
    .then(async (response) => {
      const result = await response.json();
      // console.log(result);
      if (result.status === 'success') {
        showAlert(result.status, ` Your Logged out Successfully!`);
        // window.setTimeout(() => {
        location.assign('/');
        // }, 1500);
      } else {
        showAlert('error', result.message);
      }
    })
    .catch(async (error) => {
      const result = await error.response.json();
      // console.log(result);
    });
};

const logOutBtn = document.querySelector('.nav__el--logout');
// console.log(logOutBtn);

if (logOutBtn) logOutBtn.addEventListener('click', logout);

const userDataForm = document.querySelector('.form-user-data');

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

const userPasswordForm = document.querySelector('.form-user-password');
// console.log(userPasswordForm);
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // console.log({ passwordCurrent, password, passwordConfirm });
    const raw = JSON.stringify({
      "password": password,
      "passwordConfirm": passwordConfirm,
      "passwordCurrent": passwordCurrent
    });


    await updateSettings(
      raw,
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

const updateSettings = (data, types) => {
  // console.log(data);
  const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
  };

  const showAlert = (type, msg, time = 7) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
  };

  const requestOptions =types==='password'? {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json', 
    },
    body: data,
    redirect: 'follow',
  }:{
    method: 'PATCH',
    body: data,
    redirect: 'follow',
  };

  const url =
    types === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';
  fetch(url, requestOptions)
    .then(async (response) => {
      const result = await response.json();
      // console.log(result);
      if (result.status === 'success') {
        showAlert(
          result.status,
          `${types.toUpperCase()} updated successfully!`
        );
      } else {
        // showAlert('error', result.message);
        showAlert(result.status, result.message);
      }
    })
    .catch(async (error) => {
      const result = await error.response.json();
      showAlert('error', error.response.data.message);

      // console.log(result);
    });
};
