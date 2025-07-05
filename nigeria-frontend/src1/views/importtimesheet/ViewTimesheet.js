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
import config from '../../config';


function ViewTimesheet() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
 const [itemCategories, setItemCategories] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const today = new Date();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [productOptions, setProductOptions] = useState([]);
    const [lineOptions, setLineOptions] = useState([]);
    const [data, setData] = useState([]);
    const [totalComplete, setTotalComplete] = useState(0);
    const [responseDate, setResponseDate] = useState('');
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');
 const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

  const [formData, setFormData] = useState({
       fromdate: '',
       todate: '',
       
       product_name: '',
       line_no: '',
       section: '',
       shift: '',

     
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

// Define the handleHourChange function
  const handleHourChange = (rowId, hourColumn, newValue) => {
    // Assuming "data" is a state variable representing the timesheet data
    const updatedData = data.map((row) =>
      row.id === rowId ? { ...row, [hourColumn]: newValue } : row
    );

    // Update the state with the modified data
    setData(updatedData);

    // Prepare the payload to be sent to the server
    const payload = {
      rowId: rowId,
      hourColumn: hourColumn,
      newValue: newValue,
    };

    // Send the updated data to the server using AJAX
    $.ajax({
      url: `${config.apiUrl}/updateHourValue`, // Replace with the appropriate API endpoint
      method: 'POST', // Assuming you want to use the POST method to update the data on the server
      headers: customHeaders,
      data: JSON.stringify(payload),
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Handle the success response if needed
      },
      error: function (error) {
        // Handle the error if needed
      },
    });
  };
    
  
useEffect(() => {

      document.title = 'View Timesheet';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {

      $.ajax({
       url: `${config.apiUrl}/viewtimesheet`,
      method: 'GET',
      headers: customHeaders,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setResponseDate(timesheet.length > 0 ? timesheet[0].date_time : ''); // Set the date_time value from the response



            // Destroy the existing DataTable instance (if it exists)
              if ($.fn.DataTable.isDataTable('#example')) {
                $('#example').DataTable().destroy();
              }
                  // Initialize the DataTable with the updated data
              tableRef.current = $('#example').DataTable({
                dom: 'Bfrtip',
                dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
                buttons: ['copy', 'csv'],
                data: response.timesheet, // Update the data option here
                      columns: [
                         
                        {
                            data: null,
                            render: function (data, type, row) {
                              const workerDetails =
                                data.worker +
                                ' <b>' +
                                data.entry_id +
                                '</b>';
                              
                              return workerDetails;
                            }
                        },
                       {
                            data: 'HOUR1',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR2',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR3',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR4',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR5',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR6',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR7',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR8',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR9',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR10',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        {
                            data: 'HOUR11',
                            render: function (data, type, row) {
                              // Check if the rendering type is 'display' to avoid rendering input fields in other types
                              if (type === 'display') {
                                // Format the data as needed (e.g., rounding to 0 decimal places)
                                const formattedValue = Number(data).toFixed(0);
                                return formattedValue;
                              }

                              // Return the original data for other types (e.g., 'filter', 'sort', etc.)
                              return data;
                            }
                        },
                        
                          {
                            data: null,
                            render: function (data, type, row) {
                              if (type === 'display') {
                                // Calculate the total sum of hours for the current row
                                const totalSum = data.value_sum;
                                 

                                // Check if the total sum matches the target
                                if (totalSum == data.target) {
                                 
                                   return '<span class="bgsuccess">' + totalSum + '</span> <br><span class="bgsuccess">target completed</span>';
                                } else if (totalSum <= data.target) {
                                   return '<span class="bgdanger">' + totalSum + '</span> <br><span class="bgdanger">target pending</span>';
                                } else {
                                   return '<span class="bgwarning">' + totalSum + '</span> <br><span class="bgwarning">target exceed</span>';
                                }

                                // Return the calculated value with appropriate HTML formatting
                               // return '<span class="' + color + '">' + value + '</span>';
                              }

                              return data;
                            }
                          },

                          { 

                            data: null,
                                      render: function(data, type, row) {
                                          return '<span class="bgsuccess ">' + data.target+'</span>';
                                      }

                           },
                            {
                              data: null,
                              render: function (data, type, row) {
                                if (type === 'display') {
                                  // Calculate the total sum of hours for the current row
                                  const totalSum = data.value_sum;

                                  // Calculate the efficiency
                                  const efficiency = (totalSum / row.target) * 100;
                                  const formattedEfficiency = efficiency.toFixed(2);

                                  // Return the formatted efficiency percentage for display
                                  return formattedEfficiency + '%';
                                }
                                return data;
                              },
                            },
                           {

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.item_description+'</b>';
                                    }

                            },
                            {

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.line+'</b>';
                                    }

                            },
                              { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.section_name+'</b>';
                                    }


                               },
                            { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.shift+'</b>';
                                    }


                               },
                           
                            { 

                                data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.site+'</b>';
                                    }


                               },
                             
                              {

                              data: null,
                                    render: function(data, type, row) {
                                        return ' <b>' + data.date_time+'</b>';
                                    }

                            },

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

      // Fetch line options from API
      const fetchLineOptions = () => {

      $.ajax({
        url: `${config.apiUrl}/getindividualLineOptionss`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setLineOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching line options:', error);
        },
      });
      };

      fetchLineOptions();

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


    const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' });
    const parts = date.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const newcurrentDate1 = `${day}-${month}-${year}`;
    //alert(newcurrentDate1);   
    }, []);



    const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

      // Clear the session
      sessionStorage.removeItem('isLoggedIn');

      // Redirect to the login page
      navigate('/login');
    };

    
  const handleProductChange = (e) => {
      const selectedProduct = e.target.value;

      // Fetch line options based on the selected product
      $.ajax({
         url: `${config.apiUrl}/getLineOptions/${selectedProduct}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setLineOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching line options:', error);
        },
      });
    };

    const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
       fetch(`${config.apiUrl}/workerdelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Item deleted:', data);
          // Refresh the list of items
          //fetchData();
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };
    
    

  return (
    <>
      <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
               
              </CardHeader>
              <CardBody>
               View
                <hr></hr>
              

                
               
                 <Table responsive id="example">
                    <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>HR1</th>
                      <th>HR2</th>
                      <th>HR3</th>
                      <th>HR4</th>
                      <th>HR5</th>
                      <th>HR6</th>
                      <th>HR7</th>
                      <th>HR8</th>
                      <th>HR9</th>
                      <th>HR10</th>
                      <th>HR11</th>
                      <th>Achievement</th>
                      <th>Target</th>
                      <th>Efficiency</th>
                      <th>Product</th>
                      <th>Line</th>
                      <th>Section</th>
                      <th>Shift</th>
                      <th>Site</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                    <tfoot className="text-primary">
                     
                    <tr>
                      <th>Name</th>
                      <th>HR1</th>
                      <th>HR2</th>
                      <th>HR3</th>
                      <th>HR4</th>
                      <th>HR5</th>
                      <th>HR6</th>
                      <th>HR7</th>
                      <th>HR8</th>
                      <th>HR9</th>
                      <th>HR10</th>
                      <th>HR11</th>
                      <th>Achievement</th>
                      <th>Target</th>
                      <th>Efficiency</th>
                      <th>Product</th>
                      <th>Line</th>
                      <th>Section</th>
                      <th>Shift</th>
                      <th>Site</th>
                      <th>Date</th>
                    </tr>
                 
                    </tfoot>
                  </Table>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ViewTimesheet;
