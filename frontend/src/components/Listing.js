import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './style.css';

const getAllTransactions = async () => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      };

      const res = await axios.get('/transactions/all', config);
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

const getMyListings = async () => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      };

      const res = await axios.get('/listings/user/me', config);
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

const getCarDetails = async (listingID) => {
  try {
      console.log(listingID);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      };

      const res = await axios.get(`/cars/details/${listingID}`, config);
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

const buy = async (listingID) => {
  try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('agora_token')
        }
      };

      const body = {
        listingID: listingID
      }

      const res = await axios.post(`/transactions/`, body, config);
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

function Listing(props) {
    const history = useHistory();
    const [displayRows, setRows] = useState([]);
    const listingID = props.match.params.listing_id;
    const [button, setButton] = useState(<div></div>);

    let rows = [];

    useEffect(() => {
      const fetchData = async () =>{
          const transactions = await getAllTransactions();
          const myListings = await getMyListings();
          console.log(transactions);
          console.log(myListings);
          const searchResult = await getCarDetails(listingID);

          let found = false;

          for (var i = 0; i < transactions.length; i++) {
            if (transactions[i].listingID === parseInt(listingID, 10)) {
              found = true;
              setButton(<button className='searchFieldButtonSold'>No longer available for sale</button>);
              break;
            }
          }

          for (var i = 0; i < myListings.length; i++) { 
            if (myListings[i].listingID === parseInt(listingID, 10)) {
              found = true;
              console.log("found");
              setButton(<div></div>);
              break;
            }
          }

          if (!found) {
            setButton(<button className='searchFieldButton' onClick={(e) => {
              buy(listingID);
              setButton(<button className='searchFieldButtonSold'>No longer available for sale</button>);
            }}>Buy Now</button>)
          }

          rows.push((
            <tr key = {0}>
                <td className='tableRowLabelLeft'>{searchResult.vin}</td>
                <td className='tableRowLabelCenter'>{searchResult.make}</td>
                <td className='tableRowLabelCenter'>{searchResult.model}</td>
                <td className='tableRowLabelCenter'>{searchResult.year}</td>
                <td className='tableRowLabelCenter'>{searchResult.price}</td>
                <td className='tableRowLabelCenter'>{searchResult.listingDate}</td>
                <td className='tableRowLabelCenter'>{searchResult.location}</td>
                <td className='tableRowLabelCenter'>{searchResult.color}</td>
                <td className='tableRowLabelCenter'>{searchResult.mileage}</td>
                <td className='tableRowLabelCenter'>{searchResult.drivetrain}</td>
                <td className='tableRowLabelCenter'>{searchResult.transmission}</td>
                <td className='tableRowLabelCenter'>{searchResult.carType}</td>
                <td className='tableRowLabelCenter'>{searchResult.userName}</td>
            </tr>
        ))
          setRows(rows)
      }
      fetchData();
  }, []);

    const table = (
        <table>
            <thead>
                <tr>
                    <th className='tableHeaderLabel'>VIN</th>
                    <th className='tableHeaderLabel'>Make</th>
                    <th className='tableHeaderLabel'>Model</th>
                    <th className='tableHeaderLabel'>Year</th>
                    <th className='tableHeaderLabel'>Price</th>
                    <th className='tableHeaderLabel'>Listing Date</th>
                    <th className='tableHeaderLabel'>Location</th>
                    <th className='tableHeaderLabel'>Color</th>
                    <th className='tableHeaderLabel'>Mileage</th>
                    <th className='tableHeaderLabel'>Drivetrain</th>
                    <th className='tableHeaderLabel'>Transmission</th>
                    <th className='tableHeaderLabel'>Type</th>
                    <th className='tableHeaderLabel'>Seller</th>
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
            <h1 className='pageTitle'>Car details:</h1>
            <div>
            <button className='searchFieldButton' onClick={(e) => goBackToHome()}>Go back to homepage</button>
            <br></br><br></br>
            </div>
            <div>
                {table}
            </div>
            <div>
              {button}
              <br></br><br></br>
            </div>
        </div>
    );
}

export default Listing;
