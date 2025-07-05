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
//DB Connection
import config from '../../config';


function FilterTimesheet() {

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
  const [wnames, setWNames] = useState('');
  const [message, setMessage] = useState('');

const [productname, setProductName] = useState('');
const [absent, setAbsent] = useState('');
  

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
    //fromdate: '',
    //todate: '',
    shift: '',
    site: '',
    line_no: '',
    section: '',
    hour: '',
    
  });



   const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  

  const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData };

  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
    url: `${config.apiUrl}/getimporttimesheetfiltertimesheetdata`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {

      if (response && response.message) {
      // Handle the case where data already exists
      //alert(response.message); // Log or display the message as needed
       setMessage(response.message);
       // Extract additional information from the response
    const { sectionname, section, sites, hour, line, shiftt } = response;

    // Use these values as needed in your application
    // For example, update state variables or perform other actions
     setSites(sites);
         setLines(line);
         setSectionNames(sectionname);
         setSection(section);
         setHours(hour);
         setShiftts(shiftt);
    } else {
      // Assign the response data directly to responseData
        const { filteredResults, hour, line, section, shiftt, sectionname, op, sites, abs, additionalResults } = response;
     // alert(JSON.stringify(op)); // Verify the response data

    //setOpOptions(op);
         // Filter out duplicate entries based on the 'name' property
        const uniqueOp = op.reduce((acc, curr) => {
          if (!acc.find(item => item.name === curr.name)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setOpOptions(uniqueOp);

     setSites(sites);
    setLines(line);
    setSectionNames(sectionname);
    setSection(section);
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

      // Log the 'opOptions' to the console
    //alert('opOptions:' + JSON.stringify(op));

    
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
      user_id: $row.find('td:eq(3)').text(),
      product_name: $row.find('td:eq(4)').text(),
      color: $row.find('td:eq(5)').text(),
      section: $row.find('td:eq(6)').text(),
      shifts: $row.find('td:eq(7)').text(),
      line: $row.find('td:eq(8)').text(),
      sectionname: $row.find('td:eq(9)').text(),
      hour: $row.find('td:eq(10)').text(),
      target: $row.find('td:eq(11)').text(),
      fg: $row.find('td:eq(12)').text(),
      op_id: $row.find('td:eq(13)').text(),
      sites: $row.find('td:eq(14)').text(),
      completes: $row.find('input[name^="achievement_"]').val(),
      
    };

    dataToSend.push(rowData); // Add the current row data to the array
    //alert(JSON.stringify(dataToSend));
  }
  });

  // Send the data to the API server
  $.ajax({
    url: `${config.apiUrl}/insertemployeetimesheetnbraidotadata`,
    type: 'POST',
    headers: customHeaders,
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
      console.log('Data successfully posted to the API server.');
      // Handle any further actions or UI updates if needed
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
          buttons: ['copy', 'csv'],
          data: data, // Use the 'data' state variable here
          // ...rest of your options
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



    
  }, []);

  const handleLogout = () => {
    

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
      url: `${config.apiUrl}/getcolordescription/${selectedProduct}`,
      method: 'GET',
      headers: customHeaders,
      success: function (colorResponse) {
        setColorOptions(colorResponse);
       

        // Perform another AJAX request here
        $.ajax({
         url: `${config.apiUrl}/gettargetnbraid/${selectedProduct}?section=${selectedSection}`, // Replace with your endpoint URL
          method: 'GET',
          headers: customHeaders,
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

            // Fetch product name based on the selected product ID
          $.ajax({
             url: `${config.apiUrl}/getproductname/${selectedProduct}`,
            method: 'GET',
            headers: customHeaders,
            success: function (productNameResponse) {
             // Access the productDescription property from the response
              const productDescription = productNameResponse.productDescription;
              
              // Update your UI or state with the product description
              setProductName(productDescription);
              
              // Display the product description in an alert
              //alert(productDescription);
            },
            error: function (xhr, status, error) {
              console.error('Error fetching product name:', error);
            },
          });
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

const exportToCSV = () => {
  const table = document.getElementById('tblCustomers'); // Get the table element
  const rows = table.querySelectorAll('tbody tr'); // Get all table rows in the tbody
  const csvData = [];

  // Create the CSV header
  const header = Array.from(table.querySelectorAll('thead th')).map((th) => th.innerText);
  csvData.push(header.join(','));

  // Create the CSV rows
  rows.forEach((row) => {
    const rowData = Array.from(row.querySelectorAll('td')).map((td) => td.innerText);
    csvData.push(rowData.join(','));
  });

  // Create a Blob (Binary Large Object) with the CSV data
  const csvBlob = new Blob([csvData.join('\n')], { type: 'text/csv' });

  // Use the FileSaver.js function to trigger the download
  saveAs(csvBlob, 'table_data.csv');
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
                    options={lineOptions.map(option => ({ value: option.id, label: option.line_name }))}
                     value={formData.line_no ? { value: formData.line_no, label: formData.line_name } : null}
                   
                    onChange={(selectedOption) => {
                    
                    setFormData({ ...formData, line_no: selectedOption.value, line_name: selectedOption.label });
                  }}
                    isSearchable
                    placeholder="Select Line No"
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
               <select className="form-control" name="hour" id="hour" value={formData.hour} onChange={handleInputChange}> required
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
                  <span className="textgreen">Site <span className="textred">*</span></span>
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
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Get Emp
                  </button>
                </div>
             
                </div>
              </form>

              <div className="row space">
                
                <div className="col-sm-3">
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


                

                <div className="col-sm-3">
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
                <div className="col-sm-3">
                  <span className="textblue">Operator <span className="textred">*</span></span>
                  <select
                    className="form-control"
                    name="operator"
                    id="operator"
                    value={formData.operator}
                   onChange={(e) => {
                    handleInputChange(e);
                   
                  }}

                  >
                    <option value="">Select Operator Name</option>
                    {opOptions.map((opOption) => (
                      <option key={opOption.opid} value={opOption.name}>
                        {opOption.name}
                      </option>
                    ))}
                   {opOptions.length > 0 && <option value="9">Admin</option>}
                  </select>
                </div>
              </div>
<div>
           
            <h6 className="header-title"> <span className="textgreen"> {lines} -> {sectionnames}[{hours}] ->{shiftts} </span></h6>


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

 {/*<div>
      {message && (
        <div>
          <p>{message} <a href="/employeetimesheet/otalist"><span className="textred">EDIT</span></a></p>
        </div>
      )}
    </div>*/}


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
                    <span className="edit"><a href="/employeetimesheet/otalist/"><span className="textred">EDIT</span></a></span>
                  {/*<a href={`/employeetimesheet/otalist/${shiftts}-${lines}-${section}-${hours}`}>
                  
  <span className="textred">EDIT</span>
</a>*/}
                  </p>
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
            
            <div className="message-container">
              {absentEntryIdsMessage && (
                <div className="absent-message">
                  {absentEntryIdsMessage}
                </div>
              )}
            </div>

            <div className="row space">
            <div className="col-sm-6"> 
            <button
  type="button"
  className="btn btn-primary"
  onClick={exportToCSV}
>
  Export
</button>

            </div>
            <div className="col-sm-6"> <input className="form-control" id="myInput" type="text" placeholder="Search.." value={searchValue}
        onChange={handleSearch} />
            </div>
            
           
 
            </div>

               <form onSubmit={handleSubmitnew} method='POST'>


    <div class="fixTableHead">
      <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
            <thead>
              <tr style={{ backgroundColor: '#ABDD93' }}>
                <th>Name</th>
                <th>Entryid</th>
                <th>Shift</th>
                <th>Product</th>
                <th>Color</th>
                <th>Line</th>
                <th>Section</th>
                <th>Target</th>
                <th>{filteredData.length > 0 ? filteredData[0].hour : ''}</th>
                <th>Site</th>
                <th>Operator</th>
                <th>Date</th>
                
                
                </tr>
            </thead>
           <tbody>
                  {
                    filteredData.map((item, index) => (
                   <tr key={item.id}> {/* Use the id as the key */}
                      <td>{item.name}</td>
                      <td>{item.entryid}</td>
                      <td>{item.shiftt}</td>
                      <td>{productname}</td>
                     <td>{formData.product_des}</td>
                      <td>{item.line}</td>
                      <td>{item.sectionname}</td>
                       <td>{targetValues[item.id]}</td>
                      <td></td>
                      <td >{sites}</td>
                       <td>{formData.operator}</td>
                     <td>{item.date}</td>
                    
                     
                     
                       
                      </tr>
                     ))}
                </tbody>

    </table>
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

export default FilterTimesheet;
