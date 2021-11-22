import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

import './style.css';

function Register(props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const initialState = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    password2: ''
  };

  const clearState = () => {
    setEmail(initialState.email);
    setFirstName(initialState.firstName);
    setLastName(initialState.lastName);
    setUserName(initialState.userName);
    setPassword(initialState.password);
    setPassword2(initialState.password2);
  };

  const register = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      console.log('Passwords do not match')
    } else {
      const newUser = {
        firstName,
        lastName,
        userName,
        email,
        password
      }

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }

        const body = JSON.stringify(newUser);

        const res = await axios.post('/users', body, config);
        clearState();
        if (res.status === 400 || res.status === 500){
          return null
        }
        console.log(res.data);
        sessionStorage.setItem('agora_token', res.data.token)
        return res.data
      } catch (error) {
        console.log(error.response.data);
        return null
      }
    }
  };

  const handleRegister = async (e) => {
    if (await register(e)){
      props.history.push('/home')
    }
    else{
      setEmail(initialState.email);
      setFirstName(initialState.firstName);
      setLastName(initialState.lastName);
      setUserName(initialState.userName);
      setPassword(initialState.password);
      setPassword2(initialState.password2);
      alert('An issue occurred, please try again.')
    }
  }

  return (
    <div className='App'>
      <div className='appAside' />
      <div className='appForm'>
        <div className='pageSwitcher'>
          <NavLink
            to="/signin"
            activeClassName="pageSwitcherItem-active"
            className="pageSwitcherItem"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/signup"
            activeClassName="pageSwitcherItem-active"
            className="pageSwitcherItem"
          >
            Sign Up
          </NavLink>
        </div>

        <div className='formCenter'>
          <form className='formFields' onSubmit={ event => handleRegister(event) }>
            <div className='formField'>
              <label className='formFieldLabel'>
              First Name
              </label>
              <input
              type='text'
              className='formFieldInput'
              placeholder='Enter your first name'
              name='firstName'
              value={ firstName }
              onChange={ (event) => {setFirstName(event.target.value)} }
              />
            </div>

            <div className='formField'>
              <label className='formFieldLabel'>
              Last Name
              </label>
              <input
              type='text'
              className='formFieldInput'
              placeholder='Enter your last name'
              name='lastName'
              value={ lastName }
              onChange={ (event) => {setLastName(event.target.value)} }
              />
            </div>

            <div className='formField'>
              <label className='formFieldLabel'>
              User Name
              </label>
              <input
              type='text'
              className='formFieldInput'
              placeholder='Enter your user-name'
              name='userName'
              value={ userName }
              onChange={ (event) => {setUserName(event.target.value)} }
              />
            </div>

            <div className='formField'>
              <label className='formFieldLabel'>
              E-Mail Address
              </label>
              <input
              type='email'
              className='formFieldInput'
              placeholder='Enter your email'
              name='email'
              value={ email }
              onChange={ (event) => {setEmail(event.target.value)} }
              />
            </div>

            <div className='formField'>
              <label className='formFieldLabel' htmlFor='email'>
              Password
              </label>
              <input
              type='password'
              className='formFieldInput'
              placeholder='Enter your password'
              name='password'
              value={ password }
              onChange={ (event) => {setPassword(event.target.value)} }
              />
            </div>


            <div className='formField'>
              <label className='formFieldLabel' htmlFor='password'>
              Confirm Password
              </label>
              <input
              type='password'
              className='formFieldInput'
              placeholder='Confirm your password'
              name='password2'
              value={ password2 }
              onChange={ (event) => {setPassword2(event.target.value)}}
              />
            </div>

            <div className='formField'>
              <button className='formFieldButton'>Create an account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
