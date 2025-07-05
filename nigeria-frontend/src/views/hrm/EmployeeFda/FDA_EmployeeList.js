import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../config';

export function FDA_EmployeeList() {
 
  const [EmployeeData, setEmployeeData] = useState([]);
  const tableRef = useRef(null);
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


  function convertDateToISO(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[2];
      const month = parts[1];
      const day = parts[0];
      return year + '-' + month + '-' + day;
    }
    return null;
  }


// Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#changezone')) {
    $('#changezone').DataTable().destroy();
  }

// Initialize the DataTable with the updated data
tableRef.current = $('#changezone').DataTable({
  dom: 'Bfrtip',
  dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
  buttons: [
      {
          extend: 'copy',
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
      {
          extend: 'csv',
          filename: 'Employees_Details', // Removed space in filename
          exportOptions: {
              columns: ':not(.action-column)',
          },
      },
  ],
  data: EmployeeData,
  columns: [
      { data: null}, // Added defaultContent and orderable for the index column
      { data: 'entryid' },
      { data: 'name' },
      { data: 'passive_type' },
      { data: 'joindate' },
      { data: 'exitdate' },
      {
        data: null,
        render: function (data, type, row) {
          if (type === 'display') {
            const joindate = convertDateToISO(row.joindate); // Assuming 'joindate' and 'exitdate' are available in the 'row' object
            const exitdate = convertDateToISO(row.exitdate);
            
            const joinTimestamp = Date.parse(joindate); // Convert to timestamp
            const exitTimestamp = Date.parse(exitdate); // Convert to timestamp
           //alert(joindate+''+joinTimestamp)
            if (!isNaN(joinTimestamp) && !isNaN(exitTimestamp)) {
              const differenceInMilliseconds = exitTimestamp - joinTimestamp;
              const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
              return differenceInDays; // Display the difference in days with two decimal places
            }
          }
      
          return 'Invalid Dates'; // Handle cases where dates are invalid or when not in 'display' mode
        },
      },
        
      { data: 'dept' },
      
  ],
  columnDefs: [
      {
          targets: 0,
          render: function (data, type, row, meta) {
              // Render the row index starting from 1
              return meta.row + 1; // Changed to use meta.row for the index
          },
      },
  ],
});

  useEffect(() => {
    document.title = 'Employees List(FDA)';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
        const fetchEmployeeData = () => {
            fetch(`${config.apiUrl}/ikeja/getEmployeeFdaData`,{headers: customHeaders})
              .then((response) => response.json())
              .then((data) => setEmployeeData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
          fetchEmployeeData();
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
                <CardTitle tag="h5" style={{textAlign:'center'}}>IKEJA FDA EMPLOYEES LIST FROM LAST 3 MONTHS <button class="btn btn-warning textwhite"><i class="fa fa-calendar" aria-hidden="true"></i> Ikeja FDA Attendance</button></CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
    
      
          <table id="changezone" className="display">
            <thead>
              <tr>
                <th>Slno</th>
                <th>Entry ID</th>
                <th>Name</th>
                <th>Passive Type</th>
                <th>Join Date</th>
                <th>Exit Date</th>
                <th>Service Days</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
           
            </tbody>
            <tfoot>
              <tr>
                <th>Slno</th>
                <th>Entry ID</th>
                <th>Name</th>
                <th>Passive Type</th>
                <th>Join Date</th>
                <th>Exit Date</th>
                <th>Service Days</th>
                <th>Department</th>
              </tr>
            </tfoot>
          </table>
         </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default FDA_EmployeeList;
