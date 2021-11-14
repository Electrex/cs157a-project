import React, { useState } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';

function App(){
  return(
    <BrowserRouter>
      <main>
        <Switch>
          <Route path='/' exact component={LandingPage}/>
          <Route path='/signin' exact component={Login}/>
          <Route path='/signup' exact component={Register}/>
        </Switch>
      </main>
    </BrowserRouter>
  )
}

export default App;