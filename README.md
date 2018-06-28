# JWT API Middleware & Utils

With a little help from [Axios](https://github.com/axios/axios)

---

## Introduction

This middleware helps with:

- Dispatching Flux Standard Actions for API Calls
- Adding a JWT authorization header for authenticated calls
- Proactively refreshing expired (or near-expired) tokens

It ships with:

- `apiMiddleware` - The middleware
- `Auth` - An Auth class to help saving stuff to localStorage
- `createDataReducer` - A reducer creator to help create simple reducers to save and delete auth data
- `checkAuth` - An High Order Component to protect routes

### Actions

A simple action requires:

- `types`: Array with one element for each of the action lifecycle (start, complete, error)
- `callAPI`: Function to make the request

```jsx
export const fetchSomething = () => ({
  callAPI: () => fetch("http://localhost:3000/something")
  types: ["START", "COMPLETE", "ERROR"]
  ]
})
```

## Auth class

Auth's constructor accepts an object with 3 optional parameters:

```jsx
// Somewhere that can easily be imported (e.g.: index.js)
const auth = new Auth({
  // localStorage key to save extra auth data
  dataKey: "auth_data"
  // localStorage key to save access token
  accessToken: "authToken_access"
  // localStorage key to save refresh token
  refreshToken: "authToken_refresh"
})
```

### Available methods

- `login`: Accepts an object with `data`, `accessToken` and `refreshToken`.
  Will save them to localStorage.
- `logout`: Removes all three from localStorage
- `isAuthed`: Returns a boolean to check whether there's an access token or not in localStorage
- `saveToken`: Saves the access token
- `saveRefreshToken`: Saves the refresh token
- `saveData`: Saves auth extra data
- `getToken`: To retrieve the access token
- `getRefreshToken`: To retrieve the refresh token
- `getData`: To retrieve the extra auth data

## Middleware

### Setup

```jsx
apiMiddleware({
  /* 
    An Auth Class instance that the middleware will use to manage the tokens in localStorage.
    It's recommended that you initialize your Auth somewhere else (e.g. index.js) and then import it here
  */
  auth: new Auth(),

  /*
    The API's base URL. It will be fed to an Axio's instance
  */
  baseUrl: "http://yourapi.com/api",

  /*
    Function to parse the token to the Authorization header
  */
  parseToken: token => `Bearer ${token}`,

  /*
    Function to make the refresh request.
    This function receives an axios instance (with the base URL already set) and the token
  */
  makeRefreshTokenCall: (axios, token) =>
    axios.post("/refresh", { refreshToken: token }),

  /*
    Function to get the tokens from the server repsonse.
    It receives the server response and must return an object with two keys:
    - accessToken
    - refreshToken
  */
  getTokenFromResponse: res => ({
    accessToken: res.jwt,
    refreshToken: res.jwt_refresh
  })
});
```

**Example**

```jsx
// in configureStore.prod.js
import { createStore, applyMiddleware } from "redux";

import reducers from "../reducers";
// Auth's instance
import { auth } from "../";

const configureStore = preloadedState => {
  const middleware = [
    apiMiddleware({
      auth,
      baseUrl: "https://yourproductionapi.com/api",
      parseToken: token => `Bearer ${token}`,
      makeRefreshTokenCall: (axios, token) =>
        axios.post("/auth/user/refresh", { jwt_refresh: token }),
      getTokenFromResponse: res => ({
        accessToken: res.jwt,
        refreshToken: res.jwt_refresh
      })
    })
  ];

  const store = createStore(
    reducers,
    preloadedState,
    applyMiddleware(...middleware)
  );

  return store;
};

export default configureStore;
```

### Actions

Actions accept the following keys:

- types
- callAPI
- shouldCallAPI
- meta

#### types

It is mandatory for types to be an Array or **either Strings or Objects**

It is mandatory for `types` to be an Array with one element for each of the action lifecycle:
'START', 'COMPLETE', 'ERROR' (In this specific order).

- Each must be a String or an Object (with 'type' and 'payload').
- The Object's payload key must be a function that will be given the server response, dispatch function and state object.

```jsx
{
  types: ["START", "COMPLETE", "ERROR"];
}
```

```jsx
{
  types: [
    "START",
    {
      type: "COMPLETE",
      payload: res => res.data
    },
    "ERROR"
  ];
}
```

```jsx
{
  types: [
    "START",
    {
      type: "COMPLETE",
      payload: res => normalize(res.data, schema.data)
    },
    {
      type: "ERROR",
      payload: res => res.error.id
    }
  ];
}
```

#### callAPI

`callAPI`, as the name says, is the function to call the API. It will be given two arguments:

- an axios instance: with the base url and a header interceptor to add authorization headers
- the redux state

```jsx
{
  callAPI: () => fetch("https://someurl.com/");
}
```

```jsx
{
  callAPI: axios => axios.get("https://someurl.com/");
}
```

```jsx
{
  callAPI: (axios, state) => {
    return axios.post(`/users/${state.user.id}/profile`, {
      email: "mynewemail@domain.com"
    });
  };
}
```

#### shouldCallAPI

A Function to evaluate if the request should return early. It is given the state and should return a boolean.

```jsx
shouldCallAPI: () => true;
```

```jsx
shouldCallAPI: state => !state.data.isFetching;
```

#### meta

The `meta` object will be forwarded in each of the actions

```jsx
meta: {
  someData: "This will be available in every action dispatched";
}
```

#### Complete action

```jsx
export const getUserData = id => ({
  shouldCallAPI: state => !state.profile.isFetching,
  callAPI: api.get(`/users/${id}`),
  types: [
    "FETCH_PROFILE_START",
    {
      type: "FETCH_PROFILE_COMPLETE",
      payload: response => response.data
    },
    "FETCH_PROFILE_ERROR"
  ],
  meta: {
    userId: id
  }
});
```

## Reducer creator

```jsx
// in reducers/index.js

export default combineReducers({
  authData: createDataReducer({
    // Array of types that will make the reducer save the payload
    addDataTypes: [types.LOGIN_COMPLETE],
    // Array of types to revert to the initialState
    removeDataTypes: [types.LOGOUT],
    // Initial State (Defaults to {})
    initialState: {}
  })
  // Your other reducers here
});
```

## checkAuth HOC (with [React Router](https://github.com/ReactTraining/react-router))

An usual implementation will load the reducer above as the store's preloaded state:

```jsx
<Provider store={configureStore({ authData: auth.getData() || {} })}>
```

This High Order Component will make use of that piece of state to protect routes.
`checkAuth` is a high-order-function that accepts an Object with the following keys:

```jsx
checkAuth({
  /*
    Function to map the state to a boolean that evaluates the authed status
  */
  mapIsAuthedToProps: state => Object.keys(state.authData).length > 0

  /*
    Boolean to define whether the HOC should redirect when the user is authed or not. Can be useful if some pages are available only for guest users.
    Defaults to true
  */
  requireAuthentication: true

  /*
    Route to redirect to (using React Router's Redirect component).
    Defaults to "/login"
  */
  redirectTo: "/login"
})
```

An usual implementation of this High Order Component is to create a file `src/hoc/checkAuthentication.js` and create some defaults there:

```jsx
const mapIsAuthedToProps = state => Object.keys(state.authData).length > 0;

export const requireAuth = checkAuth({
  mapIsAuthedToProps
});

export const requireGuest = checkAuth({
  mapIsAuthedToProps,
  requireAuthentication: false,
  redirectTo: "/profile"
});
```

Then use it where you define the Routes:

```jsx
<Route exact path="/profile" component={requireAuth(Profile)} />
<Route exact path="/login" component={requireGuest(Login)} />
```

---

Check source code for an example app.
