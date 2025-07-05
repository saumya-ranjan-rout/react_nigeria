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

export function ViewAdmin() {
  const {id} = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [admin, setAdmin] = useState([]);
  
  

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

useEffect(() => {
  document.title = 'Admin Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    navigate('/login');
  } else {
    const fetchUsers = () => {
      $.ajax({
        url: `${config.apiUrl}/admin_data_single/${id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
            setAdmin(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };

        fetchUsers();
  }
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
                <CardTitle tag="h5">Admin Details </CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>

             <div className='row'>
                <div className='col-md-6' style={{textAlign:'center'}}>
                    <div className="" style={{ borderRight: '1px solid black',padding:'83px' }}>
                    <div style={{ fontWeight: 'bold' }}>
                       {admin.name + '[' + admin.entryid + ']'}
                    </div>
                    <hr></hr>
                    <div style={{ fontWeight: 'bold' }}>Email : {admin.email}</div>
                    </div>
                </div>
                <div className='col-md-6' style={{padding:'83px'}}>
                {admin.roleid === '1' ? (
                  <>
                    <Link to={`/admin/hrm/editadmin/${id}`}>
                      <button className='btn btn-info' style={{ color: '#fff' }}>
                        <i class="fa fa-user"></i>&nbsp;
                        Edit Account
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={`/admin/hrm/editadmin/${id}`}>
                      <button className='btn btn-info' style={{ color: '#fff' }}>
                        <i class="fa fa-user"></i>&nbsp;
                        Edit Account
                      </button>
                    </Link>
                  </>
                )}
                &nbsp;
                  
                <Link to={`/admin/hrm/adminchangepassword/${admin.entryid}`}>
                  <button className="btn btn-info" style={{color:'#fff'}}>
                    <i class="fa fa-key"></i>&nbsp;
                    Change Password
                  </button>
                </Link>
                </div>
             </div>
        
           </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}


export default ViewAdmin;
