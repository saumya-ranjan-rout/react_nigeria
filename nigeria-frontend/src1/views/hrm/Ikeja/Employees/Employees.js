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
import '../../Loader.css' // Import the CSS file

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
  Modal, // Import Modal from reactstrap
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import $ from 'jquery';
import axios from 'axios';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../../config';


function Employees() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [machines, setMachines] = useState([])
  const[Defaultdate, setEmpDate]=useState('');
  const [secNm, setSecNm] = useState('');
  const tableRef = useRef(null);
  const [modal, setModal] = useState(false); // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Selected employee for transfer
  const [employeeData, setEmployeeData] = useState(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);
 
 

  const handleView = (id) => {
    navigate(`/admin/hrm/ikeja/viewworker/${id}`);
  };
  const ConvertToOp = (id) => {
    navigate(`/admin/hrm/ikeja/changetooperator/${id}`);
  };

  const handleTransfer = async (id) => {
  setSelectedEmployee(id);
  setModal(true);
  try {
    const response = await axios.get(`${config.apiUrl}/ikeja/operator_data_single/${id}`, { headers: customHeaders });
    setEmployeeData(response.data);
  } catch (error) {
    console.error('Error fetching dates:', error);
  }
};

  const toggleModal = () => {
    setModal(!modal);
  };
  

  // Define a function to format machine names with breaks
  function formatMachineNames(machineNames) {
    if (machineNames) {
      const machinesArray = machineNames.split(',');
      const lines = [];
  
      for (let i = 0; i < machinesArray.length; i += 3) {
        const line = machinesArray.slice(i, i + 3).join(', ');
        lines.push(line);
      }
  
      return lines.join('<br>');
    } else {
      return ''; // or any other appropriate default value
    }
  }

