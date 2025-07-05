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
import { saveAs } from 'file-saver';
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


function DaywiseProductionReport() {
  const [loading, setLoading] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [resultData, setTfooterData] = useState([]);
  const [resultData1, setTbodyData] = useState([]);
  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
   const tableRef = useRef(null);
  const [formData, setFormData] = useState({
    fromdate: "",
    todate: "",
    shift: "",
    site: "",
  });

  //date formats 1
  const currentDate1 = new Date(fdate);
  const day1 = currentDate1.getDate().toString().padStart(2, '0');
  const month1 = (currentDate1.getMonth() + 1).toString().padStart(2, '0');
  const year1 = currentDate1.getFullYear();
  const fdate1 = `${day1}-${month1}-${year1}`;
  
//date formats 1
  const currentDate2 = new Date(tdate);
  const day2 = currentDate2.getDate().toString().padStart(2, '0');
  const month2 = (currentDate2.getMonth() + 1).toString().padStart(2, '0');
  const year2 = currentDate2.getFullYear();
  const tdate1 = `${day2}-${month2}-${year2}`;
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

    $.ajax({
      url: `${config.apiUrl}/braid/get_daywise_production_search`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        console.log("Response Data:", response.tfgData);
        try {
          setMonthsArray(response.resultData[0].dates);
          setFDate(response.resultData[0].fdate);
          setTDate(response.resultData[0].tdate);
          setTfooterData(response.resultData);
          setTbodyData(response.tfgData);
        } catch (error) {
          console.error("Error handling new data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {


         document.title = 'Daywise Production Report';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [defaultData, shiftOptions] = await Promise.all([
          $.ajax({
            url: `${config.apiUrl}/braid/get_daywise_production_default`,
            method: "GET",
            headers: customHeaders,
            processData: false,
            contentType: "application/json",
          }),
          $.ajax({
            url: `${config.apiUrl}/getShiftOptions`,
            method: 'GET',
            headers: customHeaders,
          }),
        ]);

        setTfooterData(defaultData.resultData);
        setShiftOptions(shiftOptions);
        setTbodyData(defaultData.tfgData);

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }
  }, []);

 const handleLogout = () => {
        

        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        navigate('/login');
    };

  const formatDate = (dateString) => {
    const currentDate = dateString ? new Date(dateString) : new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();

    return { day, month, year };
  };

  //csv download
const downloadCSV = () => {
  const table = document.querySelector('.table');
  const rows = table.querySelectorAll('tr');
  const csvData = [];

  rows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('th, td');

    cells.forEach(cell => {
      const rowspan = cell.rowSpan;
      const colspan = cell.colSpan;
      const content = cell.innerText;

      if (rowspan > 1 || colspan > 1) {
        // Duplicate content for rowspan or colspan
        for (let i = 0; i < colspan; i++) {
          rowData.push(content);
        }
      } else {
        rowData.push(content);
      }
    });

    csvData.push(rowData.join(','));
  });

  // Create a CSV string
  const csvContent = csvData.join('\n');

  // Create a Blob and trigger the download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'DaywiseProductionReport.csv');
}


const copyTable = () => {
  // Select the table content
  const range = document.createRange();
  range.selectNode(tableRef.current);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  // Copy the selected content to the clipboard
  document.execCommand('copy');

  // Deselect the content
  window.getSelection().removeAllRanges();

  alert('Table copied to clipboard!');
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
               <CardTitle tag="h5"> Daywise Production Summary
                <hr></hr>
                Date Range
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
                    <span className="textgreen">Shift</span>
                    <select
                      id="shift"
                      className="form-control"
                      name="shift" 
                      value={formData.shift} onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.name}>
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
                        value={formData.site} onChange={handleInputChange}>
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

              <div>
                <h6 className="header-title">
                  <span className="textgreen">
                    {fdate !== '' ? `From [${fdate1}] to [${tdate1}]` : null}
                  </span>
                </h6>
              </div>

              <button onClick={downloadCSV} className="btn btn-primary">
               CSV
            </button>
            &nbsp;
            <button onClick={copyTable} className="btn btn-warning">Copy </button>
            <div className="table-responsive">
             
              <table className="table" ref={tableRef}>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Color Name</th>
                    <th>Shift</th>
                    <th>Site</th>

                    {monthsArray && monthsArray.length > 0 ? (
                      monthsArray.map((monthName, index) => (
                        <th key={monthName}>{monthName}</th>
                      ))
                    ) : (
                      <th>{formattedDate}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {resultData1 && resultData1.length > 0 ? (
                    resultData1.map((rowData, rowIndex) => (
                      <tr key={rowIndex}>
                        <td >{rowData.item}</td>
                        <td >{rowData.color}</td>
                        <td >{rowData.shift}</td>
                        <td >{rowData.site}</td>
                        {rowData.tfg && rowData.tfg.length > 0 ? (
                          rowData.tfg.map((value, index) => (
                            <td key={index}>{value}</td>
                          ))
                        ) : (
                          <td>{rowData.tfg}</td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={monthsArray.length + 2}>No data available</td>
                    </tr>
                  )}
         
                </tbody>
                <tfoot>
                  <tr>
                    <td className="textred">Total FG</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index} className="textred">{dataItem.totalFG}</td>
                      ))
                    ) : (
                      <td></td>
                    )}
                  </tr>
                  <tr>
                    <td className="textgreen">Total Active Worker</td>
                    <td></td>
                    <td></td>
                    <td></td>

                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index} className="textgreen">{dataItem.totalActiveWorker}</td>
                      ))
                    ) : (
                      <td>0</td>
                    )}
                  </tr>
                  <tr>
                    <td className="textblue">Daily PPP</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {resultData && resultData.length > 0 ? (
                      resultData.map((dataItem, index) => (
                        <td key={index} className="textblue">{dataItem.dailyPPP}</td>
                      ))
                    ) : (
                      <td>x</td>
                    )}
                  </tr>
                </tfoot>
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

export default DaywiseProductionReport;
