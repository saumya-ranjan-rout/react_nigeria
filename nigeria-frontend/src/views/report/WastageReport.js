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

function WastageReport() {
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
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [workerOptions, setWorkerOptions] = useState([]);
    const tableRef = useRef(null);
    const [productOptions, setProductOptions] = useState([]);
    const [lineOptions, setLineOptions] = useState([]);
    const [data, setData] = useState([]);
    const [totalComplete, setTotalComplete] = useState(0);
    const [currentDate, setCurrentDate] = useState(0);
    const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
    const [loading, setLoading] = useState(false);
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
   // line_no: '',
    category_id: '',
    category_name: '',
    worker_id: '',
    worker_name: '',
    search: '',
     
     

    
   });

   const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'category_id') {
      //console.log("section_id" + value);
      //console.log(sectionOptions);
      const selectedCategory = categoryOptions.find(category => category.id === value);
      const categoryName = selectedCategory ? selectedCategory.category_name : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        category_id: value,
        category_name: categoryName,
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
    const updatedFormData = { ...formData, fromdate: formData.fromdate, todate: formData.todate , userid: userid, roleid: roleId };
    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url:`${config.apiUrl}/getwastagereportData`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // Access the timesheet results from the response object
        const { timesheet } = response;
        const { title } = response;

        const filetitle=`MZ WASTAGE REPORT ${title}`;
//alert(timesheet);
        // Update the component state with the timesheet data
        setData(timesheet);
        setIsSearchFetch(true);
        initializeTable(response.timesheet,filetitle);
         setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
        setLoading(false)
      },
    });
  };

