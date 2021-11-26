import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './style.css';

const getMyTransactions = async () => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      };

      const res = await axios.get('/transactions/me', config);
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

function Transactions(props) {
    const history = useHistory();
    const [displayRows, setRows] = useState([]);
    let rows = [];

    useEffect(() => {
      const fetchData = async () =>{
          const searchResult = await getMyTransactions();

          for (let i = 0; i < searchResult.length; i++){
              rows.push((
                  <tr key = {i}>
                      <td className='tableRowLabelLeft'>{searchResult[i].transactionID}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].listingID}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].userName}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].transactionDate}</td>
                      <td className='tableRowLabelCenter'>{searchResult[i].price}</td>
                  </tr>
              ))
          }
          setRows(rows)
      }
      fetchData();
  }, []);

    const table = (
        <table>
            <thead>
                <tr>
                    <th className='tableHeaderLabel'>Transaction ID</th>
                    <th className='tableHeaderLabel'>Listing ID</th>
                    <th className='tableHeaderLabel'>Seller</th>
                    <th className='tableHeaderLabel'>Transaction Date</th>
                    <th className='tableHeaderLabel'>Transaction Amount</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{displayRows}</tbody>
        </table>
    );

    const goBackToHome = () => {
      history.push('/home');
    }

    return (
        <div className='DarkApp'>
            <h1 className='pageTitle'>My Transactions</h1>
            <div>
            <button className='searchFieldButton' onClick={(e) => goBackToHome()}>Go back to homepage</button>
            <br></br><br></br>
            </div>
            <div>
                {table}
            </div>
        </div>
    );
}

export default Transactions;
