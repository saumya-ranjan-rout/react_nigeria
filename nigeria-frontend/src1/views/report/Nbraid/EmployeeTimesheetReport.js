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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../config';

function EmployeeTimesheetReport() {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
  const [selectedSections, setSelectedSections] = useState([]);
  const animatedComponents = makeAnimated();
  const [loading, setLoading] = useState(false);

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
    // alert(token);

  const [formData, setFormData] = useState({
    fromdate: '',
    todate: '',
    shift: '',
    product_id: '',
    product_name: '',
    line_no:'',
    section_id: '',
    section: '',
    site: '',
  });

   const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
const [sectionFromResponse, setSectionFromResponse] = useState('');
const [itemDescription, setItemDescription] = useState('');
const [line, setLine] = useState('');


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'section_id') {
      //console.log("section_id" + value);
      //console.log(sectionOptions);
      const selectedSection = sectionOptions.find(section => String(section.id) === value);
      const sectionName = selectedSection ? selectedSection.section_name : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        section_id: value,
        section_name: sectionName,
      }));
    }
    else if (name === 'product_id') {
      const selectedProduct = productOptions.find(product => String(product.id) === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: value,
        product_name: productName,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  const formatSelectedSections = () => {
    if (selectedSections.length > 0) {
      const sectionNames = selectedSections.map((option) => option.label);
      return sectionNames.join(', ');
    }
    return '';
  };

  

const handleSubmit = (event) => {
  setLoading(true);
  event.preventDefault();

  // You can adjust the condition based on your requirements
  // In this example, the condition is removed
  const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

  // Convert selectedSections (array of objects) to an array of section IDs (strings)
  const sectionIds = selectedSections.map((option) => option.value);

  // Add the section_ids array to the updatedFormData
  updatedFormData.section_ids = sectionIds;

  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
     url: `${config.apiUrl}/getempreportData`,
    method: "POST",
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Access the timesheet results from the response object
      const { timesheet, fdate, tdate, product, line, section} = response;

      
      // Update the component state with the timesheet data and other values
      setData(timesheet);
      setFDate(fdate);
      setTDate(tdate);

       // Format the date as "DD-MM-YYYY"
          const formattedDate = `${fdate} to ${tdate}`;

          // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet, formattedDate);
      //initializeTable(response.timesheet);

     
        setItemDescription(product);
        setSectionFromResponse(section);
        setLine(line);
      setLoading(false);
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
};

useEffect(() => {
setLoading(true);
    document.title = 'Employee Timesheet Report';
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
        buttons: ['copy', 'csv'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });


      $.ajax({
       url: `${config.apiUrl}/gettodayempreportData`,
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
          setLoading(false);
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    }


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

    // Fetch section options from API
    const fetchSectionOptions = () => {
      $.ajax({
         url: `${config.apiUrl}/getSectionOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSectionOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchSectionOptions();

    const fetchProductOptions = () => {
      $.ajax({
         url: `${config.apiUrl}/getProductOptionsnbraidotalist`,
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


    const fetchLineOptions = () => {
    $.ajax({
      url: `${config.apiUrl}/getindividualLineOptionss`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setLineOptions(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching Line options:', error);
      },
    });
  };

  fetchLineOptions();



  }, []);

 const initializeTable = (timesheet, formattedDate) => {

    //const currentDate = new Date().toISOString().slice(0, 10);
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
        filename: `NON-BRAID EMPLOYEETIMESHEET REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
      data: timesheet, // Update the data option here
      columns: [
       {
                            data: null,
                            render: function (data, type, row) {
                              const workerDetails =
                                data.worker +
                                '[' +
                                data.entry_id +
                               ']';

                             
                              return workerDetails;
                            }
              },

      
        { 
  data: 'regg',
  render: function (data, type, row) {
    return data ? data.split(' ')[0] : ''; // Use a default value if 'regg' is falsy
  }
},
       
                {
            data: null,
            render: function (data, type, row) {
              // Assuming 'date_time' and 'regg' are in 'dd-mm-yyyy' format
              const date1Parts = row.date_time.split('-');
              const date2Parts = (row.regg || '').split('-');
              // Create Date objects by reversing the order of parts
              const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
              const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
              // Calculate the time difference in milliseconds
              const timeDiff = Math.abs(date2 - date1);
              // Convert milliseconds to days
              const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
              return daysDiff;
            }
          },
       
        
        
        
      
        { data: 'item_description', },
       
        { data: 'line', },
        { data: 'section_name' },
        { data: 'shift' },
        { data: 'HOUR1' },
        { data: 'HOUR2' },
        { data: 'HOUR3' },
        { data: 'HOUR4' },
        { data: 'HOUR5' },
        { data: 'HOUR6' },
        { data: 'HOUR7' },
        { data: 'HOUR8' },
        { data: 'HOUR9' },
        { data: 'HOUR10' },
        { data: 'HOUR11' },
       
        { data: 'target' },
        {
          data: null,
          render: function (data, type, row) {
            if (type === 'display') {
              // Calculate the total sum of hours for the current row
              const totalSum =
                row.HOUR1 +
                row.HOUR2 +
                row.HOUR3 +
                row.HOUR4 +
                row.HOUR5 +
                row.HOUR6 +
                row.HOUR7 +
                row.HOUR8 +
                row.HOUR9 +
                row.HOUR10 +
                row.HOUR11 ;
               

              // Return the total sum for display
              return totalSum;
            }
            return data;
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            if (type === 'display') {
              // Calculate the total sum of hours for the current row
              const totalSum =
                row.HOUR1 +
                row.HOUR2 +
                row.HOUR3 +
                row.HOUR4 +
                row.HOUR5 +
                row.HOUR6 +
                row.HOUR7 +
                row.HOUR8 +
                row.HOUR9 +
                row.HOUR10 +
                row.HOUR11 ;
               

              // Calculate the efficiency
              const efficiency = (totalSum / row.target) * 100;
              const formattedEfficiency = efficiency.toFixed(2);

              // Return the formatted efficiency percentage for display
              return formattedEfficiency + '%';
            }
            return data;
          },
        },
        //{ data: 'remark' },
       { data: 'site' },
       {
        data: 'date_time',
       
      },
       
       // { data: 'site' },
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
               <CardTitle tag="h5"> Reports Employee Timesheet
                <hr></hr>
                
               </CardTitle>
               </CardHeader>
                <CardBody>
         
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
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

                <div className="col-sm-4">
                                    <span className="textgreen">Product Name </span>
                                    <Select
                                      options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
                                      value={formData.product_id ? { value: formData.product_id, label: formData.item_description } : null}
                                      //value={productOptions.find(option => option.id === formData.product_name)} // Adjust this line
                                      onChange={(selectedOption) => {
                                        setFormData({ ...formData, product_id: selectedOption.value, item_description: selectedOption.label });
                                        
                                      }}
                                      isSearchable
                                      placeholder="Select Product Name"
                                    />
                                  </div>


              </div>
              <div className="row space space2x">
               
                <div className="col-sm-3">
                                      <span className="textgreen">Line </span>
                                      <Select
                                        options={lineOptions.map(option => ({ value: option.id, label: option.line_name }))}
                                         value={formData.line_no ? { value: formData.line_no, label: formData.line_name } : null}
                                       
                                        onChange={(selectedOption) => {
                                        
                                        setFormData({ ...formData, line_no: selectedOption.value, line_name: selectedOption.label });
                                      }}
                                        isSearchable
                                        placeholder="Select Line No"
                                        
                                      />
                </div>
                <div className="col-sm-3">
                                  <span className="textgreen">Section  </span>
                                  <Select
                                  options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                                 value={formData.section ? { value: formData.section, label: formData.section_name } : null}
                                  onChange={(selectedOption) => {
                                    
                                    setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
                                  }}
                                  isSearchable
                                  placeholder="Select Section"
                                />
                 </div>

                <div className="col-sm-2">
                  <span className="textgreen">Site</span>
                      <select
                        id="site"
                        className="form-control"
                        name="site"
                        value={formData.site} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="all">All</option>
                        <option value="ota">ota</option>
                        <option value="ikeja">ikeja</option>
                         <option value="both">both</option>
                      </select>


                </div>
                <div className="col-sm-2">
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
                    <span className="textred">[{fdate}] - [{tdate}]</span><span className="textgreen"> [{itemDescription}-{line}-{sectionFromResponse}]</span>
                    
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
                    <th>Emp Name/Emp Id</th>
                   
                    <th>Date Of Joining</th>
                    <th>Total No of Days</th>
                    <th>Product Name</th>
                  <th>Line</th> 
                    <th>Section</th>
                    <th>Shift</th>
                    <th>HR 1</th>
                    <th>HR 2</th>
                    <th>HR 3</th>
                    <th>HR 4</th>
                    <th>HR 5</th>
                    <th>HR 6</th>
                    <th>HR 7</th>
                    <th>HR 8</th>
                    <th>HR 9</th>
                    <th>HR 10</th>
                    <th>HR 11</th>
                    <th>Target</th>
                    <th>Total Complete</th>
                    <th>Efficiency</th>
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

export default EmployeeTimesheetReport;
