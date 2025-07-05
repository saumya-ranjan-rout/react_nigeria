import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function AddOperatorComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);

  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }
  let star = {
    color: 'red',
    fontSize: '15px',
  }


  useEffect(() => {
    document.title = 'Add Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

     
    // Fetch worker type from API
    const fetchworkerType = () => {
    $.ajax({
      url: `${config.apiUrl}/getworkertype`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setWorker(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching shift options:', error);
      },
    });
  }
  fetchworkerType();

  // Fetch Shift type from API
  const fetchshift = () => {
    $.ajax({
      url: `${config.apiUrl}/getShiftOptions`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setShift(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching shift options:', error);
      },
    });
  }
  fetchshift();
  
    }
  }, []);
  //Get changezone wise machine data
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    $.ajax({
      url: `${config.apiUrl}/ota/getMachines/${selectedZone}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setMachines(response);
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



  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    entryid: '',
    password: '',
    workertype: '',
    shift: '',
    site:'',
    zone:'',
    machine:'',
    type:'NBRAID',     
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    username: '',
    email: '',
    entryid: '',
    password: '',
    workertype: '',
    shift: '',
    site:'',
    zone:'',

  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
  event.preventDefault();
  //
  const insertFormdata = { ...formData, machiness: subcat};
  const jsonData = JSON.stringify(insertFormdata);

  let errors = {}
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Invalid email format'
    isValid = false
  }

  if (!formData.username.trim()) {
      errors.username = 'Username is required'
      isValid = false
    } else if (!isValidEmail(formData.username)) {
      errors.username = 'Invalid username format'
      isValid = false
    }

  if (!formData.entryid.trim()) {
    errors.entryid = 'Entryid is required'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Invalid password format And Min length 6 to 20'
    isValid = false
  }

  if (!formData.workertype.trim()) {
    errors.workertype = 'Worker type is required'
    isValid = false
  }

  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }

  if (!formData.site.trim()) {
    errors.site = 'Site is required'
    isValid = false
  }
    if(formData.type=="BRAID"){
      if (!formData.zone.trim()) {
        errors.zone = 'Zone is required'
        isValid = false
      }
    
      if (!subcat.trim()) {
        errors.machiness = 'Machines is required'
        isValid = false
      }
    }
 

  // First, add the item master data to the "itemmaster" table
  if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/ota/add_operator`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
      if(response.status === 409){
        alert(response.message);
      }else{
        alert(response.message);
        // Redirect to SectionComponent after successful addition\
        //window.location.reload();
        navigate('/admin/hrm/ota/operatorcomponentota');
      }
        
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}else {
  setFormErrors(errors)
}
  
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
// const isValidPassword = (password) => {
//   // Password validation criteria
//   const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/
//   return passwordRegex.test(password)
// }
const isValidPassword = (password) => {
  // Password validation criteria: Only numeric characters and length between 6 and 20
  const passwordRegex = /^\d{6,20}$/;
  return passwordRegex.test(password);
}

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
                <CardTitle tag="h5">Operator Details</CardTitle>
              </CardHeader>
              <CardBody>
          <form onSubmit={handleSubmit} method='POST' >
            
             <div className=" row space" >
                <div className="col-sm-6">
                   <span className="Name">Name <span style={star}>*</span></span>
                   <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                   {formErrors.name && <span style={error}>{formErrors.name}</span>}
                </div>
                <div className="col-sm-6">
                   <span className="UserName">UserName <span style={star}>*</span><span style={red}>(eg. abc@xyz.com )</span></span>
                   <input type="text" className="form-control " name="username" placeholder="username" value={formData.username} onChange={handleInputChange} />
                   {formErrors.username && <span style={error}>{formErrors.username}</span>} 
                </div>
             </div>
             <div className=" row space">
                <div className="col-sm-6">
                   <span className="Email">Email <span style={star}>*</span><span style={red}>(eg. abc@xyz.com )</span></span>
                   <input type="text" className="form-control " name="email" placeholder="email" value={formData.email} onChange={handleInputChange} />
                   {formErrors.email && <span style={error}>{formErrors.email}</span>}
                </div>
                <div className="col-sm-6">
                   <span className="Entryid">Entryid <span style={star}>*</span></span>
                   <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} />
                   {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                </div>
             </div>
             <div className=" row space">
                <div className="col-sm-6">
                   <span className="Password">Password <span style={star}>*</span><span style={red}>(min length 6 | max length 20 | a-zA-Z 0-9 @ $)</span></span>
                   <input type="text" className="form-control " name="password" placeholder="password" value={formData.password} onChange={handleInputChange} />
                   {formErrors.password && <span style={error}>{formErrors.password}</span>}
                </div>
                <div className="col-sm-6">
                   <span className="Password">Worker Type <span style={star}>*</span></span>
                   <select className="form-control"  name="workertype" value={formData.workertype} onChange={handleInputChange}>
                     <option value="">Choose</option>
                      {worker_type.map((workertyp) => (
                        <option
                          key={workertyp.id}
                          value={workertyp.name}
                        >
                          {workertyp.name}
                        </option>
                      ))}
                   </select>
                   {formErrors.workertype && <span style={error}>{formErrors.workertype}</span>}
                </div>
             </div>
             <div className=" row space">
                <div className="col-sm-6">
                   <span className="Password">Shift <span style={star}>*</span></span>
                   <select className="form-control"  name="shift" value={formData.shift} onChange={handleInputChange}>
                     <option value="">Choose</option>
                  { shift.map((shiftnm) => (
                    <option
                      key={shiftnm.id}
                      value={shiftnm.name}
                    >
                      {shiftnm.name}
                    </option>
                  ))}
                   </select>
                   {formErrors.shift && <span style={error}>{formErrors.shift}</span>}
                </div>

                <div className="col-sm-6">
                   <span className="Password">Site <span style={star}>*</span></span>
                   <select className="form-control"  name="site" value={formData.site} onChange={handleInputChange}>
                     <option value="">Choose</option>
                     <option value="RIL">RIL </option>
                     <option value="LORNA">LORNA</option>
                   </select>
                   {formErrors.site && <span style={error}>{formErrors.site}</span>}
                </div>
             </div>   
          {formData.type === 'BRAID' &&
             <div className="row space">
                <div className="col-sm-6">
                   <span className="Password">Zone</span>
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
                <span className="Password">Choose Machine</span>
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
              
                </div>
            </div>   
             } 
            {formData.type === 'BRAID' &&
             <div className="row space">
              <div className='col-sm-12'>
                  <span className="Password">Machines</span>
                  <input type="text" className="form-control"  name="machiness" value={subcat} onChange={handleInputChange} readOnly/>
                  {formErrors.machiness && <span style={error}>{formErrors.machiness}</span>}
                </div>
             </div>
            }
             <div className="row space">
             <div className='col-sm-6' style={{ display: 'inline-flex' }}>
                  <input
                    type="radio"
                    name="type"
                    value="BRAID"
                    onChange={() => setFormData({ ...formData, type: 'BRAID' })}
                    checked={formData.type === 'BRAID'} style={{width:'3%'}}
                  /> BRAID
                  <input
                    type="radio"
                    name="type"
                    value="NBRAID"
                    onChange={() => setFormData({ ...formData, type: 'NBRAID' })}
                    checked={formData.type === 'NBRAID'} style={{width:'3%'}}
                  /> NBRAID
                    
                  </div>
             </div>
             <div className=" row space">
                <div className="col-sm-6">
                   <button className='btn btn-success btn-md'>Add</button>
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

export default AddOperatorComponent;
