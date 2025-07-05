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

export function ChangeZoneNbraidCheckbox() {
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [items ,setItems] = useState([]);

  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [lines, setLine] = useState([])
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


  //get items
  useEffect(() => {
   
      $.ajax({
        url: `${config.apiUrl}/ikeja/getZonedataNbraid`,
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
        url: `${config.apiUrl}/ikeja/get_zoneNbraid_search?where=${where}`,
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
    navigate(`/admin/hrm/ikeja/multiplezonenbraid?${queryParams}`);
  };

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
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
                <CardTitle tag="h5">Change Zone</CardTitle>
              </CardHeader>
              <CardBody>
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
                      <option value="">Select Shift</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.name}>
                          {shiftOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Line</span>
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
                      className="btn btn-success btn-md"
                    >
                      Search
                    </button>
                  </div>
                </div>
            </form>
           
            <br/>
            <hr/>
             
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
                    <th>Line<br/>(section)</th>
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
                        
                        <span style={{ fontSize: '12px' }}>
                            {'('+row.line+')'}
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

export default ChangeZoneNbraidCheckbox;
