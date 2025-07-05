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

function FGOutputReport() {
  
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
 const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
const [shiftOptions, setShiftOptions] = useState([]);
const [siteFromResponse, setSiteFromResponse] = useState([]);
const [dayFromResponse, setDayFromResponse] = useState([]);
const [sectionFromResponse, setSectionFromResponse] = useState('');
const [itemDescription, setItemDescription] = useState('');
const [line, setLine] = useState('');

 const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
  

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
    fromdate: '',
    todate: '',
    shift: '',
    product_id: '',
    product_name: '',
    site:'',
   // section_id: '',
   // section_name: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'product_id') {
      const selectedProduct = productOptions.find(product => String(product.id) === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: value,
        product_name: productName,
      }));
    }else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
 

  const handleSubmit = (event) => {
     setLoading(true);
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

     

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: `${config.apiUrl}/getfgoutputreport`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, shift, site, fdate, tdate } = response;

       

      // Set the site value to state
      setSiteFromResponse(site);
      setDayFromResponse(shift);

       setFDate(fdate);
      setTDate(tdate);

        // Update the component state with the timesheet data
        setData(timesheet);
        //alert(JSON.stringify(timesheet));


         // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
       // initializeTable(response.timesheet);
         setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };

// Assuming workerCount is an array of values related to each row in the DataTable
const workerCount = [/* ... */];
  const initializeTable = (timesheet, formattedDate) => {
    // Destroy the existing DataTable instance (if it exists)
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Initialize the DataTable with the updated data
    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
       dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
      buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID FGOUTPUT REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
      data: timesheet, // Update the data option here
      columns: [
       
       
        {
        // Add the first column for row numbers
        data: null,
        render: function (data, type, row, meta) {
          // 'meta.row' contains the index of the row
          return meta.row + 1;
        },
      },
        { data: 'item_description', },
        { data: 'line', },
        { data: 'shift', },
        { data: 'tar' },
        {
          data: 'workerCount',
         
        },
        {
          data: 'workerCount',
          render: function (data, type, row, meta) {
            const tarValue = row.tar; // Assuming 'tar' is a property of the row data

            // Check if 'workerCount' is not zero to avoid division by zero
            const result = data !== 0 ? (tarValue / data).toFixed(2) : '0';

            return result;
          },
        },
        { data: 'site', },
        { data: 'date_time', },
      
        
      ],
      columnDefs: [


        {
        //  targets: [4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15], // Column indices for Hour 1 to Hour 12
          render: function (data, type, row) {
            if (type === 'display') {
              // Format the hour value to display decimal numbers
              const formattedHour = data.toFixed(4);
              return formattedHour;
            }
            return data;
          },
        },
      ],
    });
  };




  useEffect(() => {
  setLoading(true)
    document.title = 'FGOUTPUT REPORT';
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

      $.ajax({
       url: `${config.apiUrl}/get_fgoutput_default`,
        method: "GET",
        headers: customHeaders,
        data: [],
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response;
          const { date } = response;
          // Update the component state with the timesheet data
          setData(timesheet);
          setCurrentDate(date);
          // Format the date as "DD-MM-YYYY"
          const formattedDate = date;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
            setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    }



    const fetchProductOptions = () => {
      $.ajax({
         url: `${config.apiUrl}/getProductOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setProductOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchProductOptions();

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

 

  const calculateSummary = () => {
    // Calculate total target and total completed
    let totalFg = 0;
    data.forEach((row) => {
      totalFg += row.tar;
    });
   // totalFg = totalFg.toFixed(2);
    return { totalFg };
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
               <CardTitle tag="h5"> FG OUTPUT
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
                        <form onSubmit={handleSubmit} method='POST'>
                          <div className="row space">
                            <div className="col-sm-3">
                              <span className="textgreen"> Date</span>
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
                                <option value="">Select</option>
                               
                                <option value="ota">ota</option>
                                <option value="ikeja">ikeja</option>
                                 
                              </select>

                            </div>
                            
                            <div className="col-sm-1">
                              <button
                                type="submit"
                                className="btn btn-success btn-md"
                              >
                                View
                              </button>
                            </div>
                          </div>
                         
                        </form>


          

                        <div>
                          {fdate && tdate ? (
                            <>
                              <h6 className="header-filter">
                                <span className="textred">[{fdate}] - [{tdate}]</span><span className="textgreen"> [{dayFromResponse}]</span><span className="textblue"> [{siteFromResponse}]</span>
                                
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

                                <th>#</th>
                                <th>Product Name</th>
                                <th>Line</th>
                                <th>Shift</th>
                                <th>FG</th>
                                <th>Count Of<br/> Workers</th>
                                <th>PPP</th>
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

export default FGOutputReport;
