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

function AddNewNbraidOtaFg() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [colorcodeOptions, setColorCodeOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [line, setLine] = useState('');
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };



const [formData, setFormData] = useState({
    product_name: '',
    color_description: '',
    code: '',
    fromdate: '',
    hour: '',
    fgoutput: '',
    line_no: '',
    shift: '',
});

const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'fromdate') {
    setStartDate(new Date(value));
  }  else {
    setFormData({ ...formData, [name]: value });
  }
};

const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate };
  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
    url: `${config.apiUrl}/addfgoutputotanbraid?userid=${userid}`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      console.log(response);
      setServerMessage(response.message);
      setServerMessageClass(response.message === 'FgOutput Details already exists' ? 'alert alert-warning' : 'alert alert-success');
      
      // Navigate back to the previous page after 3 seconds
      setTimeout(() => {
        console.log('Navigating back...');
         navigate(-1);
      }, 3000);
    },
    error: function (xhr, status, error) {
      console.log(error);
      if (xhr.status === 409) {
        setServerMessage(xhr.responseJSON.message);
        setServerMessageClass('alert alert-danger');
      } else {
        setServerMessage(xhr.responseJSON.message); // Use the error message from the server
        setServerMessageClass('alert alert-danger');
      }
    },
  });
};

const handleDeleteRow = (index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
};

const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
};

useEffect(() => {
  document.title = 'Add Fg';
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

    const fetchProductOptions = () => {
      $.ajax({
         url: `${config.apiUrl}/getProductOptionsnbraid`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setProductOptions(response);
          setColorOptions(response); // Update colorOptions state here
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
        // Fetch line options based on the selected product
          $.ajax({
            url: `${config.apiUrl}/getindividualLineOptions/${roleId}/${userid}`,
            method: 'GET',
            headers: customHeaders,
            success: function (lineResponse) {
              setLineOptions(lineResponse);
            },
            error: function (xhr, status, error) {
              console.error('Error fetching line options:', error);
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
  
const handleColorChange = (selectedOption) => {
  //const selectedColor = e.target.value;
   const selectedColor = selectedOption.value;
   
  // Make an API request based on the selected color description
  $.ajax({
    url: `${config.apiUrl}/getproductcode/${selectedColor}`, // Replace with your API endpoint URL
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      // Handle the response data
      console.log(response);
       setColorCodeOptions(response);
       //alert(JSON.stringify(response));
       const productCode = response; // Assuming the API response contains a property named "product_code"
       //alert(JSON.stringify(response));
      if (response.length > 0) {
        const productCode = response[0].product_code;
        const cleanedProductCode = productCode.replace(/"/g, '');
        // Update the formData state
          setFormData((prevFormData) => ({
            ...prevFormData,
            code: cleanedProductCode,
          }));
        //alert(cleanedProductCode);
        //console.log(productCode); // Log the product code for debugging
         setTimeout(function() {
    $('input[name="code"]').val(cleanedProductCode).prop('readonly', true); // Set the value of the input field
  }, 100); // Delay in milliseconds
      } else {
        console.log('Product code not found in API response.');
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data:', error);
    },
  });
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
              FG Output Details
              <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="row space">
                
                
                <div className="col-sm-3">
                <span className="textgreen">Product Name <span className="textred">*</span></span>
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
                  <span className="textgreen">Color Description <span className="textred">*</span></span>
                  <Select
                    options={colorOptions.map(option => ({ value: option.id, label: option.product_des }))}
                    value={formData.color_description ? { value: formData.color_description, label: formData.product_des } : null}
                    
                    onChange={(selectedOption) => {
                      setFormData({ ...formData, color_description: selectedOption.value, product_des: selectedOption.label  });
                      handleColorChange(selectedOption);
                    }}
                    isSearchable
                    placeholder="Select Color"
                  />
                </div>


                <div class="col-sm-3">
                  <span class="textgreen">Color Code</span>
                  <input type="text" className="form-control margin-bottom required" name="code" id="code"  disabled />
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
                    required
                  />
                </div>
                
                  <div className="col-sm-3">
                    <span className="textgreen">Date</span><br/>
                   
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
                  <span className="textgreen">Shift <span className="textred">*</span></span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                     value={formData.shift} onChange={handleInputChange}
                     required
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.nhrs}>
                        {shiftOption.name}
                      </option>
                    ))}
                  </select>
                </div>

               
                <div class="form-group col-md-3" >
             <span className="textgreen">Hour </span>
               <select className="form-control" name="hour" id="hour"  value={formData.hour} required onChange={handleInputChange} >
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

             <div class="col-sm-3 ">

                     <span className="textgreen">Fg Output <span className="textred">*</span></span>
                         <input  type="text" className="form-control margin-bottom  " name="fgoutput" placeholder="" value={formData.fgoutput} onChange={handleInputChange}  required/>
                   
                </div>

                <div className="col-sm-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Add
                  </button>
                </div>
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

export default AddNewNbraidOtaFg;
