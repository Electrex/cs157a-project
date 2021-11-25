import React, { useState } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserList from './components/UserList';
import Login from './components/Login';
import Register from './components/Register';
import Transactions from './components/Transactions';

function App(){
  return(
    <BrowserRouter>
      <main>
        <Switch>
          <Route path='/' exact component={LandingPage}/>
          <Route path='/signin' exact component={Login}/>
          <Route path='/signup' exact component={Register}/>
          <Route path='/home' exact component={UserList}/>
          <Route path='/myTransactions' exact component={Transactions}/>
        </Switch>
      </main>
    </BrowserRouter>
  )
}

export default App;
