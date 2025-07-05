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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../../config';

export function MultipleZoneToBraid() {
  const animatedComponents = makeAnimated();
  const [shiftOptions, setShiftOptions] = useState([]);
  const [data, setData] = useState([]);
  const [entryIds, setEntryIds] = useState('');

  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
 
  const [section, setSection] = useState([])
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');
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
    shift: '',
    zone:'',
    machine:'',
    section_id:'',
  });

  const [formErrors, setFormErrors] = useState({
    shift: '',
    entryIds: '',
    zone:'',
    section_id:'',
    machine:'',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
    setFormData({ ...formData, [name]: value });
 
};
  

 const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData,machines:subcat};

  const jsonData = JSON.stringify(updatedFormData);
  //alert(jsonData);
  let errors = {}
  let isValid = true

  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }
  if (!formData.zone.trim()) {
    errors.zone = 'Zone is required'
    isValid = false
  }
  if (!formData.machine.trim()) {
    errors.machine = 'Machines is required'
    isValid = false
  }

  if (!formData.section_id) {
    errors.section_id = 'Section is required'
    isValid = false
  }

  if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/ota/update_multiple_zone_braid`,
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
      document.title = 'Change Zone For Multiple Employees';
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

        // Update the component state with the timesheet data
        setData(timesheetData);

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


    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        // API URL for fetching shift options
        url: `${config.apiUrl}/getShiftOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setShiftOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };

    fetchShiftOptions();

     // Fetch section type from API
     const fetchSection = () => {
      $.ajax({
      url: `${config.apiUrl}/ota/getSection`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
          setSection(response);
      },
      error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
      },
      });
      
  }
  fetchSection();

  }

    setFormData((prevFormData) => ({
      ...prevFormData,
      entryIds: entryIds,
    }));
 
   
    }, []);

    const toggleRM = () => {
      setEntryIdExpanded((prevExpanded) => !prevExpanded);
    };

//Get changezone wise machine data
const handleZoneChange = (e) => {
  const selectedZone = e.target.value;
  $.ajax({
    url: `${config.apiUrl}/ota/getMachines/${selectedZone}`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      const machinesSplit = response.split(',');
      setMachines(machinesSplit);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching line options:', error);
    },
  });
};
//Get Machine change 
 const handleMachineChange = (val) => {
  const data = val.target.value;
 
  if (subcat === '') {
    setSubcat(data + ',');
  } else {
    const ret = subcat.split(',');
    let d = '';
    let found = false;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i] === data) {
        found = true;
        break;
      }
    }
    if (found) {
      d = subcat;
    } else {
      d = subcat + data + ',';
    }
    setSubcat(d);
  }
};

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };

const selectedOption = section.find((data) => data.id === formData.section_id);

  return (
     <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Multiple Change Zone And Machine</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
            <div style={{ fontWeight: 'bold' }} className='readmore'>
            <p className='c'>
               Changes for  <b>Operators :</b>
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
               
               <div className="col-sm-6">
                <span className="Password">Zone<span style={red}>*</span></span>
                  <select className="form-control"  name="zone" value={formData.zone} onChange={(e) => {
                  handleInputChange(e);
                  handleZoneChange(e);
                }}>
                      <option value="">Choose</option>
                      <option value="ZONE1">ZONE1</option>
                      <option value="ZONE2">ZONE2</option>
                      <option value="ZONE3">ZONE3</option>
                      <option value="ZONE4">ZONE4</option>
                      <option value="ZONE5">ZONE5</option>
                      <option value="ZONE6">ZONE6</option>
                      <option value="ZONE7">ZONE7</option>
                      <option value="ZONE8">ZONE8</option>
                      <option value="ZONE9">ZONE9</option>
                      <option value="ZONE10">ZONE10</option>
                      <option value="ZONE11">ZONE11</option>
                      <option value="ZONE12">ZONE12</option>
                      <option value="ZONE13">ZONE13</option>
                      <option value="ZONE14">ZONE14</option>
                      <option value="ZONE15">ZONE15</option>
                      <option value="ZONE16">ZONE16</option>
                      <option value="ZONE17">ZONE17</option>
                      <option value="ZONE18">ZONE18</option>
                      <option value="ZONE19">ZONE19</option>
                      <option value="ZONE20">ZONE20</option>
                      </select>
                      {formErrors.zone && <span style={error}>{formErrors.zone}</span>}
              </div>
              
              <div className='col-sm-6'>
                <span className="Password">Choose Machine<span style={red}>*</span></span>
                <select className="form-control"  name="machine" value={formData.machine} onChange={(e) => {
                    handleInputChange(e);
                    handleMachineChange(e);
                  }}>
                  <option value="">Select Machine</option>
                  {machines.map((machine, index) => (
                    <option key={index} value={machine}>
                      {machine}
                    </option>
                  ))}
                </select>
                {formErrors.machine && <span style={error}>{formErrors.machine}</span>}
              </div>

              <div className='col-sm-12'>
                <span className="Password">Change Machines</span>
                <textarea className="form-control" value={subcat}  name="machiness" onChange={handleInputChange} readOnly>{subcat}</textarea>
                
              </div>

              <div className="col-sm-6">
                  <span className="shift">Shift <span style={red}>*</span></span>
                  <select
                     id="shift"
                     className="form-control"
                     name="shift" 
                     value={formData.shift} onChange={handleInputChange}
                     >
                     <option value="">Select Shift</option>
                     {shiftOptions.map((shiftOption) => (
                     <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
                     </option>
                     ))}
                  </select>
                  {formErrors.shift && <span style={error}>{formErrors.shift}</span>}
               </div>
               <div className="col-sm-6">
                <span className="Section">Section <span style={red}>*</span> </span>
                <Select
                    components={animatedComponents}
                    isSearchable
                    placeholder="Choose Section..."
                    value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                    onChange={(selectedOption) => {
                      const newValue = selectedOption ? selectedOption.value : '';
                      handleInputChange({ target: { name: 'section_id', value: newValue } });
                    }}
                    options={section.map((data) => ({ value: data.id, label: data.section_name }))}
                  />
                 {formErrors.section_id && <span style={error}>{formErrors.section_id}</span>}
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
export default MultipleZoneToBraid;
