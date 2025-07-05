import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function ConvertToCategory() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');
  const [typs, setCtyp] = useState('');

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
 

  

  useEffect(() => {
    document.title = 'Convert to category';
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

   // Fetch operator type from API
   const fetchOperator = () => {
    $.ajax({
      url: `${config.apiUrl}/ota/getConvertdata/${id}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setFormData(response);
        if (response.category_type == 'BRAID') {
            setCtyp('NBRAID')
        }else{
            setCtyp('BRAID')
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching shift options:', error);
      },
      });
      }
      fetchOperator();
  
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
    id:'',
    entryid: '',
    workertype: '',
    shift: '',
    staff:'',
    zone:'',
    category_type:'',  
    
  });

  const [formErrors, setFormErrors] = useState({
    
    workertype: '',
    shift: '',
    staff: '',
   
  })
   
 let typ;
  if (formData.category_type === 'BRAID') {
     typ="NBRAID";
  }else{
     typ="BRAID";
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    
  };


  const handleSubmit = (event) => {
  event.preventDefault();
  //
    const insertFormdata = { ...formData, machiness: subcat,typ:typs};
    const jsonData = JSON.stringify(insertFormdata);

  let errors = {}
  let isValid = true

  if (!formData.workertype.trim()) {
    errors.workertype = 'Worker type is required'
    isValid = false
  }

  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }
  
  if (!formData.staff.trim()) {
    errors.staff = 'Staff is required'
    isValid = false
  }


  // First, add the item master data to the "itemmaster" table
  if (isValid) {
   
  $.ajax({
    url: `${config.apiUrl}/ota/category_convert_op`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
          // Redirect to SectionComponent after successful addition\
          navigate('/hrm/ota/operatorcomponentota');
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}else {
  setFormErrors(errors)
}
  
};

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
                <p style={{color:'red',fontWeight:'500'}}>Are you sure you want to convert <span style={{color:'green'}}>{formData.name}</span> from <span style={{color:'blue'}}>{formData.category_type}</span> to <span style={{color:'#9c27b0'}}>{typ}</span>??.It will permanently delete previous assigned <span>{formData.category_type}</span> data from database.</p>
                 <hr></hr>
              </CardHeader>
              <CardBody>

          <form onSubmit={handleSubmit} method='POST' >
             <div className="row space">
                <div className="col-sm-4">
                   <span className="Name">Name</span>
                   <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name || ''} onChange={handleInputChange} readOnly/>
                   <input type='hidden' className="form-control" name="id" value={formData.id || ''} onChange={handleInputChange}/>
                </div>
                <div className="col-sm-4">
                   <span className="Email">Email <span style={red}>(eg. abc@xyz.com )</span></span>
                   <input type="text" className="form-control" name="email" placeholder="email" value={formData.email || ''} onChange={handleInputChange} readOnly/>
                </div>
                <div className="col-sm-4">
                   <span className="Entryid">Entryid</span>
                   <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} readOnly/>
                </div>
             </div>
             <div className=" row space">
                <div className="col-sm-4">
                   <span className="Password">Worker Type</span>
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
                <div className="col-sm-4">
                   <span className="Password">Shift</span>
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
              <div className="col-sm-4">
                   <span className="Password">Site</span>
                   <select className="form-control"  name="staff" value={formData.staff} onChange={handleInputChange}>
                     <option value="">Choose</option>
                     <option value="RIL">RIL </option>
                     <option value="LORNA">LORNA</option>
                   </select>
                   {formErrors.staff && <span style={error}>{formErrors.staff}</span>}
              </div>
             </div>
             
                {formData.category_type === "BRAID" ? (
                  <div  style={{display:'inline-flex'}}>
                    <input
                        type="radio"
                        name="category_type"
                        value={typ}
                        onChange={handleInputChange}
                        checked={formData.category_type === 'BRAID'}
                    />
                    <label  style={{fontSize:'13px',margin:'0px'}}><span className='textblack'>{typ}</span></label>
                  </div>
                    ) : (
                    <div  style={{display:'inline-flex'}}>
                        <input
                            type="radio"
                            name="category_type"
                            value={typ}
                            onChange={handleInputChange} style={{width:'18px'}}
                            checked={formData.category_type === 'NBRAID'}
                        />
                        <label  style={{fontSize:'13px',margin:'0px'}}><span className='textblack'>{typ}</span></label>
                    </div>
                    )}
             
             {formData.category_type === "NBRAID" ? (
              <>
             <div className='row space'>
               <div className='col-sm-6'>
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
             <div className='row space'>
                <div className='cpl-sm-6'>
                <span className="Password">Machines</span>
                  <input type="text" className="form-control"  name="machiness" value={subcat} onChange={handleInputChange} readOnly/>
                 
                </div>
             </div>
             </>
             
             ):null}
             <div className=" row space">
                <div className="col-sm-6">
                   <button className='btn btn-success btn-md'>Add</button>&nbsp;&nbsp;
                   <Link to="/hrm/ota/operator" className="btn btn-info btn-md">Cancel</Link>
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

export default ConvertToCategory;
