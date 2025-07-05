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

function AddEmployeeComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const today = new Date(); // Get the current date
  const [startDate, setStartDate] = useState(today);
  const [worker_type, setWorker] = useState([]);
  const [shift, setShift] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
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
    entryid: '',
    email: '',
    fdate: today,
    site: '', // Add site to the form data state
    workertype: '',
    shift: '',
    etype: '',
    ctype: '',
    staff: '', // Add staff to the form data state
    
  });
/*
const handleSubmit = (event) => {
    event.preventDefault();
   // Update formData with selectedMachines
  const updatedFormData = {
    ...formData,
    machine: selectedMachines.join(','), // Add selected machines joined by comma
  };
    // First, add the item master data to the "itemmaster" table
    $.ajax({
      url: `${config.apiUrl}/addemployee`,
      method: 'POST',
      headers: customHeaders,
      data: updatedFormData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          navigate(-1);
        }, 3000); // Adjust the delay time as needed
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
  };*/

  const handleSubmit = (event) => {
  event.preventDefault();
  
  // Update formData with selectedMachines
  const updatedFormData = {
    ...formData,
    machine: selectedMachines.join(','), // Add selected machines joined by comma
  };

  // Conditionally make the AJAX call based on the site value
  if (updatedFormData.site === 'ota') {
    // AJAX call for site ota
    $.ajax({
      url: `${config.apiUrl}/addemployee`,
      method: 'POST',
      headers: customHeaders,
      data: updatedFormData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        // Redirect to the appropriate component after successful addition
        // Replace '/ota-success' with the actual route for the success component in site ota
         navigate('/admin/hrm/ikeja/employeesota');
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
    // AJAX call for other sites
    $.ajax({
      url: `${config.apiUrl}/addemployee`,
      method: 'POST',
      headers: customHeaders,
      data: updatedFormData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass('alert alert-success');
        // Redirect to the appropriate component after successful addition
        // Replace '/ikeja-success' with the actual route for the success component in other sites
         navigate('/admin/hrm/ota/employees');
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
  }
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

const renderSelectedMachines = () => {
  return selectedMachines.join(', ');
};

  const handleInputChange = (event) => {
  const { name, value } = event.target;

  if (name === 'machine1' && value) {
    // Check if the selected machine is already in the array
    if (!selectedMachines.includes(value)) {
      setSelectedMachines((prevSelectedMachines) => [...prevSelectedMachines, value]);
    }
    // Update the machine field in formData
    setFormData({ ...formData, machine: selectedMachines.join(',') });
  } else {
    setFormData({ ...formData, [name]: value });
  }
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
                  <div className="col-sm-2">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Name</span> </label>
                    <input type="text" placeholder=" Name"
                      className="form-control margin-bottom  required" name="name" id="name" value={formData.name} onChange={handleInputChange} required />
                    
                  </div>
                  <div className="col-sm-2">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Entryid </span> </label>
                    <input type="text" placeholder="Entryid"
                      className="form-control margin-bottom  required" name="entryid" id="entryid" value={formData.entryid} onChange={handleInputChange} required />
                    
                  </div>
                  <div className="col-sm-2">
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
                  <div className="col-sm-2">
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
                  <div className="col-sm-2">
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
                  <div className="col-sm-2">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Employee Type </span> </label>
                    <select className="form-control" name="etype" value={formData.etype} onChange={handleInputChange}>
                      <option value="">select</option>
                      <option value="Contract">Contract</option>
                      <option value="Casual">Casual</option>
                      <option value="Outsourcing">Outsourcing</option>
                      <option value="staff">staff</option>
                    </select>
                   
                  </div>
                  <div className="col-sm-2">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Site</span> </label>
                    <select className="form-control" name="site" value={formData.site} onChange={handleInputChange}>
                      <option value="">select</option>
                      <option value="ikeja">ikeja</option>
                      <option value="ota">ota</option>
                    </select>
                  </div>
                  {formData.site === 'ota' && (
                    <div className="col-sm-2">
                      <label className="col-sm-12 col-form-label"
                        htmlFor="section_name"><span className='textblack'>Staff</span> </label>
                      <select className="form-control" name="staff" value={formData.staff} onChange={handleInputChange}>
                        <option value="">select</option>
                        <option value="LORNA">LORNA</option>
                        <option value="RIL">RIL</option>
                      </select>
                    </div>
                  )}
                  <div className="col-sm-2">
                    <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Type </span> </label>
                    <select className="form-control" name="ctype" value={formData.ctype} onChange={handleInputChange}>
                      <option value="">select</option>
                      <option value="BRAID">BRAID</option>
                      <option value="NBRAID">NON-BRAID</option>
                    </select>
                    
                  </div>
               {formData.ctype === 'NBRAID' && (
  <> {/* Wrap the JSX elements inside a div or React fragment */}
    <div className="col-sm-2">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Product </span>
      </label>
      <Select
        options={productOptions.map(option => ({ value: option.id, label: option.item_description }))}
        value={formData.product_id ? { value: formData.product_id, label: formData.item_description } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, product_id: selectedOption.value, item_description: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
    <div className="col-sm-2">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Line </span>
      </label>
      <Select
        options={lineOptions.map(option => ({ value: option.id, label: option.line_name }))}
        value={formData.line_no ? { value: formData.line_no, label: formData.line_name } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, line_no: selectedOption.value, line_name: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
    <div className="col-sm-2">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Section </span>
      </label>
      <Select
        options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
        value={formData.section ? { value: formData.section, label: formData.section_name } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
  </>
)}
{formData.ctype === 'BRAID' && (
  <> {/* Wrap the JSX elements inside a div or React fragment */}
  <div className="col-sm-2">
      <label className="col-sm-12 col-form-label" htmlFor="section_name">
        <span className='textblack'>Section </span>
      </label>
      <Select
        options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
        value={formData.section ? { value: formData.section, label: formData.section_name } : null}
        onChange={(selectedOption) => {
          setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
        }}
        isSearchable
        placeholder="Select "
      />
    </div>
                 <div className="col-sm-2">
                  <label className="col-sm-12 col-form-label"
                      htmlFor="section_name"><span className='textblack'>Zone </span> </label>
                    <select className="form-control" name="zone"  value={formData.zone} onChange={(e) => {
                                      handleInputChange(e);
                                      handleZoneChange(e);
                                    }}>
                        <option value="" >Select</option>
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
                <div className='col-sm-2'>
                 <label className="col-sm-12 col-form-label"
                      htmlFor="machine"><span className='textblack'>Choose </span> </label>
                                 
                                  <select
                                    className="form-control"
                                    name="machine1"
                                    value={formData.machine1}
                                     onChange={handleInputChange}
                                  >
                                    <option value="">Select Machine</option>
                                    {machines &&
                                      machines.map((machine, index) =>
                                        machine.trim() !== "" ? (
                                          <option key={index} value={machine}>
                                            {machine}
                                          </option>
                                        ) : null
                                      )}
                                  </select>
                  </div>
                  <div class="col-sm-2">
                   <label className="col-sm-12 col-form-label"
                      htmlFor="machine"><span className='textblack'>Machine </span> </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="machine" 
                          readOnly
                          value={renderSelectedMachines()} 
                          required 
                          style={{ background: '#ECEFF1' }} 
                        />
                    </div>
                    </>
)}
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
