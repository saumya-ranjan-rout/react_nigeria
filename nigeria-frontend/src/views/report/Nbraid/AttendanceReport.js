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

function AttendanceReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);


  const [date, setDate] = useState("");
  const [cat, setCat] = useState("");
  const [shift, setShift] = useState("");
  const [site, setSite] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
 const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
 const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

 
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
 const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);
  
 
  
  const [formData, setFormData] = useState({
    fromdate: "",
    todate: "",
    category:"",
    shift:"",
    site:"",
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

    // Prepare the form data
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    // Make an AJAX request to fetch data
    $.ajax({
      url: `${config.apiUrl}/Nbraid/get_attendance_search_data`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response);
        setMonthsArray(response.dates);
        setDate(response.date);
        setCat(response.cat);
        setShift(response.shift);
        setSite(response.site);

        const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }
        if ($.fn.DataTable.isDataTable("#example")) {
          $("#example").DataTable().destroy();
        }

          tableRef.current = $('#example').DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: [
              {
                extend: 'csvHtml5',
                text: 'Export CSV',
                customize: function (csv) {
                  // Get the current header content
                  const currentHeaders = $('table thead th').map(function () {
                    return $(this).text();
                  }).get();
    
                  // Add the dynamic headers
                  const dynamicHeaders = monthsArray.map((header) => header);
                  const allHeaders = currentHeaders.concat(dynamicHeaders);
    
                  // Add the headers to the CSV
                  csv = allHeaders.join(',') + '\n' + csv;
    
                  return csv;
                },
              },
            ],
            data: response, // Update the data option here
            columns:[
              { data: "estatus" },
              ...response.dates.map((dateLabel) => ({
                data: `values.${dateLabel}`,
                render: function (data, type, row) {
                  if (type === "display" && data) {
                    return data.join(", ");
                  }
                  return "";
                },
              }),
              ),
            ],
    
          });
        
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        // Handle the error gracefully, e.g., show an error message to the user
      },
    });
  };
  
useEffect(() => {
  document.title = "MTD Attendance";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    navigate("/login");
  } else {
    $.ajax({
      url: `${config.apiUrl}/Nbraid/get_attendance_default_data`,
      method: "get",
      headers: customHeaders,
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
            data:response,
            columns:[
              { data: "estatus" },
              { data: "values" },
            ]
          })
       
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });

     //get shift
     const fetchShiftOptions = () => {
        $.ajax({
          // API URL for fetching shift options
          url: `${config.apiUrl}/getshift`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShiftOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

    fetchShiftOptions();
  }
}, []);


  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
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
                <CardTitle tag="h5">MTD Attendance

             </CardTitle>
             </CardHeader>
              <CardBody>
               Month Range
                <hr></hr>
      
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
                <div className="col-sm-2">
                  <span className="textgreen">Category Name</span>
                  <select
                    id="category"
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    <option value="BRAID">BRAID</option>
                     <option value="NBRAID">NBRAID</option>
                  </select>
                </div>
                <div className="col-sm-2">
                    <span className="textgreen">Shift</span>
                    <select
                      id="shift"
                      className="form-control"
                      name="shift" 
                      value={formData.shift} onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.nhrs}>
                          {shiftOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                <div className="col-sm-2">
                  <span className="textgreen">Site</span>
                  <select
                    id="site"
                    className="form-control"
                    name="site"
                    value={formData.site}
                    onChange={handleInputChange}
                  >
                    <option value="">All</option>
                    <option value="ota">ota</option>
                    <option value="ikeja">ikeja</option>
                  </select>
                </div>
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <br/>
            {monthsArray && monthsArray.length > 0 ? (
              // Render content when monthsArray is not empty
              <div>
                <p  style={{ textAlign: 'center',color:'green' }}>{date} - {cat} - {shift} - {site}</p>
              </div>
            ) : (
              // Render a message when monthsArray is empty
              <p style={{ textAlign: 'center' }}>
                PRESENT EMPLOYEES BREAKDOWN BY ALL CATEGORY <span className="textgreen">{formattedDate}</span>
              </p>
            )}

            <br/>
            <div className="table-responsive">
              <table id="example" className="display">
            <thead>
            <tr>
                <th>Employee Status</th>
                {/* Render headers for months */}
                {monthsArray && monthsArray.length > 0 ? (
                    <>
                        {monthsArray.map((monthName, index) => (
                            <th key={monthName}>{monthName}</th>
                        ))}
                    </>
                ) : (
                    // Handle the case where monthsArray is empty or null
                    <th>{formattedDate}</th>
                )}
            </tr>
            </thead>
            <tbody>

            </tbody>
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

export default AttendanceReport;
