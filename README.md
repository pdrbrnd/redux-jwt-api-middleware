# JWT API Middleware & Utils

[WORK IN PROGRESS]

With a little help from [Axios](https://github.com/axios/axios)

---

## Introduction

This middleware helps with:

- Dispatching Flux Standard Actions for API Calls
- Adding a JWT authorization header for authenticated calls
- Proactively refreshing expired (or near-expired) tokens

It also ships with:

- An Auth class to help saving stuff to localStorage
- A reducer creator to help create simple reducers to save and delete auth data

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

### Auth class

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

### Reducer creator

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

## Installation

### Setup middleware

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

#### Example

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

## Actions

Action accept the following keys:

- types
- callAPI
- shouldCallAPI
- meta

### types

It is mandatory for types to be an Array or **either Strings or Objects**

It is mandatory for `types` to be an Array with one element for each of the action lifecycle:
'START', 'COMPLETE', 'ERROR' (In this specific order).

- Each must be a String or an Object (with 'type' and 'payload').
- The Object's payload key must be a function that will be given the server response, dispatch function and state object.

#### Examples

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

### callAPI

`callAPI`, as the name says, is the function to call the API. It will be given two arguments:

- an axios instance: with the base url and a header interceptor to add authorization headers
- the redux state

#### Examples

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

### shouldCallAPI

A Function to evaluate if the request should return early. It is given the state and should return a boolean.

#### Examples

```jsx
shouldCallAPI: () => true;
```

```jsx
shouldCallAPI: state => !state.data.isFetching;
```

### meta

The `meta` object will be forwarded in each of the actions

```jsx
meta: {
  someData: "This will be available in every action dispatched";
}
```
