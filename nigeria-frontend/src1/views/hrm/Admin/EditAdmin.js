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

export function EditAdmin() {
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
    document.title = 'Update Admin';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

     
           

       
        // Fetch role from API
        const fetchrole = () => {
            $.ajax({
            url: `${config.apiUrl}/get_admin_role/${id}`,
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
            url: `${config.apiUrl}/admin_data_single/${id}`,
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

       
    }
  }, []);
 

  const [formData, setFormData] = useState({
    name: '',
   
    id: '',
   
    
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    entryid: '',
    section_id:'',
    workertype: '',
    shift: '',
    zone:'',
    machine:'',
    id: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
  event.preventDefault();
  //
  let errors = {}
  let isValid = true

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

 
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/update_admin`,
    method: 'POST',
    headers: customHeaders,
    data: formData,
    success: function (response){
         alert(response.message);
         // history.push('/hrm/ikeja/operator');
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
                <CardTitle tag="h5">Update Your Details ({formData.username}) ({formData.entryid})</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>

   
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
                              <input type="text" className="form-control " name="entryid" placeholder="entryid" value={formData.entryid} onChange={handleInputChange} disabled />
                              {formErrors.entryid && <span style={error}>{formErrors.entryid}</span>}
                            </div>
                            <div className="col-sm-6">
                              <span className="Entryid">Email</span>
                              <input type="text" className="form-control " name="email" placeholder="email" value={formData.email} onChange={handleInputChange} disabled />
                              {formErrors.email && <span style={error}>{formErrors.email}</span>}
                            </div>
                        </div>
                        <div className=" row space">
                                <div className="col-sm-6">
                                <button className='btn btn-success btn-md'>Update</button>
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


export default EditAdmin;
