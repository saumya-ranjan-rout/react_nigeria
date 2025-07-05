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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function ChangeZone() {
  const { t } = useTranslation();
  //const [itemCategories, setItemCategories] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const animatedComponents = makeAnimated();
  
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [machines, setMachines] = useState([])
  const [lineOptions, setLineOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
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
      { data: 'site' },
      { data: 'emptype' },
      {
          data: null,
          render: function (data, type, row) {
              return data.workertype + '<br/>(' + data.shift + ')';
          },
      },
      {
        data: null,
        render: function (data, type, row) {
            return (
                (data.item_names ? data.item_names : '') + '<br />(' +
                (data.line ? data.line : '') + ')<br />' +
                '<b>' + t('Section') + ':</b><span style="color: green;">' + 
                (data.section_names ? data.section_names : '') + 
                '</span>'
            );
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
const fetchLineOptions = (id) => {
  //alert(id);
     $.ajax({
       url: `${config.apiUrl}/getLineOptions/${id}`,
       method: 'GET',
       headers: customHeaders,
       success: function (response) {
         console.log('Line options:', response); // Add this line for debugging
        // alert(response);
         setLineOptions(response);
       },
       error: function (xhr, status, error) {
         console.error('Error fetching line options:', error);
       },
     });
   };
  useEffect(() => {
    document.title = 'Change Zone';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
        const fetchOperatorData = () => {
            fetch(`${config.apiUrl}/getZonedata`,{headers: customHeaders})
              .then((response) => response.json())
              .then((data) => setZoneData(data))
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
    fetchSectionOptions()
    const fetchProductname = () => {
      $.ajax({
      url: `${config.apiUrl}/getProductOptions`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setProductOptions(response);
      },
      error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
      },
      });
  }
  fetchProductname();
    }
  }, []);

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

  //move data to shift update
  const handleMove = (entryIds) => {
    const queryParams = selectedEmployees.map((employee) => `entryIds=${employee.value}`).join('&');
    navigate(`/admin/hrm/multiplezonechange?${queryParams}`);
  };

  

const [formData, setFormData] = useState({
  shift: '',
  product: '',
  line: '',
  section: '',
  item_description: '',
  section_name: '',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;

  if (name === 'section') {
    const selectedSection = sectionName.find((sections) => sections.id === value);
    const sectionNamee = selectedSection ? selectedSection.section_name : '';
    setFormData((prevFormData) => ({
      ...prevFormData,
      section: value,
      section_name: sectionNamee,
    }));

    //alert(JSON.stringify(formData));
  } else if (name === 'product') {
    const selectedProduct = productOptions.find((products) => products.id === value);
    const productName = selectedProduct ? selectedProduct.item_description : '';
    setFormData((prevFormData) => ({
      ...prevFormData,
      product: value,
      item_description: productName,
    }));
  } else {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }


};
const handleSubmit = (event) => {
  event.preventDefault();
  const shift = formData.shift;
  const product_name = formData.product_name;
  const line = formData.line;
  
  const section = formData.section;

  let where = `(employees_moz.roleid = 1 AND employees_moz.passive_type = 'ACT')`;

  if (product_name !== '' && product_name !== undefined && product_name != null) {
      where += `AND find_in_set(${product_name}, employees_moz.product)`;
  }

  if (shift !== '' && shift !== undefined && shift != null) {
      where += `AND employees_moz.shift = '${shift}'`;
  }
 
  
  if (line !== '' && line !== undefined && line != null) {
    where += `AND employees_moz.line = '${line}'`;
  }

  if (section !== '' && section !== undefined && section != null) {
    where += `AND find_in_set(${section}, employees_moz.section_id)`;
   }
   const encodedWhere = encodeURIComponent(where);

  $.ajax({
    url: `${config.apiUrl}/get_zonedata_search?where=${encodedWhere}`,
      method: 'GET',
      headers: customHeaders,
  })
  .done((response) => {
    // Set the fetched data in the state
    setZoneData(response);
  })
  .fail((error) => {
    console.log(error);
  });
}

// const [searchValue, setSearchValue] = useState('')
// const handleSearchChange = (event) => {
//   setSearchValue(event.target.value)
// }
// const filteredData = employeedata.filter((row) => {
//   return row.name.toLowerCase().includes(searchValue.toLowerCase())
// });

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
  const selectedOption = sectionName.find((data) => data.id === formData.section);
  const selectedOption1 = lineOptions.find((data) => data.line === formData.line);
  const selectedOption3 = productOptions.find((data) => data.id === formData.product);
  return (
    <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Change Zone[Filter]</CardTitle>   <hr/>
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
                      name="shift" 
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
                    <span className="textgreen">Product Name </span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Product Name..."
                        value={selectedOption3 ? { value: selectedOption3.id, label: selectedOption3.item_description } : null}
                        onChange={(selectedOption3) => {
                          const newValue = selectedOption3 ? selectedOption3.value : '';
                          handleInputChange({ target: { name: 'product', value: newValue } });
                          fetchLineOptions(selectedOption3.value);
                        }}
                        options={productOptions.map((data) => ({ value: data.id, label: data.item_description }))} 
                      />
                  
                  </div> 
                
                <div className="col-sm-2">
                    <span className="textgreen">Line </span>
                        <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Line..."
                        value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line } : null}
                        onChange={(selectedOption1) => {
                          const newValue = selectedOption1 ? selectedOption1.value : '';
                          handleInputChange({ target: { name: 'line', value: newValue } });
                        }}
                        options={lineOptions.map((data) => ({ value: data.line, label: data.line }))} 
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
                      handleInputChange({ target: { name: 'section', value: newValue } });
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

          <br/>
          {formData.shift!="" && (
                      <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>PRODUCT :<span style={{color:'green'}}>{formData.item_description}</span> , LINE : <span style={{color:'green'}}>{formData.line}</span>, SECTION : <span style={{color:'green'}}>{formData.section_name}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{zoneData.length}</span></p>
                    )}
          <hr/>
      
          <form method='POST'>
            <div className="row space">
             {/*<div className="col-sm-5">
                              <br/>
                              <input
                                  className='form-control'
                                  type="text"
                                  value={searchValue}
                                  onChange={handleSearchChange}
                                  placeholder="Search..."
                                  style={{ width: '100%' }}
                                />  
                              </div>*/}
              <div className="col-sm-6">
                <span className="textgreen">Choose Employees*</span>
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
          <div className="table-responsive">
          <table id="changezone" className="display">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('Entryid')}</th>
                    <th>{t('Name')}</th>
                    <th>{t('Site')}</th>
                    <th>{t('UserRole')}</th>
                    <th>{t('Worker Type')}<br />({t('Shift')})</th>
                    <th>{t('Product Name')}<br />({t('Line')})<br />{t('Section')}</th>
               
              </tr>
            </thead>
            <tbody>
           
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

export default ChangeZone;