// Assuming workerCount is an array of values related to each row in the DataTable
const workerCount = [/* ... */];
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
        {
          data: null,
          render: function (data, type, row) {
            if (type === 'display') {
              // Concatenate the worker and entry_id
              const empDetails = ` ${row.entry_id}`;

              // Return the concatenated value for display
              return empDetails;
            }
            return data;
          },
        },
        { data: 'worker', },
        {
            data: 'shift',
            render: function (data, type, row) {
              if (type === 'display') {
      
                return data + ' HRS';
              } return data;
            },
          },
        { data: 'joindate' },
        // {
        //     data: null,
        //     render: function (data, type, row) {
        //       return ``;
        //     }
        //   },
        {
          data: null,
          render: function (data, type, row) {
            if (!row.joindate || !row.date_time) {
              return ' ';
            }
        
            const joinDateComponents = row.joindate.split('/');
            const joinYear = joinDateComponents[2];
            const joinMonth = joinDateComponents[1] - 1; // Note: Months are zero-based in JavaScript Date object
            const joinDay = joinDateComponents[0];
            const joinDate = new Date(joinYear, joinMonth, joinDay);
        
            const dttmComponents = row.date_time.split('-');
            const dttmYear = dttmComponents[2];
            const dttmMonth = dttmComponents[1] - 1;
            const dttmDay = dttmComponents[0];
            const dttmDate = new Date(dttmYear, dttmMonth, dttmDay);
        
            const timeDiff = Math.abs(dttmDate.getTime() - joinDate.getTime());
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
            return `${daysDiff} days`;
          }
        },        
        { data: 'category_name' },
        { data: 'item_description' },
        { data: 'fiber' },
        { data: 'expected_waste_percentage' },
        { data: 'expected_waste' },
        {
            data: 'waste',
            render: function (data, type, row) {
              if (type === 'display') {
                const iw = data.split(",");
                let ffw = 0;
                
                iw.forEach((qw) => {
                  const num = parseFloat(qw.trim()); // Use parseFloat for decimal values
                  if (!isNaN(num)) {
                    ffw += num;
                  }
                });
          
                return ffw.toFixed(2) + ' gm'; // Display the result with 2 decimal places
              }
          
              return data;
            },
          },
          {
            data: null,
            render: function (data, type, row) {
              if (type === 'display') {
                const iw = row.waste.split(",");
                let ffw = 0;
                iw.forEach((qw) => {
                  const num = parseInt(qw.trim());
                  if (!isNaN(num)) {
                    ffw += num;
                  }
                });
                return ((ffw / row.expected_waste) * 100).toFixed(2) + '%'; // Rounded to 2 decimal places and displayed as a percentage
              }
              return data;
            },
          },          
        { data: 'date_time' },
        { data: 'name' }
      ],
      columnDefs: [


        {
          targets: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // Column indices for Hour 1 to Hour 12
          render: function (data, type, row) {
            if (type === 'display' && typeof data === 'number') {
              // Format the hour value to display decimal numbers
              const formattedHour = data.toFixed(4);
              return formattedHour;
            }
            return data;
          },
        },
      ],
    });
    setLoading(false);
  };




  useEffect(() => {
  setLoading(true)
  document.title = `WASTAGE REPORT`;
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

        const filetitle =`MZ WASTAGE REPORT DATE ${formattedToday}`;

        setLoading(true);
      // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
      // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ['copy', 'csv'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });

      const updatedFormData = { userid: userid, roleid: roleId };
      const jsonData = JSON.stringify(updatedFormData);
      $.ajax({
        url:`${config.apiUrl}/gettodaywastereportData`,
        method: "POST",
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {

          // Access the timesheet results from the response object
          const { timesheet } = response;
          const { date } = response;
          // Update the component state with the timesheet data
          setData(timesheet);
          setCurrentDate(date);
          setIsSearchFetch(false);
          initializeTable(response.timesheet,filetitle);
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
    const fetchCategoryOptions = () => {
        $.ajax({
          url:`${config.apiUrl}/getCategoryOptions`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setCategoryOptions(response);
           // alert(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
           // alert(error);
          },
        });
      };
  
      fetchCategoryOptions();
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

  const handleSearchTypeChange = (event) => {
    const { value } = event.target;
    setIsPeriodSearch(value === '4');
};

  const handleProductChange = (e) => {
    const selectedProduct = e.target.value;

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
               <CardTitle tag="h5"> Wastage
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
                <div className="col-sm-3">
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
      
                <div className="col-sm-3">
                  <span className="textgreen">{t('Category')}</span>
                  <select
                    id="category_id"
                    className="form-control"
                    name="category_id"
                    value={formData.category_id} onChange={handleInputChange}
                  >
                    <option value="">{t('Select')} {t('Category')}</option>
                    {categoryOptions.map((categoryOption) => (
                      <option
                        key={categoryOption.id}
                        value={categoryOption.id}
                      >
                        {categoryOption.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-3" style={{ display: 'none' }}>
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
              <h4 class="header-title"> <span class="textred" >{isSearchFetch && formData.search == 4 ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{isSearchFetch ? `[${formData.shift}-${formData.product_name}-${formData.category_name}-${formData.worker_name}]` : ""}</span></h4>
            </div>


                          <div className="table-responsive">


                            <table id="example" className="display">
                            <thead>
                            <tr>
                      
                            <th>Emp {t('Id')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Shift')}</th>
                    <th>DOJ</th>
                    <th>{t('Total No. of Days')}</th>
                    <th>{t('Category')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Fiber Weight in GMs/Piece')}</th>
                    <th>{t('Expected Waste in %')}</th>
                    <th>{t('Expected Waste in Gms')}</th>
                    <th>{t('Actual Waste in Gms')}</th>
                    <th>{t('Expected vs Actual %')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Supervisor')}</th>
                 
                      
                    </tr>
                              </thead>
<tfoot>
<tr>
                      
<th>Emp {t('Id')}</th>
                    <th>Emp {t('Name')}</th>
                    <th>{t('Shift')}</th>
                    <th>DOJ</th>
                    <th>{t('Total No. of Days')}</th>
                    <th>{t('Category')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Fiber Weight in GMs/Piece')}</th>
                    <th>{t('Expected Waste in %')}</th>
                    <th>{t('Expected Waste in Gms')}</th>
                    <th>{t('Actual Waste in Gms')}</th>
                    <th>{t('Expected vs Actual %')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Supervisor')}</th>
                 
                      
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

export default WastageReport;
