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


function WastagePerItemReport() {
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const [monthsArray, setMonthsArray] = useState([]);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  
  const [data, setData] = useState([]);

 
  const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' });
    const parts = date.split('/');
    const formattedDay = parts[0].padStart(2, '0');
    const formattedMonth = parts[1].padStart(2, '0');
    const year = parts[2];
    const formattedDate = `${formattedDay}-${formattedMonth}-${year}`;


  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "fromdate") {
      setStartDate(new Date(value));
    } else if (name === "todate") {
      setEndDate(new Date(value));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
  
    // Prepare the form data
    const updatedFormData = {
      fromdate: startDate.toISOString(), // Convert dates to ISO format
      todate: endDate.toISOString(),
    };

    const jsonData = JSON.stringify(updatedFormData);

    // Make an AJAX request to fetch data
    $.ajax({
      url: `${config.apiUrl}/braid/get_wastage_item_search_data`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response);
        setMonthsArray(response.dates);
        setFDate(response.fdate); // Use response[0].fdate directly
        setTDate(response.tdate);
        setLoading(false);
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
          $('#example').remove();
        }
        setTimeout(() => {
        tableRef.current = $("#example").DataTable({
          autoWidth: false,
          dom: "Bfrtip",
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv'],
          data: response.datas,
          columns:[
             { data: 'items',
              className: 'textred', }, // Add a class to style the text as red },
            ...response.dates.map((dateLabel) => ({
              data: `values.${dateLabel}`,
              render: function (data, type, row) {
                if (type === "display" && data) {
                  return data.join(", ");
                }
                return "";
              },
            })),
          ],
        });
      }, 100); // Adjust the delay time as needed
        } catch (error) {
          console.error("Error handling new data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        //setLoading(false);
        // Handle the error gracefully, e.g., show an error message to the user
      },
    });
  };

  useEffect(() => {
    document.title = 'Wastage % Per Item';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      setLoading(true);
      $.ajax({
        url: `${config.apiUrl}/get_wastage_item_data`,
        method: 'GET',
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          setLoading(false);
         
          // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Initialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ['copy', 'csv'],
            data: response, // Use data from data.zone here
            columns: [
              { data: 'items',
              className: 'textred', }, // Add a class to style the text as red },
              ...response[0].dates.map((dateLabel) => ({
                data: `values.${dateLabel}`,
                render: function (data, type, row) {
                  if (type === "display" && data) {
                    return data.join(", ");
                  }
                  return "";
                },
              }))
            ],
          });
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });

      
    }
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
 
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
               <CardTitle tag="h5"> Wastage Per Item
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
            <br />
            <br />
         
            <div>
              <h6 class="header-title" style={{textAlign:'center'}}>
                <span style={{color:'red'}}>
                {fdate !== '' ? `From [${formatDate(new Date(fdate))}] to [${formatDate(new Date(tdate))}]` : `Date - `+formattedDate}
                </span>
              </h6>
            </div>
            <div className="table-responsive">
             <table id="example" className="display">
              <thead>
                <tr>
                  <th>Items</th>
                  {/* Render headers for months */}
                  {monthsArray && monthsArray.length > 0 ? (
                    monthsArray.map((monthName, index) => (
                      <th key={monthName}>{monthName}</th>
                    ))
                  ) : (
                    // Handle the case where monthsArray is empty or null
                    <th>{formattedDate}</th>
                  )}
                </tr>
              </thead>
              <tbody></tbody>
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

export default WastagePerItemReport;
