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
import makeAnimated from 'react-select/animated';
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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import config from '../../../config';

function AddAssignOperatorNbraid() {
  const { t } = useTranslation();
  const animatedComponents = makeAnimated();
  const { id } = useParams()
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUser] = useState('') ;
  const [shift, setShift] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [section, setSection] = useState([]);
  const [productname, setProductname] = useState([]);
  const [userId ,setUserid] = useState('');
  const [items ,setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
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

       document.title = 'Add Assign Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      window.handleDelete = handleDelete;
      const fetchUserName = () => {
        $.ajax({
          url: `${config.apiUrl}/operator_data_single/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setOpUser(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
      fetchUserName();
     
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

        // Fetch line type from API

        // Fetch section type from API
        const fetchSection = () => {
            $.ajax({
            url: `${config.apiUrl}/getSectionOptions`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {
                setSection(response);
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
              setProductname(response);
          },
          error: function (xhr, status, error) {
              console.error('Error fetching section options:', error);
          },
          });
      }
      fetchProductname();
     
    }
  }, []);

 //get user id
 useEffect(() => {
    if (OpUserName && OpUserName.entryid) {
      $.ajax({
        url: `${config.apiUrl}/getuserid/${OpUserName.entryid}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setUserid(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [OpUserName]);

  //get items
  useEffect(() => {
    if (userId && userId.id) {
      //alert(userId.id);
      $.ajax({
        url: `${config.apiUrl}/getSectionitem/${userId.id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {

         // alert(response);
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [userId]);

 //submit assign data
 const [formData, setFormData] = useState({
  shift: '',
  line:'',
  section:'',
  productname:'',
  
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const insertFormdata = { ...formData, id: userId.id};
  const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: `${config.apiUrl}/addSectionOp`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
         window.location.reload();
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/delete_section_assign/${id}`,
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
  let star = {
    color: 'red',
    fontSize: '15px',
  }
  
//Data table filter search
const [searchValue, setSearchValue] = useState('')
const handleSearchChange = (event) => {
  setSearchValue(event.target.value)
}

// Destroy the existing DataTable instance (if it exists)
//  if ($.fn.DataTable.isDataTable('#asssignnbraid')) {
//   $('#asssignnbraid').DataTable().destroy();
// }


// Initialize the DataTable with the updated data
//tableRef.current = $('#asssignnbraid').DataTable({
//dom: 'Bfrtip',
//dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
// buttons: [
//     {
//         extend: 'copy',
//         exportOptions: {
//             columns: ':not(.action-column)',
//         },
//     },
//     {
//         extend: 'csv',
//         filename: 'Employees_Details', // Removed space in filename
//         exportOptions: {
//             columns: ':not(.action-column)',
//         },
//     },
// ],
// data: items,
// columns: [
//     { data: null},
//     { data: 'item_description' },
//     { data: 'line'}, // Added defaultContent and orderable for the index column
//     { data: 'section_name' },
//     { data: 'shift' },
//     {
//       data: null,
//       render: function (data, type, row) {
//         const id = data.id;
        
//           return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>`
       
//       },
//     }
 
// ],
// columnDefs: [
//     {
//         targets: 0,
//         render: function (data, type, row, meta) {
//             // Render the row index starting from 1
//             return meta.row + 1; // Changed to use meta.row for the index
//         },
//     },
// ],
//});




const filteredData = items.filter((row) => {
  // Check if row.section_name is not null or undefined before calling toLowerCase()
  const sectionName = row.section_name || '';
  const item_description = row.item_description || '';
  const line = row.line || '';
  const shiftt = row.shift || '';

// Return true if either sectionName or productName contains the searchValue (case-insensitive)
return sectionName.toLowerCase().includes(searchValue.toLowerCase()) ||
String(line).includes(searchValue) ||
shiftt.toLowerCase().includes(searchValue.toLowerCase()) ||
item_description.toLowerCase().includes(searchValue.toLowerCase());
});
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

const handleMove = () => {
  const id=userId.id;
  const chkvalue = checkedItems.join(',');
  const redirectURL = `/admin/hrm/multiplesectionassign/${id}/${chkvalue}`;
  navigate(redirectURL);
};

const selectedOption = section.find((data) => data.id === formData.section);
const selectedOption1 = lineOptions.find((data) => data.line === formData.line);
const selectedOption3 = productname.find((data) => data.id === formData.productname);

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
                <CardTitle tag="h5">Add New Section For <span style={{color:'red'}}>{OpUserName.name}</span></CardTitle>
              <hr></hr>
              </CardHeader>
              <CardBody>
    
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
                <div className="col-sm-3">
                    <span className="textgreen">Shift <span style={star}>*</span></span>
                    <select className="form-control"  name="shift" value={formData.shift} onChange={handleInputChange} required>
                    <option value="">Choose</option>
                    {shift.map((shiftnm) => (
                    <option
                        key={shiftnm.id}
                        value={shiftnm.nhrs}
                    >
                        {shiftnm.name}
                    </option>
                    ))}
                    </select>
                </div>

                     <div className="col-sm-3">
                    <span className="textgreen">Product Name <span style={star}>*</span></span>
                    <Select
                        components={animatedComponents}
                        isSearchable
                        placeholder="Choose Product Name..."
                        value={selectedOption3 ? { value: selectedOption3.id, label: selectedOption3.item_description } : null}
                        onChange={(selectedOption3) => {
                          const newValue = selectedOption3 ? selectedOption3.value : '';
                          handleInputChange({ target: { name: 'productname', value: newValue } });
                          fetchLineOptions(selectedOption3.value);
                        }}
                        options={productname.map((data) => ({ value: data.id, label: data.item_description }))} required
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
                          handleInputChange({ target: { name: 'section', value: newValue } });
                        }}
                        options={section.map((data) => ({ value: data.id, label: data.section_name }))} required
                      />
                  
                  </div> 
             
                
                <div className="col-sm-1">
                  
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
<br></br>
            {/* <form method='POST'> */}
              <div className="row space">
              {/* <div className="col-sm-10"> */}
                {/* 
                  <span className="textgreen">Choose Line And Section*</span>
                  <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      required
                      name="section_id"
                      options={items.map((item) => ({
                        value: item.id,
                        label: `${item.line} (${item.section_name})`,
                      }))}
                      value={selectedItems}
                      onChange={(selectedOptions) => {
                        setSelectedItems(selectedOptions);
                      // const sectionIds = selectedOptions.map((option) => option.value).join(',');
                      //  alert(sectionIds);
                      }}
                      isSearchable
                      placeholder="Choose Line and sec"
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
                    onClick={() => handleMove(selectedItems)}
                    disabled={selectedItems.length == 0}
                  />
                 */}
                       
                  <input
                    className='form-control'
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    style={{ width: '80%' }}
                   /> &nbsp;&nbsp;
                   {/* </div>
                 <div className="col-sm-1"> */}
                  <button
                    className='btn btn-success'
                    style={{ color: '#fff' }}
                    disabled={!isChecked}
                    type="submit"
                    onClick={handleMove}
                  >
                    {t('Move')}
                  </button>
                </div>
                {/* </div>       */}
           
            {/* </form> */}
            <div className="table-responsive">
            <table className="table">
                <thead>
                  <tr>
                  <th><input type="checkbox" onChange={handleCheckAll} />{t('All')}</th>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>line</th>
                    <th>Section name</th>
                    <th>Shift</th>
                    <th>Action</th>
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
                      <td>{index + 1}</td>
                      <td>{row.item_description}</td>
                      <td>{row.line}</td>
                      <td>{row.section_name}</td>
                     
                      <td>{row.shift}</td>
                      <td>
                        <button className="btn btn-danger" style={btnStyle} onClick={() => handleDelete(row.id)}>
                        <i class="fa fa-trash" aria-hidden="true"></i>
                        </button>
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

export default AddAssignOperatorNbraid;
