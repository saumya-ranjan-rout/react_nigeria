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

function PPPReport() {
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
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  // 12-09-23
  const [currentDate, setCurrentDate] = useState(0);
  const [totalfgoutput, setTotalfgoutput] = useState(0);
  const [totalmandays, setTotalmandays] = useState(0);
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
    search: '',
    fromdate: formattedToday,
    todate: formattedOneMonthAgo,
    shift: '',
    product_name: '',
    product: '',
    shift_name: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;


    if (name === 'product_name') {
      const selectedProduct = productOptions.find(product => product.id === value);
      const productName = selectedProduct ? selectedProduct.item_description : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_name: value,
        product: productName,
      }));

    }
    else if (name === 'shift') {
      const selectedShift = shiftOptions.find(shift => String(shift.nhrs) === value);
      const shiftName = selectedShift ? selectedShift.name : '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        shift: value,
        shift_name: shiftName,
      }));
    }
  //   const { name, value } = event.target;
  //   if (name === 'fromdate') {
  //   setStartDate(new Date(value));
  // } else if (name === 'todate') {
  //   setEndDate(new Date(value));
  else {
    setFormData({ ...formData, [name]: value });
  }
};

  useEffect(() => {
    setLoading(true);
    document.title = 'PPP REPORT';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
     navigate('/login');
    } else {
      const filetitle =`MZ PPP REPORT DATE ${formattedToday}`;
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
    

    const updatedFormData = {userid: userid, roleid: roleId };
    const jsonData = JSON.stringify(updatedFormData);
//alert(jsonData);

  $.ajax({
    url:`${config.apiUrl}/gettodaypppreportData`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      const { date } = response;
      let cdate = date;
      const { timesheet } = response;
      const { total_fg_output } = response;
      const { total_mandays } = response;
      //setData(timesheet);
      const extractedData = timesheet.map(item => ({
        product_name: item.product_name,
        shift: item.shift,
        date: date
      }));
      setData(extractedData);
      setCurrentDate(cdate);
      setTotalfgoutput(total_fg_output);
      setTotalmandays(total_mandays);

           renderDataTable(timesheet,filetitle);

           setIsSearchFetch(false);
        setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      }
    });

    // Fetch shift options from API
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
  }
  }, []);

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
   
    const updatedFormData = { ...formData,userid: userid, roleid: roleId};
  
    const jsonData = JSON.stringify(updatedFormData);
    // console.log(updatedFormData);
  
    $.ajax({
      url:`${config.apiUrl}/getpppreportData`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        //alert(JSON.stringify(response));
        const { date } = response;
          let cdate = date;
          const { timesheet } = response;
          const { total_fg_output } = response;
          const { total_mandays } = response;
          const { title } = response;
          const filetitle=`MZ PPP REPORT ${title}`;
          //setData(timesheet);
          const extractedData = timesheet.map(item => ({
            product_name: item.product_name,
            shift: item.shift,
            date: date
          }));
         
          setData(extractedData);
          setCurrentDate(cdate);
          setTotalfgoutput(total_fg_output);
          setTotalmandays(total_mandays);
            renderDataTable(timesheet,filetitle);
  
            setIsSearchFetch(true);
        setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
  };

  function renderDataTable(timesheet,filetitle) {
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

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
      data: timesheet,
      buttons: [
        {
            extend: 'csv',
            text: 'CSV',
            filename: filetitle,
            exportOptions: {
                modifier: {
                    // You can add export options if needed
                }
            }
        },
        'copy'
    ],
      data: timesheet,
      columns: [
        { data: 'item_description' },
        { 
                          data: 'shift',
                          render: function(data) {
                            return data + 'HRS';
                          }
                        },
        {
          data: 'sum', // Assuming 'sum' is the property in your data
          render: function (data, type, row, meta) {
            const style = 'color: green;';
            return `<span style="${style}"><b>${data !== null ? data : 0}</b></span>`;
          },
        },
        { data: 'count' },
         { data: 'mandays' },
         { data: 'reww' },

        { data: 'date_time' },
      ],
      
    });
    setLoading(false); 
  }

  function calculateAndAlertRatio(sumValues, avgValues) {
    let totalSum = 0;
    let totalAvg = 0;

    sumValues.forEach((sum) => {
      if (sum !== null) {
        totalSum += sum;
      }
    });

    avgValues.forEach((avg) => {
      if (avg !== null) {
        totalAvg += avg;
      }
    });

    if (totalAvg !== 0) {
      const ratio = totalSum / totalAvg;
      // setTotalSum(totalSum);
      // setTotalAvg(totalAvg);
      // setRatio(ratio);
    }
  }

 const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };


  const handleProductChange = (id) => {
    // const selectedProduct = e.target.value;
    const selectedProduct = id;

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
               <CardTitle tag="h5"> PPP REPORT
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
                <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">
              <div className="col-sm-3">
                  <span className="textgreen">{t('Search Type')}</span>
                  <select
                    id="search"
                    className="form-control"
                    name="search"
                     value={formData.search} 
                    //  onChange={handleInputChange}
                    onChange={(e) => {
                      handleInputChange(e);
                      handleSearchTypeChange(e);
                  }}
                  >
                    <option value="">{t('Select')}</option>
                    <option value="5">Today</option>
                    <option value="4">Period</option>
                  </select>
                </div>
                {/* 12-09-23 */}
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
                <div className="col-sm-2">
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

                <div className="col-sm-3">
                  <span className="textgreen">{t('Product Name')}</span>


<Select
          className="basic-single"
          classNamePrefix="select"
          name="product_name"
          id="product_name"
     
          value={productOptions.find(option => option.value === formData.product_name)}
          onChange={(selectedOption) => {
            handleInputChange({ target: { name: 'product_name', value: selectedOption.id } });
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

                    <div>
                    <h4 class="header-title"> <span class="textred" >{isSearchFetch && formData.search == 4 ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{isSearchFetch ? `[${formData.product}-${formData.shift_name}]` : ""}</span></h4>
                    </div>

                      <div className="table-responsive">
                         <table id="example" className="display">
                         <thead>
                  <tr>
                    <th>{t('Product Name')}</th>
                    <th>{t('Shift')}</th>
                    <th>{t('Fg Output')}</th>
                    <th>{t('No Of Hour Worked')}</th>
                    <th>{t('Man Days')}</th>
                    <th>PPP</th>
                    <th>{t('Date Time')}</th>  
                   
                  </tr>
          
                </thead>
               <tfoot>        <tr>
          
          <th>{t('Summary')}</th>
          <th></th>
          <td>{t('Total Fg Output')}:<span class="textred" >{totalfgoutput.toFixed(2)}</span></td>
          <th></th>
          <td>{t('Total Man Days')}:<span class="textred" >{totalmandays.toFixed(2)}</span></td>
          <td>Total PPP:<span class="textred" >{totalfgoutput && totalmandays ? (totalfgoutput / totalmandays).toFixed(2) : '0'}</span></td>
          <th></th>  
         
        </tr></tfoot>
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

export default PPPReport;
