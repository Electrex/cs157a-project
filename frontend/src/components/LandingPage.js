import React from 'react';
import { NavLink, useHistory} from 'react-router-dom';

import "./style.css";

function LandingPage(props) {
    const history = useHistory();

    const routeChange = (path) => {
        history.push(path);
    }

    return (
        <div className='App'>
            <div className='appAside' />
            <div className='appForm'>
                <hr/>
                {/* <button onClick={() => routeChange('/')}>LandingPage</button> */}
                <button onClick={() => routeChange('/signin')}>SignIn</button>
                <button onClick={() => routeChange('/signup')}>Register</button>
                {/* <button onClick={() => routeChange('/home')}>UserLanding</button>
                <button onClick={() => routeChange('/transactions')}>Register</button>
                <button onClick={() => routeChange('/listing')}>Listing</button> */}
            </div>
        </div>
    );
}

export default LandingPage;