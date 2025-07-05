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

export function ChangeShiftOperaor() {
 
  //const [itemCategories, setItemCategories] = useState([]);
  const [employeedata, setEmployeeData] = useState([]);
  const animatedComponents = makeAnimated();
 
  const [selectedEmployees, setSelectedEmployees] = useState([]);
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
    document.title = 'Change Shift Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
        const fetchOperatorData = () => {
            fetch(`${config.apiUrl}/ota/getEmployees`,{headers: customHeaders})
              .then((response) => response.json())
              .then((data) => setEmployeeData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
      
          fetchOperatorData();
    }

   
  }, []);

  //move data to shift update
  const handleMove = (entryIds) => {
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
    navigate(`/admin/hrm/ota/multipleshiftchangeoperatorota?${queryParams}`);
  };

  //Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}
const filteredData = employeedata.filter((row) => {
  return row.name.toLowerCase().includes(searchValue.toLowerCase())
});

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
                <CardTitle tag="h5">Change Shift Operator</CardTitle>
              </CardHeader>
              <CardBody>
          <form method='POST'>
                          <div className="row space">
                              <div className="col-sm-5">
                              <br/>
                              <input
                                  className='form-control'
                                  type="text"
                                  value={searchValue}
                                  onChange={handleSearchChange}
                                  placeholder="Search..."
                                  style={{ width: '100%' }}
                                /> 
                              </div>
          <div className="col-sm-4">
                  <span className="textgreen">Choose Employees</span> <span className='textred'>*</span>
                  <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="section_id"
                      options={employeedata.map((employee) => ({
                        value: employee.id,
                        label: `${employee.entryid} (${employee.name})`,
                      }))}
                      value={selectedEmployees}
                      onChange={(selectedOptions) => {
                        setSelectedEmployees(selectedOptions)
                      }}
                      isSearchable
                      placeholder="Choose Operator"
                    />
                </div>
             
                    <div className="col-sm-2"><br/>
                    <input
                      className="btn btn-success btn-sm"
                      value="Multiple Change"
                      id="btnw"
                      readOnly=""
                      style={{ width: '150px', color: '#fff' }}
                      onClick={() => handleMove(selectedEmployees)}
                      disabled={selectedEmployees.length == 0}
                    />
                  </div>
                  
                  </div>
                </form>
          
          <table class='table display-table'>
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Name</th>
                <th>User Role</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
            {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.entryid}</td>
                  <td>{item.name}</td>
                  <td>{item.role}</td>
                  <td>{item.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default ChangeShiftOperaor;
