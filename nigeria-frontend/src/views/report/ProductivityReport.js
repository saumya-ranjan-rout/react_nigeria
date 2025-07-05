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
import './Loader.css' // Import the CSS file

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
import config from '../../config';
import dateUtils from '../../utils/dateUtils';

function ProductivityReport() {
  const today = dateUtils.getCurrentDateTime();
  const oneMonthAgo = dateUtils.getOneMonthAgo();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
  const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd-MM-yyyy");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
  const [totalFGOutput, setTotalFGOutput] = useState(0);
  const [productDataa, setItemspan] = useState([]);
  const [currentDate, setCurrentDate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSearchFetch, setIsSearchFetch] = useState(false);

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  
  const [formData, setFormData] = useState({
    fromdate: formattedToday,
    todate: formattedToday,
    shift: '',
    product_id: '',
    product_name: '',
    line_no: '',
    section_id: '',
    worker_id: '',
    worker_name: '',
    section_name: '',
    search: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'section_id') {
      //console.log("section_id" + value);
      //console.log(sectionOptions);
      const selectedSection = sectionOptions.find(section => section.id === value);
      const sectionName = selectedSection ? selectedSection.section_name : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        section_id: value,
        section_name: sectionName,
      }));
    }
    else if (name === 'product_id') {
      const selectedProduct = productOptions.find(product => product.id === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_id: value,
        product_name: productName,
      }));
    }  else if (name === 'worker_id') {
        const selectedWorker = workerOptions.find(worker => String(worker.id) === value);
        const workerName = selectedWorker ? selectedWorker.name : '';
        setFormData((prevFormData) => ({
          ...prevFormData,
          worker_id: value,
          worker_name: workerName,
        }));
      }else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
 
  const handleSubmit = (event) => {
    event.preventDefault();

    setLoading(true);
    const updatedFormData = { ...formData, fromdate: formData.fromdate, todate: formData.todate, userid: userid, roleid: roleId };

    const jsonData = JSON.stringify(updatedFormData);
   // alert(jsonData);

    $.ajax({
      url:`${config.apiUrl}/getproductivityreport`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheett } = response[0];
        const { title } = response[0];
        const filetitle=`MZ PRODUCTIVITY REPORT ${title}`;
      //  alert(timesheett);
        // Update the component state with the timesheet data
        setData(timesheett);
        setIsSearchFetch(true);
        initializeTable(timesheett,filetitle); 
        setLoading(false);
            
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            setLoading(false);
        },
    });
};


const initializeTable = (timesheet,filetitle) => {
    // Destroy the existing DataTable instance (if it exists)
    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
    }

    // Initialize the DataTable with the updated data
    tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
         dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
       buttons: [
  {
    extend: 'copy',
    
  },
  {
    extend: 'csv',
    filename: filetitle
  },
],
        data: timesheet, // Update the data option here
        columns: [
          { data: 'iku' },
            { data: 'worker' },
            { data: 'entry_id' },
            {
              data: 'shift',
              render: function (data, type, row) {
                if (type === 'display') {
        
                  return data + ' HRS';
                }
                return data;
              },
            },
            { data: 'reg' },
            {
              data: null,
              render: function (data, type, row) {
                if (row.numberDays ) {
                  return `${row.numberDays} days`;
                } else {
                  return '';
                }
              }
            },
            { data: 'target' },
            {
              data: 'sum',
              render: function (data, type, row) {
                if (data !== '') {
                  return `<span style="color:green;">${data}</span>`;
                } else {
                  return 'NA';
                }
              },
            },         
            {
              data: 'eff',
              render: function (data, type, row) {
                if (type === 'display') {
        
                  return data + ' %';
                }
                return data;
              },
            },
        { data: 'date_time' },
        { data: 'name' }
  
        ],
        createdRow: function (row, data, dataIndex) {
          if (data.single === '1') {
            $(row).css({
              'font-weight': 'bold',
              // other inline styles if needed
            });
          }
        }
    
      });
  
  
      setLoading(false);
};




