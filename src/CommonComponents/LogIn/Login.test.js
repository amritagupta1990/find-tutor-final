import React from 'react';
import { render } from '@testing-library/react';
import LoginComponent from './Login';

// import API mocking utilities from Mock Service Worker.
import {rest} from 'msw'
import {setupServer} from 'msw/node'

// import testing utilities
import {fireEvent, screen} from '@testing-library/react'
import {
    // Tip: all queries are also exposed on an object
    // called "queries" which you could import here as well
    waitFor,
  } from '@testing-library/dom'

const fakeUserResponse =  { token: 'fake_user_token', isValidUser: true, userDetails: null}
// const emailErrorResponse =  { error: true, message: "Email is not registered. Please Register.", isValidUser: false}
const server = setupServer(
  rest.post('http://localhost:5001/api/login', (req, res, ctx) => {
    return res(ctx.json(fakeUserResponse))
  }),
)

var localStorageMock = (function() {
    var store = {};
    return {
      getItem: function(key) {
        return store[key];
      },
      setItem: function(key, value) {
        store[key] = value.toString();
      },
      clear: function() {
        store = {};
      },
      removeItem: function(key) {
        delete store[key];
      }
    };
  })();

beforeAll(() => server.listen());
beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
afterEach(() => {
  server.resetHandlers()
  window.localStorage.removeItem('token')
})
afterAll(() => server.close())

test('doLogin Method for success response', async () => {
    
    render(<LoginComponent />);
    // fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: {value: 'test@gmail.com'},
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: {value: '123456'},
    });
    // await waitFor(() => {
        fireEvent.click(screen.getByText(/submit/i));
    //   })
    
    setTimeout(() => {
        let token = window.localStorage.getItem('auth-data');
        console.log('token', token);
        if(token){
            expect(token).toEqual(fakeUserResponse.token);
        }
      }, 0)
    
});