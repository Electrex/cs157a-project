import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

import './style.css';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Start with empty text
    const initialState = {
        email: '',
        password: ''
    }

    // Function to clear email and password fields
    const clearState = () => {
        setEmail(initialState.email);
        setPassword(initialState.password);
    };

    // Function to check for login validity
    const login = async (e) => {
        e.preventDefault();

        const loginAttempt = {
            email,
            password
        }

        try {
            const config = {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            const body = JSON.stringify(loginAttempt)
            const result = await axios.post('/api/auth', body, config); // Authenticate email and password
            if (result.status === 400 || result.status === 500) {
                return null
            }
            sessionStorage.setItem('agora_token', result.data.token)
            console.log(result.data);
            return result.data
        } catch (error) {
            console.log(error.response.data);
            return null
        }
    }

    // Set page state depending on login success
    // TODO: pass user information into next page? Not sure if that is required
    const handleLogin = async (event) => {
        if (await login(event)) {
            props.history.push('/me')
        }
        else {
            setEmail(initialState.email);
            setPassword(initialState.password);
            alert('Invalid Email or Password.')
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
                    <form className='formFields' onSubmit={ event => handleLogin(event) }>
                        <div className='formField'>
                            <label className='formFieldLabel' htmlFor='email'>
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
                            <label className='formFieldLabel' htmlFor='password'>
                                Password
                            </label>
                            <input
                                type='password'
                                className='formFieldInput'
                                placeholder='Enter your password'
                                name='password'
                                value={ password }
                                onChange={ (event) => {setPassword(event.target.value)}}
                            />
                        </div>

                        <div className='formField'>
                            <button className='formFieldButton'>Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    
    )
}

export default Login;