useEffect(() => {
setLoading(true);
document.title = `Productivity Report`;
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
    } else {
     
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
        }
        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv'],
            data: data, // Use the 'data' state variable here
            // ...rest of your options
        });

        
        const filetitle =`MZ PRODUCTIVITY REPORT DATE ${formattedToday}`;

        setLoading(true);
   
  
        const updatedFormData = {userid: userid, roleid: roleId };
        const jsonData = JSON.stringify(updatedFormData);
  
        $.ajax({
          url:`${config.apiUrl}/getproductivityreportdirectly`,
          method: "POST",
          headers: customHeaders,
          data: jsonData,
          processData: false,
          contentType: 'application/json',
          success: function (response) {
  
            // Access the timesheet results from the response object
            const { timesheet } = response[0];
            const { date } = response[0];
           
            //   alert(JSON.stringify(response));
            // Update the component state with the timesheet data
            setData(timesheet);
            setCurrentDate(date);
            setIsSearchFetch(false);
            // Destroy the existing DataTable instance (if it exists)
            initializeTable(response[0].timesheet,filetitle); 
       setLoading(false);
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                setLoading(false);
            },
        });
    }
    const fetchShiftOptions = () => {
      $.ajax({
        url:`${config.apiUrl}/getShiftOptions`,
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
        url:`${config.apiUrl}/getSectionOptions`,
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

    const fetchProductOptions = () => {

      $.ajax({
        url:`${config.apiUrl}/getProductOptions`,
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

    // Fetch worker options from API
    const fetchWorkerOptions = () => {
      $.ajax({
        url:`${config.apiUrl}/getWorkerOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setWorkerOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchWorkerOptions();





}, []);

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
};

const handleSearchTypeChange = (event) => {
  const { value } = event.target;
  setIsPeriodSearch(value === '4');
};

let selectedProductText = '';


const handleProductChange = (id) => {
  // const selectedProduct = e.target.value;
  const selectedProduct = id;
  const selectedProductname = productOptions.find(product => String(product.id) === selectedProduct);
  const productName = selectedProductname ? selectedProductname.item_description : '';

  setItemspan(productName);
  // Fetch line options based on the selected product
  $.ajax({
    url:`${config.apiUrl}/getLineOptions/${selectedProduct}`,
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


  return (
    <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
    <div className="content">
      <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
               <CardTitle tag="h5"> Productivity Report
                <hr></hr>
                 Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
          
                <form onSubmit={handleSubmit} method='POST'>
              <div className="row space">


<div className="col-sm-3">
                                    <span className="textgreen">{t('Search Type')}</span>
                                    <select
                                        className="form-control"
                                        name="search"
                                        id="search"
                                        required
                                        value={formData.search}

                                        onChange={(e) => {
                                            handleInputChange(e);
                                            handleSearchTypeChange(e);
                                        }}

                                    >
                                        <option value="">{t('Select')}</option>
                                        <option value="5">Today</option>
                                        <option value="1">This Week</option>
                                        <option value="2">This Month</option>
                                        <option value="4">Period</option>

                                    </select>
                                </div>
                                {isPeriodSearch && ( // Render the datepicker fields when isPeriodSearch is true
                                    <>
                                        <div className="col-sm-3">
                                            <span className="textgreen">{t('Start Date')}</span>
   
       <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      required
                      onChange={(date) => {
      
                        const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                        const updatedEvent = { target: { value: formattedDate, name: 'fromdate' } };
                        handleInputChange(updatedEvent);
                        setStartDate(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText={`${t('Select')} ${t('Start Date')}`}
                      name="fromdate"
                    />


                                        </div>
                                        <div className="col-sm-3">
                                            <span className="textgreen">{t('To Date')}</span> <br></br>


<DatePicker
                      className="form-control margin-bottom"
                      selected={endDate}
                      required
                      onChange={(date) => {
      
                        const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                        const updatedEvent = { target: { value: formattedDate, name: 'todate' } };
                        handleInputChange(updatedEvent);
                        setEndDate(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText={`${t('Select')} ${t('To Date')}`}
                      name="todate"
                    />
                                        </div>
                                    </>
                                )}
                <div className="col-sm-3">
                  <span className="textgreen">{t('Shift')}</span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift"
                    value={formData.shift} onChange={handleInputChange}
                  >
                    <option value="">{t('Select')} {t('Shift')}</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.nhrs}>
                        {shiftOption.name}
                      </option>
                    ))}
                  </select>
                </div>
              {/* </div>
              <div className="row space space2x"> */}
                <div className="col-sm-3" style={{display:'none'}}>
                  <span className="textgreen">{t('Product Name')}</span>

<Select
          className="basic-single"
          classNamePrefix="select"
          name="product_id"
          id="product_id"
     
          value={productOptions.find(option => option.value === formData.product_id)}
          onChange={(selectedOption) => {
            handleInputChange({ target: { name: 'product_id', value: selectedOption.id } });
            handleProductChange(selectedOption.value);
           
          }}
          options={productOptions.map(productOption => ({
            id: productOption.id,
            label: productOption.item_description,
            value: productOption.id
          }))}
          placeholder={`${t('Select')} ${t('Product')}`}
          isSearchable
        />
                </div>
                <div className="col-sm-3"  style={{display:'none'}}>
                  <span className="textgreen">{t('Line')}</span>
                  <select
                    name="line_no"
                    className="form-control subcat"
                    id="line_no"
                    value={formData.line_no} onChange={handleInputChange}
                  >
                    <option value="">{t('Select')} {t('Line')}</option>
                    {lineOptions.map((lineOption) => (
                      <option key={lineOption.id} value={lineOption.id}>
                        {lineOption.line}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-3"  style={{display:'none'}}>
                  <span className="textgreen">{t('Section')}</span>
  

<Select
          className="basic-single"
          classNamePrefix="select"
          name="section_id"
          id="section_id"
     
          value={sectionOptions.find(option => option.value === formData.section_id)}
          onChange={(selectedOption) => {
            handleInputChange({ target: { name: 'section_id', value: selectedOption.id } });
          }}
          options={sectionOptions.map(sectionOption => ({
            id: sectionOption.id,
            label: sectionOption.section_name,
            value: sectionOption.id
          }))}
          placeholder={`${t('Select')} ${t('Section')}`}
          isSearchable
        />
                </div>

                <div className="col-sm-3">
                  <span className="textgreen">{t('Worker')}</span>
   
        <Select
          className="basic-single"
          classNamePrefix="select"
          name="worker_id"
          id="worker_id"
     
          value={workerOptions.find(option => option.value === formData.worker_id)}
          onChange={(selectedOption) => {
            handleInputChange({ target: { name: 'worker_id', value: selectedOption.id } });
          }}
          options={workerOptions.map(workerOption => ({
            id: workerOption.entryid,
            label: workerOption.name,
            value: workerOption.entryid
          }))}
          placeholder={`${t('Select')} ${t('Worker')}`}
          isSearchable
        />
                </div>
                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    {t('View')}
                  </button>
                </div>
              </div>

            </form>


            {/* Display Input Field Values */}
            <div>
            <h4 class="header-title"> <span class="textred" >{isSearchFetch && formData.search == 4 ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{isSearchFetch ? `[${formData.shift}-${formData.product_name}-${formData.line_no}-${formData.section_name}-${formData.worker_name}]` : ""}</span></h4>
            </div>
 


                          <br/>
                          <table id="example" className="display">
                          <thead>
                          <tr>
                    {/* <th>worker name/id</th>
                    <th>Shift</th> */}
                    <th>{t('Remarks')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Id')}</th>
                    <th>{t('Shift')}</th>
                    <th>{t('Date of Joining')}</th>
                    <th>{t('Total No. of Days')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Achieved')}</th>
                    <th>{t('Productivity')}</th> 
                   <th>{t('Date')}</th>
                    <th>{t('Operator')}</th> 
                    {/* <th>Product Name</th>
                    <th>Section</th>
                    <th>Target</th>
                    <th>Achieve</th>
                    <th>Balance</th>
                    <th>Hourly Target</th>
                    <th>Hourly ACH</th>
                    <th>Hour Loss</th>
                    <th>Date(m-d-Y)</th> */}

                  </tr>
                          </thead>
                          <tfoot>
                          <tr>
                    {/* <th>worker name/id</th>
                    <th>Shift</th> */}
                    <th>{t('Remarks')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Id')}</th>
                    <th>{t('Shift')}</th>
                    <th>{t('Date of Joining')}</th>
                    <th>{t('Total No. of Days')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Achieved')}</th>
                    <th>{t('Productivity')}</th> 
                   <th>{t('Date')}</th>
                    <th>{t('Operator')}</th> 
                    {/* <th>Product Name</th>
                    <th>Section</th>
                    <th>Target</th>
                    <th>Achieve</th>
                    <th>Balance</th>
                    <th>Hourly Target</th>
                    <th>Hourly ACH</th>
                    <th>Hour Loss</th>
                    <th>Date(m-d-Y)</th> */}

                  </tr>
                          </tfoot>
                          <tbody>

                          </tbody>
                          </table>
           
               </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}


export default ProductivityReport;
