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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function Employees() {
  const { t } = useTranslation();
  const animatedComponents = makeAnimated();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [employess, setEmployees] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([])
  const [zone, setZone] = useState([]) 
  const [machines, setMachines] = useState([])
  const [lineOptions, setLineOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const[Defaultdate, setEmpDate]=useState('');
  const [secNm, setSecNm] = useState('');
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
    navigate(`/admin/hrm/viewworker/${id}`);
  };
  const ConvertToOp = (id) => {
    navigate(`/admin/hrm/ikeja/changetooperator/${id}`);
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
///////
const [formData, setFormData] = useState({
  product: '',
  product_name: '',
  line: '',
  sectionId: '',
  section_name: '',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;

  if (name === 'sectionId') {
    const selectedSection = sectionName.find((sections) => sections.id === value);
    const sectionNamee = selectedSection ? selectedSection.section_name : '';
    setFormData((prevFormData) => ({
      ...prevFormData,
      sectionId: value,
      section_name: sectionNamee,
    }));
  } else if (name === 'product') {
    const selectedProduct = productOptions.find((products) => products.id === value);
    const productName = selectedProduct ? selectedProduct.item_description : '';
    setFormData((prevFormData) => ({
      ...prevFormData,
      product: value,
      product_name: productName,
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
    const line = formData.line;
    const product = formData.product;
    const section = formData.sectionId;

    let where = `(employees_moz.roleid != '3')`;

    if (product !== '') {
        where += ` AND employees_moz.product='${product}'`;
    }

    if (line !== '') {
        where += ` AND employees_moz.line='${line}'`;
    }

    if (section !== '') {
      where += ` AND employees_moz.section_id='${section}'`;
  }


    $.ajax({
        url: `${config.apiUrl}/get_employees?where=${where}`,
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
      
          return (data.item_description ? data.item_description : '')  + '<br><span style="font-size:12px;">(' + (data.line ? data.line : '') + ')<br>Section : <span style="color:green;">' + (data.section_name ? data.section_name : '') + '</span></span>'
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
           </span>
          `
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
    const fetchSection = () => {
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
  }
  fetchSection();


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
       //Default employees data fetch
    const fetchData = () => {
      $.ajax({
        url: `${config.apiUrl}/get_employeess`,
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
          url: `${config.apiUrl}/get_employeess_nbraid_date`,
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



  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/delete_user/${id}`,
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

  
const selectedOption = sectionName.find((data) => data.id === formData.sectionId);
const selectedOption1 = lineOptions.find((data) => data.line === formData.line);
const selectedOption3 = productOptions.find((data) => data.id === formData.product);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }
  let star = {
    color: 'red',
    fontSize: '15px',
  }
  return (
     <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
              <Link to={`/admin/hrm/addworker`}>
                  <button className="btn btn-info" style={{color:'#fff'}}>
                    Add Worker
                  </button>
                </Link>
                <hr></hr>
                <CardTitle tag="h6">Filter</CardTitle>
               
              </CardHeader>
              <CardBody>
   
                <div className='row'>
                  <div className='col-md-12'>
                    <form  onSubmit={handleSubmit} method='POST'>
                              <div className="row space">
                             
                              <div className="col-sm-3">
                    <span className="textgreen">Product Name <span style={star}>*</span></span>
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
                        options={productOptions.map((data) => ({ value: data.id, label: data.item_description }))} required
                      />
                  
                  </div> 
                
                <div className="col-sm-2">
                    <span className="textgreen">Line <span style={star}>*</span></span>
                        <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Line..."
                        value={selectedOption1 ? { value: selectedOption1.id, label: selectedOption1.line } : null}
                        onChange={(selectedOption1) => {
                          const newValue = selectedOption1 ? selectedOption1.value : '';
                          handleInputChange({ target: { name: 'line', value: newValue } });
                        }}
                        options={lineOptions.map((data) => ({ value: data.line, label: data.line }))} required
                      />
                      
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">Section Name <span style={star}>*</span></span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Section..."
                        value={selectedOption ? { value: selectedOption.id, label: selectedOption.section_name } : null}
                        onChange={(selectedOption) => {
                          const newValue = selectedOption ? selectedOption.value : '';
                          handleInputChange({ target: { name: 'sectionId', value: newValue } });
                        }}
                        options={sectionName.map((data) => ({ value: data.id, label: data.section_name }))} required
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
                      <p style={{fontSize:'15px',fontWeight:'bold',textAlign:'center'}}>PRODUCT :<span style={{color:'green'}}>{formData.product_name}</span> , LINE : <span style={{color:'green'}}>{formData.line}</span>, SECTION : <span style={{color:'green'}}>{formData.section_name}</span>,<span style={{color:'red'}}>Total No of worker</span> : <span style={{color:'green'}}>{employess.length}</span></p>
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
                        <th>Product <br/> (Line) <br/> Section</th>
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
      </div>
    
  );
}

export default Employees;
