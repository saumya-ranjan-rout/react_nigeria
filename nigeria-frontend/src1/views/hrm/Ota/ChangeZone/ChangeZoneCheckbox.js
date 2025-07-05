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

export function ChangeZoneCheckbox() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [items ,setItems] = useState([]);

  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [machines, setMachines] = useState([])
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


    useEffect(() => {

       document.title = 'Add Assign Operator';
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
    fetchSectionOptions()
     
    }
  }, []);


  //get items
  useEffect(() => {
   
      $.ajax({
        url: `${config.apiUrl}/ota/getZonedata`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
   
  }, []);

 //submit assign data
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
  
    let where = `(employees_ota.roleid != '3' AND employees_ota.roleid !='5' AND employees_ota.passive_type='ACT' AND employees_ota.category_type='BRAID')`;
  
    if (zone !== '') {
        where += ` AND employees_ota.zone='${zone}'`;
    }
  
    if (shift !== '') {
        where += ` AND employees_ota.shift='${shift}'`;
    }
  
    if (machine !== '') {
        where += ` AND employees_ota.machine LIKE '%${machine+','}%'`;
    }
  
    if (section !== '') {
      where += ` AND employees_ota.section_id='${section}'`;
    }
  
    const encodedWhere = encodeURIComponent(where);
  
    $.ajax({
        url: `${config.apiUrl}/ota/get_zonedata_search?where=${encodedWhere}`,
        method: 'GET',
        headers: customHeaders,
    })
    .done((response) => {
      // Set the fetched data in the state
      setItems(response);
    })
    .fail((error) => {
      console.log(error);
    });
  }


  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  //////////////
//Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}

const filteredData = items.filter((row) => {
  return row.name.toLowerCase().includes(searchValue.toLowerCase())
})
//For check box
const [checkedItems, setCheckedItems] = useState([])
const [isChecked, setIsEnabled] = useState(false)

const handleCheckAll = (event) => {
  const { checked } = event.target

  if (checked) {
    setIsEnabled(true)
    // Get the IDs of all items in your table and set them in the state
    const allItemIds = items.map((item) => item.id)
    setCheckedItems(allItemIds)
  } else {
    setIsEnabled(false)
    // Uncheck all items
    setCheckedItems([])
  }
}
//Variable set for send tomove
const [checkboxValue, setCheckboxValue] = useState('')

const handleCheckSingle = (event, itemId) => {
  const { checked } = event.target
  setCheckboxValue(itemId)
  if (checked) {
    setIsEnabled(true)
    // Add the item ID to the checkedItems array
    setCheckedItems((prevCheckedItems) => [...prevCheckedItems, itemId])
  } else {
    setIsEnabled(false)
    // Remove the item ID from the checkedItems array
    setCheckedItems((prevCheckedItems) => prevCheckedItems.filter((id) => id !== itemId))
  }
}
 

//move data to shift update
const handleMove = (entryIds) => {
    const queryParams = checkedItems.map((items) => `entryIds=${items}`).join('&');
     navigate(`/admin/hrm/ota/multiplezonechangeota?${queryParams}`);
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

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
  
const selectedOption = sectionName.find((data) => data.id === formData.sectionId);

  return (
    <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Change Zone</CardTitle>
              </CardHeader>
              <CardBody>
            <form  onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-2">
                    <span className="textgreen">Shift</span> <span className='textred'>*</span>
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
                
                      <span className="textgreen">Zone</span> <span className='textred'>*</span>
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
                      View
                    </button>
                  </div>
                </div>
                <br/>
            </form>
          
             
            {/* Display Input Field Values */}
          
            <div style={{ display: 'flex' }}>
                  <input
                    className='form-control'
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    style={{ width: '40%' }}
                  /> &nbsp;&nbsp;
                  <button
                    className='btn btn-success'
                    style={{ color: '#fff' }}
                    disabled={!isChecked}
                    type="submit"
                    onClick={handleMove}
                  >
                    Multiple Change
                  </button>
                </div>


            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={handleCheckAll} />All</th>
                    <th>Entry ID</th>
                    <th>Name</th>
                    <th>User Role</th>
                    <th>WorkerType<br/>(Shift)</th>
                    <th>Zone<br/>(Machine)</th>
                  </tr>
                </thead>
                <tbody>
                {filteredData.map((row, index) => (
                    <tr key={row.id}>
                      <td scope="row">
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(row.id)}
                          onChange={(event) => handleCheckSingle(event, row.id)}
                          name="check[]"
                          value={row.id}
                        />
                      </td>
                      <td>{row.entryid}</td>
                      <td>{row.name}</td>
                      <td>{row.role}</td>
                      <td>
                          {row.workertype + '(' + row.shift + ')'}
                      </td>
                      <td>
                        <span style={{ color: 'blue', fontWeight: 'bold' }}>
                            {row.zone}
                        </span>
                        <br />
                        <span style={{ fontSize: '12px' }}>
                            {formatMachineNames(row.machine)}
                            <br />
                            <b>Section:</b>
                            <span style={{ color: 'green' }}>{row.section_name}</span>
                        </span>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default ChangeZoneCheckbox;