const [formData, setFormData] = useState({
    shift:'',
    zone:'',
    machine:'',
    sectionId: '',
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const shift = formData.shift;
    const zone = formData.zone;
    const machine = formData.machine;
    const section = formData.sectionId;
    $.ajax({
      url: `${config.apiUrl}/ikeja/getSectionName/${formData.sectionId}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setSecNm(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section options:', error);
      },
    });
    let where = `(geopos_employees.roleid != '3' AND geopos_employees.roleid !='5' AND geopos_employees.passive_type='ACT')`;

    if (zone !== '') {
        where += ` AND geopos_employees.zone='${zone}'`;
    }

    if (shift !== '') {
        where += ` AND geopos_employees.shift='${shift}'`;
    }
    if (machine !== '') {
      const machinec = machine.endsWith(',') ? machine : machine + ',';
      where += ` AND geopos_employees.machine LIKE '%${machinec}%'`;
    }

    if (section !== '') {
      where += ` AND geopos_employees.section_id='${section}'`;
    }
   
    const encodedWhere = encodeURIComponent(where);

    $.ajax({
        url: `${config.apiUrl}/ikeja/get_employees?where=${encodedWhere}`,
        method: 'GET',
        headers: customHeaders,
    })
    .done((response) => {
      // Set the fetched data in the state
      setEmployees(response);
    })
    .fail((error) => {
      console.log(error);
    });
  }
  
 
// Destroy the existing DataTable instance (if it exists)
if ($.fn.DataTable.isDataTable('#employee')) {
    $('#employee').DataTable().destroy();
  }

  // Initialize the DataTable with the updated data
  tableRef.current = $('#employee').DataTable({
      dom: 'Bfrtip',
       dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
      buttons: [
      {
          extend: 'copy',
          exportOptions: {
          columns: ':not(.action-column)', // Exclude columns with class 'action-column'
          },
      },
      {
          extend: 'csv',
          filename: 'Employees Details',
          exportOptions: {
          columns: ':not(.action-column)',
          },
      },
      ],
      data: employess,
      columns: [
      { data: null },
      { data: 'entryid' },
      { data: 'name' },
      { data: 'role' },
      {
          data: null,
          render: function (data, type, row) {
          if (row.status === 'P') {
              return (
              data.workertype +
              '<br>(' +
              data.shift +
              ')<br><span style="color: blue;">Present</span>'
              )
          } else {
              return (
              data.workertype +
              '<br>(' +
              data.shift +
              ')<br><span style="color: red;">Absent</span>'
              )
          }
          },
      },
      {
          data: null,
          render: function (data, type, row) {
          const formattedMachineNames = formatMachineNames(data.machine);  
          return data.zone + '<br><span style="font-size:12px;">(' + formattedMachineNames + ')<br>Section : <span style="color:green;">' + data.section_name+'</span></span>'
          },
      },
      { data: null, className: 'action-column' }, // Add class 'action-column' to the action column
      ],
      columnDefs: [
      {
          targets: 0,
          render: function (data, type, row, meta) {
          // Render the row index starting from 1
          return meta.row + 1
          },
      },
      {
          targets: 6,
          render: function (data, type, row, meta) {
          const id = row.id
          return `
          <span style="display:in-line"> 
          <button class="btn btn-sm btn-info" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleView(${id})" title="View"><i class="fa fa-eye"></i></button>
          <button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash"></i></button>
          <button class="btn btn-sm btn-primary" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="ConvertToOp(${id})" title="Convert To Operator"><i class="fa fa-user"></i></button>
          <button class="btn btn-sm btn-warning" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px;" onclick="handleTransfer(${id})" title="Transfer"><i class="fa fa-arrow-circle-right"></i></button>
          </span>
          `
          },
      },
      ],
  });

  useEffect(() => {
    document.title = 'Employees List';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
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

    fetchSectionOptions();
       //Default employees data fetch
    const fetchData = () => {
      $.ajax({
        url: `${config.apiUrl}/ikeja/get_employeess`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          // Set the fetched data in the state
          setEmployees(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });
    };
    fetchData();
    //Default employees date fetch
    const fetchDate = () => {
      $.ajax({
          url: `${config.apiUrl}/ikeja/get_employeess_nbraid_date`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
          // Set the fetched data in the state
          setEmpDate(response.date);
          },
          error: function (xhr, status, error) {
          console.log(error);
          },
      });
    };
    fetchDate();
    }

    // Attach the functions to the window object
    window.handleDelete = handleDelete;
    window.handleView = handleView;
    window.ConvertToOp = ConvertToOp;
    window.handleTransfer = handleTransfer;
  }, []);



  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/ikeja/delete_user/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
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


const handleTransferConfirmation = async () => {
    try {
      // Prepare data to send to API endpoint
      const transferData = {
        ...employeeData, // Spread all employeeData properties
        staff: formData.staff // Add selected staff to the data
      };

      // Make POST request to your API endpoint
      const response = await axios.post(`${config.apiUrl}/ikejaemployeetransfer`, transferData, {
        headers: customHeaders
      });

      // Handle success response from API
      console.log('Transfer successful:', response.data); // Log the response or handle it as needed

      // Close the modal after successful transfer
      toggleModal();

      // Set server message and its class based on response
    if (response.data.status === 'Success') {
      setServerMessage(response.data.message);
      setServerMessageClass('alert alert-success');
       // Auto refresh page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000); // 5000 milliseconds = 5 seconds
    } else {
      setServerMessage(response.data.message);
      setServerMessageClass('alert alert-warning');
    }

    } catch (error) {
      // Handle error from API request
      console.error('Error transferring employee:', error);
      // Optionally show an error message or take appropriate action
    }
  };
  
const selectedOption = sectionName.find((data) => data.id === formData.sectionId);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
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
                <CardTitle tag="h5">Filter</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
   
                <div className='row'>
                  <div className='col-md-12'>
                    <form  onSubmit={handleSubmit} method='POST'>
                              <div className="row space">
                                 <div className="col-sm-2">
                                  <span className="textgreen">Shift</span>
                                  <select
                                    id="shift"
                                    className="form-control"
                                    name="shift"required
                                     value={formData.shift} onChange={handleInputChange}
                                  >
                                    <option value="">Select Shift</option>
                                    {shiftOptions.map((shiftOption) => (
                                      <option key={shiftOption.id} value={shiftOption.name}>
                                        {shiftOption.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-sm-2">
                              
                                     <span className="textgreen">Zone</span>
                                     <select className="form-control"  name="zone" value={formData.zone} onChange={(e) => {
                                      handleInputChange(e);
                                      handleZoneChange(e);
                                    }}>
                                        <option value="">Choose</option>
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
                                  <span className="textgreen">Machine</span>
                                  <select
                                    className="form-control"
                                    name="machine"
                                    value={formData.machine}
                                    onChange={(e) => {
                                      handleInputChange(e);
                                    }}
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

                                  <div className="col-sm-3">
                                    <span className="textgreen">Section Name</span>
                                    <Select
                                        components={animatedComponents}
                                        isSearchable
                                        placeholder="Choose Section..."
                                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                                        onChange={(selectedOption) => {
                                          const newValue = selectedOption ? selectedOption.value : '';
                                          handleInputChange({ target: { name: 'sectionId', value: newValue } });
                                        }}
                                        options={sectionName.map((data) => ({ value: data.id, label: data.section_name }))} 
                                      />
                                  
                                  </div>

                                <div className="col-sm-2">
                                  <button
                                    type="submit"
                                    className="btn btn-success btn-md"
                                  >
                                    Search
                                  </button>
                                </div>
                              </div>
                    </form>
                  </div>
                </div>  

                <br/><br/>
                  {formData.shift!="" && (
                      <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>ZONE :<span style={{color:'green'}}>{formData.zone}</span> , SHIFT : <span style={{color:'green'}}>{formData.shift}</span>, SECTION : <span style={{color:'green'}}>{secNm}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{employess.length}</span></p>
                    )}
                   <p style={{fontSize:'15px',fontWeight:'bold',color:'red',textAlign:'center'}}>Attendance Showing List <span style={{color:'green'}}>Date: {Defaultdate}</span></p>
                   <div className="table-responsive">
                  <table id="employee" className="display">
                    <thead>
                      <tr>
                        <th>Slno</th>
                        <th>Entry Id</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Worker Type<br/>(Shift)</th>
                        <th>Zone <br/> Machine <br/> Section</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    <tfoot>
                    <tr>
                        <th>Slno</th>
                        <th>Entry Id</th>
                        <th>Name</th>
                        <th>User Role</th>
                        <th>Worker Type<br/>(Shift)</th>
                        <th>Product <br/>(Line) <br/>Section</th>
                        <th>Action</th>
                      </tr>
                    </tfoot>
                  </table>
                  </div>
         </CardBody>
            </Card>
          </Col>
        </Row>


        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Transfer</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to transfer this employee to <span className="badge-success">OTA</span> Site ?</p>
            <p>It will remove master data from Employee Master.</p>
           
           
          </ModalBody>
          <ModalFooter>
         
          <select  className="form-control" name="staff" required value={formData.staff} onChange={handleInputChange}>
                                 <option value="Select Staff">Select Staff</option>
                                <option value="LORNA" selected>LORNA</option>
                                 <option value="RIL">RIL</option>
          </select>
            <Button color="secondary" onClick={toggleModal}>
              Close
            </Button>{' '}
            <Button color="primary" onClick={handleTransferConfirmation}>
              Yes
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    
  );
}

export default Employees;
