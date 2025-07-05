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

function SectionwiseEfficiencyReport() {
    const today = dateUtils.getCurrentDateTime();
    const oneMonthAgo = dateUtils.getOneMonthAgo();
    const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
    const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd-MM-yyyy");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

  const { t } = useTranslation();
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);

    const [loading, setLoading] = useState(false);    
    const [productOptions, setProductOptions] = useState([]);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(0);
    const [isPeriodSearch, setIsPeriodSearch] = useState(false); // State to track if "Period" search type is selected
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
    // alert(token);

    const [formData, setFormData] = useState({
        fromdate: formattedToday,
        todate: formattedToday,
        category: '',
        product_id: '',
        product_name: '',
        section_id: '',
        section_name: '',
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
        } else {
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
        //alert(jsonData);
        $.ajax({
            url:`${config.apiUrl}/getsectionwiseefficiencyreportData`,
            method: "POST",
            headers: customHeaders,
            data: jsonData,
            processData: false,
            contentType: 'application/json',
            success: function (response) {

                // Access the timesheet results from the response object
                const { timesheet } = response;
                const { title } = response;
           
                const filetitle=`MZ SECTIONWISE EFFICIENCY REPORT ${title}`;

                // Update the component state with the timesheet data
                setData(timesheet);
                setIsSearchFetch(true);
                initializeTable(response.timesheet,filetitle);
            setLoading(false)
                
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
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
                { data: 'category_name' },
                { data: 'item_description' },
                { data: 'section_name', },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const complete = row.comp;
                            if (complete != 0) {
                                const st = row.target * row.tt;
                                // Calculate the efficiency
                                const efficiency = (complete / st) * 100;
                                const formattedEfficiency = efficiency.toFixed(2);

                                // Return the formatted efficiency percentage for display
                                return formattedEfficiency + '%';
                            }
                            else {
                                return "N/A";
                            }

                        }
                        return data;
                    },
                },
                { data: 'date_time' },

            ],
        });
        setLoading(false);
    };




    useEffect(() => {
 setLoading(true);
        document.title = 'Sectionwise Efficiency Report';
        // Check if the user is logged in
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            // Redirect to the login page if not logged in
            navigate('/login');
        } else {
            const filetitle =`MZ SECTIONWISE EFFICIENCY REPORT DATE ${formattedToday}`;
      
            setLoading(true);
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

            
            const updatedFormData = { userid: userid, roleid: roleId };
            const jsonData = JSON.stringify(updatedFormData);

            $.ajax({
                url:`${config.apiUrl}/getsectionwiseefficiencyreportData`,
                method: "POST",
                headers: customHeaders,
                data:jsonData,
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
        const fetchCategoryOptions = () => {
            $.ajax({
                url:`${config.apiUrl}/getCategoryOptions`,
                method: 'GET',
                headers: customHeaders,
                success: function (response) {
                    setCategoryOptions(response);
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching category options:', error);
                },
            });
        };

        fetchCategoryOptions();

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
        

        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        navigate('/login');
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
               <CardTitle tag="h5"> Sectionwise Efficiency
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
                                            {/* <DatePicker
                                                className="form-control margin-bottom"
                                                selected={startDate}
                                                // onChange={date => setStartDate(date)}
                                                onChange={date => {
                                                    const formattedDate = date.toLocaleDateString('en-GB', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    });
                                                    const updatedEvent = { target: { value: formattedDate, name: 'fromdate' } };
                                                    handleInputChange(updatedEvent);
                                                    setStartDate(date);
                                                }}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={`${t('Select')} ${t('Start Date')}`}
                                                name="fromdate"
                                                required
                                            /> */}
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
                                            {/* <DatePicker
                                                className="form-control margin-bottom"
                                                selected={endDate}
                                                // onChange={date => {
                                                //   setEndDate(date);
                                                //   handleInputChange(date);
                                                // }}
                                                onChange={date => {
                                                    const formattedDate = date.toLocaleDateString('en-GB', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    });
                                                    const updatedEvent = { target: { value: formattedDate, name: 'todate' } };
                                                    handleInputChange(updatedEvent);
                                                    setEndDate(date);
                                                }}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText={`${t('Select')} ${t('To Date')}`}
                                                name="todate"
                                                required
                                            /> */}

                                            
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
                                    <span className="textgreen">{t('Category')}</span>
                                    <select
                                        id="category"
                                        className="form-control"
                                        name="category"
                                        value={formData.category} onChange={handleInputChange}
                                    >
                                        <option value="">{t('Select')} {t('Category')}</option>
                                        {categoryOptions.map((categoryOption) => (
                                            <option key={categoryOption.id} value={categoryOption.id}>
                                                {categoryOption.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-3">
                                    <span className="textgreen">{t('Product Name')}</span>
                                    {/* <select
                                        className="form-control"
                                        name="product_id"
                                        id="product_id"

                                        value={formData.product_id}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            //handleProductChange(e);
                                        }}

                                    >
                                        <option value="">{t('Select')} {t('Product Name')}</option>
                                        {productOptions.map((productOption) => (
                                            <option
                                                key={productOption.id}
                                                value={productOption.id}
                                            >
                                                {productOption.item_description}
                                            </option>
                                        ))}
                                    </select> */}

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



                                <div className="col-sm-2">
                                    <span className="textgreen">{t('Section')}</span>
                                    {/* <select
                                        id="section_id"
                                        className="form-control"
                                        name="section_id"
                                        value={formData.section_id} onChange={handleInputChange}
                                    >
                                        <option value="">{t('Select')} {t('Section')}</option>
                                        {sectionOptions.map((sectionOption) => (
                                            <option
                                                key={sectionOption.id}
                                                value={sectionOption.id}
                                            >
                                                {sectionOption.section_name}
                                            </option>
                                        ))}
                                    </select> */}

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

                                <div className="col-sm-1">
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
                            <h4 class="header-title"> <span class="textred" >{isSearchFetch && formData.search == 4 ? `[${formData.fromdate}-${formData.todate}]` : currentDate}</span><span class="textgreen">{isSearchFetch ? `[${formData.product_name}-${formData.section_name}]` : ""}</span></h4>
                        </div>


                        <div className="table-responsive">


                             <table id="example" className="display">
                             <thead>
                             <tr>
                                        <th>{t('Category')}</th>
                                        <th>{t('Product')}</th>
                                        <th>{t('Section')}</th>
                                        <th>{t('Productivity')} %</th>
                                        <th>{t('Date')} (d-m-Y)</th>
                                    </tr>
                                </thead>
                                <tfoot>
                                <tr>
                                        <th>{t('Category')}</th>
                                        <th>{t('Product')}</th>
                                        <th>{t('Section')}</th>
                                        <th>{t('Productivity')} %</th>
                                        <th>{t('Date')} (d-m-Y)</th>
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

export default SectionwiseEfficiencyReport;
