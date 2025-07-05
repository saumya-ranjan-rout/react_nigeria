import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
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
import makeAnimated from 'react-select/animated';
//DB Connection
import config from '../../../../config';


export function ChangeWorker() {
  const [zoneData, setShiftData] = useState([]);
  const animatedComponents = makeAnimated();
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [workerTyp, setWorkerTypName] = useState([]);
  const [lines, setLine] = useState([])
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
// Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#changezone')) {
    $('#changezone').DataTable().destroy();
  }

// Initialize the DataTable with the updated data
tableRef.current = $('#changezone').DataTable({
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
  data: zoneData,
  columns: [
      { data: null}, // Added defaultContent and orderable for the index column
      { data: 'entryid' },
      { data: 'name' },
      { data: 'role' },
      {
          data: null,
          render: function (data, type, row) {
              return data.workertype + '(' + data.shift + ')';
          },
      },
      {
        data: null,
        render: function (data, type, row) {
          if (row.category_type === "NBRAID") {
           
            return ('<span style="font-size:12px;">(' +
            data.line  +
            ')<br><b>Section:</b> <span style="color:green;">' +
            data.section_name +
            '</span></span>')
          } else {
            return ('<span style="font-size:12px;">(' +
            data.zone  +
            ')<span style="font-size:12px;">(' +
            data.machine  +
            ')<br><br><b>Section:</b> <span style="color:green;">' +
            data.section_name +
            '</span></span>')
          }
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

  useEffect(() => {
    document.title = 'Change Worker';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
        const fetchOperatorData = () => {
            fetch(`${config.apiUrl}/ota/getWorkerTypeDefaultData`,{headers: customHeaders})
              .then((response) => response.json())
              .then((data) => setShiftData(data))
              .catch((error) => console.error('Error fetching employee data:', error));
          };
          fetchOperatorData();

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

    const fetchWorkertypOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getworkertype`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setWorkerTypName(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };
    fetchWorkertypOptions()
   // Fetch line type from API
   const fetchLine = () => {
    $.ajax({
    url: `${config.apiUrl}/ikeja/getlinemaster`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
        setLine(response);
    },
    error: function (xhr, status, error) {
        console.error('Error fetching section options:', error);
    },
    });
    
    }
    fetchLine();


    }
  }, []);


  //move data to shift update
  const handleMove = (entryIds) => {
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
     navigate(`/admin/hrm/ota/multipleworkertypechangeota?${queryParams}`);
  };

  

const [formData, setFormData] = useState({
  shift:'',
  line:'',
  sectionId: '',
  wtype:'',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};
const handleSubmit = (event) => {
  event.preventDefault();
  const shift = formData.shift;
  const line = formData.line;
  const wtype = formData.wtype;
  const section = formData.sectionId;
  let where = `(employees_ota.roleid != '3' AND employees_ota.roleid !='5') AND employees_ota.passive_type='ACT'`;

  if (section !== '') {
      where += ` AND employees_ota.section_id='${section}'`;
  }

  if (shift !== '') {
      where += ` AND employees_ota.shift='${shift}'`;
  }

  if (line !== '') {
    where += ` AND employees_ota.line='${line}'`;
  }

   if (wtype !== '') {
    where += ` AND employees_ota.workertype='${wtype}'`;
   }


  $.ajax({
      url: `${config.apiUrl}/ota/get_workerdata_search?where=${where}`,
      method: 'GET',
      headers: customHeaders,
  })
  .done((response) => {
    // Set the fetched data in the state
    setShiftData(response);
  })
  .fail((error) => {
    console.log(error);
  });
}

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };

const selectedOption = lines.find((data) => data.id === formData.line);
const selectedOption1 = sectionName.find((data) => data.id === formData.sectionId);
  return (
    <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Change Worker</CardTitle>
                <br/>
                <h6 >Filter</h6>
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
                      name="shift" required
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
                    <span className="textgreen">Worker Type</span>
                    <select
                      id="wtype"
                      className="form-control"
                      name="wtype" 
                      value={formData.wtype} onChange={handleInputChange}
                    >
                      <option value="">Select Type</option>
                      {workerTyp.map((worker) => (
                        <option key={worker.id} value={worker.name}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Line</span>
                        <Select
                      components={animatedComponents}
                      isSearchable
                      placeholder="Choose line..."
                      value={selectedOption ? { value: selectedOption.id, label: selectedOption.line_name } : null}
                      onChange={(selectedOption) => {
                        const newValue = selectedOption ? selectedOption.value : '';
                        handleInputChange({ target: { name: 'line', value: newValue } });
                      }}
                      options={lines.map((data) => ({ value: data.id, label: data.line_name }))}
                    />
                </div>

                  <div className="col-sm-3">
                    <span className="textgreen">Section Name</span>
                  
                  <Select
                      components={animatedComponents}
                      isSearchable
                      placeholder="Choose section..."
                      value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.section_name } : null}
                      onChange={(selectedOption1) => {
                        const newValue = selectedOption1 ? selectedOption1.value : '';
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
                      View
                    </button>
                  </div>
                </div>
            </form>
            </div>
          </div>

          <br/>
          <hr/>
      
      <form method='POST'>
        <div className="row space">
          <div className="col-sm-6">
            <span className="textgreen">Choose Employees</span> <span className='textred'>*</span>
            <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                required
                name="section_id"
                options={zoneData.map((employee) => ({
                  value: employee.id,
                  label: `${employee.entryid} (${employee.name})`,
                }))}
                value={selectedEmployees}
                onChange={(selectedOptions) => {
                  setSelectedEmployees(selectedOptions);
                // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                //  alert(sectionIds);
                }}
                isSearchable
                placeholder="Choose Employees"
              />
          </div>
             
          <div className="col-sm-2"><br/>
          <input
            className="btn btn-success btn-sm"
            value="Multiple Change"
            id="btnw"
            readOnly=""
            style={{ width: '150px', color: '#fff' }}
            //onClick={() => handleMove(selectedEntryId)}
            onClick={() => handleMove(selectedEmployees)}
            disabled={selectedEmployees.length == 0}
          />
        </div>
                  
      </div>
   </form>
          
          <table id="changezone" className="display">
            <thead>
              <tr>
                <th>Slno</th>
                <th>Entry ID</th>
                <th>Name</th>
                <th>User Role</th>
                <th>WorkerType<br/>(Shift)</th>
                <th>(Line)/Zone/machine <br/>Section</th>
               
              </tr>
            </thead>
            <tbody>
           
            </tbody>
          </table>
        </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default ChangeWorker;
