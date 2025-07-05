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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import dateUtils from '../../utils/dateUtils';

function EmployeeTimesheetList() {
    const { t } = useTranslation();
    const today = dateUtils.getCurrentDateTime();
    const oneMonthAgo = dateUtils.getOneMonthAgo();
    const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
    const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd-MM-yyyy");
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
 // const today = new Date();
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
  const [currentDate, setCurrentDate] = useState(0);
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(roleId);
     //alert(ctype);

     const [formData, setFormData] = useState({
        fromdate: formattedToday,
        todate: formattedToday,
        shift: '',
        line: '',
        product_id: '',
        product_name: '',
        section_id: '',
        section_name: ''
      });
    
      const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'section_id') {
          const selectedSection = sectionOptions.find(section => String(section.id) === value);
          const sectionName = selectedSection ? selectedSection.section_name : '';
          setFormData((prevFormData) => ({
            ...prevFormData,
            section_id: value,
            section_name: sectionName,
          }));
        } else if (name === 'product_id') {
          const selectedProduct = productOptions.find(product => String(product.id) === value);
          const productName = selectedProduct ? selectedProduct.item_description : '';
          setFormData((prevFormData) => ({
            ...prevFormData,
            product_id: value,
            product_name: productName,
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
          }));
        }
      };

  const handleEdit = (id) => {
    navigate(`/admin/employeetimesheet/editemployeetimesheetnbraid/${id}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url:`${config.apiUrl}/getemployeetimesheetdata`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
        processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet, fdate, tdate } = response;
//alert(timesheet);
        // Update the component state with the timesheet data
        setData(timesheet);
        setFDate(fdate);
        setTDate(tdate);
      setIsSearchFetch(true);
      setIsDefaultFetch(false);


         // Initialize the DataTable with the updated data and filename
          //initializeTable(timesheet);
          },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        },
      });
    };
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

      document.title = 'Employee Timesheet';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {
        const Data = {
            roleId: roleId,
            userId: userid,
          };
          const jsonData = JSON.stringify(Data);

         // alert(jsonData);
     
  $.ajax({
    url: `${config.apiUrl}/getemployeetimesheetdata`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      // Access the timesheet results from the response object

      // Update the component state with the timesheet data
      const { timesheet, date } = response;
     // alert(timesheet);
      // Update the component state with the timesheet data
      setData(timesheet);
   //   alert(timesheet);
      setCurrentDate(date);
      setIsSearchFetch(false);
      setIsDefaultFetch(true);

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

      const fetchProductOptions = () => {
        $.ajax({
           url: `${config.apiUrl}/getProductOptions`,
          method: 'GET',
          headers: customHeaders,
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
       url: `${config.apiUrl}/workerdelete/${id}`,
      method: 'DELETE',
      headers: customHeaders,
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
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
};

const renderTableData = () => {
      
    // Filter data based on the search query (case-insensitive)
    const filteredData = data.filter(row =>
        row.worker.toLowerCase().includes(searchQuery.toLowerCase())
      );
     
      const tableRows = filteredData.map((row, index) => {
        // Calculate the total sum of hours for the current row
        const totalSum =
          row.HOUR1 +
          row.HOUR2 +
          row.HOUR3 +
          row.HOUR4 +
          row.HOUR5 +
          row.HOUR6 +
          row.HOUR7 +
          row.HOUR8 +
          row.HOUR9 +
          row.HOUR10 +
          row.HOUR11 ;
          //+
          // row.HOUR12;
  
        const waste_string = row.waste;
        const numberArray = waste_string.split(",").map(Number); // Split and convert to numbers
        const waste_sum = numberArray.reduce((acc, num) => acc + num, 0); // Calculate the sum
  
  
        // Calculate the target status
        let targetStatus;
        if (totalSum == row.target) {
          targetStatus = `<span class="bgsuccess">${totalSum}</span><br><span class="bgsuccess">target completed</span>`;
        } else if (totalSum <= row.target) {
          targetStatus = `<span class="bgdanger">${totalSum}</span><br><span class="bgdanger">target pending</span>`;
        } else {
          targetStatus = `<span class="bgwarning">${totalSum}</span><br><span class="bgwarning">target exceed</span>`;
        }
  
        // Return the table row with updated cell values
        return (
          <tr key={index}>
            <td style={{ fontSize: 'smaller' }}>{row.worker}<b> {row.entry_id + ' [' + row.shift + 'HRS]'}</b>
              <i className="bx bxs-trash " style={{ color: 'red' }} onClick={() => handleDelete(row.id)} ></i>
          </td>
  
  
  <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR1')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR1'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR1')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR1" // Add a data attribute for field name
            >
              {row.HOUR1}
            </td>
  
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR2')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR2'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR2')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR2" // Add a data attribute for field name
            >
              {row.HOUR2}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR3')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR3'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR3')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR3" // Add a data attribute for field name
            >
              {row.HOUR3}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR4')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR4'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR4')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR4" // Add a data attribute for field name
            >
              {row.HOUR4}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR5')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR5'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR5')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR5" // Add a data attribute for field name
            >
              {row.HOUR5}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR6')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR6'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR6')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR6" // Add a data attribute for field name
            >
              {row.HOUR6}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR7')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR7'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR7')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR7" // Add a data attribute for field name
            >
              {row.HOUR7}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR8')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR8'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR8')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR8" // Add a data attribute for field name
            >
              {row.HOUR8}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR9')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR9'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR9')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR9" // Add a data attribute for field name
            >
              {row.HOUR9}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR10')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR10'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR10')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR10" // Add a data attribute for field name
            >
              {row.HOUR10}
            </td>
            <td
              onDoubleClick={() => handleDoubleClick(index, 'HOUR11')}
              onBlur={handleBlur}
              contentEditable={editableCell.rowIndex === index && editableCell.field === 'HOUR11'}
              onInput={(e) => handleInputChange2(e, index, 'HOUR11')}
              data-row-id={row.id} // Add a data attribute for row ID
              data-field-name="HOUR11" // Add a data attribute for field name
            >
              {row.HOUR11}
            </td>
  
  
            <td style={{ fontSize: 'smaller' }} dangerouslySetInnerHTML={{ __html: targetStatus }}></td>
            <td style={{ fontSize: 'smaller' }}><span class="bgsuccess ">{Number(row.target).toFixed(4)}</span></td>
            <td>{((totalSum / row.target) * 100).toFixed(2)}%</td>
            {/* <td><b>{row.site}</b></td> */}
            <td style={{ fontSize: 'smaller' }}><b>{row.section_name}</b></td>
            <td><b>{row.line}</b></td>
            <td style={{ fontSize: 'smaller' }}><b>{row.item_description}</b></td>
            <td><b>{row.date_time}</b></td>
            {/* <td style={{ fontSize: 'smaller' }}>{row.remark.split(',').filter(Boolean).join(',')}</td> */}
            <td style={{ fontSize: 'smaller' }}>{row.remark.split(',').map(item => item.trim()).filter(item => item !== '').join(',')}</td>
            <td style={{ fontSize: 'smaller' }}>{waste_sum.toFixed(2)}</td>
         
          </tr>
        );
      });
  
  
  
      return tableRows;
};


const handleDoubleClick = (index, field) => {

    setEditableCell({ rowIndex: index, field });
  };
  const handleBlur = (event) => {
   
    // Assuming you have a way to identify the relevant data, e.g., row.id
    const rowId = event.currentTarget.dataset.rowId;

    // Find the field name from the HTML element
    const fieldName = event.currentTarget.dataset.fieldName;

    // Get the new value from the input field
    const newValue = event.currentTarget.textContent;

    // Construct the data to send to the server
    const dataToSend = {
      id: rowId,
      field: fieldName,
      value: newValue,
    };


   // alert(JSON.stringify(dataToSend));
    // Make an AJAX request to update the database
    $.ajax({
      url: `${config.apiUrl}/updatetimesheet`,
      method: 'PUT',
      headers: customHeaders,
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
    const updatedData = [...data];
    updatedData[index][field] = e.target.textContent;
    //alert(JSON.stringify(updatedData));
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
              <CardHeader> <b className="h5">{t('Worker timesheet')} </b>
              <Link to={`/admin/employeetimesheet/addemployeetimesheet`}>
                  <button className="btn btn-success" style={{color:'#fff'}}>
                    Add New
                  </button>
                </Link>
              </CardHeader>
              <CardBody>
              {roleId != 3 && ( 
  <>
    <div>
    
      <hr />
    </div>
   <b className="h5">Date Range</b> 
    <br></br><br></br>
    <form onSubmit={handleSubmit} method="POST">
      <div>
        <div className="row space">
          <div className="col-sm-2">
            <span className="textgreen">Start Date</span>
            <DatePicker
              className="form-control margin-bottom"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Start Date"
              name="fromdate"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">To Date</span>
            <DatePicker
              className="form-control margin-bottom"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select End Date"
              name="todate"
            />
          </div>
          <div className="col-sm-1">
            <span className="textgreen">Shift</span>
            <select
              id="shift"
              className="form-control"
              name="shift"
              value={formData.shift}
              onChange={handleInputChange}
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
            <span className="textgreen">Product Name </span>
            <Select
              options={productOptions.map((option) => ({
                value: option.id,
                label: option.item_description,
              }))}
              value={
                formData.product_id
                  ? { value: formData.product_id, label: formData.product_name }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  product_id: selectedOption.value,
                  product_name: selectedOption.label,
                });
                fetchLineOptions(selectedOption.value);
              }}
              isSearchable
              placeholder="Select Product"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">Line </span>
            <Select
              options={lineOptions.map((option) => ({
                value: option.line,
                label: option.line,
              }))}
              value={
                formData.line
                  ? { value: formData.line, label: formData.line }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  line: selectedOption.value,
                
                });
              }}
              isSearchable
              placeholder="Select Line No"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">Section Name </span>
            <Select
              options={sectionOptions.map((option) => ({
                value: option.id,
                label: option.section_name,
              }))}
              value={
                formData.section_id
                  ? { value: formData.section_id, label: formData.section_name }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  section_id: selectedOption.value,
                  section_name: selectedOption.label,
                });
              }}
              isSearchable
              placeholder="Select Section"
            />
          </div>
          <div className="col-sm-1">
            <button type="submit" className="btn btn-success btn-md">
              View
            </button>
          </div>
        </div>
      </div>
    </form>
  </>
)}

               {/* Display Input Field Values */}
            <div>
              <h4 class="header-title">

                <span class="textred">{isDefaultFetch ? date : ''}</span>
                <span class="textred">{isSearchFetch ? `[${formData.fromdate}-${formData.todate}]` : ''}</span>
                <span class="textgreen">
                  {isSearchFetch ? `[` : ''}
                  {isSearchFetch && formData.shift ? `${formData.shift}HRS-` : ''}
                  {isSearchFetch && formData.line ? `${formData.line}-` : ''}
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
                    <th>{t('Name')}</th>
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
                    {/* <th>HR12</th> */}
                    <th>{t('Achievement')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Efficiency')}</th>
                    {/* <th>Site</th> */}
                    <th>{t('Section')}</th>
                    <th>{t('Line')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Remarks')}</th>
                    <th>{t('Waste')}</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {renderTableData()}
                </tbody>
                <tfoot>
                <tr>
                    <th>{t('Name')}</th>
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
                    {/* <th>HR12</th> */}
                    <th>{t('Achievement')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Efficiency')}</th>
                    {/* <th>Site</th> */}
                    <th>{t('Section')}</th>
                    <th>{t('Line')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Remarks')}</th>
                    <th>{t('Waste')}</th>
                    
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

export default EmployeeTimesheetList;
