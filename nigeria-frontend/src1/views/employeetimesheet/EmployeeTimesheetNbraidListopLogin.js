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
import Select from 'react-select';
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
//DB Connection
import config from '../../config';


function EmployeeTimesheetNbraidListopLogin() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [date, setDate] = useState('');
  const [totalComplete, setTotalComplete] = useState(0);
  const [isDefaultFetch, setIsDefaultFetch] = useState(false);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [editableCell, setEditableCell] = useState({ rowIndex: null, field: null });
  // New state variable to hold the search query
  const [searchQuery, setSearchQuery] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

  const [formData, setFormData] = useState({
       fromdate: '',
       todate: '',
       product_name: '',
       line_no: '',
       section: '',
       shift: '',     
    });

const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (id) => {
    navigate(`/admin/employeetimesheet/editemployeetimesheetnbraid/${id}`);
  };

useEffect(() => {

      document.title = 'Today Employee Timesheet';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
         navigate('/login');
      } else {

      $.ajax({
      url: `http://192.168.29.60:4000/getdefaultemployeetimesheetdatanbraidotaop/${roleId}/${userid}`,
      method: 'GET',
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
        setResponseDate(timesheet.length > 0 ? timesheet[0].date_time : ''); // Set the date_time value from the response

        // Initialize the DataTable with the updated data and filename
        //initializeTable(timesheet);

           },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
     
      }
   
      // Fetch shift options from API
      const fetchShiftOptions = () => {
        $.ajax({
          url: 'http://192.168.29.60:4000/getShiftOptions',
          method: 'GET',
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
          url: 'http://192.168.29.60:4000/getSectionOptions',
          method: 'GET',
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
        url: `http://192.168.29.60:4000/getindividualLineOptionss`,
        method: 'GET',
        success: function (response) {
          setLineOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching line options:', error);
        },
      });
      };

      fetchLineOptions();

      const fetchProductOptions = () => {
        $.ajax({
          url: 'http://192.168.29.60:4000/getProductOptionsnbraidotalist',
          method: 'GET',
          success: function (response) {
            setProductOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching product options:', error);
          },
        });
      };

      fetchProductOptions();

    const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' });
    const parts = date.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const newcurrentDate1 = `${day}-${month}-${year}`;
    //alert(newcurrentDate1);

    window.handleDelete = handleDelete;
    window.handleEdit = handleEdit;
    
}, []);

  
const handleDelete = (id) => {
  const confirmDelete = window.confirm('Do You Really Want To Delete This Record From Employee Timesheet???');

  if (confirmDelete) {
    $.ajax({
      url: `http://192.168.29.60:4000/workerdelete/${id}`,
      method: 'DELETE',
      success: function (data) {
        console.log('Item deleted:', data);
        // Update the component state or perform any other necessary actions
        // Set the server message and style it
          setServerMessage('Worker deleted successfully');
          setServerMessageClass('alert alert-success');
           setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
             window.location.reload();
          }, 5000);
      },
      error: function (xhr, status, error) {
        console.error('Error deleting item:', error);
        // Handle the error, show an error message, or perform any other necessary actions
      },
    });
  }
};

const handleLogout = () => {
    // Perform any necessary logout actions here
    // For example, clearing session storage, removing tokens, etc.

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
     navigate('/login');
};

