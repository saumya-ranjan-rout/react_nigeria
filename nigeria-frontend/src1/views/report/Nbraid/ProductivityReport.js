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

function ProductivityReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);


  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dataTableInitialized, setDataTableInitialized] = useState(false);
  

  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  //alert(formattedDate);

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  
  const [formData, setFormData] = useState({
    fromdate: "",
    line_no: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
   
  };
 
 const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
  
    // Prepare the form data
    const updatedFormData = { ...formData, fromdate: startDate};
  
    const jsonData = JSON.stringify(updatedFormData);
   
    // Make an AJAX request to fetch data
    $.ajax({
      url: `${config.apiUrl}/nbraid/getfilteredproductivity`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {

        console.log("Response Data:", response);
        setMonthsArray(response.section)
        try {
          const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
          // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
          if (dataTable) {

            // Clear and destroy the DataTable
            dataTable.clear().destroy();
          }
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          
          const flattenedData = response.items.map((row) => {
            const flattenedRow = {
              lines: row.lines,
              tm: row.tm,
              pp: row.pp,
              eff: row.eff,
            };
          
            response.section.forEach((section, index) => {
              flattenedRow[`section_${index}`] = row.section_data[index];
            });
          
            return flattenedRow;
          });
          
          // Initialize DataTable with flattened data
          setTimeout(() => {
            tableRef.current = $('#example').DataTable({
              autoWidth: false,
              dom: 'Bfrtip',
               dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
              buttons: [
                {
                  extend: "copy",
                  filename: "LINE_REPORT_Copy_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                {
                  extend: "csv",
                  filename: "LINE_REPORT_CSV_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                "excel",
              ],
              data: flattenedData,
              columns: [
                { data: "lines" },
                ...response.section.map((section, index) => ({ data: `section_${index}` })),
                { data: "tm" },
                { data: "pp" },
                { data: "eff" },
              ],
            });
          }, 100);
          
          // Set the new table data
          setTableData(response.items);

          // Set the flag to indicate DataTable initialization
          setDataTableInitialized(false);
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
  document.title = "Productivity Report";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    navigate("/login");
  } else {
    $.ajax({
      url: `${config.apiUrl}/Nbraid/getfilteredproductivitydefault`,
      method: "GET",
      headers: customHeaders,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setMonthsArray(response.section);
         //alert(response.section.length)
         try {
                  
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          const flattenedData = response.items.map((row) => {
            const flattenedRow = {
              lines: row.lines,
              tm: row.tm,
              pp: row.pp,
              eff: row.eff,
            };
          
            response.section.forEach((section, index) => {
              flattenedRow[`section_${index}`] = row.section_data[index];
            });
          
            return flattenedRow;
          });
           // Initialize the DataTable with the updated data
           setTimeout(() => {
            tableRef.current = $("#example").DataTable({
              dom: "Bfrtip",
               dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
              buttons: [
                {
                  extend: "copy",
                  filename: "LINE_REPORT_Copy_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                {
                  extend: "csv",
                  filename: "LINE_REPORT_CSV_" + startDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }).replace(/\//g, '-'),
                },
                "excel",
              ],
              data: flattenedData, // Update the data option here
              columns: [
                { data: "lines" },
                ...response.section.map((section, index) => ({ data: `section_${index}` })),
                { data: "tm" },
                { data: "pp" },
                { data: "eff" },
               
              ],
            });
          }, 100);
        } catch (error) {
          console.error("Error handling initial data:", error);
        }
        setLoading(false);
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
               <CardTitle tag="h5"> Productivity & Display
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
                              <div className="col-sm-4">
                                <span className="textgreen">Line No</span>
                                <select
                                  name="line_no"
                                  className="form-control subcat"
                                  id="line_no"
                                  value={formData.line_no} onChange={handleInputChange}
                                >
                                   <option>Select Line</option>
                                  <option value="1">LINE 1-16</option>
                                  <option value="2">EB LINE</option>
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
                          
                          <div>
                            <h6 className="header-title">
                              <span className="textred">
                                {startDate &&
                                  startDate.toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric',
                                  }).replace(/\//g, '-')}
                              </span>
                            </h6>
                          </div>


                          <br/>
                          <table id="example" className="display">
                          <thead>
                          <tr>
                              {/* Render headers for months */}
                              {monthsArray && monthsArray.length > 0 ? (
                                  <>
                                    <th>Line</th> 
                                      {monthsArray.map((monthName, index) => (
                                          <th key={monthName}>{monthName}</th>
                                      ))}
                                    <th>Total ManPower</th>
                                    <th>Total Production<br/>Fg Output</th>
                                    <th>PPP</th>
                                  </>
                              ) : (
                                  <>
                                    <th>Line</th> 
                                    
                                    <th>Total ManPower</th>
                                    <th>Total Production<br/>Fg Output</th>
                                    <th>PPP</th>
                                  </>
                                 
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


export default ProductivityReport;
