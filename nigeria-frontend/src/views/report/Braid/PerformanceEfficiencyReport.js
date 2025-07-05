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

function PerformanceEfficiencyReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
 
  const [data, setData] = useState([]);

  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
  //Today date format
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0'); // Get the day and pad with leading zero if needed
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Get the month (adding 1 since months are zero-based) and pad with leading zero if needed
  const year = currentDate.getFullYear(); // Get the year
  
  const formattedDate = `${day}-${month}-${year}`;

 
  const tDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).split('/').reverse().join('-');
  
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
    setLoading(true)
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: `${config.apiUrl}/braid/get_performance_eff_braid_searchh`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
    
        setMonthsArray(response.resultData.dates);
        setFDate(response.resultData.fdate);
        setTDate(response.resultData.tdate);
        // Initialize DataTable with the fetched data
        const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }

        if ($.fn.DataTable.isDataTable("#example")) {
          $("#example").DataTable().destroy();
        }
   
              
      const columns = [
        { data: "emp" },
        { data: "empid" },
        {
          data: "site",
          defaultContent: 'N/A',
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
        // Generate columns for each month's average
          ...response.resultData.dates.map((avg, index) => ({
            data: `eff.${index}`, // Access eff by index
            render: function (data, type, row) {
              return data ? data : "";
            },
          }))

      ];
      
      
      setTimeout(() => {
      tableRef.current = $("#example").DataTable({
        autoWidth: false,
        dom: "Bfrtip",
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ['copy', 'csv', 'excel', 'pdf'],
        data: response.resultData.items,
        columns: columns,
      });
    }, 100); // Adjust the delay time as needed
    
    
    setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    setLoading(true)
    document.title = "Braid Performance Efficiency";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      $.ajax({
        url: `${config.apiUrl}/braid/get_performance_Eff_report_braid_default`,
        method: "GET",
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
                { data: "eff" },
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
               <CardTitle tag="h5"> Braid Performance Efficiency
                <hr></hr>
                Search Between Dates Reports
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
                    <form onSubmit={handleSubmit} method="POST">
                      <div className="row space mb-4">
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

                    {monthsArray && monthsArray.length > 0 ? (
                      <div>
                        <h6 className="header-title">
                          <span className="textgreen">
                            [{fdate}-{tdate}]
                          </span>
                        </h6>
                      </div>
                    ) : (
                      <div>
                        <h6 className="header-title">
                          <span className="textgreen">{formattedDate}</span>
                        </h6>
                      </div>
                    )}
<div className="table-responsive">
              <table id="example" className="display">
                <thead>
                  <tr>
                    <th>Emp Name</th>
                    <th>ID</th>
                    <th>Site</th>
                    <th>D.O.J</th>
                    <th>Total Days</th>
                    <th>Section</th>
                    <th>Product</th>
                    <th>Zone</th>
                    <th>Machine</th>
                    <th>Shift</th>
                    {/* Render headers for months */}
                    {monthsArray && monthsArray.length > 0 ? (
                      monthsArray.map((monthName, index) => (
                        <th key={index}>{monthName}</th>
                      ))
                    ) : (
                      // Handle the case where monthsArray is empty or null
                      <th>{formattedDate}</th>
                    )}
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

export default PerformanceEfficiencyReport;
