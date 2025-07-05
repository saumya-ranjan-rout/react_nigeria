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
import '../Loader.css' // Import the CSS file

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
import config from '../../../config';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export function EditOperator() {
  const { t } = useTranslation();
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [role, setRole] = useState([])
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

  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }

   

  

  useEffect(() => {
    document.title = 'Edit Operator';
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
        // Fetch role from API
        const fetchrole = () => {
            $.ajax({
            url: `${config.apiUrl}/get_role/3`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {
                setRole(response);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching shift options:', error);
            },
            });
        }

        fetchrole();
        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `${config.apiUrl}/operator_data_single/${id}`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {
                setFormData(response);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching shift options:', error);
            },
            });
        };
        fetchUsers();

        // Fetch section type from API
        const fetchSection = () => {
          $.ajax({
          url: `${config.apiUrl}/getSection`,
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
  }, []);
  //Get changezone wise machine data
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    $.ajax({
      url: `${config.apiUrl}/getMachines/${selectedZone}`,
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
    name: '',
    entryid: '',
    email:'',
    workertype: '',
    shift: '',
    id: '',
    
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    email:'',
    workertype: '',
    shift: '',
    id: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {

   // alert("hi");
  event.preventDefault();
  //
  let errors = {}
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
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
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/update_operator`,
    method: 'PUT',
    headers: customHeaders,
    data: formData,
    success: function (response){
         alert(response.message);
         navigate(`/admin/hrm/operatorcomponent`)
        },
    error: function (xhr, status, error) {

      alert(error);
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
                <CardTitle tag="h5">Edit Operator</CardTitle>
              <hr></hr>
              </CardHeader>
              <CardBody>
   
             <div className='row'>
                <div className='col-md-12'>
                    <p>Update Your Details ({formData.username}) ({formData.entryid})</p> 
                    <hr/>
                    <form onSubmit={handleSubmit} method='POST' >
                    <div className=" row space">
                        <div className="col-sm-6">
                        <span className="Password">User Role</span>
                        <select className="form-control"  name="roleid" value={formData.roleid} onChange={handleInputChange}>
                            {role.map((data) => (
                                <option key={data.id} value={data.name}>
                                {data.name}
                                </option>
                            ))}
                        </select>
                        </div>
                        <div className="col-md-6">
                            <span className="Name">Name</span>
                            <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
                            {formErrors.name && <span style={error}>{formErrors.name}</span>}
                        </div>
                   </div>
                    <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Entryid</span>
                          <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} readOnly />
                          {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                        </div>
                        <div className="col-sm-6">
                        <span className="section">{t('Email')} </span>
                          <input type="text" className="form-control " name="email" placeholder={t('Email')} value={formData.email} onChange={handleInputChange} readOnly />
                          {formErrors.email && <span style={error}>{formErrors.email}</span>}
                        </div>
                    </div>
                    <div className=" row space">
                        <div className="col-sm-6">
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
                        <div className="col-sm-6">
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
                        <input
                                type="hidden"
                                id="inputEmail4"
                                name="id"
                                placeholder="Entry Id"
                                value={formData.id}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </div>
                      </div>  
                      
            
                      
                        <div className=" row space">
                            <div className="col-sm-6">
                            <button className='btn btn-success btn-md'>Update</button>
                            </div>
                        </div>
                </form>
                </div>
             </div>
        </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default EditOperator;