const renderTableData = () => {
  // Filter data based on the search query (case-insensitive)
  const filteredData = data.filter(row =>
    row.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof row.entry_id === 'number' && row.entry_id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return filteredData.map((row, index) => {
    const totalSum = row.value_sum;

    // Calculate the target status
    let targetStatus;
    if (totalSum == row.target) {
      targetStatus = `<span class="bgsuccess">${totalSum}</span><br><span class="bgsuccess">target completed</span>`;
    } else if (totalSum <= row.target) {
      targetStatus = `<span class="bgdanger">${totalSum}</span><br><span class="bgdanger">target pending</span>`;
    } else {
      targetStatus = `<span class="bgwarning">${totalSum}</span><br><span class="bgwarning">target exceed</span>`;
    }

    // Initialize the count of hour columns
    let hourColumnsCount = 0;

    // Loop through the columns and check for hour values
    for (let i = 1; i <= 11; i++) {
      const hourColumnName = `HOUR${i}`;
      if (typeof row[hourColumnName] === 'number' && row[hourColumnName] !== 0) {
        hourColumnsCount++;
      }
    }

    //alert(hourColumnsCount); // Alert the hour count
    // Return the table row with updated cell values
    return (
      <tr key={index}>
        <td>{row.worker}<b> {row.entry_id}</b>
          <a
            href=""
            style={{ fontSize: '12px', color: '#009c9f', paddingLeft: '2px' }}
            onClick={(event) => {
              event.preventDefault(); // Prevent the default behavior
              handleEdit(row.id);
            }}
          >
            Edit
          </a>
          <a
            href=""
            style={{ fontSize: '12px', color: 'red', paddingLeft: '2px' }}
            onClick={(event) => {
              event.preventDefault(); // Prevent the default behavior
              handleDelete(row.id);
            }}
          >
            Delete
          </a>
        </td>

        {/* Repeat for each hour column */}
        {Array.from({ length: 11 }, (_, i) => i + 1).map(hourIndex => (
          <td
            key={hourIndex}
            onDoubleClick={() => handleDoubleClick(index, `HOUR${hourIndex}`, hourColumnsCount, row)}
            onBlur={(e) => handleBlur(e, row)}
            contentEditable={editableCell.rowIndex === index && editableCell.field === `HOUR${hourIndex}`}
            onInput={(e) => handleInputChange2(e, index, `HOUR${hourIndex}`)}
            data-row-id={row.id} // Add a data attribute for row ID
            data-field-name={`HOUR${hourIndex}`} // Add a data attribute for field name
          >
            {row[`HOUR${hourIndex}`]}
          </td>
        ))}

        <td dangerouslySetInnerHTML={{ __html: targetStatus }}></td>
        <td><span class="bgsuccess ">{row.target}</span></td>
        <td hidden><span class="bgsuccess ">{row.actual_target}</span></td>
        <td>{((totalSum / row.target) * 100).toFixed(2)}%</td>
        <td><b>{row.item_description}</b></td>
        <td><b>{row.line}</b></td>
        <td><b>{row.section_name}</b></td>
        <td><b>{row.shift}</b></td>
        <td><b>{row.site}</b></td>
        <td><b>{row.date_time}</b></td>
      </tr>
    );
  });
};


const handleDoubleClick = (index, field, hourColumnsCount, row) => {
  setEditableCell({ rowIndex: index, field, hourColumnsCount, row });
};


const handleBlur = (event, row) => {
  const rowId = event.currentTarget.dataset.rowId;
  const fieldName = event.currentTarget.dataset.fieldName;
  const newValue = event.currentTarget.textContent;

  // Find out the number of filled hour columns by checking all hour values in the row
  let hourColumnsCount = 0;
  for (let i = 1; i <= 11; i++) {
    const hourColumnName = `HOUR${i}`;
    if (typeof row[hourColumnName] === 'number' && row[hourColumnName] !== 0) {
      hourColumnsCount++;
    }
  }

  const totalTargetForAllHours = row.target;
  const totalActualTargetForAllHours = row.actual_target;

  const dataToSend = {
    id: rowId,
    field: fieldName,
    value: newValue,
    hourColumnsCount: hourColumnsCount,
    totalTargetForAllHours: totalTargetForAllHours,
    totalActualTargetForAllHours: totalActualTargetForAllHours
  };

  // Make an AJAX request to update the database
  $.ajax({
    url: 'http://192.168.29.60:4000/updatetimesheet',
    method: 'POST',
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
      setEditableCell({ rowIndex: null, field: null });
      alert("updated successfully");
      window.location.reload();
    },
    error: function (error) {
      console.error('Failed to update data.');
      // Handle error or display an error message
    },
  });
};

const handleInputChange2 = (e, index, field) => {
    // alert(id);
    const updatedData = [...data];
    updatedData[index][field] = e.target.textContent;
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
               
              </CardHeader>
              <CardBody>
             
            <div>
              <h4 class="header-title">

                <span class="textred">{isDefaultFetch ? date : ''}</span>
                <span class="textred">{isSearchFetch ? `[${formData.fromdate}-${formData.todate}]` : ''}</span>
                <span class="textgreen">
                  {isSearchFetch ? `[` : ''}
                  {isSearchFetch && formData.shift ? `${formData.shift}HRS-` : ''}
                  {isSearchFetch && formData.line_no ? `${formData.line_no}-` : ''}
                  {isSearchFetch && formData.product_id ? `${formData.product_name}-` : ''}
                  {isSearchFetch && formData.section_id ? `${formData.section_name}` : ''}
                  {isSearchFetch ? `]` : ''}
                </span>

              </h4>
            </div>

            {/* Add the search box */}
            <div className="col-sm-4">
              <input
                type="text"
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for name..."
              />
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-bordered zero-configuration bordered ts">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>HR1</th>
                    <th>HR2</th>
                    <th>HR3</th>
                    <th>HR4</th>
                    <th>HR5</th>
                    <th>HR6</th>
                    <th>HR7</th>
                    <th>HR8</th>
                    <th>HR9</th>
                    <th>HR10</th>
                    <th>HR11</th>
                    <th>Achievement</th>
                    <th>Target</th>
                    <th>Efficiency</th>
                    <th>Product</th>
                    <th>Line</th>
                    <th>Section</th>
                    <th>Shift</th>
                    <th>Site</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableData()}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Name</th>
                    <th>HR1</th>
                    <th>HR2</th>
                    <th>HR3</th>
                    <th>HR4</th>
                    <th>HR5</th>
                    <th>HR6</th>
                    <th>HR7</th>
                    <th>HR8</th>
                    <th>HR9</th>
                    <th>HR10</th>
                    <th>HR11</th>
                    <th>Achievement</th>
                    <th>Target</th>
                    <th>Efficiency</th>
                    <th>Product</th>
                    <th>Line</th>
                    <th>Section</th>
                    <th>Shift</th>
                    <th>Site</th>
                    <th>Date</th>
                  </tr>
                </tfoot>
              </table>
            </div>
           </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default EmployeeTimesheetNbraidListopLogin;
