// import jwt from 'jwt-simple';
// import request from 'superagent';

const initialState = {
  isAuthenticated: false,
  error: '',
  email: '',
  token: '',
  user: {},
};
// const setToken = async (action, state) =>
//   // const decoded = await jwt.decode(action.data.token, process.env.HashString);
//   // console.log(decoded);// eslint-disable-line no-console
//   // let user;
//   // try {
//   //   user = await request.get(`${process.env.BackendUrl}/user/${decoded.sub}`)
//   //     .set('Accept', 'application/json').set('Authorization', `Bearer ${action.data.token}`);
//   // } catch (e) {
//   //   return {
//   //     ...state,
//   //     isAuthenticated: false,
//   //     email: '',
//   //     token: '',
//   //     error: `${e.message}`,
//   //     decoded: '',
//   //     user: {},
//   //   };
//   // }
//   // console.log(user.body);// eslint-disable-line no-console
//   ({
//     ...state,
//     isAuthenticated: true,
//     email: action.data.email,
//     token: action.data.token,
//     error: '',
//     decoded,
//     // user: user.body,
//   });
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GOT_TOKEN':
      return {
        ...state,
        isAuthenticated: true,
        email: action.data.email,
        token: action.data.token,
        error: '',
        user: {},
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        email: '',
        token: '',
        error: '',
        user: {},
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        email: '',
        token: '',
        error: action.error.message,
        user: {},
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
