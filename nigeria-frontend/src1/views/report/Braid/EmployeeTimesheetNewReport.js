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
import Select from 'react-select';
//DB Connection
import config from '../../../config';

function EmployeeTimesheetNewReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const today = new Date();
  const currentDate = new Date();
  // Extract day, month, and year components
  const day = currentDate.getDate();
  const month = currentDate.toLocaleDateString("en-US", { month: "2-digit" });
  const year = currentDate.getFullYear();
  
  // Create the formatted date string
  const formattedDate = `${month}-${day}-${year}`;
  const [startDate, setStartDate] = useState(today);
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

 
  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = {
      fromdate: startDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
       url: `${config.apiUrl}/braid/getEmployeeTimesheetDataNew`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
      
      // Initialize DataTable with the fetched data
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }

      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ["copy", "csv", "excel"],
        data: response.resultData,
        columns: [
          { data: "emp" },
          { data: "empid" },
          {
            data: "site",
            defaultContent: 'N/A', // Provide default content for the "site" column
          },
          {
            data: "regg",
            render: function (data, type, row) {
              if (typeof data === 'undefined' || data === null) {
                return 'N/A';
              }
          
              // Assuming 'data' is in standard date format (e.g., "2024-01-08")
              var date = new Date(data);
              var day = date.getDate().toString().padStart(2, '0');
              var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
              var year = date.getFullYear();
          
              return day + '-' + month + '-' + year;
            },
          },
          {
            data: null,
            render: function (data, type, row) {
              if (typeof data === 'undefined' || data === null) {
                return 'N/A';
              }
              return data.diff + ' Days';
            },
          },
          { data: "item_description" },
          { data: "section_name" },
          { data: "zone" },
          { data: "machine" },
          { data: "shift" },
          { data: "complete" },
          { data: "tar1" },
          { data: "total" },
          {
            data: "eff",
            render: function (data, type, row) {
              if (type === 'display' && data !== null && data !== undefined) {
                return data + '%';
              } else {
                // For other types or if the data is null/undefined, return the original data
                return data;
              }
            }
          },
          {
            data: "date",
            render: function (data, type, row) {
              if (type === 'display' && data !== null && data !== undefined) {
                // Assuming "data" is a valid date string or a Date object
              
               
                const date = new Date(data).toLocaleDateString('en-GB');
                const parts = date.split('/');
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                const currentMonth = `${month}-${year}`;
                const currentDate = `${month}-${day}-${year}`;
                return currentDate;
              } else {
                // For other types or if the data is null/undefined, return the original data
                return data;
              }
            }
          },
        ],
        columnDefs: [
          {
            targets: [3, 14], // Assuming columns 3 and 14 contain date values
            render: function (data, type, row, meta) {
              if (type === 'display' && typeof data === 'string') {
                var dateParts = data.split('-');
                if (dateParts.length === 3) {
                  return dateParts[1] + '-' + dateParts[0] + '-' + dateParts[2];
                }
              }
              return data;
            },
          },
        ],
        
      });
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

 

  useEffect(() => {
    setLoading(true)
    document.title = "BRAID EMPLOYEE TIMESHEET";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      $.ajax({
       url: `${config.apiUrl}/braid/getEmployeeTimesheetDataNew`,
        method: "POST",
        headers: customHeaders,
        data: '',
        processData: false,
        contentType: "application/json",
        success: function (response) {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }

          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ["copy", "csv", "excel"],
            data: response.resultData,
            columns: [
              { data: "emp" },
              { data: "empid" },
              {
                data: "site",
                defaultContent: 'N/A', // Provide default content for the "site" column
              },
              {
                data: "regg",
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
              
                  // Assuming 'data' is in standard date format (e.g., "2024-01-08")
                  var date = new Date(data);
                  var day = date.getDate().toString().padStart(2, '0');
                  var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
                  var year = date.getFullYear();
              
                  return day + '-' + month + '-' + year;
                },
              },
              {
                data: null,
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
                  return data.diff + ' Days';
                },
              },
              { data: "item_description" },
              { data: "section_name" },
              { data: "zone" },
              { data: "machine" },
              { data: "shift" },
              { data: "complete" },
              { data: "tar1" },
              { data: "total" },
              {
                data: "eff",
                render: function (data, type, row) {
                  if (type === 'display' && data !== null && data !== undefined) {
                    return data + '%';
                  } else {
                    // For other types or if the data is null/undefined, return the original data
                    return data;
                  }
                }
              },
              {
                data: "date",
                render: function (data, type, row) {
                  if (type === 'display' && data !== null && data !== undefined) {
                    // Assuming "data" is a valid date string or a Date object
                  
                   
                    const date = new Date(data).toLocaleDateString('en-GB');
                    const parts = date.split('/');
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    const currentMonth = `${month}-${year}`;
                    const currentDate = `${month}-${day}-${year}`;
                    return currentDate;
                  } else {
                    // For other types or if the data is null/undefined, return the original data
                    return data;
                  }
                }
              }
            ],
            columnDefs: [
              {
                targets: [3, 14], // Assuming columns 3 and 14 contain date values
                render: function (data, type, row, meta) {
                  if (type === 'display' && typeof data === 'string') {
                    var dateParts = data.split('-');
                    if (dateParts.length === 3) {
                      return dateParts[1] + '-' + dateParts[0] + '-' + dateParts[2];
                    }
                  }
                  return data;
                },
              },
            ],
            
          });
          setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }
  }, []);

const handleLogout = () => {
        

        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        navigate('/login');
    };

  return (
    <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
     <div className="content">
      <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
               <CardTitle tag="h5"> Braid Employee Timesheet
                <hr></hr>
                Search Between Dates Reports
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
               <div className="col-sm-4">
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
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>

            {/* Display Input Field Values */}

            <div className="table-responsive">
              <table id="example" className="display" style={{ width: '100%' }}>
                <thead>
                  <tr>
                  <th>EMP NAME</th>
                  <th>ID</th>
                  <th>Site</th>
                  <th>D.O.J</th>
                  <th>Total Days</th>
                  <th>Product</th>
                  <th>Section</th>
                  <th>Zone</th>
                  <th>Machine</th>
                  <th>Shift</th>
                  <th>Start Hour - End Hour<br/><small>Total Data Captured</small></th>
                  <th> <span>Target</span></th>
                  <th> <span>Complete</span></th>
                  <th> <span>Eff</span></th>
                  <th> <span>Date</span></th>
                </tr>
                </thead>
              </table>
            </div>
          </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default EmployeeTimesheetNewReport;
