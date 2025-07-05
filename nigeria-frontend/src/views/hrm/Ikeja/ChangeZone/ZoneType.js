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


export function EmployeeList() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
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
  document.title = 'Zone Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    navigate('/login');
  } else {
 
  }
}, []); 

  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
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
                <CardTitle tag="h5">Show List of worker working on different category</CardTitle>
              </CardHeader>
              <CardBody>
    
             <div className='row' style={{padding:'50px'}}>
                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="#" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Braid 
                   </Link>
                   <p>
                    <Link to="/admin/hrm/ikeja/changezone" className="btn btn-primary btn-sm">
                      Without <i class="fa fa-check-square"></i>
                   </Link>
                    &nbsp;
                    <Link to="/admin/hrm/ikeja/changezoneCheckbox" className="btn btn-primary btn-sm">
                      With <i class="fa fa-check-square"></i>
                   </Link>
                   </p>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="/admin/hrm/ikeja/changezonetonbraid" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Convert Braid To NBraid
                    </Link>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="#" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      NBraid
                    </Link>
                    <p>
                    <Link to="/admin/hrm/ikeja/changezonenbraid" className="btn btn-primary btn-sm">
                      Without <i class="fa fa-check-square"></i>
                   </Link>
                    &nbsp;
                    <Link to="/admin/hrm/ikeja/changezonenbraidCheckbox" className="btn btn-primary btn-sm">
                      With <i class="fa fa-check-square"></i>
                   </Link>
                   </p>
                </div>

                <div className='col-md-3' style={{textAlign:'center'}}>
                   <Link to="/admin/hrm/ikeja/changezonetobraid" className="btn btn-danger btn-lg" style={{fontSize:'18px'}}>
                      Convert NBraid To Braid
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

export default EmployeeList;
