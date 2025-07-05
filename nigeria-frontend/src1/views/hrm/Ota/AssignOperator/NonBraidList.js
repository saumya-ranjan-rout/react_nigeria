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
} from "reactstrap";
import $ from 'jquery';
import Select from 'react-select';
//DB Connection
import config from '../../../../config';


export function NonBraidAssignList() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [workList, setAssignNbraidList] = useState([])
  const tableRef = useRef(null);
  const [data, setData] = useState([]);
  const [name, setName] = useState([]);
  const [shift, setShift] = useState([]);
  const [line, setLine] = useState([]);
  const [sectionName, setSectionName] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

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


    const [formData, setFormData] = useState({
       
       operator_name: '',
       line_no: '',
       section: '',
       shift: '',
    });


useEffect(() => {
  document.title = 'Employee Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
   navigate('/login');
  } else {
    window.handleDelete = handleDelete;
    const fetchUsers = () => {
      $.ajax({
        url: `${config.apiUrl}/ota/get_operator_nbraid_assign_list`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setAssignNbraidList(response);
          // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#asssignNbraid')) {
          $('#asssignNbraid').DataTable().destroy();
        }
        // Initialize the DataTable with the updated data
        tableRef.current = $('#asssignNbraid').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
              {
                  extend: 'copy',
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
              {
                  extend: 'csv',
                  filename: 'Assign_NBraid_list_Details', // Removed space in filename
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
          ],
          data: response,
          columns: [
              { data: null},
              { data: 'name'}, // Added defaultContent and orderable for the index column
              { data: 'entryid' },
              { data: 'line' },
              { data: 'section_name' },
              { data: 'shift' },
              {
                data: null,
                render: function (data, type, row) {
                  const id = data.id;
                  
                    return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                
                },
              }
          
          ],
          columnDefs: [
              {
                  targets: 0,
                  render: function (data, type, row, meta) {
                      // Render the row index starting from 1
                      return meta.row + 1; // Changed to use meta.row for the index
                  },
              },
          ],
          });


        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };
    fetchUsers();

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

      const fetchOperatorOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/getOtaOperatorOptions`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setOperatorOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching product options:', error);
          },
        });
      };

      fetchOperatorOptions();
  }
}, []); 

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/ota/delete_assign_list/${id}`,
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
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/ota/search_operator_assignlist_ota`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, name, shift, line, section_name } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setName(name);
        setShift(shift);
        setLine(line);
        setSectionName(section_name);

        
       


         // Initialize the DataTable with the updated data and filename
          initializeTable(timesheet);
          },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    };

    const initializeTable = (timesheet) => {
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#asssignNbraid')) {
            $('#asssignNbraid').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#asssignNbraid').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
              {
                  extend: 'copy',
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
              {
                  extend: 'csv',
                  filename: 'Employees_Details', // Removed space in filename
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
          ],
          data: timesheet,
          columns: [
              { data: null},
              { data: 'name'}, // Added defaultContent and orderable for the index column
              { data: 'entryid' },
              { data: 'line' },
              { data: 'section_name' },
              { data: 'shift' },
              {
                data: null,
                render: function (data, type, row) {
                  const id = data.id;
                  
                    return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                
                },
              }
          
          ],
          columnDefs: [
              {
                  targets: 0,
                  render: function (data, type, row, meta) {
                      // Render the row index starting from 1
                      return meta.row + 1; // Changed to use meta.row for the index
                  },
              },
          ],
        });
    };

   const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
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
                <CardTitle tag="h5">Show List of work assign to operator</CardTitle>
              </CardHeader>
              <CardBody>
              <form onSubmit={handleSubmit} method='POST' >
                  <div className="row">

                  <div className="col-sm-3">
                        <span className="textgreen">Operator </span>
                        <Select
                          options={operatorOptions.map(option => ({ value: option.id, label: option.name }))}
                          value={formData.operator_name ? { value: formData.operator_name, label: formData.name } : null}
                          onChange={(selectedOption) => {
                            setFormData({ ...formData, operator_name: selectedOption.value, name: selectedOption.label });
                            
                          }}
                          isSearchable
                          placeholder="Select Operator"
                        />
                      </div>
                   
                      <div className="col-sm-2">
                        <span className="textgreen">Shift</span>
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
                      
                      <div className="col-sm-2">
                        <span className="textgreen">Line </span>
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
                      <div className="col-sm-3">
                          <span className="textgreen">Section Name </span>
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
                      <div className="col-sm-1 mt-2">
                        <button
                          type="submit"
                          className="btn btn-success btn-md"
                        >
                          View
                        </button>
                      </div>

                    
                  </div>
                 
                  
                </form>

                 <div>
             
               
                  <h6 className="header-filter">
                    Showing list of &nbsp;
                    <span className="textgreen">Shift: </span> <span className="textred"> {shift}</span>&nbsp;
                     <span className="textgreen">Line: </span> <span className="textred"> {line}</span>&nbsp;
                      <span className="textgreen">Section: </span> <span className="textred"> {sectionName}</span>&nbsp;
                       <span className="textgreen">Name: </span> <span className="textred"> {name}</span>
                    
                  </h6>
                
             
                </div>

             <div className='row mt-4'>
                <div className='col-md-12'>
                 <div className="table-responsive">
                <table id="asssignNbraid" className="display">
                        <thead>
                            <tr>
                                <th>Slno</th>
                                <th>Name</th>
                                <th>EntryId</th>
                                <th>Line</th>
                                <th>Section Name</th>
                                <th>shift</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    </div>
                </div>
             </div>
        
         </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
     </>
  );
}

export default NonBraidAssignList;
