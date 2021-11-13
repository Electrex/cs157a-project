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
                <p>Things below the hr tag is just for development to make things easier for people to view the page they are editing.</p>
                <button onClick={() => routeChange('/')}>LandingPage</button>
                <button onClick={() => routeChange('/signin')}>SignIn</button>
                <button onClick={() => routeChange('/signup')}>Register</button>
            </div>
        </div>
    );
}

export default LandingPage;