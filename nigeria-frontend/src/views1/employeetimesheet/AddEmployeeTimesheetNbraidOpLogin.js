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
import Select from 'react-select';

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

function AddEmployeeTimesheetNbraidOpLogin() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [product, setProduct] = useState('');
  //const [line, setLine] = useState('');
  const [section, setSection] = useState('');
  //const [hour, setHour] = useState('');
  //const [shiftt, setShift] = useState('');
  const [absentEntryIdsMessage, setAbsentEntryIdsMessage] = useState('');
  const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [targetOptions, setTargetOptions] = useState([]); // Define colorOptions state
  const [targetValues, setTargetValues] = useState({});
  const [opOptions, setOpOptions] = useState([]);
  const [sites, setSites] = useState('');
  const [shiftts, setShiftts] = useState('');
  const [lines, setLines] = useState('');
  const [hours, setHours] = useState('');
  const [sectionnames, setSectionNames] = useState('');

  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const [absent, setAbsent] = useState('');
  const [wnames, setWNames] = useState('');

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

  const [formData, setFormData] = useState({
    
    shift: '',
    line_no: '',
    section: '',
    hour: '',
    product_name: '',
    color_description: '',
    operator: '',
    
  });

  const handleInputChange = (event) => {
    if (event && event.target) {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    } else {
      console.error('Event or event.target is undefined:', event);
    }
  };

const handleSubmit = (event) => {
  event.preventDefault();
  const { shift, line_no, section, hour } = formData; // Extract only the needed properties

  const updatedFormData = {
    shift,
    line_no,
    section,
    hour,
  };

 const jsonData = JSON.stringify(updatedFormData);
 console.log('Request Payload:', jsonData);
  $.ajax({
    url: `http://192.168.29.243:/getaddemployeetimesheetfilterdatanbraidotaoplogin/${userid}`,
    method: 'POST',
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      if (response && response.message) {
      // Handle the case where data already exists
      //alert(response.message); // Log or display the message as needed
       setMessage(response.message);
       // Extract additional information from the response
    const { sectionname, sites, hour, line, shiftt } = response;

    // Use these values as needed in your application
    // For example, update state variables or perform other actions
         setSites(sites);
         setLines(line);
         setSectionNames(sectionname);
         setHours(hour);
         setShiftts(shiftt);
    } else {
      // Assign the response data directly to responseData
        const { filteredResults, hour, line, section, shiftt, sectionname, op, sites, abs, additionalResults} = response;
     // alert(JSON.stringify(op)); // Verify the response data

     // Filter out duplicate entries based on the 'name' property
        const uniqueOp = op.reduce((acc, curr) => {
          if (!acc.find(item => item.name === curr.name)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setOpOptions(uniqueOp);

         //setOpOptions(op);
         setSites(sites);
         setLines(line);
         setSectionNames(sectionname);
         setHours(hour);
         setShiftts(shiftt);

         // Split the 'ab' string into an array of values
         const abValues = abs;

         // Log the 'ab' values for debugging
         // alert('AB Values:' + abValues);
            
         setAbsent(abValues);

         //alert(abValues);
        // Extract the "name" property from each object in the array
        const workerNames = additionalResults.map(result => result.name).join(', ');
        setWNames(workerNames);
         //alert(workerNames);

      // Update the filteredData state variable with the response data
      setData(
        filteredResults.map((item, index) => ({
          ...item,
          id: index, // Add a unique identifier to each item in the data array
          hour: hour,
          line: line,
          section: section,
          shiftt: shiftt,
          sectionname: sectionname,
          
        }))
      );

      // Clear the message when there is data to show
        setMessage('');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
};

const handleDeleteRow = (id) => {
  // Display an alert with the index of the row being deleted
  //alert(`Deleting row with index: ${id}`);
  
   setData((prevData) => {
    const newData = prevData.filter((item) => item.id !== id);
    return newData;
  });
};

const handleSubmitnew = (event) => {

  event.preventDefault(); // Prevent the default form submission

  const tableRows = Array.from(document.querySelectorAll('table#tblCustomers tbody tr'));
  const dataToSend = []; // Create an array to store the data

  tableRows.forEach((row) => {
    const $row = $(row);
     const completes = $row.find('input[name^="achievement_"]').val();
    if (completes !== '') {

    const rowData = {
      worker_names: $row.find('td:eq(0)').text(),
      emp_ids: $row.find('td:eq(1)').text(),
      shifts: $row.find('td:eq(2)').text(),
      product_name: $row.find('td:eq(3)').text(),
      color: $row.find('td:eq(4)').text(),
      section: $row.find('td:eq(5)').text(),
      shifts: $row.find('td:eq(6)').text(),
      line: $row.find('td:eq(7)').text(),
      sectionname: $row.find('td:eq(8)').text(),
      hour: $row.find('td:eq(9)').text(),
      target: $row.find('td:eq(10)').text(),
      fg: $row.find('td:eq(12)').text(),
      completes: $row.find('input[name^="achievement_"]').val(),
    };

    dataToSend.push(rowData); // Add the current row data to the array
    //alert(JSON.stringify(dataToSend));
  }
  });

  // Send the data to the API server
  $.ajax({
    url: `http://192.168.29.243:4000/insertemployeetimesheetnbraidotadataoplogin/${userid}`,
    type: 'POST',
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
      console.log('Data successfully posted to the API server.');
      // Handle any further actions or UI updates if needed
      // Check the status in the response
    if (response.status === 1) {
      // Set success message and class
      setServerMessage('Details added successfully');
      setServerMessageClass('alert alert-success');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
           navigate('/admin/employeetimesheet/employeetimesheetnbraidlistoplogin');
          }, 5000);
    } else {
      // Set error message and class
      setServerMessage('Failed to add details. Please try again.');
      setServerMessageClass('alert alert-danger');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
             //history.push('/login');
          }, 5000);
    }
    },
    error: function (error) {
      console.error('Failed to post data to the API server.');
      // Handle error or display an error message
    },
  });
};

const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
  };

