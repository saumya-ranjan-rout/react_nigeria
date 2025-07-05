import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

function MultipleZoneChange() {
  const [shiftOptions, setShiftOptions] = useState([]);
  const [data, setData] = useState([]);
  const [entryIds, setEntryIds] = useState('');
  const params = new URLSearchParams(useLocation().search);
  const entryIdsArray = params.getAll('entryIds');
  const animatedComponents = makeAnimated();
 
  const [sectionName, setSectionName] = useState([])
  const [machines, setMachines] = useState([])
  const [lineOptions, setLineOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [subcat, setSubcat] = useState('');

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
    
  let error = {
    color: 'red',
    fontSize: '13px',
  }
  let red = {
    color: 'red',
    fontSize: '16px',
  }
 

  const [formData, setFormData] = useState({
    entryIds: '',
    product: '',
    line: '',
    section: '',
  });

  const [formErrors, setFormErrors] = useState({
    entryIds: '',
    product: '',
    line: '',
    section: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
   
    setFormData({ ...formData, [name]: value });
 
};
const fetchLineOptions = (id) => {
  //alert(id);
     $.ajax({
       url: `${config.apiUrl}/getLineOptions/${id}`,
       method: 'GET',
       headers: customHeaders,
       success: function (response) {
         console.log('Line options:', response); // Add this line for debugging
        // alert(response);
         setLineOptions(response);
       },
       error: function (xhr, status, error) {
         console.error('Error fetching line options:', error);
       },
     });
   };

 const handleSubmit = (event) => {

  event.preventDefault();
  const updatedFormData = { ...formData};

  const jsonData = JSON.stringify(updatedFormData);
  alert(jsonData);
  // let errors = {}
  // let isValid = true

  // if (!formData.section.trim()) {
  //   errors.section = 'Section is required'
  //   isValid = false
  // }
  // if (!formData.line.trim()) {
  //   errors.line = 'Line is required'
  //   isValid = false
  // }
  // if (!formData.product_name.trim()) {
  //   errors.product_name = 'Product is required'
  //   isValid = false
  // }



 // if (isValid) {
  $.ajax({
    url: `${config.apiUrl}/update_multiple_zone`,
    method: "POST",
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Display the success message from the server response
    
      // Set the server response message in the state variable
      setServerMessage(response.message);
      setServerMessageClass('alert alert-success');
      // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        navigate(-1);
      }, 3000); // Adjust the delay time as needed
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
      // Display the error message or handle errors as needed
      setServerMessage('An error occurred'); // Set the server message in state for other errors
      setServerMessageClass('alert alert-danger');
    },
  });
  // }else{
  //   setFormErrors(errors)
  // }
};


const [isEntryIdExpanded, setEntryIdExpanded] = useState(false);
 useEffect(() => {
      document.title = 'Change Zone For Multiple Employees';
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {

     // Send the entryIdsArray in the API call
    const jsonData = JSON.stringify({ entryIds: entryIdsArray });

    $.ajax({
      url: `${config.apiUrl}/changeshift_entryid`,
      method: 'POST', // Change the method to POST for sending the entryIdsArray
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // Access the timesheet results from the response object
        const timesheetData = response;

        // Update the component state with the timesheet data
        setData(timesheetData);

         // Extract the entry IDs from the response
        const entryIds = timesheetData.map((item) => item.entryid).join(',');

        // Update the entryIds state with the formatted string
        setEntryIds(entryIds);

       // Convert the entryIdsArray into a comma-separated string
        const entryIdsString = entryIdsArray.join(',');

        // Set the formData state including entryIds
        setFormData((prevFormData) => ({
          ...prevFormData,
          entryIds: entryIdsString,
        }));

        // Destroy the existing DataTable instance (if it exists)
       
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });


    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        // API URL for fetching shift options
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

     // Fetch section type from API
     const fetchSectionOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getSectionOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSectionName(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };
    fetchSectionOptions()
    const fetchProductname = () => {
      $.ajax({
      url: `${config.apiUrl}/getProductOptions`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setProductOptions(response);
      },
      error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
      },
      });
  }
  fetchProductname();

  }

    setFormData((prevFormData) => ({
      ...prevFormData,
      entryIds: entryIds,
    }));
 
   
    }, []);

    const toggleRM = () => {
      setEntryIdExpanded((prevExpanded) => !prevExpanded);
    };

