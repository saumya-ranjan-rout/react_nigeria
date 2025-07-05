import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function EditFg() {
    const { t } = useTranslation();
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

const { id } = useParams();
//console.log(id);

const [formData, setFormData] = useState({ 
    id: id,  
    product_name: '',
    color_description: '',
    code: '',
    date: '',
    shift: '',
    hour: '',
    fgoutput: '',
    country: '',

    //     id: id,
    // product_name: '',
    // color_description: '',
    // code: '',
    // fromdate: '',
    // hour: '',
    // fgoutput: '',
    // line_no: '',
    // shift: '',
    // product_code: 'product_code',
});

const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
};

const handleFgOutputChange = (event) => {
    const { value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      fgoutput: value,
    }));
};

const handleHourChange = (event) => {
    const { value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      hour: value,
    }));
};

const handleDateChange = (date) => {
  // Adjust the date by adding 1 day
  const adjustedDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));


  // Update the formData state
  setFormData((prevFormData) => ({
    ...prevFormData,
    date: date,
  }));

  // Update the DatePicker state
  setStartDate(date);
};

const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
   // alert(JSON.stringify(updatedFormData));

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: `${config.apiUrl}/fg_output_update`,
      method: 'PUT',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

       // alert(response);
        setServerMessage(response.message);
      if (response.status === 'Success') {
        setServerMessage(response.message);
        setServerMessageClass('alert alert-success');

        // Redirect after showing the success message
        setTimeout(() => {
          console.log('Navigating back...');
         navigate(-1);
        }, 3000);
      } else {
        // Handle other UI updates for non-success cases
        setServerMessage(response.message);
        setServerMessageClass('alert alert-warning');
      }
      },
      error: function (xhr, status, error) {
      console.log(error);

      if (xhr.status === 409) {
        setServerMessage(xhr.responseJSON.message);
        setServerMessageClass('alert alert-danger');
      } else {
        setServerMessage(xhr.responseJSON.message);
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

const handleLineChange = (event) => {
  const { name, value } = event.target;

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};

const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
};

useEffect(() => {
    document.title = 'Edit FG Output';

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      //alert(id);

      $.ajax({
        url: `${config.apiUrl}/getfgoutputData/${id}`, // Replace with your API endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
            const selectedProduct = productOptions.find(product => String(product.id) === response.product_name);
            const productName = selectedProduct ? selectedProduct.item_description : '';
    
            setFormData({
              ...formData,
              product_name: response.product_name,
              color_description: response.product_code,
              code: response.pcode,
              shift: response.shift,
              date: response.date_time,
              hour: response.hour,
              fgoutput: response.fg_output, // Replace response.fgoutput with the correct property from the API response,
              country: response.country,
              pdes : response.pdes,
              item_description : productName
    
    
    
            });
           // alert("product_code"+response.product_code);
            fetchColorOptions(response.product_name);
            setInitialProductId(response.product_name);

         // Fetch line options based on the line_no
        //fetchLineOptions(response.line);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching data:', error);
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

    

    const fetchProductOptions = () => {
      $.ajax({
       url: `${config.apiUrl}/getProductOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setProductOptions(response);
          //setColorOptions(response); // Update colorOptions state here
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };

    fetchProductOptions();

        const fetchColorOptions = (product_name) => {

           // alert("product_name1:"+product_name);
      $.ajax({
        url: `${config.apiUrl}/getColorOptions/${product_name}`, // Include product_name in the URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setColorOptions(response);
          
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };



  //  fetchColorOptions();

  }, []);

const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
};

const handleProductChange = (e) => {
    const selectedProduct = e.value;
    getColorDescriptions(selectedProduct);
};

function getColorDescriptions(selectedProduct) {
    // Fetch color options based on the selected product
    $.ajax({
      url: `${config.apiUrl}/getcolordescription/${selectedProduct}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setColorOptions(response);
        //alert(JSON.stringify(response));
      },
      error: function (xhr, status, error) {
        console.error('Error fetching color options:', error);
      },
    });
}

const handleColorChange = (e) => {
    const selectedColor = e.target.value;
    if (!(selectedColor > 0)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        code: '',
      }));
      return;
    }
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

   
const [selectedOption, setSelectedOption] = useState(null);
  const [initialProductId, setInitialProductId] = useState(null);
  
  useEffect(() => {
    // Set the selected option based on the initialProductId
    // alert(JSON.stringify(productOptions));
    //alert(initialProductId);
    const initialOption = productOptions.find(option => option.id == initialProductId);
    //alert(JSON.stringify(initialOption));
    if (initialOption) {
      // alert("mkkk");
      setSelectedOption({ value: initialOption.id, label: initialOption.item_description });
    }
  }, [initialProductId, productOptions]);

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
              FG Output Edit
              <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="row space">
                
                
                <div className="col-sm-3">
                    <span className="textgreen">Product Name </span>
                    

                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable
                      name="product_name"
                      placeholder="Select"
                      required
                      options={[
                        
                        ...productOptions.map((productOption) => ({
                          value: productOption.id,
                          label: `${productOption.item_description}`,
                        }))
                      ]}
                      value={selectedOption}
                      onChange={(selectedOption) => {
                        setSelectedOption(selectedOption);
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        setFormData((prevFormData) => ({ ...prevFormData, product_name: selectedValue, color_description: '', code: '' }));

                        if (selectedValue > 0) {
                          handleProductChange(selectedOption);
                        }
                        else {
                          setColorOptions([]);
                        }
                      }}
                    />

                  </div>

                <div className="col-sm-3">
                  <span className="textgreen">Color Description</span>
                <select
                  className="form-control"
                  name="color_description"
                  id="color_description"
                  value={formData.color_description}
                  onChange={(e) => {
                    handleInputChange(e);
                   handleColorChange(e); 
                  }}
                >
                  <option value="">Select Color</option>
                  {colorOptions.map((colorOption) => (
                    <option key={colorOption.id} value={colorOption.id}>
                      {colorOption.product_des}
                    </option>
                  ))}
                </select>
                </div>


                <div class="col-sm-3">
                  <span class="textgreen">Color Code</span>
                  <input
                  type="text"
                  className="form-control margin-bottom required"
                  name="code"
                  id="code"
                  disabled
                  value={formData.code}
                />
                </div>

       

                 <div className="col-sm-3">
                  <span className="textgreen">Shift </span>
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
                
                <div class="form-group col-md-3" >
             <span className="textgreen">Hour</span>
               <select className="form-control" name="hour" id="hour" required="" value={formData.hour} onChange={handleInputChange}>
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
                        <input
                        type="text"
                        className="form-control margin-bottom required"
                        name="fgoutput"
                        placeholder=""
                        value={formData.fgoutput}
                        onChange={handleInputChange}
                        required
                      />
                   
                </div>
                
                <div class="form-group col-md-3" >
             <span className="textgreen">{t('Country')} <span style={{ color: 'red'}}>*</span></span>
               <select className="form-control" name="country" id="country" required value={formData.country} onChange={handleInputChange}>
               <option value="Mozambique"> Mozambique</option>
                <option value="South Africa">South Africa</option>                 
               </select>
             </div>

                <div className="col-sm-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Edit
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

export default EditFg;
