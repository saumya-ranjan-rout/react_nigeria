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

export function AdminChangePassword() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [UserName, setUserName] = useState('');
  const [UserId, setUserId] = useState('');
  const [UserEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //const [adminId, setAdminId] = useState('');
  const [adminid, setAdminId] = useState(null);
  

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


  const toggleClass = () => {
    setActive(!isActive);
  };
  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };
  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }
 

  useEffect(() => {
  document.title = 'Employee Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
   navigate('/login');
  } else {
    const fetchUsers = () => {
      $.ajax({
        url: `${config.apiUrl}/admin_data_username/${id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          // Assuming the response structure is as mentioned
      const userData = response.data[0]; // Assuming it's an array with a single object

     // Extracting the required fields
      const Name = userData.name;
      const entryId = userData.entryid;
      const userEmail = userData.email;
      const adminid = userData.id;
    
      setUserName(Name);
      setUserId(entryId);
      setUserEmail(userEmail);
      setAdminId(adminid);
      //alert(adminid);
  
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };
    fetchUsers();
  }
}, [id]); 


  const [formData, setFormData] = useState({
    newPassword:'',
    confirmPassword: '',
    entryid:id,
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage("Passwords don't match")
      } else if (formData.newPassword == '' || formData.confirmPassword == '') {
        setErrorMessage('Password Required')
      } else if (!isValidPassword(formData.newPassword) || !isValidPassword(formData.confirmPassword)) {
        setErrorMessage('Invalid password format And min length 6')
      } else {

        // Include adminid in formData
    const formDataWithAdminId = { ...formData, adminid: adminid };
        $.ajax({
            url: `${config.apiUrl}/admin_change_password`,
            method: 'POST',
            headers: customHeaders,
            data: formDataWithAdminId,
            success: function (response){
                 alert(response.message);
                  // Redirect to SectionComponent after successful addition\
                  window.location.reload();
                },
            error: function (xhr, status, error) {
              console.log(error);
            },
          });
      }
  }
  const isValidPassword = (pass) => {
    // Password validation criteria
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/
    return passwordRegex.test(pass)
  }

  const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

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
                <CardTitle tag="h5">Update Your Password ({UserName}) [{UserId}] [{UserEmail}]</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
   
            
             <div className='row'>
                <div className='col-md-3'>
                </div>
                <div className='col-md-6'>
                <form onSubmit={handleSubmit} method='POST' >
                    <div className="row space" >
                        <div className="col-sm-12">
                            <span className="Name">New Password <span className="textred">*</span></span>
                            <input type="text" className="form-control " name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleInputChange} />
                            {errorMessage && <span style={error}>{errorMessage}</span>}
                        </div>
                        <div className="col-sm-12">
                            <span className="UserName">ReNew Password <span className="textred">*</span></span>
                            <input type="text" className="form-control " name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} />
                            {errorMessage && <span style={error}>{errorMessage}</span>}
                        </div>
                        <div className="col-sm-12">
                            <button className='btn btn-success btn-md'>Update Password</button>
                        </div>
                    </div>
                    </form>
                </div>
                <div className='col-md-3'>
                </div>
             </div>
        
             </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default AdminChangePassword;
