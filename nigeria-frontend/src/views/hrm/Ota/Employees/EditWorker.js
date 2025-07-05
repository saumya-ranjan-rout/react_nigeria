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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../../config';

export function EditWorker() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [worker_type, setWorker] = useState([])
  const [shift, setShift] = useState([])
  const [section, setSection] = useState([])
  const [lines, getLine] = useState([])
  const [roleid, setRoleid] = useState([])
  const [sectionname, setsectionName]=useState('')

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
            headers: customHeaders,
            method: 'GET',
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
        //OPERATOR DATA
        const fetchUsers = () => {
            $.ajax({
            url: `${config.apiUrl}/ota/operator_data_single/${id}`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {
                setFormData(response);
                fetchwty(response.roleid);
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

       // Fetch linemaster from API
       const fetchLine = () => {
        $.ajax({
        url: `${config.apiUrl}/ota/getlinemaster`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          getLine(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
        },
        });
        
    }
    fetchLine();

       // Fetch section type from API
       const fetchwty = (id) => {
        $.ajax({
        url: `${config.apiUrl}/ota/get_role/${id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
            setRoleid(response);
        },
        error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
        },
        });
        
    }
   
    }
  }, []);
 
const [formData, setFormData] = useState({
  name: '',
  roleid:'',
  entryid: '',
  workertype: '',
  shift: '',
  line:'',
  id: '',
  section_id:'',
  usection_id:null,
  uline:null,
});

const [formErrors, setFormErrors] = useState({
  usection_id:'',
  uline:'',
  workertype: '',
  shift: '',

})
useEffect(() => {
  if (formData.section_id !== '') {
  $.ajax({
    // API URL for fetching shift options
    url: `${config.apiUrl}/ota/getSectionName/${formData.section_id}`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      setsectionName(response);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching section name:', error);
    },
  });
}
}, [formData.section_id]); // Add dependencies array to specify when the effect should run



  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
  event.preventDefault();
  //
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
  if (!formData.uline) {
    errors.uline = 'Line is required';
    isValid = false;
  }
  if (!formData.usection_id) {
    errors.usection_id = 'Section is required';
    isValid = false;
  }
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
    const insertFormdata = { ...formData};
    const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: `${config.apiUrl}/ota/updateemployee`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
           navigate('/admin/hrm/ota/nbraidemployeesota');
        },
    error: function (xhr, status, error){
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
                {/*<CardTitle tag="h5">Edit Employees</CardTitle>
                 <hr></hr>*/}
              </CardHeader>
              <CardBody>
              
             <div className='row'>
                <div className='col-md-12'>
                    <p>Update Your Details ({formData.entryid})</p> 
                    <hr/>
                    <form onSubmit={handleSubmit} method='POST' >
                    <div className=" row space">
                        <div className="col-sm-6">
                        <span className="Password">User Role</span>
                        <select className="form-control"  name="roleid" value={formData.roleid} onChange={handleInputChange}>
                            {roleid.map((data) => (
                                <option key={data.id} value={data.name}>
                                {data.name}
                                </option>
                            ))}
                        </select>
                        </div>
                        <div className="col-md-6">
                            <span className="Name">Name</span>
                            <input type="text" className="form-control " name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} readOnly/>
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
                      
                      <div className='row space'>
                        <div class="col-sm-6">
                            <span className="Password">line</span>
                            <input type="text" className="form-control"  name="old_line"  value={formData.line} onChange={handleInputChange} readOnly />
                        </div>
                        <div class="col-sm-6">
                            <span className="Password">Section</span>
                            <input type="text" className="form-control"  name="old_section"  value={sectionname} onChange={handleInputChange} readOnly />
                        </div>
                      </div>
                      <div className="row space">
                        <div className="col-sm-6">
                          <span className="Entryid">Change Line</span> <span className='textred'>*</span>
                          <select className="form-control"  name="uline" value={formData.uline} onChange={handleInputChange}>
                            <option value="">Select..</option>
                          {lines.map((data) => (
                          <option
                              key={data.id}
                              value={data.line_name}
                          >
                              {data.line_name}
                          </option>
                          ))}
                          </select>
                          {formErrors.uline && <span style={error}>{formErrors.uline}</span>}
                        </div>
                        <div className="col-sm-6">
                          <span className="section">Change Section</span> <span className='textred'>*</span>
                          <select className="form-control"  name="usection_id" value={formData.usection_id} onChange={handleInputChange}>
                          <option value="">Select..</option>
                          {section.map((data) => (
                          <option
                              key={data.id}
                              value={data.id}
                          >
                              {data.section_name}
                          </option>
                          ))}
                          </select>
                          {formErrors.usection_id && <span style={error}>{formErrors.usection_id}</span>}
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

export default EditWorker;
