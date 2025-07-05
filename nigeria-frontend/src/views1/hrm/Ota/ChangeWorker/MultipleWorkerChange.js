import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import { Link } from 'react-router-dom';
import 'jquery/dist/jquery.min.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../Loader.css' // Import the CSS file

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  FormGroup,
  Form,
  Input,
  Table,
  Row,
  Col,
} from "reactstrap";
import $ from 'jquery';
import Select from 'react-select';
//DB Connection
import config from '../../../../config';

export function MultipleWorkerChange() {
  const [wtypeOptions, setWorkersOptions] = useState([]);
  const [entryIds, setEntryIds] = useState('');

   const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);

  let error = {
    color: 'red',
    fontSize: '13px',
  }
  let red = {
    color: 'red',
    fontSize: '16px',
  }
  

  const [formData, setFormData] = useState({
    entryIds: '',
    wtype: '',
  });

  const [formErrors, setFormErrors] = useState({
    wtype: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
    setFormData({ ...formData, [name]: value });
 
};
  

 const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData};
  const jsonData = JSON.stringify(updatedFormData);
  //alert(jsonData);
  let errors = {}
  let isValid = true

  if (!formData.wtype.trim()) {
    errors.wtype = 'wtype is required'
    isValid = false
  }
 
  if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/ota/update_multiple_workertype`,
    method: "POST",
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Display the success message from the server response
    
      // Set the server response message in the state variable
      setServerMessage(response.message);

      // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        navigate(-1);
      }, 3000); // Adjust the delay time as needed
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
      // Display the error message or handle errors as needed
    },
  });
  }else{
    setFormErrors(errors)
  }
};
const [isEntryIdExpanded, setEntryIdExpanded] = useState(false);
 useEffect(() => {
      document.title = 'Change worker type For Multiple Employees';
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {

     // Send the entryIdsArray in the API call
    const jsonData = JSON.stringify({ entryIds: entryIdsArray });

    $.ajax({
      url: `${config.apiUrl}/ota/changeshift_entryid`,
      method: 'POST', // Change the method to POST for sending the entryIdsArray
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Access the timesheet results from the response object
        const timesheetData = response;

         // Extract the entry IDs from the response
        const entryIds = timesheetData.map((item) => item.entryid).join(',');

        // Update the entryIds state with the formatted string
        setEntryIds(entryIds);

       // Convert the entryIdsArray into a comma-separated string
      const entryIdsString = entryIdsArray.join(',');

        // Set the formData state including entryIds
        setFormData((prevFormData) => ({
          ...prevFormData,
          entryIds: entryIdsString,
        }));

        // Destroy the existing DataTable instance (if it exists)
       
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });


    // Fetch worker type options from API
    const fetchWorkerOptions = () => {
      $.ajax({
        // API URL for fetching workertyp options
        url: `${config.apiUrl}/getworkertype`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setWorkersOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching workertype options:', error);
        },
      });
    };

    fetchWorkerOptions();

  }

    setFormData((prevFormData) => ({
      ...prevFormData,
      entryIds: entryIds,
    }));
 
   
    }, []);

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
 
  return (
    <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Multiple Change Worker</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
            <div style={{ fontWeight: 'bold' }} className='readmore'>
            <p className='c'>
               Changes for  <b>Employees :</b>
               {isEntryIdExpanded ? (
               <span style={{ color: 'green', fontWeight: 'bold' ,fontSize:'12px'}}> {entryIds}</span>
               ) : (
               <span style={{ color: 'green', fontWeight: 'bold',fontSize:'12px' }}> {entryIds.slice(0, 150)}</span>
               )}
               
            </p>
         </div>
         <br></br>
         <form  onSubmit={handleSubmit} method='POST'>
            <div className="row space ">
              <div className="col-sm-4">
                  <span className="shift">Worker Type<span style={red}>*</span></span>
                  <select
                     id="wtype"
                     className="form-control"
                     name="wtype" 
                     value={formData.wtype} onChange={handleInputChange}
                     >
                     <option value="">Select Type</option>
                     {wtypeOptions.map((type) => (
                     <option key={type.id} value={type.name}>
                        {type.name}
                     </option>
                     ))}
                  </select>
                  {formErrors.wtype && <span style={error}>{formErrors.wtype}</span>}
               </div>
              

               <div className="col-sm-2">
                  <button
                     type="submit"
                     className="btn btn-success btn-md"
                     >
                  Add
                  </button>
               </div>
            </div>
         </form>
        </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default MultipleWorkerChange;
