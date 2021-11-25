import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './style.css';

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

const search = async (qs) => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      let body = {
      };
      let q = new URLSearchParams(qs);
      if (q.has("make")) {
        body.make = q.get("make");
      }
      if (q.has("model")) {
        body.model = q.get("model");
      }
      if (q.has("mileage")) {
        body.mileage = q.get("mileage");
      }
      if (q.has("year")) {
        body.year = q.get("year");
      }

      const res = await axios.post('/listings/byQuery', body, config);
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

function UserList(props) {
    const history = useHistory();
    const [updateState, setUpdate] = useState(0);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [mileage, setMileage] = useState();
    const [year, setYear] = useState();
    const [displayRows, setRows] = useState([]);
    let searchQuery = props.location.search.substring(1)
    let rows = [];

    useEffect(() => {
      const fetchData = async () =>{
          var searchResult = [];
          if (searchQuery.length == 0){
              searchResult = await getAllListings();
          }
          else{
              searchResult = await search(searchQuery);
          }

          for (let i = 0; i < searchResult.length; i++){
              rows.push((
                  <tr key = {i}>
                      <td className='tableRowLabelLeft'>{searchResult[i].vin}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].make}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].model}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].year}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].location}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].mileage}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].price}</td>
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
    
    const handleSearch = (make, model, mileage, year) => {
      let queryString = '/home?';
      if (make !== '') {
        queryString += `make=${make}&`;
      }
      if (model !== '') {
        queryString += `model=${model}&`;
      }
      if (mileage !== undefined) {
        queryString += `mileage=${mileage}&`;
      }
      if (year !== undefined) {
        queryString += `year=${year}&`;
      }
      queryString = queryString.slice(0, -1); 
      history.push(queryString);
      setUpdate(updateState + 1)
    }

    const handleTransactionView = () => {
      history.push('/myTransactions');
    }

    return (
        <div className='DarkApp'>
            <h1 className='pageTitle'>Car Listings</h1>
            <div>
            <input
                type='text'
                placeholder='Make:'
                name='make'
                value={make}
                onChange={(e) => {setMake(e.target.value)}}
                required
                className='searchFieldInput'
            />
            <input
                type='text'
                placeholder='Model:'
                name='model'
                value={model}
                onChange={(e) => {setModel(e.target.value)}}
                required
                className='searchFieldInput'
            />
            <input
                type='number'
                placeholder='Mileage at most:'
                name='mileage'
                value={mileage}
                onChange={(e) => {setMileage(e.target.value)}}
                required
                className='searchFieldInput'
            />
            <input
                type='number'
                placeholder='Year newer than:'
                name='year'
                value={year}
                onChange={(e) => {setYear(e.target.value)}}
                required
                className='searchFieldInput'
            />
            <button className='searchFieldButton' onClick={(e) => handleSearch(make, model, mileage, year)}>Search</button>
            <br></br><br></br>
            <button className='searchFieldButton' onClick={(e) => handleTransactionView()}>View My Transactions</button>
            <br></br><br></br>
            </div>
            <div>
                {table}
            </div>
        </div>
    );
}

export default UserList;
