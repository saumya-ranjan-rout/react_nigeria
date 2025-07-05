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

function PerformanceOverviewReport() {
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
  const [workerOptions, setWorkerOptions] = useState([]);
  const tableRef = useRef(null);

  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [processedResult, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
  const [totalFGOutput, setTotalFGOutput] = useState(0);
  const [productDataa, setItemspan] = useState([]);
  const [period, setPeriod] = useState([]);
  const [isAchvEffVisible, setAchvEffVisible] = useState(true); // Set to true by default
  const [loading, setLoading] = useState(false);
   const [currentDate, setCurrentDate] =  useState(formattedToday);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
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

    const [formData, setFormData] = useState({
      fromdate: formattedToday,
      todate: formattedToday,
      shift: '',
      product_id: '',
      product_name: '',
    //  line_no: '',
      section_id: '',
      worker_id: '',
      section_name: '',
      search: '',
     
     

    
   });

   const handleInputChange = (event) => {
    const { name, value } = event.target;

      setFormData({ ...formData, [name]: value });
    
    
  };
 

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const updatedFormData = { ...formData, fromdate: formData.fromdate, todate: formData.todate , userid: userid, roleid: roleId};

    const jsonData = JSON.stringify(updatedFormData);
   // alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/getperformanceoverviewreport`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response[0];
        const { title } = response[0];
        
   // document.title = `MZ   PERF OVERVIEW REPORT DATE ${title}`;
    const filetitle=`MZ PERF OVERVIEW REPORT ${title}`;
       // alert(processedResult);
        // Update the component state with the timesheet data
        setData(timesheet);
       // setCurrentDate('');
        setIsSearchFetch(true);
        initializeTable(response[0].timesheet,filetitle); 
         setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
        alert('no data');
        setLoading(false)
      },
    });
  };

// Assuming workerCount is an array of values related to each row in the DataTable
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
        filename: filetitle,
      },
    ],
      data: timesheet, // Update the data option here
      columns: [
        { data: 'remark' },
        { data: 'worker' },
        { data: 'entry_id' },
        { 
          data: 'shift',
          render: function(data) {
            return data + 'HRS';
          }
        },
       { data: 'reg' },
        {
          data: null,
          render: function (data, type, row) {
            if (row.numberDaysInt ) {
              return `${row.numberDaysInt} days`;
            } else {
              return '';
            }
          }
        },
         { data: 'target' },
         { data: 'hr' },
        {data: 'tar'},
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
        { data: 'days' },
      { data: 'present' },
      { data: 'abs' },
      {
        data: 'per',
        render: function (data, type, row) {
          if (type === 'display') {
  
            return data + ' %';
          }
          return data;
        },
      },   {
        data: null,
        render: function (data, type, row) {
          return `<span style="border-right: 1px solid #2e6398;background-color:${row.bcolor};color:${row.color}">${row.performance}</span>`;
        }
      }
      ,
      
      { data: 'date_time' },

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
 
  document.title = `PERF OVERVIEW REPORT`;
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      const filetitle =`MZ PERF OVERVIEW REPORT DATE ${formattedToday}`;
      setLoading(true);
      // Destroy the existing DataTable instance (if it exists)


      const updatedFormData = { userid: userid, roleid: roleId };
      const jsonData = JSON.stringify(updatedFormData);

      $.ajax({
        url:`${config.apiUrl}/getdefaultperformanceoverview`,
        method: "POST",
        data: jsonData,
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response[0];
          const { date } = response[0];
           
         //   alert(JSON.stringify(response));
          // Update the component state with the timesheet data
          setData(timesheet);
        //  alert(timesheet);
       //   setCurrentDate(date);
          // Destroy the existing DataTable instance (if it exists)
          setIsSearchFetch(false);
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
  }, []);

 



const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  let selectedProductText = '';
  const handleProductChange = (e) => {
    const selectedProduct = e.target.value;

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

  const handleSearchTypeChange = (event) => {
    const { value } = event.target;
    setIsPeriodSearch(value === '4');
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
               <CardTitle tag="h5"> PERF OVERVIEW
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
                                            <span className="textgreen">{t('Start Date')}</span><br></br>
                                            

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
                                            <span className="textgreen">{t('To Date')}</span><br></br>
                                          
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
                <div className="col-sm-3"  style={{display:'none'}}>
                  <span className="textgreen">{t('Product Name')}</span>
                  

<Select
          className="basic-single"
          classNamePrefix="select"
          name="product_id"
          id="product_id"
     
          value={productOptions.find(option => option.value === formData.product_id)}
          onChange={(selectedOption) => {
            handleInputChange({ target: { name: 'product_id', value: selectedOption.id } });
         
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

                <div className="col-sm-3" style={{display:'none'}}>
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
            <h4 class="header-title"><span class="textred" >{isSearchFetch && formData.search == 4 ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{formData.fromdate && formData.todate ? `[${formData.shift}-${formData.product_name}-${formData.section_name}]` : ""}</span></h4>
            </div>


                          <div className="table-responsive">


                            <table id="example" className="display">
                            <thead>
                            <tr>
                      
                            <th>{t('Remarks')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Id')}</th>
                    <th>{t('Shift')}</th>
                     <th>{t('Date of Joining')}</th>
                    <th>{t('Total No. of Days')}</th>
                    <th>{t('Actual Target')}</th>
                   <th>HR {t('Used')}</th>
                    <th>{t('Target')}</th>
                    <th>{isSearchFetch  ? ' ' : currentDate}<br></br>({t('Achieved')})</th>
                    <th>{t('Productivity')}</th>
                    <th>{t('Working Days')}</th>
                    <th>{t('Days')} {t('Present')}</th>
                    <th>{t('Days')} {t('Absent')}</th>
                    <th>% {t('Attendance')}</th>
                    <th>{t('Performance')}</th>
                    <th>{t('Date')}</th>
                      
                    </tr>
                              </thead>
<tfoot>
<tr>
                      
<th>{t('Remarks')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Id')}</th>
                    <th>{t('Shift')}</th>
                    <th>{t('Date of Joining')}</th>
                    <th>{t('Total No. of Days')}</th>
                     <th>{t('Actual Target')}</th>
                    <th>HR {t('Used')}</th>
                    <th>{t('Target')}</th>
                    <th>{isSearchFetch  ? ' ' : currentDate}<br></br>({t('Achieved')})</th>
                   <th>{t('Productivity')}</th>
                    <th>{t('Working Days')}</th>
                    <th>{t('Days')} {t('Present')}</th>
                    <th>{t('Days')} {t('Absent')}</th>
                    <th>% {t('Attendance')}</th>
                    <th>{t('Performance')}</th>
                    <th>{t('Date')}</th>
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

export default PerformanceOverviewReport;
