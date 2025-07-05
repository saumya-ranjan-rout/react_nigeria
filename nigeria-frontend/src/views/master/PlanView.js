import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'jquery/dist/jquery.min.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Card, CardHeader, CardBody, CardFooter, CardTitle, FormGroup, Form, Input, Table, Row, Col } from "reactstrap";
import $ from 'jquery';
//DB Connection
import config from '../../config';

function PlanView() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
 
  const [itemCategories, setItemCategories] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dataTableInitialized, setDataTableInitialized] = useState(false);
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const days = [];
  for (let dt = new Date(weekStart); dt <= weekEnd; dt.setDate(dt.getDate() + 1)) {
    const currentDate = new Date(dt); // Create a new Date object
    days.push({
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      date: formatDate(currentDate),
    });
  }
  
  const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/weeklyplanview`,
        method: 'GET',
        headers: customHeaders,
      success: function (response) {
        setItemCategories(response);
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  };

  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  useEffect(() => {
    document.title = "Plan Vs Target";
  
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      $.ajax({
         url: `${config.apiUrl}/targetplan/batchh`,
        method: "GET",
        headers: customHeaders,
        processData: false,
        contentType: "application/json",
        success: function (response) {
          console.log("API Response:", response);
          try {
            const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
            // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
            if (dataTable) {
              // Clear and destroy the DataTable
              dataTable.clear().destroy();
            }
            // Clear and destroy DataTable if it exists
            if ($.fn.DataTable.isDataTable("#example")) {
              tableRef.current.DataTable().clear().destroy();
            }
 
            // Set the new table data
            setTableData(response);
 
            // Set the flag to indicate DataTable initialization
            setDataTableInitialized(false);
          } catch (error) {
            console.error("Error handling new data:", error);
          }
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    }
  }, []);

  useEffect(() => {
    if (tableData.length > 0 && !dataTableInitialized) {
      try {
        tableRef.current = $("#example").DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Specify the DOM layout
          buttons: ['copy', 'csv', 'excel'],
          data: tableData,
          columns: generateColumns(tableData[0].dates),
        });
        setDataTableInitialized(true);
      } catch (error) {
        console.error("Error initializing DataTable:", error);
      }
    }
  }, [tableData, dataTableInitialized]);
  
  const generateColumns = (dateLabels) => {
    const columns = [
      { data: "desc" },
      ...dateLabels.map((dateLabel) => ({
        data: (row) => row.values[dateLabel],
        render: function (data, type, row) {
          if (type === "display" && data !== undefined) {
            return data;
          }
          return "";
        },
      })),
    ];
    return columns;
  };

  return (
    <>
      <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0' }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Plan View &nbsp;
                  <Link to="/admin/master/addnewplan" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
                    Add new
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Table responsive id="example">
                  <thead>
                    <tr>
                      <th>Product Description</th>
                      {days.map((day, index) => (
                        <th key={index}>
                          {day.dayName}
                          <br />
                          {day.date}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>{row.desc}</td>
                        {days.map((day, colIndex) => (
                          <td key={colIndex}>{row.values[day.date]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PlanView;
