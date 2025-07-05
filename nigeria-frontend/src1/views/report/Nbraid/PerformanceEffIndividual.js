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
//DB Connection
import config from '../../../config';

function PerformanceEffIndividual() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employees, setEmployeeIkeja] = useState([]);
  const [employeesota, setEmployeeota] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [date_time, setDateTime] = useState("");

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

  const [formData, setFormData] = useState({
    fromdate: "",
    todate: "",
    employees: "",
    employeesota: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "fromdate") {
      setStartDate(new Date(value));
    } else if (name === "todate") {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);
    if(formData.employees ==='' && formData.employeesota ==='' ){
     window.alert('Please select either OTA or IKEJA.');
    }else{
    $.ajax({
      url: `${config.apiUrl}/nbraid/get_performance_eff_individual`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
    
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable("#example")) {
          $("#example").DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $("#example").DataTable({
          dom: "Bfrtip",
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
            {
              extend: "copy",
              filename: `NON-BRAID PERFORMANCE OVERVIEW INDIVIDUAL REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            {
              extend: "csv",
              filename: `NON-BRAID PERFORMANCE OVERVIEW INDIVIDUAL REPORT FROM ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            "excel",
          ],          
          data: response, // Update the data option here
          columns: [
            { data: "worker" },
            { data: "entry_id"},
            { data: 'regg'},
            { data: 'diff'},
            { data: 'shift'},
            { data: 'sec'},
            { data: 'pro'},
            { data: 'line'},
            { data: 'target'},
            { data: 'sum'},
            {
              data: 'efficiency',
              render: function (data, type, row) {
                // Check if the rendering is for display, not sorting or filtering
                if (type === 'display') {
                  return `${data}%`;
                }
                return data;
              },
            },
            
            { data: 'date_time'},
            { data: 'ss'},
            {
              data: 'faef',
              render: function (data, type, row) {
                // Check if the rendering is for display, not sorting or filtering
                if (type === 'display') {
                  return `${data}%`;
                }
                return data;
              },
            },
            
            { data: 'day_count'},
            
          ],
        });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
   }
  };

  useEffect(() => {
    document.title = "Performance Eff Individual";
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate("/login");
    } else {
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }

      // Initialize the DataTable with the updated data
      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ["copy", "csv", "excel"],
        data: '', // Update the data option here
        columns: [
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
          { data: null},
        ],
      });
    }

    // Fetch category options from API
    const fetchEmployees = () => {
      $.ajax({
         url: `${config.apiUrl}/report/nbraid/getEmployeesikeja`,
        method: "GET",
        headers: customHeaders,
        success: function (response) {
          setEmployeeIkeja(response);
        },
        error: function (xhr, status, error) {
          console.error("Error fetching  options:", error);
        },
      });
    };

    fetchEmployees();

     // Fetch category options from API
     const fetchEmployeesota = () => {
        $.ajax({
          url: `${config.apiUrl}/report/nbraid/getEmployeesota`,
          method: "GET",
          headers: customHeaders,
          success: function (response) {
            setEmployeeota(response);
          },
          error: function (xhr, status, error) {
            console.error("Error fetching  options:", error);
          },
        });
      };
  
      fetchEmployeesota();
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem("isLoggedIn");

    // Redirect to the login page
    navigate("/login");
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
               <CardTitle tag="h5"> Performance Overview Individual
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Start Date"
                    name="fromdate"
                  />
                </div>
                <div className="col-sm-2">
                  <span className="textgreen">To Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                </div>
                
                <div className="col-sm-3">
                  <span className="textgreen">OTA</span>
                  <select
                    id="employees"
                    className="form-control"
                    name="employeesota"
                    value={formData.employeesota}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Employees</option>
                    {employeesota.map((employee) => (
                      <option key={employee.entry_id} value={employee.entry_id}>
                        {employee.worker + "(" + employee.entry_id + ")"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-3">
                  <span className="textgreen">IKEJA</span>
                  <select
                    id="employees"
                    className="form-control"
                    name="employees"
                    value={formData.employees}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.entry_id} value={employee.entry_id}>
                        {employee.worker + "(" + employee.entry_id + ")"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>

            {/* Display Input Field Values */}
      
            <div>
            <h6 className="header-title">
              <span className="textred">
                {startDate !== endDate 
                  ? `[${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${formData.employeesota}]-[${formData.employees}]`
                  : new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
              </span>
            </h6>
          </div>

            <div className="table-responsive">
               <table id="example" className="display">
                <thead>
                  <tr>
                    <th>EMP NAME</th>
                    <th>ID</th>
                    <th>D.O.J</th>
                    <th>No Of Day</th>
                    <th>Shift</th>
                    <th>Section</th>
                    <th>Product Name</th>
                    <th>Line</th>
                    <th>Total Daily Target</th>
                    <th>Total Daily Complete</th>
                    <th>Efficiency</th>
                    <th>Date Range</th>
                    <th>Site</th>
                    <th>Average Efficiency</th>
                    <th>Total No Of Days</th>
                  </tr>
                </thead>
              </table>
            </div>

          </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default PerformanceEffIndividual;