useEffect(() => {

    document.title = 'Today Employee Timesheet';
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
        buttons: ['copy', 'csv', 'excel', 'pdf'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });

     
    }
 

    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        url: 'http://192.168.29.243:4000/getShiftOptions',
        method: 'GET',
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
        url: `http://192.168.29.243:4000/getSectionOptionsOpLogin/${userid}`,
        method: 'GET',
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
        url: `http://192.168.29.243:4000/getindividualLineOptions/${roleId}/${userid}`,
        method: 'GET',
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
          url: 'http://192.168.29.243:4000/getProductOptionsnbraidotalist',
          method: 'GET',
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

const handleProductChange = (selectedOption) => {
  if (selectedOption && selectedOption.value) {
    const selectedProduct = selectedOption.value;
    const selectedSection = formData.section; // Get the selected section from your form data

    // Fetch line options based on the selected product
    $.ajax({
      url: `http://192.168.29.243:4000/getcolordescription/${selectedProduct}`,
      method: 'GET',
      success: function (colorResponse) {
        setColorOptions(colorResponse);

        // Perform another AJAX request here
        $.ajax({
          url: `http://192.168.29.243:4000/gettargetnbraid/${selectedProduct}?section=${selectedSection}`, // Replace with your endpoint URL
          method: 'GET',
          success: function (response) {
            const { target } = response;

            // Handle the response from the second request here
            // alert('Data from another endpoint:' + target);
            setTargetOptions(response);

            // Update the targetValues state variable with the target value
            const updatedTargetValues = {};
            filteredData.forEach((item) => {
              updatedTargetValues[item.id] = target; // Assuming item.id uniquely identifies each row
            });
            setTargetValues(updatedTargetValues);

            // You can update your UI or state based on the second response here
          },
          error: function (xhr, status, error) {
            console.error('Error fetching data from another endpoint:', error);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error('Error fetching color options:', error);
      },
    });
  } else {
    console.error('Selected option or selected option value is undefined:', selectedOption);
  }
};

const [achievementValue, setAchievementValue] = useState('');
  
const handleAchievementChange = (index, value) => {
    setAchievementValue(value);
    const rows = document.querySelectorAll(`input[name^="achievement_${index}"]`);
    rows.forEach((row) => {
      row.value = value;
    });
  };

const handleReplicateClick = () => {
    const rows = document.querySelectorAll('input[name^="achievement_"]');

    rows.forEach((row) => {
      row.value = achievementValue;
    });
  
  };

const [searchValue, setSearchValue] = useState('');
  
const handleSearch = (event) => {
     setSearchValue(event.target.value);
     //alert(event.target.value);
  };

const filteredData = data.filter((item) => {
  return (
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.entryid.toLowerCase().includes(searchValue.toLowerCase()) 
    
  );
});

const messageRef = useRef(null); // Create a reference for the message container
  
useEffect(() => {
    // Scroll to the message container when serverMessage changes
    if (serverMessage) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serverMessage]); // Watch for changes in serverMessage state

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
              Add Work Completes 
             
            <hr ></hr>
            <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                
                <div className="col-sm-2">
                  <span className="textgreen">Shift <span className="textred">*</span></span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                     value={formData.shift} onChange={handleInputChange} required
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
                  <span className="textgreen">Line <span className="textred">*</span></span>
                  <Select
                    options={lineOptions.map(option => ({ value: option.line, label: option.line }))}
                     value={formData.line_no ? { value: formData.line_no, label: formData.line } : null}
                   
                    onChange={(selectedOption) => {
                    
                    setFormData({ ...formData, line_no: selectedOption.value, line: selectedOption.label });
                  }}
                    isSearchable
                    placeholder="Select Line No"
                    required
                  />
                </div>

                  <div className="col-sm-2">
                  <span className="textgreen">Section Name <span className="textred">*</span></span>
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
                
                <div class="form-group col-md-2" >
             <span className="textgreen">Hour <span className="textred">*</span></span>
               <select className="form-control" name="hour" id="hour" value={formData.hour} onChange={handleInputChange} required>
                 <option value="">Select Hour</option>
                 <option value="HOUR1">HOUR1</option>
                 <option value="HOUR2">HOUR2</option>
                 <option value="HOUR3">HOUR3</option>
                 <option value="HOUR4">HOUR4</option>
                 <option value="HOUR5">HOUR5</option>
                 <option value="HOUR6">HOUR6</option>
                 <option value="HOUR7">HOUR7</option>
                 <option value="HOUR8">HOUR8</option>
                 <option value="HOUR9">HOUR9</option>
                 <option value="HOUR10">HOUR10</option>
                 <option value="HOUR11">HOUR11</option>
                
            
               </select>
             </div>

             
                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Get Emp
                  </button>
                </div>
              </div>
              
          </form> 
          <form onSubmit={handleSubmitnew} method='POST'>
           <div className="row space">
                
                

                <div className="col-sm-4">
                <span className="textblue">Product Name <span className="textred">*</span></span>
                <Select
                  options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
                  value={formData.product_name ? { value: formData.product_name, label: formData.item_description } : null}
                  //value={productOptions.find(option => option.id === formData.product_name)} // Adjust this line
                  onChange={(selectedOption) => {
                    setFormData({ ...formData, product_name: selectedOption.value, item_description: selectedOption.label });
                    handleProductChange(selectedOption);
                  }}
                  isSearchable
                  placeholder="Select Product Name"
                />
              </div>


                

                <div className="col-sm-4">
                  <span className="textblue">Select Color <span className="textred">*</span></span>
                  <Select
                    options={colorOptions.map(option => ({ value: option.id, label: option.product_des }))}
                    value={formData.color_description ? { value: formData.color_description, label: formData.product_des } : null}
                    
                    onChange={(selectedOption) => {
                      setFormData({ ...formData, color_description: selectedOption.value, product_des: selectedOption.label  });
                      handleProductChange(selectedOption);
                    }}
                    isSearchable
                    placeholder="Select Color"
                  />
                </div>

                
              </div>

          
            <div>
           
            <h6 className="header-title"> <span className="textblue"> {lines} </span>-><span className="textred"> {sectionnames}[{hours}] ->{shiftts} </span></h6>
            </div>


          <div>
            {wnames.length > 0 && (
              <div>
                {wnames.split(', ').map((worker, index) => (
                  <p key={index}>
                    {worker} worker is working for another product in{' '}
                    <span className='textblue'>{hours}</span> hour.
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            {absent.length > 0 && (
              <p>
                workers having <span className='textblue'>{absent.join(', ')}</span> are absent.
              </p>
            )}
          </div>

            <div>
              {message && (
                <div>
                  <p>
                    <span>{message.split(',')[0]},</span>
                    <span className="badge badge-danger rounded-circle noti-icon-badge">{message.split(',')[1]}</span>
                    <span>{message.split(',')[2]},</span>
                    <span className="badge badge-warning">{message.split(',')[3]}</span>
                    <span>{message.split(',')[4]}</span>
                    <span className="badge badge-primary">{message.split(',')[5]}</span>
                    <span>{message.split(',')[6]},</span>
                    <span >{message.split(',')[7]}</span>
                    <span>{message.split(',')[8]}</span>
                    <span className="edit"><a href="/employeetimesheet/otalist"><span className="textred">EDIT</span></a></span>
                  </p>
                </div>
              )}
            </div>

            <div className="message-container">
              {absentEntryIdsMessage && (
                <div className="absent-message">
                  {absentEntryIdsMessage}
                </div>
              )}
            </div>

            <div className="row space">
            <div className="col-sm-6"> <input className="form-control" id="myInput" type="text" placeholder="Search.." value={searchValue}
        onChange={handleSearch} />
            </div>
            <div className="col-sm-3">&nbsp;</div>
            <div className="col-sm-2"><input className="btn btn-primary btn-sm" value="Replicate Qty" id="btn" readonly="" style={{ width: '150px' }}  onClick={handleReplicateClick}/>
            </div>
           
 
            </div>
              
      
    <div className="table-responsive">
      <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered table" cellPadding="0" cellSpacing="0" border="1">
            <thead>
              <tr className='tablegreen'>
                <th>Name</th>
                <th>Entryid</th>
                <th>Shift</th>
                <th>Line</th>
                <th>Section</th>
                <th>Hour</th>
                <th>Target</th>
                <th>Achievement</th>
                
                <th><i class="bx bx-cog"></i></th>
                </tr>
            </thead>
           <tbody>
                  {
                    filteredData.map((item, index) => (
                    <tr key={item.id}> {/* Use the id as the key */}
                      <td>{item.name}</td>
                      <td>{item.entryid}</td>
                      <td hidden>{item.shiftt}</td>
                      <td hidden>{formData.product_name}</td>
                      <td hidden>{formData.color_description}</td>
                      <td hidden>{item.section}</td>
                      <td>{item.shiftt}</td>
                      <td>{item.line}</td>
                      <td>{item.sectionname}</td>
                      <td>{item.hour}</td>
                      <td>{targetValues[item.id]}</td>
                      <td hidden>{item.section}</td>
                      <td hidden>{formData.operator}</td>
                      <td>
                        <input
                          type="text"
                          name={`achievement_${index}`}
                          value={item.Achievement}

                          className="form-control margin-bottom"
                          onChange={(e) => handleAchievementChange(index, e.target.value)} required
                        />
                      </td>
                      
                         <td><button
                          className="btn btn-danger"
                         onClick={() => handleDeleteRow(item.id)}
                        >
                          <i className="bx bx-trash"></i>
                        </button></td>
                      </tr>
                     ))}
                </tbody>

    </table>
    </div>
              <div className="form-group row">

                  <label className="col-sm-11 col-form-label"></label>
                  <div className="col-sm-11">
                      
                      
                  </div>
                  <div className="col-sm-1">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Save" data-loading-text="Adding..." />
                      
                  </div>
              </div>
              </form>
               
         </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default AddEmployeeTimesheetNbraidOpLogin;
