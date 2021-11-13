import React, { useState } from 'react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';

const profile = async (token) =>{
    try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
        const res = await axios.get('/api/profile/me', config);
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error.response.data);
      }
}

function UserLanding(props){
  const history = useHistory();
    const token = sessionStorage.getItem('agora_token');
    const json =  profile(token);
    const [query, setQuery] = useState('');

    const handleSearch = (query) => {
        history.push(`/users?${query}`);
    }

    return (
      <div>
        <div>
            <input
            type='text'
            placeholder='Search for User'
            name='query'
            value={query}
            onChange={(e) => {setQuery(e.target.value)}}
            required
          />
          <button onClick={(e) => handleSearch(query)}>Search</button>
        </div>
        <div>
          <h2>
            Following:
          </h2>
          <h3>
            {json.followers}
          </h3>
        </div>
      </div>
    )
}

export default UserLanding