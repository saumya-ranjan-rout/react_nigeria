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
import config from '../../config';

export function DataAccuracy() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);

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
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  // Set the options for formatting the date
  const options = { timeZone: 'Africa/Nairobi', day: 'numeric', month: 'numeric', year: 'numeric' };
  const formattedToday = today.toLocaleDateString('en-GB', options);
  const formattedOneMonthAgo = oneMonthAgo.toLocaleDateString('en-GB', options);
  //alert(formattedToday);       // Output: "dd-mm-yyyy" format in Africa/Nairobi timezone
  //alert(formattedOneMonthAgo); // Output: "dd-mm-yyyy" format in Africa/Nairobi timezone

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
   const [fdate, setFDate] = useState('');
  const [tdate, setTDate] = useState('');
   const [currentDate, setCurrentDate] = useState(0);


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
    shift: '',
    day_night: '',
    line_no: '',
    product_id: '',
    product_name: '',
    section_id: '',
    section_name: '',
  });

 const handleEdit = (id) => {
    //history.push(`/employeetimesheet/editotalist/${id}`);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);
    setLoading(true);
    $.ajax({
      url: `${config.apiUrl}/getdataaccuracysearch`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        setIsSearchFetch(true);
        setIsDefaultFetch(false);
        // Access the timesheet results from the response object
        const { timesheet, fdate, tdate } = response;

        // Update the component state with the timesheet data
        setData(timesheet);
         setFDate(fdate);
      setTDate(tdate);
        setLoading(false);
      },
      error: function (xhr, status, error) {
        setLoading(false);
        console.error('Error:', error);
      },
    });
  };

  useEffect(() => {

    document.title = 'Today Employee Timesheet';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {


      const updatedFormData = { ...formData, userid: userid, roleid: roleId };
      const jsonData = JSON.stringify(updatedFormData);
      setLoading(true);
      $.ajax({
        url: `${config.apiUrl}/getdataaccuracy`,
        method: 'POST',
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          setIsDefaultFetch(true);
          setIsSearchFetch(false);
          // Access the timesheet results from the response object
          const { timesheet, date } = response;
          // Update the component state with the timesheet data
          setData(timesheet);
         setCurrentDate(date);
          setLoading(false);
        },
        error: function (xhr, status, error) {
          setLoading(false);
          console.error('Error:', error);
        },
      });


    }


    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getshift`,
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
    
    const fetchLines = () => {
       
    
        // Fetch line options based on the selected product
        $.ajax({
          url: `${config.apiUrl}/getline/`,
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
      fetchLines();

    const fetchProductOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getProductOptionsnbraidotalist`,
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
    window.handleDelete = handleDelete;

  }, []);

  const handleDelete = (id) => {
    //alert(id);
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      fetch(`${config.apiUrl}/emptimesheetdelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((res) => {
          //console.log('Item deleted:', res);
          // Remove the deleted item from itemCategories
          const updatedData = data.filter(timesheet => timesheet.id !== id);
          setData(updatedData); // Update the itemCategories state with the updated data
          alert('Deleted worker timesheet successfully.');
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };


  const handleProductChange = (e) => {
    const selectedProduct = e.value;

    // Fetch line options based on the selected product
    $.ajax({
      url: `${config.apiUrl}/getline/`,
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

  const renderTableData = () => {
    // Filter data based on the search query (case-insensitive)
    const filteredData = data.filter(row =>
    row.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof row.entry_id === 'number' && row.entry_id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );
    return filteredData.map((row, index) => {
     

      //const totalSum = row.value_sum;

      const totalSum =
                (row.HOUR1 +
                row.HOUR2 +
                row.HOUR3 +
                row.HOUR4 +
                row.HOUR5 +
                row.HOUR6 +
                row.HOUR7 +
                row.HOUR8 +
                row.HOUR9 +
                row.HOUR10 +
                row.HOUR11 );
               
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
         
          
          <td><span class="bgsuccess ">{row.target}</span></td>
          <td dangerouslySetInnerHTML={{ __html: targetStatus }}></td>
          <td>{((totalSum / (row.target * hourColumnsCount)) * 100).toFixed(2)}%</td>
          <td><b>{row.item_description}</b></td>
          <td><b>{row.line}</b></td>
          <td><b>{row.section_name}</b></td>
          <td><b>{row.shift}</b></td>
          <td><b>{row.site}</b></td>
          <td><b>{row.date_time}</b></td>
          {/* <td><div className="fixed-width-remark">{row.remark}</div></td>
          <td>{waste_sum}gm</td> */}

        </tr>
      );
    });
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

    // Make an AJAX request to update the database
    $.ajax({
       url: `${config.apiUrl}/updatetimesheet`,
      method: 'POST',
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
    // alert(id);
    const updatedData = [...data];
    updatedData[index][field] = e.target.textContent;
  };

  return (
    <>
      {
        loading ? (
          <div className="loader-overlay" >
            <div className="loader"></div>
          </div>
        ) : (
          <div>{/* Render your content */}</div>
        )
      }
      <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                View
                <hr></hr>
              </CardHeader>
              <CardBody>
              
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-2">
                    <span className="textgreen">Start Date <span className='textred'>*</span></span>
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
                    <span className="textgreen">To Date <span className='textred'>*</span></span>
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
                      onChange={handleInputChange}
                      value={formData.shift}
                    >
                      <option value="">Select</option>
                      {shiftOptions.map((shiftOption) => (
                        <option key={shiftOption.id} value={shiftOption.nhrs}>
                          {shiftOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="col-sm-1">
                    <span className="textgreen">D/N</span>

                    <select id="day_night" className="form-control" name="day_night" value={formData.day_night} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="Day">Day </option>
                      <option value="Night">Night </option>
                    </select>
                  </div> */}
                  <div className="col-sm-2">
                    <span className="textgreen">Product Name</span>
                   
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable

                      name="product_id"
                      placeholder="Product"
                      options={[
                        { value: '', label: 'Select' }, // Add this line for the "Select" option
                        ...productOptions.map((productOption) => ({
                          value: productOption.id,
                          label: `${productOption.item_description}`,
                        }))
                      ]}
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        const selectedText = selectedOption ? selectedOption.label : '';
                        setFormData((prevFormData) => ({ ...prevFormData, product_id: selectedValue, product_name: selectedText, line_no: '' }));
                        
                      }}
                    />
                  </div>
                  <div className="col-sm-1">
                    <span className="textgreen">Line No</span>
                    <select
                      name="line_no"
                      className="form-control subcat"
                      id="line_no"
                      value={formData.line_no} onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      {lineOptions.map((lineOption) => (
                        <option key={lineOption.id} value={lineOption.id}>
                          {lineOption.line_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-2">
                    <span className="textgreen">Section</span>
                   
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable

                      name="section_id"
                      placeholder="Section"
                      options={[
                        { value: '', label: 'Select' }, // Add this line for the "Select" option
                        ...sectionOptions.map((sectionOption) => ({
                          value: sectionOption.id,
                          label: `${sectionOption.section_name}`,
                        }))
                      ]}
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : '';
                        const selectedText = selectedOption ? selectedOption.label : '';
                        setFormData((prevFormData) => ({ ...prevFormData, section_id: selectedValue, section_name: selectedText }));
                      }}
                    />
                  </div>
                  <div className="col-sm-1">
                    <button
                      type="submit"
                      className="btn btn-success btn-md"
                    >
                      View
                    </button>
                  </div>
                </div>

              </form>


              {/* Display Input Field Values */}
              

               <div>
                  {fdate && tdate ? (
                    <>
                      <h6 className="header-filter">
                        <span class="textred" >[{fdate}] - [{tdate}]</span>
                        
                      </h6>
                    </>
                  ) : (
                    <span className="textred">{currentDate}</span>
                  )}
                </div>

              {/* Add the search box */}
              <div className="col-sm-4">
                <input
                  type="text"
                  className="form-control"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for name or entryId"
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
                      <th>Target</th>
                      <th>Achievement</th>
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
                      <th>Target</th>
                      <th>Achievement</th>
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

export default DataAccuracy;
