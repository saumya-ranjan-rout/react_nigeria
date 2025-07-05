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

 function ProductionBreakdown() {
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [itemCategories, setItemCategories] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
   const today = new Date(); // Get the current date
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  // Add one day to oneMonthAgo
oneMonthAgo.setDate(oneMonthAgo.getDate() + 1);

const [startDate, setStartDate] = useState(oneMonthAgo);
    const [endDate, setEndDate] = useState(today);
    const [productOptions, setProductOptions] = useState([]);
    const [machineOptions, setMachineOptions] = useState([]);

    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [totalComplete, setTotalComplete] = useState(0);
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');
    const [items, setItems] = useState([]);
    const [todate, setToDate] = useState([]);
    const [wh, setWh] = useState([]);
    const [dw, setDw] = useState([]);
    const [zone, setZone] = useState([]);
    const [machine, setMachine] = useState([]);
    const [shift, setShift] = useState([]);

    

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
       zone: '',
       shift: '',
       machine1: '',
      

     
    });

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      if (name === 'fromdate') {
      setStartDate(new Date(value));
    } else if (name === 'todate') {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
    
    // Define an array to store the 'tw' values
          let twValues = []; 
           let tfgValues = []; 


   const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/getsearchproductionbreakdown`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

         // Access the timesheet results from the response object
        // Assuming that the response is an object with properties items, tdate, and wh
            const { items } = response;
            
            // Update the state with the received data
            setItems(items);
             // Assuming response is an array
 if (Array.isArray(response.items) && response.items.length > 0) {
    const firstItem = response.items[0]; // Access the first element of the 'items' array
    const { fromdate, todate, zone, machine, shift } = firstItem; // Destructure the properties

    // Update the state with the received data
    setItems(response.items);
    setFDate(fromdate);
    setTDate(todate);
    setZone(zone);
    setMachine(machine);
    setShift(shift);

    // Alert the values
    /*alert('FDate: ' + fromdate);
    alert('TDate: ' + todate);
    alert('Zone: ' + zone);
    alert('Machine: ' + machine);
    alert('Shift: ' + shift);
*/
    // ... (rest of your code)
  } else {
    console.error('Empty or invalid response items array');
  }
      
        
        // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

           // Initialize the DataTable with the updated data
              tableRef.current = $('#example').DataTable({
                dom: 'Bfrtip',
                dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
                buttons: ['copy', 'csv'],
                data: items, // Use data from data.zone here
                      columns: [

                           
                             {
                                targets: 0, // The index of the column you want to configure (0-based index)
                                data: 'item', // Specify the data source for this column
                               
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  const id = data;
                                  let name = ''; // Initialize with an empty string

                                  // Perform an AJAX request to fetch the item description
                                  $.ajax({
                                     url: `${config.apiUrl}/get-item-description`, // Replace with your API endpoint
                                    method: 'GET',
                                    headers: customHeaders,
                                    data: {
                                      id: id,
                                      item: data, // Pass the 'item' value as a parameter to the URL
                                    },
                                    async: false, // Ensure synchronous execution for this example (not recommended in production)
                                    success: function (response) {
                                      // Assuming your API returns the item description in the response
                                      name = response.item_description;
                                    },
                                    error: function (xhr, status, error) {
                                      console.error('Error fetching item description:', error);
                                    },
                                  });

                                  // Return the item description to be displayed in the table cell
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + name + '</td>';

                                },
                              },
                              {data: 'zone'},
                              {data: 'machine'},
                              {data: 'shift'},

                             {
                                data: 'wh', // This column contains the 'wh' value
                                title: 'FG OUTPUT',
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  // Create a button element with an event handler to trigger the AJAX request
                                  const whValue = data; // Get the 'wh' value from the column data
                                  const itemValue = row.item; // Get the 'item' value from the row data
                                  let tfg = ''; // Initialize with an empty string
                                
                                    $.ajax({
                                       url: `${config.apiUrl}/get-fg-output`,
                                      method: 'GET',
                                      headers: customHeaders,
                                     data: {
                                        id: itemValue, // Send 'item' as 'id'
                                        wh: whValue, // Send 'wh' as 'wh'
                                      },
                                        async: false, // Ensure synchronous execution for this example (not recommended in production)
                                        success: function (response) {
                                          // Assuming your API returns the item description in the response
                                          tfg = response.fg_output;
                                        },
                                        error: function (xhr, status, error) {
                                          console.error('Error fetching item description:', error);
                                        },
                                      });

                                    // Store 'tw' value in the array
                                    tfgValues[rowIndex] = tfg;
                                 

                                  // Create a button that triggers the AJAX request when clicked
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + tfg + '</td>';
                                },
                              },
                              {
                                data: 'wh', // This column contains the 'wh' value
                                title: 'Direct Worker',
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  // Create a button element with an event handler to trigger the AJAX request
                                  const whValue = data; // Get the 'wh' value from the column data
                                  const itemValue = row.item;
                                  const zoneValue = row.zone;
                                   const machineValue = row.machine;
                                    const shiftValue = row.shift;
                                     const dateValue = row.date;
                                     

                                  let tw = ''; // Initialize with an empty string
                                
                                    $.ajax({
                                       url: `${config.apiUrl}/get-direct-worker`,
                                      method: 'GET',
                                      headers: customHeaders,
                                     data: {
                                        id: itemValue,    // Send 'item' as 'id'
                                        wh: whValue,      // Send 'wh' as 'wh'
                                        zone: zoneValue,  // Send 'zone' as 'zone'
                                        machine: machineValue,  // Send 'machine' as 'machine'
                                        shift: shiftValue,      // Send 'shift' as 'shift'
                                        date: dateValue,        // Send 'date' as 'date'
                                      },
                                        async: false, // Ensure synchronous execution for this example (not recommended in production)
                                        success: function (response) {
                                          // Assuming your API returns the item description in the response
                                          tw = response.fg_output;
                                        },
                                        error: function (xhr, status, error) {
                                          console.error('Error fetching item description:', error);
                                        },
                                      });

                                     // Store 'tw' value in the array
                                    twValues[rowIndex] = tw;
                                 

                                  // Create a button that triggers the AJAX request when clicked
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + tw + '</td>';
                                },
                              },
                             {
                              data: null, // Use null to indicate that this column doesn't have a direct data source
                              title: 'PPP', // Replace with your desired title for the third column
                              render: function (data, type, row, meta) {
                                const rowIndex = meta.row; // Get the index of the current row

                                // Access the 'tw' value from the 'twValues' array using the row index
                                const twValue = twValues[rowIndex];
                                const tfgValue = tfgValues[rowIndex];

                               let pw = 0; // Initialize pw with 0
                                    
                                    if (tfgValue !== 0) {
                                      pw = (tfgValue / twValue);
                                    }

                                    // Return the formatted pw to be displayed in the table cell
                                    return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + pw.toFixed(2) + '</td>';
                              },
                            },
                              
                                { data: 'date', title: 'Date' },
                            
                          
                         
                          
                          
                      ],
                      
              });
          },
          error: function (xhr, status, error) {
            console.error('Error:', error);
          },
        });
  };




      useEffect(() => {

         document.title = 'Production Breakdown';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {


   $.ajax({
         url: `${config.apiUrl}/getdefaultproductionbreakdown`,
        method: 'GET',
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
       success: function (response) {
    

         // Access the timesheet results from the response object
        // Assuming that the response is an object with properties items, tdate, and wh
            const { items } = response;
            
            // Update the state with the received data
            setItems(items);
             // Assuming response is an array
 if (Array.isArray(response.items) && response.items.length > 0) {
    const firstItem = response.items[0]; // Access the first element of the 'items' array
    const { fromdate, todate, zone, machine, shift } = firstItem; // Destructure the properties

    // Update the state with the received data
    setItems(response.items);
    setFDate(fromdate);
    setTDate(todate);
    setZone(zone);
    setMachine(machine);
    setShift(shift);

   
    // ... (rest of your code)
  } else {
    console.error('Empty or invalid response items array');
  }

        
        
        // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

           // Initialize the DataTable with the updated data
              tableRef.current = $('#example').DataTable({
                dom: 'Bfrtip',
                dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
                buttons: ['copy', 'csv'],
                data: items, // Use data from data.zone here
                      columns: [
                            {
                                targets: 0, // The index of the column you want to configure (0-based index)
                                data: 'item', // Specify the data source for this column
                               
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  const id = data;
                                  let name = ''; // Initialize with an empty string

                                  // Perform an AJAX request to fetch the item description
                                  $.ajax({
                                     url: `${config.apiUrl}/get-item-description`, // Replace with your API endpoint
                                    method: 'GET',
                                    headers: customHeaders,
                                    data: {
                                      id: id,
                                      item: data, // Pass the 'item' value as a parameter to the URL
                                    },
                                    async: false, // Ensure synchronous execution for this example (not recommended in production)
                                    success: function (response) {
                                      // Assuming your API returns the item description in the response
                                      name = response.item_description;
                                    },
                                    error: function (xhr, status, error) {
                                      console.error('Error fetching item description:', error);
                                    },
                                  });

                                  // Return the item description to be displayed in the table cell
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + name + '</td>';

                                },
                              },
                             {data: 'zone'},
                             {data: 'machine'},
                             {data: 'shift'},
                             {
                                data: 'wh', // This column contains the 'wh' value
                                title: 'FG OUTPUT',
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  // Create a button element with an event handler to trigger the AJAX request
                                  const whValue = data; // Get the 'wh' value from the column data
                                  const itemValue = row.item; // Get the 'item' value from the row data
                                  let tfg = ''; // Initialize with an empty string
                                
                                    $.ajax({
                                     url: `${config.apiUrl}/get-fg-output`,
                                      method: 'GET',
                                      headers: customHeaders,
                                     data: {
                                        id: itemValue, // Send 'item' as 'id'
                                        wh: whValue, // Send 'wh' as 'wh'
                                      },
                                        async: false, // Ensure synchronous execution for this example (not recommended in production)
                                        success: function (response) {
                                          // Assuming your API returns the item description in the response
                                          tfg = response.fg_output;
                                        },
                                        error: function (xhr, status, error) {
                                          console.error('Error fetching item description:', error);
                                        },
                                      });

                                    // Store 'tw' value in the array
                                    tfgValues[rowIndex] = tfg;
                                 

                                  // Create a button that triggers the AJAX request when clicked
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + tfg + '</td>';
                                },
                              },
                              {
                                data: 'wh', // This column contains the 'wh' value
                                title: 'Direct Worker',
                                 render: function (data, type, row, meta) {
                                  const rowIndex = meta.row; // Get the index of the current row
                                  // Create a button element with an event handler to trigger the AJAX request
                                  const whValue = data; // Get the 'wh' value from the column data
                                  const itemValue = row.item;
                                  const zoneValue = row.zone;
                                   const machineValue = row.machine;
                                    const shiftValue = row.shift;
                                     const dateValue = row.date;
                                     

                                  let tw = ''; // Initialize with an empty string
                                
                                    $.ajax({
                                      url: `${config.apiUrl}/get-direct-worker`,
                                      method: 'GET',
                                      headers: customHeaders,
                                     data: {
                                        id: itemValue,    // Send 'item' as 'id'
                                        wh: whValue,      // Send 'wh' as 'wh'
                                        zone: zoneValue,  // Send 'zone' as 'zone'
                                        machine: machineValue,  // Send 'machine' as 'machine'
                                        shift: shiftValue,      // Send 'shift' as 'shift'
                                        date: dateValue,        // Send 'date' as 'date'
                                      },
                                        async: false, // Ensure synchronous execution for this example (not recommended in production)
                                        success: function (response) {
                                          // Assuming your API returns the item description in the response
                                          tw = response.fg_output;
                                        },
                                        error: function (xhr, status, error) {
                                          console.error('Error fetching item description:', error);
                                        },
                                      });

                                     // Store 'tw' value in the array
                                    twValues[rowIndex] = tw;
                                 

                                  // Create a button that triggers the AJAX request when clicked
                                 return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + tw + '</td>';
                                },
                              },
                             {
                              data: null, // Use null to indicate that this column doesn't have a direct data source
                              title: 'PPP', // Replace with your desired title for the third column
                              render: function (data, type, row, meta) {
                                const rowIndex = meta.row; // Get the index of the current row

                                // Access the 'tw' value from the 'twValues' array using the row index
                                const twValue = twValues[rowIndex];
                                const tfgValue = tfgValues[rowIndex];

                               let pw = 0; // Initialize pw with 0
                                    
                                    if (tfgValue !== 0) {
                                      pw = (tfgValue / twValue);
                                    }

                                    // Return the formatted pw to be displayed in the table cell
                                    return '<td style="font-weight: bold; color: red; border-right: 1px solid #2e6398; font-size: 10px;">' + pw.toFixed(2) + '</td>';
                              },
                            },
                              
                                { data: 'date', title: 'Date' },
                          
                         
                          
                          
                      ],
                      
              });
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

      
    }, []);

    const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

      // Clear the session
      sessionStorage.removeItem('isLoggedIn');

      // Redirect to the login page
      navigate('/login');
    };

    


  const handleMachineChange = (e) => {
    const selectedZone = e.target.value;

    // Make a GET request to your API endpoint
    $.ajax({
     url: `${config.apiUrl}/getMachineOptions/${selectedZone}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
         //alert(JSON.stringify(response)); // Display the response data in an alert
        setMachineOptions(response);  // Update machineOptions state with the response
      },
      error: function (xhr, status, error) {
        console.error('Error fetching machine options:', error);
      },
    });
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
               <CardTitle tag="h5"> Production Breakdown
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
              
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-2">
                    <span className="textgreen">Start Date</span>
                  <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      onChange={date => setStartDate(date)}
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
                      onChange={date => setEndDate(date)}
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
                          <option key={shiftOption.id} value={shiftOption.nhrs}>
                            {shiftOption.name}
                          </option>
                        ))}
                      </select>
                    </div>

                     <div className="col-sm-2">
                      <span className="textgreen">Zone</span>
                      <select
                              className="form-control"
                              name="zone"
                              value={formData.zone}
                              onChange={(e) => {
                        handleInputChange(e);
                        handleMachineChange(e);
                      }}
                            >
                              <option value=""disable>Select ZONE</option>
                                 <option value="ZONE1">ZONE1</option>
                                 <option value="ZONE2">ZONE2</option>
                                 <option value="ZONE3">ZONE3</option>
                                 <option value="ZONE4">ZONE4</option>
                                 <option value="ZONE5">ZONE5</option>
                                 <option value="ZONE6">ZONE6</option>
                                 <option value="ZONE7">ZONE7</option>
                                 <option value="ZONE8">ZONE8</option>
                                 <option value="ZONE9">ZONE9</option>
                                 <option value="ZONE10">ZONE10</option>
                                 
                                  <option value="ZONE11">ZONE11</option>
                                 <option value="ZONE12">ZONE12</option>
                                 <option value="ZONE13">ZONE13</option>
                                 <option value="ZONE14">ZONE14</option>
                                 <option value="ZONE15">ZONE15</option>
                                 <option value="ZONE16">ZONE16</option>
                                 <option value="ZONE17">ZONE17</option>
                                 <option value="ZONE18">ZONE18</option>
                                 <option value="ZONE19">ZONE19</option>
                                 <option value="ZONE20">ZONE20</option>
                          </select>
                    </div>

                <div className="col-sm-2">
                <span className="textgreen">Choose Machine</span>
                <select
                  className="form-control"
                  name="machine1"
                  value={formData.machine1}
                  onChange={handleInputChange}
                >
                  <option value="">Select Machine</option>
                 
                   {machineOptions.map((machineOption) => (
                                    <option key={machineOption.machine} value={machineOption.machine}>
                                      {machineOption.machine}
                                    </option>
                                  ))}
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

              
              {/* Display Input Field Values */}
              <div align="center">
              <h6 className="header-title">
              From <span className="textred">
      {fdate} </span> To <span className="textred">{tdate}</span>
   
             
              <br></br>
              
              SHIFT: <span className="textgreen">
      {shift} </span> ZONE: <span className="textblue">{zone}</span> MACHINE: <span className="textblue">{machine}</span>
   
              </h6>
              </div>
                
             
              <div className="table-responsive">
             

                  <table id="example" className="display">
                  <thead>
                    <tr>
                      <th>ITEM NAME</th>
                      <th>Zone</th>
                      <th>Machine</th>
                      <th>Shift</th>
                      <th>FG Output</th>
                      <th>Direct Worker</th>
                      <th>PPP</th>
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
    
  );
}

  export default ProductionBreakdown;