//Get changezone wise machine data
const handleZoneChange = (e) => {
  const selectedZone = e.target.value;
  $.ajax({
    url: `${config.apiUrl}/ikeja/getMachines/${selectedZone}`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      const machinesSplit = response.split(',');
      setMachines(machinesSplit);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching line options:', error);
    },
  });
};
//Get Machine change 
 const handleMachineChange = (val) => {
  const data = val.target.value;
 
  if (subcat === '') {
    setSubcat(data + ',');
  } else {
    const ret = subcat.split(',');
    let d = '';
    let found = false;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i] === data) {
        found = true;
        break;
      }
    }
    if (found) {
      d = subcat;
    } else {
      d = subcat + data + ',';
    }
    setSubcat(d);
  }
};

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
  const selectedOption = sectionName.find((data) => data.id === formData.section);
  const selectedOption1 = lineOptions.find((data) => data.line === formData.line);
  const selectedOption3 = productOptions.find((data) => data.id === formData.product);
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  let star = {
    color: 'red',
    fontSize: '15px',
  }
  return (
    <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Multiple Change Zone</CardTitle>
              </CardHeader>
              <CardBody>
    
           
            <div style={{ fontWeight: 'bold' }} className='readmore'>
            <p className='c'>
               Changes for  <b>Operators :</b>
               {isEntryIdExpanded ? (
               <span style={{ color: 'green', fontWeight: 'bold' ,fontSize:'12px'}}> {entryIds}</span>
               ) : (
               <span style={{ color: 'green', fontWeight: 'bold',fontSize:'12px' }}> {entryIds.slice(0, 150)}</span>
               )}
               
            </p>
         </div>
         <br></br>
         <form  onSubmit={handleSubmit} method='POST'>
            <div className="row space ">
               
            <div className="col-sm-3">
                    <span className="textgreen">Product Name<span style={star}>*</span> </span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Product Name..."
                        value={selectedOption3 ? { value: selectedOption3.id, label: selectedOption3.item_description } : null}
                        onChange={(selectedOption3) => {
                          const newValue = selectedOption3 ? selectedOption3.value : '';
                          handleInputChange({ target: { name: 'product', value: newValue } });
                          fetchLineOptions(selectedOption3.value);
                        }}
                        options={productOptions.map((data) => ({ value: data.id, label: data.item_description }))} required
                      />
                  
                  </div> 
                
                <div className="col-sm-2">
                    <span className="textgreen">Line<span style={star}>*</span> </span>
                        <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Line..."
                        value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line } : null}
                        onChange={(selectedOption1) => {
                          const newValue = selectedOption1 ? selectedOption1.value : '';
                          handleInputChange({ target: { name: 'line', value: newValue } });
                        }}
                        options={lineOptions.map((data) => ({ value: data.line, label: data.line }))}  required
                      />
                      
                  </div>
                  
                  <div className="col-sm-3">
                  <span className="textgreen">Section Name<span style={star}>*</span></span>
                  <Select
                    components={animatedComponents}
                    isSearchable
                    placeholder="Choose Section..."
                    value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                    onChange={(selectedOption) => {
                      const newValue = selectedOption ? selectedOption.value : '';
                      handleInputChange({ target: { name: 'section', value: newValue } });
                    }}
                    options={sectionName.map((data) => ({ value: data.id, label: data.section_name }))} required
                  />
                </div>



               <div className="col-sm-2">
                  <button
                     type="submit"
                     className="btn btn-success btn-md"
                     >
                  Add
                  </button>
               </div>
            </div>
         </form>
         
</CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default MultipleZoneChange;
