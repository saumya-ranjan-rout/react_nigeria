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

function PerformanceEfficiencyReport() {
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
  const [processedResult, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
  const [totalFGOutput, setTotalFGOutput] = useState(0);
  const [productDataa, setItemspan] = useState([]);
  const [period, setPeriod] = useState([]);
  const [isAchvEffVisible, setAchvEffVisible] = useState(true); // Set to true by default
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
    fromdate:formattedToday,
    todate: formattedToday,
    search: '',
    product_name: '',
   
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  
};
let newColumns = []; 
const handleSubmit = (event) => {
  setLoading(true);
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: formData.fromdate, todate: formData.todate, userid: userid, roleid: roleId };
  const jsonData = JSON.stringify(updatedFormData);

  setPeriod([]);
  const periodd = [];
  fetch(`${config.apiUrl}/getperformanceefficiencyreport`, {
    method: 'POST',
    headers: {
      ...customHeaders,
      'Content-Type': 'application/json'
    },
    body: jsonData
  })
  .then(response => response.json())
  .then(data => {
    const { processedResult, indexcolumn, newfromdate1, newtodate1 } = data;
   const filetitle = `MZ PERF EFFICIENCY REPORT FROM ${newfromdate1} TO ${newtodate1} `;

    const begin = newfromdate1;
    const end = newtodate1;
    const periodd = dateUtils.getDatesBetween(begin, end, 'DD-MM-YYYY', 'DD-MM-YYYY');

    setIsSearchFetch(true);
    setData(processedResult);

setAchvEffVisible(false);
   setPeriod(periodd);

const formattedDates = periodd.map(dtt => dtt);
const headers = [
  `Emp ${t('Name')}`,
  t('Id'),
  t('Date of Joining'),
  t('Product Name'),
  t('Section'),
  ...formattedDates,
];
console.log(headers);
// Set columns for DataTable
const columns = [
  { data: 'worker' },
  { data: 'entry_id' },
  { data: 'joindate' },
  { data: 'item_description' },
  { data: 'section_name' },
  ...indexcolumn[0].map((dt) => {
    return {
      data: null,
      render: function (data, type, row) {
        if (type === 'display') {
          const dd1 = `${"day" + dt}`;
          return row[dd1];
        }
        return data;
      },
    };
  }),
];
    // Destroy existing DataTable instance
    const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
    if (dataTable) {
      dataTable.destroy();
    }

    // Clear the table content
    $('#example').empty();
// Initialize DataTable
tableRef.current = $('#example').DataTable({
  autoWidth: false,
        dom: "Bfrtip",
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

  data: processedResult,
  columns: columns,
  // Set headers dynamically in DataTable headerCallback
  headerCallback: function (thead, data, start, end, display) {
    headers.forEach((header, index) => {
      $(thead).find('th').eq(index).text(header);
    });
  },
});

setLoading(false);
  })
  .catch(error => {
    console.error('Error:', error);
    setLoading(false);
   
  });
 
 // setAchvEffVisible(false);
};

const calculateTotalFGOutput = () => {
const sum = tableRef.current
  .column('4')
  .data()
  .reduce(function (a, b) {
    return parseInt(a) + parseInt(b);
  }, 0);

setTotalFGOutput(sum);
};

    useEffect(() => {
      document.title = `PERF EFFICIENCY REPORT`;
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

         const filetitle =`MZ PERF EFFICIENCY REPORT DATE ${formattedToday}`;

      setLoading(true);

      const updatedFormData = { userid: userid, roleid: roleId };
      const jsonData = JSON.stringify(updatedFormData);
      $.ajax({
          url: `${config.apiUrl}/getdefaultperformanceefficiency`,
          method: "POST",
          headers: customHeaders,
          data: jsonData,
          processData: false,
          contentType: 'application/json',
          success: function (response) {
 
            const { timesheet ,date } = response;
            setData(timesheet);
            setIsSearchFetch(false);
          //  alert(date);
        // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

const currentDate = formattedToday;

const headers = [
  `Emp ${t('Name')}`,
  t('Id'),
  t('Date of Joining'),
  t('Product Name'),
  t('Section'),
  currentDate,
];
// Set columns for DataTable
const columns = [
  { data: 'worker' },
  { data: 'entry_id' },
  { data: 'joindate' },
  { data: 'item_description' },
  { data: 'section_name' },
  {
    data: null,
    render: function (data, type, row) {
      var sum =
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
      var efficiency = (sum / row.target) * 100;
      var formattedEfficiency = efficiency.toFixed(2) + '%';
  
      if (sum !== '') {
        return (
        //   '<span style="color: green">' +
        //   sum +
        //   '</span>[' +
        //   '<span style="color: red">' +
        //   formattedEfficiency +
        //   '</span>]'
        '<span style="color: green">' +
        formattedEfficiency +
          '</span>'
        );
      } else {
        return 'NA';
      }
    },
  },
  
];

// Initialize DataTable
tableRef.current = $('#example').DataTable({
  autoWidth: false,
  dom: "Bfrtip",
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
  columns: columns, 
  // Set headers dynamically in DataTable headerCallback
  headerCallback: function (thead, data, start, end, display) {
    headers.forEach((header, index) => {
      $(thead).find('th').eq(index).text(header);
    });
  },
});

setLoading(false);

        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
         
          setLoading(false);
        },
      });

           
          }
 

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
               <CardTitle tag="h5">Performance Efficiency
                <hr></hr>
                Search Between Dates Reports
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
                <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space">

        

            
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
            <h4 class="header-title"> <span class="textred" >{isSearchFetch ? `[${formData.fromdate}-${formData.todate}]` : formattedToday}</span></h4>
            </div>


<div className="table-responsive">
              <table id="example" className="display">
               
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

export default PerformanceEfficiencyReport;
