import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './style.css';

const search = async (q) => {
    try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const body = {'name': q};

        const res = await axios.post('/api/profile/byname', body, config);
        if (res.status === 400 || res.status === 500){
          return [];
        }
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error.response.data);
        return [];
      }
}

const fullList = async () => {
    try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          }
        }
        const res = await axios.get('/api/profile', config);
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error.response.data);
        return [];
      }
}

const myId = async () => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      }
      const res = await axios.get('/users/myID', config);
      console.log(res.data);
      return res.data.id;
    } catch (error) {
      console.log(error.response.data);
      return '';
    }
}

const getAllListings = async () => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      }
      const res = await axios.get('/listings/all', config);
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.response.data);
      return '';
    }
}

function UserList(props) {
    const history = useHistory();
    const [updateState, setUpdate] = useState(0);
    const [query, setQuery] = useState('');
    const [displayRows, setRows] = useState([]);
    let [searchResult, setSearchResult] = useState([]);
    const searchQuery = props.location.search.substring(1)
    let rows = [];

    const fetchData = async () => {
        let res;
        if (searchQuery.length === 0) {
            res = await getAllListings();
        } 
        else {
            res = await search(searchQuery);
        }
        return res;
    }

    const handleFollow = async (userId) => {
        try {
            const config = {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': sessionStorage.getItem('agora_token')
              }
            }
            const body = {}
            const res = await axios.post(`/api/profile/follow/${userId}`, body, config);
            console.log(res.data);
          } catch (error) {
            console.log(error.response.data);
          }
          setUpdate(updateState + 1)
    }

    const viewProfile = (profileId) => {
        history.push(`/profile/${profileId}`)
    }

    useEffect(() => {
      const fetchData = async () =>{
          var searchResult = [];
          if (searchQuery.length == 0){
              searchResult = await getAllListings();
          }
          else{
              searchResult = await search(searchQuery);
          }
          const id = await myId();
          const listings = await getAllListings();

          for (let i = 0; i < searchResult.length; i++){
              var buttonName = 'Visit Listing';
              // for (let j = 0; j < searchResult[i].followers.length; j++){
              //   if (searchResult[i].followers[j]._id == id){
              //     buttonName = 'Unfollow'
              //   }
              // }
              rows.push((
                  <tr key = {i}>
                      <td className='tableRowLabelLeft'>{searchResult[i].vin}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].make}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].model}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].year}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].location}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].mileage}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].price}</td>
                      {/* <td><button className='tableButton' 
                          onClick={()=>history.push(`/listing/${searchResult[i].listingID}`)}>
                            {buttonName}</button></td> */}
                      <td><button className='tableButton' onClick={()=>history.push(`/listing/${searchResult[i].listingID}`)}>View Listing</button></td>
                  </tr>
              ))
          }
          setRows(rows)
      }
      fetchData();
  }, [updateState]);

    const table = (
        <table>
            <thead>
                <tr>
                    <th className='tableHeaderLabel'>VIN</th>
                    <th className='tableHeaderLabel'>Make</th>
                    <th className='tableHeaderLabel'>Model</th>
                    <th className='tableHeaderLabel'>Year</th>
                    <th className='tableHeaderLabel'>Location</th>
                    <th className='tableHeaderLabel'>Mileage</th>
                    <th className='tableHeaderLabel'>Price</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{displayRows}</tbody>
        </table>
    );
    
    const handleSearch = (query) => {
        history.push(`/search?${query}`);
        setUpdate(updateState + 1)
    }

    return (
        <div className='DarkApp'>
            <h1 className='pageTitle'>Car Listings</h1>
            <div>
            <input
                type='text'
                placeholder='Search for Car Listing'
                name='query'
                value={query}
                onChange={(e) => {setQuery(e.target.value)}}
                required
                className='searchFieldInput'
            />
            <button className='searchFieldButton' onClick={(e) => handleSearch(query)}>Search</button>
            <br></br><br></br>
            </div>
            <div>
                {table}
            </div>
        </div>
    );
}

export default UserList;
