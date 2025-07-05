import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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


function EditEmployeeTimesheetBraid() {

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
  const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [colorcodeOptions, setColorCodeOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
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

  const { id } = useParams();
  console.log(id);


  const [formData, setFormData] = useState({
    
   
    product_name: '',
    line_no: '',
    section: '',
    eid: '',
    
  });



   const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

 
  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    //alert(JSON.stringify(updatedFormData));

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: `${config.apiUrl}/updatenbraidotadata`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        //setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          navigate('/admin/employeetimesheet/employeetimesheetnbraidlist');
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Record Not Updated'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
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
    document.title = 'Timesheet Edit';

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      //alert(id);

      $.ajax({
        url: `${config.apiUrl}/getnbraidotadata/${id}`, // Replace with your API endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          //const { timesheet } = response;
          //alert(JSON.stringify(response));
           //setData(timesheet);
           const { worker, item_description, section_name, line, entry_id, id} = response[0]; 

           
           setFormData({ worker, item_description, section_name, line, entry_id, id });
          
          
        },
        error: function (xhr, status, error) {
          console.error('Error fetching data:', error);
        },
      });
    }



     

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

  
const handleProductChange = (e) => {
  const selectedProduct = e.target.value;

  // Fetch color options based on the selected product
  $.ajax({
    url: `${config.apiUrl}/getcolordescription/${selectedProduct}`, // Corrected URL
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
            Update Your Details (<span className="textred">{formData.worker}</span>)  (<span className="textblue">{formData.entry_id}</span>)
                <hr class="mb-2"></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>

                    <div className="row space">

              <div className="col-sm-4">
                  <span >Name </span>
                   
                </div>
                <div className="col-sm-8">
                    
                    <input type="text" class="form-control"  name="name"  value={formData.worker} disabled/>
                  </div>

                
               

               </div>
              <div className="row space">

              <div className="col-sm-4">
                  <span >Product Name </span>
                    <input type="text" class="form-control"  name="productc"  value={formData.item_description} disabled/>
                </div>
                <div className="col-sm-4">
                    <span >Line No </span>
                    <input type="text" class="form-control"  name="linec"  value={formData.line} disabled/>
                  </div>

                 <div className="col-sm-4">
                    <span >Section </span>
                    <input type="text" class="form-control"  name="sectionc"  value={formData.section_name } disabled/>
                  </div>
               

               </div>
               <span className="textred">Change Product->Section->line</span>
              <div className="row space">
                <input type="hidden" class="form-control"  name="eid"  value={formData.id } readonly/>
                
                <div className="col-sm-4">
                  <span >Product Name <span className="textred">*</span></span>
                   <Select
                  options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
                  value={formData.product_name ? { value: formData.product_name, label: formData.item_description } : null}
                  onChange={(selectedOption) => {
                    setFormData({ ...formData, product_name: selectedOption.value, item_description: selectedOption.label });
                    
                  }}
                  isSearchable
                  placeholder="Select Product"
                />
                </div>
                <div className="col-sm-4">
                    <span >Line No <span className="textred">*</span></span>
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

                 <div className="col-sm-4">
                    <span >Section <span className="textred">*</span></span>
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

                <div className="col-sm-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Update
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

export default EditEmployeeTimesheetBraid;
