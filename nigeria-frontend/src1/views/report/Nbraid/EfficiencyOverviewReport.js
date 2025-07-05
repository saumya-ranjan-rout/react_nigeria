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

function EfficiencyOverviewReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [monthsArray, setMonthsArray] = useState([]);

  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

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
    setLoading(true);
    // Prepare the form data
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };
  
    const jsonData = JSON.stringify(updatedFormData);
   
    // Make an AJAX request to fetch data
    $.ajax({
       url: `${config.apiUrl}/Nbraid/get_efficiencyOverview_search_data`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response);
        setMonthsArray(response.dates)
        try {
          const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }
           // Clear and destroy DataTable if it exists
           if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          setTimeout(() => {
          tableRef.current = $('#example').DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ["copy", "csv", "excel"],
            data: response.effdata, // Update the data option here
            columns:[
              { data: "worker" },
              { data: "id" },
              { data: "section_name" },
              ...response.dates.map((dateLabel) => ({
                data: `sum_ef.${dateLabel}`,
                render: function (data, type, row) {
                  if (type === "display" && data) {
                    //return data.join(", ");
                    return `<a href="/admin/report/efficiencyoverviewdetailsreport/${row.id}/${dateLabel}" rel="noopener noreferrer">${data}</a>`;
                  }
                  return "";
                },
              })),

              { data: "present_days" },
              { data: "avg" },
            ],
    
          });
        }, 100); // Adjust the delay time as needed
        } catch (error) {
          console.error("Error handling new data:", error);
        }
        setLoading(false);
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        // Handle the error gracefully, e.g., show an error message to the user
      },
    });
  };
  
useEffect(() => {
  setLoading(true);
  document.title = "Efficiency Overview";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    navigate("/login");
  } else {
    $.ajax({
       url: `${config.apiUrl}/Nbraid/get_efficiencyOverview_deafault_data`,
      method: "GET",
      headers: customHeaders,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        try {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          // Set the initial table data
           // Initialize the DataTable with the updated data
            tableRef.current = $("#example").DataTable({
              dom: "Bfrtip",
              dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
              buttons: [
                {
                  extend: "copy",
                  filename: `NON-BRAID PERFORMANCE OVERVIEW REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
                },
                {
                  extend: "csv",
                  filename: `NON-BRAID PERFORMANCE OVERVIEW REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
                },
                "excel",
              ],
              data: response, // Update the data option here
              columns: [
                { data: 'worker'},
                { data: 'id'},
                {
                  data: 'eff',
                  render: function (data, type, row, meta) {
                    // Render a link for 'eff' column in 'display' mode
                    if (type === 'display') {
                      return `<a href="/admin/report/efficiencyoverviewdetailsreport/${row.id}/${row.dates}" rel="noopener noreferrer">${data}</a>`;
                    }
                    // Return the original data for other types (sorting, filtering, etc.)
                    return data;
                  },
                },           
              ],
           
            });
            setLoading(false);
        } catch (error) {
          console.error("Error handling initial data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
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
               <CardTitle tag="h5"> Performance Overview
                <hr></hr>
                 Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
              <div className="col-sm-2"></div>
                <div className="col-sm-3">
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
                <div className="col-sm-3">
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
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <br/>
            <br/>

            <div>
              <h6 className="header-title">
                <span className="textred">
                  {startDate !== endDate 
                    ? `[${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]`
                    : new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </span>
              </h6>
            </div>

             <table id="example" className="display">
                <thead>
                <tr>
                    <th>EMP NAME</th>
                    <th>ID</th>
                    {/* Render headers for months */}
                    {monthsArray && monthsArray.length > 0 ? (
                        <>
                          <th>Current Section</th>
                            {monthsArray.map((monthName, index) => (
                                <th key={monthName}>{monthName}</th>
                            ))}
                            <th>Present Days</th>
                            <th>Average For The Date Range</th>
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
           
         </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default EfficiencyOverviewReport;
