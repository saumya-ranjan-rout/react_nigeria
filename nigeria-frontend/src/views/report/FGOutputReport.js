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

function FGOutputReport() {
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
    const [currentDate, setCurrentDate] = useState(0);
    const [startFdate, setFdate] = useState(null);
    const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
    const [totalFGOutput, setTotalFGOutput] = useState(0);
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
     
     

    
   });

   const handleInputChange = (event) => {
     const { name, value } = event.target;

       setFormData({ ...formData, [name]: value });

 };
 

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const updatedFormData = { ...formData, fromdate: formData.fromdate, userid: userid, roleid: roleId};

    const jsonData = JSON.stringify(updatedFormData);
  //  console.log(updatedFormData);
  //   alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/getfgoutputreport`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        // console.log("response",response);
        // Access the timesheet results from the response object
       const { timesheet } = response;
       const { fdate } = response;
       const { title } = response;
       
       const filetitle=`MZ FGOUTPUT REPORT ${title}`;
       setData(timesheet); 
       setIsSearchFetch(true);
      // alert(fdate);
       setFdate(fdate);
        // alert(fdate);
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
        { data: 'item_product_name' },
        { data: 'item_groups' },
        { data: 'item_group_product_des' },                
        { data: 'fg_output' },
        { data: 'rowCount' },
        { data: 'rew' },
      ],
       
    });
    setLoading(false);
  };




  useEffect(() => {
  setLoading(true)
    document.title = 'FGOUTPUT REPORT';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      const filetitle =`MZ  FGOUTPUT REPORT DATE ${formattedToday}`;

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

      $.ajax({
        url:`${config.apiUrl}/getfgoutputreport`,
        method: "POST",
        headers: customHeaders,
        data: jsonData,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
          // console.log("response",response);
            // Access the timesheet results from the response object
            // const { timesheet } = response;
            const { timesheet } = response;
            const { date } = response;
            // alert(date);
            setData(timesheet);               
            // Update the component state with the timesheet data
            // setData(response); 
            // alert(response);
            setCurrentDate(date);
            initializeTable(response.timesheet,filetitle);  
            // initializeTable(response);
            setIsSearchFetch(false);
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
    


  }, []);

 

  const calculateSummary = () => {
    // Calculate total target and total completed
    let totalFg = 0;
    data.forEach((row) => {
      totalFg += row.tar;
    });
   // totalFg = totalFg.toFixed(2);
    return { totalFg };
  };

const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
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
               <CardTitle tag="h5"> FG OUTPUT
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
           
                <form  onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                      <div className="col-sm-2">
                        <span className="textgreen"> {t('Date')}</span>

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
                      placeholderText="Select Date"
                      name="fromdate"
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
                            <h4 class="header-title"> <span class="textred" >{isSearchFetch ? `${startFdate}` : currentDate}</span></h4>
                        </div>


                          <div className="table-responsive">


                            <table id="example" className="display">
                            <thead>
                            <tr>
                      
                      <th>{t('Product Name')}</th>
                      <th>{t('Color Code')}</th>
                      <th>{t('Color Description')}</th>                      
                      <th>{t('Fg Output')}</th>
                      <th>{t('No. of Worker')}</th>
                      <th>PPP</th>
                      
                    </tr>
                              </thead>
<tfoot>
<tr>
                      
                      <th>{t('Product Name')}</th>
                      <th>{t('Color Code')}</th>
                      <th>{t('Color Description')}</th>                      
                      <th>{t('Fg Output')}</th>
                      <th>{t('No. of Worker')}</th>
                      <th>PPP</th>
                      
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

export default FGOutputReport;
