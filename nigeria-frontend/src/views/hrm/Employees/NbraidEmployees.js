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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../config';

export function Employees() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [lines, setLines] = useState([])
  const [secNm, setSecNm] = useState('');
  const[Defaultdate, setEmpDate]=useState('');
  const tableRef = useRef(null);

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
  

  const handleView = (id) => {
    navigate(`/admin/hrm/ikeja/viewworkernbraid/${id}`);
  };
  const ConvertToOp = (id) => {
    navigate(`/admin/hrm/ikeja/changetooperator/${id}`);
  };
  
const [formData, setFormData] = useState({
    shift:'',
    line:'',
    sectionId: '',
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const shift = formData.shift;
    const line = formData.line;
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
    let where = `(geopos_employees.roleid != '3' AND geopos_employees.roleid !='5' AND geopos_employees.passive_type='ACT' AND geopos_employees.category_type='NBRAID')`;

    if (shift !== '') {
        where += ` AND geopos_employees.shift='${shift}'`;
    }

    if (line !== '') {
        where += ` AND geopos_employees.line='${line}'`;
    }

    if (section !== '') {
      where += ` AND geopos_employees.section_id='${section}'`;
  }


    $.ajax({
        url: `${config.apiUrl}/ikeja/get_employees_nbraid?where=${where}`,
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
          return data.zone + '<br><span style="font-size:12px;">(' + data.line + ')<br>Section : <span style="color:green;">' + data.section_name+'</span></span>'
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
          <button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash"></i></button>
           <button class="btn btn-sm btn-primary" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="ConvertToOp(${id})" title="Convert To Operator"><i class="fa fa-user"></i></button>
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

    const fetchLines = () => {
      $.ajax({
        url: `${config.apiUrl}/ikeja/getlinemaster`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setLines(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchLines();
       //Default employees data fetch
        const fetchData = () => {
        $.ajax({
            url: `${config.apiUrl}/ikeja/get_employeess_nbraid`,
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
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };

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
  
  const selectedOption = sectionName.find((data) => data.id === formData.sectionId);
  const selectedOption1 = lines.find((data) => data.line_name === formData.line);

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
                         <div className="col-sm-3">
                          <span className="textgreen">Shift</span>
                          <select
                            id="shift"
                            className="form-control"
                            name="shift" required
                             value={formData.shift} onChange={handleInputChange}
                          >
                            <option value="">Choose...</option>
                            {shiftOptions.map((shiftOption) => (
                              <option key={shiftOption.id} value={shiftOption.name}>
                                {shiftOption.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-sm-3">
                            <span className="textgreen">Line </span>
                                <Select
                                components={animatedComponents}
                                isSearchable
                                placeholder="Choose Line..."
                                value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line_name } : null}
                                onChange={(selectedOption1) => {
                                  const newValue = selectedOption1 ? selectedOption1.value : '';
                                  handleInputChange({ target: { name: 'line', value: newValue } });
                                }}
                                options={lines.map((data) => ({ value: data.line_name, label: data.line_name }))} 
                              />
                              
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
                            className="btn btn-success btn-md">
                            Search
                          </button>
                        </div>
                      </div>
                    </form>
                    </div>
                  </div>  

                  <br/><br/>
                  {formData.shift!="" && (
                      <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>Line :<span style={{color:'green'}}>{formData.line}</span> , SHIFT : <span style={{color:'green'}}>{formData.shift}</span>, SECTION : <span style={{color:'green'}}>{secNm}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{employess.length}</span></p>
                    )}
                   <p style={{fontSize:'15px',fontWeight:'bold',color:'red',textAlign:'center'}}>Attendance Showing List <span style={{color:'green'}}>Date: {Defaultdate}</span></p>
                  <table id="employee" className="display">
                    <thead>
                      <tr>
                        <th>Slno</th>
                        <th>Entry Id</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Worker Type<br/>(Shift)</th>
                        <th>Line <br/> Section</th>
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
       </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default Employees;
