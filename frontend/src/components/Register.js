import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

import './style.css';

function Register(props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const initialState = {
    name: '',
    email: '',
    password: '',
    password2: ''
  };

  const clearState = () => {
    setEmail(initialState.email);
    setName(initialState.name);
    setPassword(initialState.password);
    setPassword2(initialState.password2);
  };

  const register = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      console.log('Passwords do not match')
    } else {
      const newUser = {
        name,
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

        const res = await axios.post('/api/users', body, config);
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

  const createProfile = async (e) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': sessionStorage.getItem('agora_token')
      }
    }

    const newProfile = {
      user: sessionStorage.getItem('agora_token'),
      bio: `Hi! I am ${name}`,
      followers: [],
      following: [],
      reviews: []
    }

    try{
      const body = JSON.stringify(newProfile)
      const res = await axios.post('/api/profile', body, config);
      if (res.status === 400 || res.status === 500){
        return null
      }
      console.log(res.data);
      return res.data
    } catch (error) {
        console.log(error.response.data);
        return null
    }
  }

  const handleRegister = async (e) => {
    if (await register(e)){
      if(await createProfile(e)){
        props.history.push('/me')
      }
      else{
        setEmail(initialState.email);
        setName(initialState.name);
        setPassword(initialState.password);
        setPassword2(initialState.password2);
      }
    }
    else{
      setEmail(initialState.email);
      setName(initialState.name);
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
              Name
              </label>
              <input
              type='text'
              className='formFieldInput'
              placeholder='Enter your name'
              name='name'
              value={ name }
              onChange={ (event) => {setName(event.target.value)} }
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
