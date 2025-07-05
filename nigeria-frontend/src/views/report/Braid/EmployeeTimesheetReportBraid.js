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

function EmployeeTimesheetReportBraid() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);

  const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' });
    const parts = date.split('/');
    const formattedDay = parts[0].padStart(2, '0');
    const formattedMonth = parts[1].padStart(2, '0');
    const year = parts[2];
    const formattedDate = `${formattedDay}-${formattedMonth}-${year}`;


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
    document.title = "BRAID EMPLOYEE TIMESHEET";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      $.ajax({
        url: `${config.apiUrl}/braid/getEmployeeTimesheetDefaultData`,
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
                data: "regg", // Use the "regg" property directly
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
                  // Add your logic here for rendering "regg" column
                  return data;
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
                data: null,
                render: function (data, type, row) {
                  if (typeof data === 'undefined' || data === null) {
                    return 'N/A';
                  }
                  return data.eff + '%';
                },
              },
              /*{ data: "eff" },*/
              { data: "tDate" },
            ],
            columnDefs: [
              {
                targets: [3], // Assuming columns 3 and 14 contain date values
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
               <CardTitle tag="h5"> Braid Employee Timesheet <Link to="/admin/report/employeetimesheetnewreport" className="btn btn-success btn-sm rounded">Previous Date</Link>
                <hr></hr>
               
               </CardTitle>
               </CardHeader>
                <CardBody>
           
            <div>
              <h6 className="header-title">
                <span className="textgreen">
                  {formattedDate}
                </span>
              </h6>
            </div>
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
    
  );
}


export default EmployeeTimesheetReportBraid;
