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

export function MultipleSectionAssign() {
  const animatedComponents = makeAnimated();
  const { id1, id2 } = useParams();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [users, setUsers] = useState([])

  const uid = id1;
  const array = id2.split(',');
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
  document.title = 'Assign Product to Operator';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    navigate('/login');
  } else {
    const fetchUsers = () => {
      $.ajax({
        url: `${config.apiUrl}/ota/get_users`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setUsers(response);
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
    user: '',
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const productPromises = array.map((value) => {
      const where = `id='${value}'`;
      return new Promise((resolve, reject) => {
        $.ajax({
          url: `${config.apiUrl}/ota/assign_check?where=${where}`,
          method: 'GET',
          headers: customHeaders,
          success: (response) => {
            if (response.length === 1) {
              $.ajax({
                url: `${config.apiUrl}/ota/update_assign_operator/${formData.user}?where=${where}`,
                method: 'GET',
                headers: customHeaders,
                success: () => {
                  resolve();
                },
                error: (error) => {
                  reject(error);
                },
              });
            } else {
              resolve();
            }
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    });
  
    Promise.all(productPromises)
      .then(() => {
        alert('Move successfully');
        navigate(`/admin/hrm/ota/operatorcomponentota`)
      })
      .catch((error) => {
        // Handle error
        console.error('Error:', error);
      });
  }

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };

  const selectedOption = users.find((data) => data.id === formData.user);

  return (
     <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Move Product,Line,Section To:</CardTitle>
              <hr></hr>
              </CardHeader>
              <CardBody>
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-8">
                  <span className="textgreen">Operator <span style={{color:'red'}}>*</span></span>
                 
                  <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Operator..."
                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.name } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'user', value: newValue } });
                        }}
                        options={users.map((data) => ({ value: data.id, label: data.name }))} required
                      />
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

export default MultipleSectionAssign;
