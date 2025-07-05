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

function PPPReport() {
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [data, setData] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
  const [sumValues, setSumValues] = useState([]);
  const [avgValues, setAvgValues] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [totalAvg, setTotalAvg] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [shiftOptions, setShiftOptions] = useState([]);
   const [fromdate1, setFromDate1] = useState('');
  const [todate1, setToDate1] = useState('');
const [ssite, setSite] = useState('');
  const [sshift, setShift] = useState('');
 const [loading, setLoading] = useState(false);
  


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
    fromdate: '',
    todate: '',
    site: '',
    shift: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'product_name') {
      const selectedProduct = productOptions.find((product) => String(product.id) === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_name: value,
        product: productName,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    setLoading(true);
    document.title = 'PPP REPORT';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
     navigate('/login');
    } else {
      // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
      // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ['copy', 'csv'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });
    }

    $.ajax({
      url: `${config.apiUrl}/gettodaypppreportData`,
      method: 'GET',
      headers: customHeaders,
      //data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        const { date } = response;
        let cdate = date;
        const { timesheet } = response;
        const extractedData = timesheet.map((item) => ({
          product_name: item.product_name,
        }));
        setData(extractedData);
        setCurrentDate(cdate);
        // Format the date as "DD-MM-YYYY"
          const formattedDate = cdate;

         
        sendSecondRequest();

        function sendSecondRequest() {
          const sumValues = [];
          const avgValues = [];
          const totalRequests = timesheet.length;
          let completedRequests = 0;

          timesheet.forEach((item, index) => {
            const { product_name,date_time,shift,site, line } = item;

            $.ajax({
              url: `${config.apiUrl}/sum`,
              method: 'POST',
              headers: customHeaders,
              data: {
                date: date,
                product_name: product_name,
                date_time: date_time,
                  shift: shift,
                  site: site,
                  line: line,
              },
              success: function (response) {
                const sum = response.sum;
                const avg = response.avg;
                sumValues[index] = sum;
                avgValues[index] = avg;
                completedRequests++;

                if (completedRequests === totalRequests) {
                  renderDataTable(timesheet, sumValues, avgValues, formattedDate);
                }
              },
              error: function (error) {
                console.error('Error fetching data:', error);
                completedRequests++;
                if (completedRequests === totalRequests) {
                  renderDataTable(timesheet, sumValues, avgValues, formattedDate);
                }
              },
            });
          });

          if (totalRequests === 0) {
            renderDataTable(timesheet, sumValues, avgValues, formattedDate);
          }
        }
        setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      }
    });

    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
         url: `${config.apiUrl}/getShiftOptions`,
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
  }, []);

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
     url: `${config.apiUrl}/getpppreportData`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        const { fromdate1, todate1, fromdatetimestamp, todatetimestamp, timesheet, site, shift} = response;
        let fdate = fromdate1;
        let tdate = todate1;
        let timestamp1 = fromdatetimestamp;
        let timestamp2 = todatetimestamp;
          setFromDate1(fromdate1);
      setToDate1(todate1);
       setSite(site);
       setShift(shift);

        // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

        if (fdate !== '' && tdate !== '') {
          function sendThirdRequest(timestamp1, timestamp2) {
            const sumValues = [];
            const avgValues = [];
            const totalRequests = timesheet.length;
            let completedRequests = 0;

            timesheet.forEach((item, index) => {
              const { product_name,date_time,shift,site, line } = item;

              $.ajax({
                 url: `${config.apiUrl}/sum`,
                method: 'POST',
                headers: customHeaders,
                data: {
                  timestamp1: timestamp1,
                  timestamp2: timestamp2,
                  fdate: fdate,
                  tdate: tdate,
                  product_name: product_name,
                  date_time: date_time,
                  shift: shift,
                  site: site,
                  line: line,
                },
                success: function (response) {
                  const sum = response.sum;
                  const avg = response.avg;

                  sumValues[index] = sum;
                  avgValues[index] = avg;
                  completedRequests++;

                  if (completedRequests === totalRequests) {
                    renderDataTable(timesheet, sumValues, avgValues, formattedDate);
                    calculateAndAlertRatio(sumValues, avgValues);
                  }
                },
                error: function (error) {
                  console.error('Error fetching data:', error);
                  completedRequests++;

                  if (completedRequests === totalRequests) {
                    renderDataTable(timesheet, sumValues, avgValues, formattedDate);
                    calculateAndAlertRatio(sumValues, avgValues);
                  }
                },
              });
            });

            if (totalRequests === 0) {
              renderDataTable(timesheet, sumValues, avgValues, formattedDate);
              calculateAndAlertRatio(sumValues, avgValues);
            }
          }

          sendThirdRequest(timestamp1, timestamp2);
        } else {
          alert('Please provide valid from and to dates.');
        }
        setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };

  function renderDataTable(timesheet, sumValues, avgValues, formattedDate) {
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
      dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
      buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID PPP REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
      data: timesheet,
      columns: [
        { data: 'item_description' },
        {
          data: null,
          render: function (data, type, row, meta) {
            const rowIndex = meta.row;
            const sum = sumValues[rowIndex];
            const style = 'color: green;';
            return `<span style="${style}"><b>${sum !== null ? sum : 0}</b></span>`;
          },
        },
        {
          data: null,
          render: function (data, type, row, meta) {
            const rowIndex = meta.row;
            const avg = avgValues[rowIndex];
            return avg !== null ? avg : 0;
          },
        },
        {
          data: null,
          render: function (data, type, row, meta) {
            const rowIndex = meta.row;
            const sum = sumValues[rowIndex];
            const avg = avgValues[rowIndex];
            const result = sum / avg;
            return result !== null ? result.toFixed(2) : '0';
          },
        },
        { data: 'line' },
        { data: 'shift' },
        { data: 'site' },
        { data: 'date_time' },
      ],
    });
  }

  function calculateAndAlertRatio(sumValues, avgValues) {
    let totalSum = 0;
    let totalAvg = 0;

    sumValues.forEach((sum) => {
      if (sum !== null) {
        totalSum += sum;
      }
    });

    avgValues.forEach((avg) => {
      if (avg !== null) {
        totalAvg += avg;
      }
    });

    if (totalAvg !== 0) {
      const ratio = totalSum / totalAvg;
      setTotalSum(totalSum);
      setTotalAvg(totalAvg);
      setRatio(ratio);
    }
  }

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
               <CardTitle tag="h5"> PPP REPORT
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
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
                        <div className="col-sm-3">
                          <span className="textgreen">Site</span>
                        <select
                          id="site"
                          className="form-control"
                          name="site"
                          value={formData.site} onChange={handleInputChange}>
                          <option value="">Select</option>
                         
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
                      {fromdate1 && todate1 ? (
                        <>
                          <h6 className="header-filter">
                            <span className="textred">[{fromdate1}] - [{todate1}]</span><span className="textgreen"> [{sshift}]</span><span class="textblue">
                                      [{ssite}]
                                    </span>
                            
                          </h6>
                        </>
                      ) : (
                        <span className="textred">{currentDate}</span>
                      )}
                    </div>

                      <div className="table-responsive">
                         <table id="example" className="display">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Fg Output</th>
                              <th>No Of Worker</th>
                              <th>PPP</th>
                              <th>Line</th>
                              <th>Shift</th>
                              <th>Site</th>
                              <th>Date</th>
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

export default PPPReport;
