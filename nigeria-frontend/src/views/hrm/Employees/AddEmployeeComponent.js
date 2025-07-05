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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function AddEmployeeComponent() {
  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
  const [worker_type, setWorker] = useState([]);
  const [shift, setShift] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };
  const lineOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
    { value: "7", label: "7" },
    { value: "8", label: "8" },
    { value: "9", label: "9" },
    { value: "10", label: "10" }
  ];

useEffect(() => {
    document.title = 'Add Employee Details';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });

      // Fetch worker type from API
      const fetchworkerType = () => {
        $.ajax({
          url: `${config.apiUrl}/getworkertype`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setWorker(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchworkerType();

      // Fetch Shift type from API
      const fetchshift = () => {
        $.ajax({
          url: `${config.apiUrl}/getShiftOptions`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShift(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      }
      fetchshift();

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
    }
  }, []);

  const [formData, setFormData] = useState({


    name: '',
    section: '',
    product: '',
    entryid: '',
    line: '',
    workertype: '',
    shift: '',
    type: '',
    join_date: today,
    
  });


  const handleSubmit = (event) => {
  event.preventDefault();
  const insertFormdata = { ...formData};
  const jsonData = JSON.stringify(insertFormdata);

  let errors = {}
  let isValid = true
  // alert(typeof formData.product);
  // console.log(typeof formData.product);
 // alert(jsonData)
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!formData.product.trim()) {
    errors.product = 'Product is required'
    isValid = false
  } 

  if (!formData.section.trim()) {
    errors.sectionId = 'Section is required'
    isValid = false
  } 

  if (!formData.entryid.trim()) {
    errors.entryid = 'Entryid is required'
    isValid = false
  }

  if (!formData.type.trim()) {
    errors.type = 'Type is required'
    isValid = false
  } 

  if (!formData.workertype.trim()) {
    errors.workertype = 'Worker type is required'
    isValid = false
  }

  if (!formData.shift.trim()) {
    errors.shift = 'Shift is required'
    isValid = false
  }
  if (!formData.line.trim()) {
    errors.line = 'Line is required'
    isValid = false
  }
  // First, add the item master data to the "itemmaster" table
  if (isValid) {
    // AJAX call for other sites
    $.ajax({
      url:  `${config.apiUrl}/add_new_worker`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response){
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        // Redirect to the appropriate component after successful addition
        // Replace '/ikeja-success' with the actual route for the success component in other sites
         navigate('/admin/hrm/employees');
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });

  } else {
    setServerMessage(errors); // Set the server message in state
    setServerMessageClass('alert alert-danger');
  }

};


//Get changezone wise machine data


const renderSelectedMachines = () => {
  return selectedMachines.join(', ');
};

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};



const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
};

  return (
    <div className="content">
      <Row>
        <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0' }}>
          {serverMessage && <div className="alert">{serverMessage}</div>}
        </div>
        <Col md="12">
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">Add Employee Details </CardTitle>
              <hr></hr>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} method='POST' >
                <div className="form-group row space">
                  <div className="col-sm-4">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Name</span> </label>
                    <input type="text" placeholder=" Name"
                      className="form-control margin-bottom  required" name="name" id="name" value={formData.name} onChange={handleInputChange} required />
                    
                  </div>
                  <div className="col-sm-4">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Entryid </span> </label>
                    <input type="text" placeholder="Entryid"
                      className="form-control margin-bottom  required" name="entryid" id="entryid" value={formData.entryid} onChange={handleInputChange} required />
                    
                  </div>
                  <div className="col-sm-4">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Type </span> </label>
                    <select className="form-control" name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="">{t('Select')}</option>
                               <option value="1">Casual</option>
                               <option value="2">Permanent</option>
                    </select>
                    
                  </div>
                  <div className="col-sm-4">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="worker date"><span className='textblack'>Worker Type</span> </label>
                    <select className="form-control" name="workertype" value={formData.workertype} onChange={handleInputChange}>
                      <option value="">select</option>
                      {worker_type.map((workertyp) => (
                        <option
                          key={workertyp.id}
                          value={workertyp.name}
                        >
                          {workertyp.name}
                        </option>
                      ))}
                    </select>
                   
                  </div>
                  <div className="col-sm-4">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Product </span>
      </label>
      <Select
        options={productOptions.map(option => ({ value:String(option.id) , label: option.item_description }))}
        value={formData.product ? { value: formData.product, label: formData.item_description } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, product: selectedOption.value, item_description: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
                  <div className="col-sm-4">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="Shift"><span className='textblack'>Shift</span> </label>
                    <select className="form-control" name="shift" value={formData.shift} onChange={handleInputChange}>
                      <option value="">select</option>
                      {shift.map((shiftnm) => (
                        <option
                          key={shiftnm.id}
                          value={shiftnm.name}
                        >
                          {shiftnm.name}
                        </option>
                      ))}
                    </select>
                   
                  </div>
                  <div className="col-sm-4">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Line </span>
      </label>
      <Select
        options={lineOptions.map(option => ({ value: option.value, label: option.label }))}
        value={formData.line ? { value: formData.line, label: formData.line } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, line: selectedOption.value });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
    <div className="col-sm-4">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Section </span>
      </label>
      <Select
        options={sectionOptions.map(option => ({ value: String(option.id), label: option.section_name }))}
        value={formData.section ? { value: formData.section, label: formData.section_name } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
                  <div className="col-sm-4" >
                    <label className="col-sm-12 col-form-label"
                      htmlFor="join date"><span className='textblack'>Join Date</span> </label>
                    <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Start Date"
                      name="fromdate"
                    />
                  </div>

               </div>
                <hr></hr>
                <div className="form-group row">
                  <div className="col-sm-12">
                    <input type="submit" id="submit-data" className="btn btn-success margin-top"
                      value="Add Employee" data-loading-text="Adding..." style={{ width: '140px' }} />
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

export default AddEmployeeComponent;
