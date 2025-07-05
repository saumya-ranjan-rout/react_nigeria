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

function PlanVsActualReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
 
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
 
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
    setLoading(true)
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/Nbraid/getPlanVsactualReportSearch`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setFDate(response.fdate); // Use response[0].fdate directly
        setTDate(response.tdate);

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
              filename: `NON-BRAID PLAN VS ACTUAL REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            {
              extend: "csv",
              filename: `NON-BRAID PLAN VS ACTUAL REPORT   ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} TO ${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}`,
            },
            "excel",
          ], 
          data: response.items, // Update the data option here
          columns: [
            {
              data: "product",
              render: function (data) {
                // Handle undefined, null, or empty string values in the "product" column
                return data ? data : '<span style="color:red">N/A</span>';
              },
            },
            { data: "total" },
            {
                data: null,
                render: function (data, type, row) {
                if (data.sump == "" ||data.sump == null) {
                    return '<span style="color:red">-</span>';
                } else {
                    return data.sump;
                }
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                const data1 = data.sump;
                const data12 = row.total;
                const totals = (data12) - (data1);
                return totals;
                },
            },
          ],
        });
        setLoading(false)
      },
      error: function (xhr, status, error) {
        setLoading(false)
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    setLoading(true)
    document.title = "PLAN VS ACTUAL REPORT";
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate("/login");
    } else {
      $.ajax({
       url: `${config.apiUrl}/Nbraid/getPlanVsactualReportDefault`,
        method: "GET",
        headers: customHeaders,
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
                filename: `NON-BRAID PLAN VS ACTUAL REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
              },
              {
                extend: "csv",
                filename: `NON-BRAID PLAN VS ACTUAL REPORT ${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')} `,
              },
              "excel",
            ], 
            data: response, // Update the data option here
            columns: [
              {
                data: "product",
                render: function (data) {
                  // Handle undefined, null, or empty string values in the "product" column
                  return data ? data : '<span style="color:red">N/A</span>';
                },
              },
              { data: "total" },
              {
                  data: null,
                  render: function (data, type, row) {
                  if (data.sump == "" ||data.sump == null) {
                      return '<span style="color:red">-</span>';
                  } else {
                      return data.sump;
                  }
                  },
              },
              {
                  data: null,
                  render: function (data, type, row) {
                  const data1 = data.sump;
                  const data12 = row.total;
                  const totals = (data12) - (data1);
                  return totals;
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

    const date = new Date().toLocaleDateString("en-GB", {
      timeZone: "Africa/Lagos",
    });
    const parts = date.split("/");
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    const newcurrentDate1 = `${day}-${month}-${year}`;
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem("isLoggedIn");

    // Redirect to the login page
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
               <CardTitle tag="h5"> PLAN VS ACTUAL REPORT
                <hr></hr>
                Date Range
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
                <div className="col-sm-4">
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
            {/* Display Input Field Values */}
          <div>
            <h6 className="header-title">
              <span className="textred">
                {startDate !== endDate 
                  ? `[${new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]-[${new Date(endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}]`
                  : new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
              </span>
             </h6>
            </div>
            <div className="table-responsive">
               <table id="example" className="display">
                <thead>
                <tr>
                <th>Product Description</th>
                {fdate !== '' && tdate !== '' ? (
                    <>
                    <th>Total Plan</th>
                    <th>Total Achieve</th>
                    </>
                ) : (
                    <>
                    <th>Daily Plan</th>
                    <th>Current Production</th>
                    </>
                )}
                <th>Balance</th>
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

export default PlanVsActualReport;
