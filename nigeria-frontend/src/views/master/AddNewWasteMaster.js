import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Row,
  Col,
} from "reactstrap";
import $ from 'jquery';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
//import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
//DB Connection
import config from '../../config';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import dateUtils from '../../utils/dateUtils';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
function AddNewWasteMaster() {

  const today = dateUtils.getCurrentDateTime();
  const oneMonthAgo = dateUtils.getOneMonthAgo();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
  const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd/MM/yyyy");
  const [startDate, setStartDate] = useState(today);
  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

useEffect(() => {
  document.title = 'Add Waste Master';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      $.ajax({
        url: `${config.apiUrl}/categorybaselineppp`, // Replace with your API endpoint
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setCategories(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });

      // Fetch item masterr from API
      $.ajax({
        url:`${config.apiUrl}/productbaselineppp`, // Replace with your API endpoint
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setProducts(response);
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });

      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }


    // Fetch section type options from API


  
  }, []);


  const [formData, setFormData] = useState({
    product_id: '',
    cat_id: '',
    expected_waste_percentage: '',
    qty: '',
    fiber: '', 
    expected_waste: '', 
    date:formattedToday, 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    $.ajax({
      url:`${config.apiUrl}/addwastemaster`,
      method: "POST",
      headers: customHeaders,
      data: formData,
      success: function (response) {
        console.log(response); 
        if (response.message) {
          // If the message from the API response matches the error message, set it in state
          alert(response.message);
              // If the message from the API response matches the error message, set it in state
              alert(response.message);
           
              navigate('/admin/master/wastemaster');
            }   
      },
      error: function (xhr, status, error) {
        console.log(error);
        
      },
    });
  };
  const handleCategoryChange = (event, selectedCategoryId) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const category_id = selectedOption.getAttribute('data-categoryid');
    // alert(category_id);
      // You can also use selectedCategoryId if needed
      $.ajax({
        url:`${config.apiUrl}/getcategoryname/${category_id}`, // Replace 'your-api-endpoint' with the actual endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
        // console.log(response);
        const category = response.data; // Assuming the response data is the category name
        // Set the selected category_id in formData
        formData.cat_id = category_id;
        
        // Set the selected value for the <select> element
        // event.target.value = category_id;
  
        // Trigger the input change event if needed
        handleInputChange(event);
         
        },
        error: function (xhr, status, error) {
          console.error('Error fetching category name:', error);
        },
      });
    }

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
                <CardTitle tag="h5">{t('Add')} {t('Waste_Master')}</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
              <form onSubmit={handleSubmit} method='POST' >

             

              <div class="form-group row space">

                    <label class="col-sm-2 col-form-label"
                           for="product_id">{t('Product')} <span style={{ color: 'red'}}>*</span></label>

                    <div class="col-sm-6">
                    <select
                    class="form-control"
                    name="product_id"
                    value={formData.product_id}
                    onChange={(event) => {
                      handleInputChange(event);
                      handleCategoryChange(event, formData.product_id);
                    }}
                    required
                  >
                    <option value="">{t('Select')} {t('Product Name')}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id} data-categoryid={product.category_id}>
                        {product.item_description}
                      </option>
                    ))}                 
                  </select>
                    </div>
                </div>

                <div class="form-group row space">

                    <label class="col-sm-2 col-form-label"
                           for="cat_id">{t('Category')} <span style={{ color: 'red'}}>*</span></label>

                    <div class="col-sm-6">
                    <select
                    class="form-control"
                    name="cat_id"
                    value={formData.cat_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('Select')} {t('Category Name')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}                
                  </select>
                    </div>
                </div>

              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="expected_waste_percentage">% {t('of')} {t('Expected')} {t('Waste')} <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number"  placeholder={`% ${t('of')} ${t('Expected')} ${t('Waste')}`}
                            className="form-control margin-bottom  required" name="expected_waste_percentage"  value={formData.expected_waste_percentage} onChange={handleInputChange} required/>
                  </div>
              </div>    

              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="qty">{t('Qty')} <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number" placeholder={t('Qty')}
                            className="form-control margin-bottom  required" name="qty"  value={formData.qty} onChange={handleInputChange} required/>
                  </div>
              </div> 

              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="fiber">{t('Fiber')} {t('in')} gm <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number" placeholder={`${t('Fiber')} ${t('in')} gm`}
                            className="form-control margin-bottom  required" name="fiber"  value={formData.fiber} onChange={handleInputChange} required/>
                  </div>
              </div> 

              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="expected_waste">{t('Expected')} {t('Waste')} <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number" placeholder={`${t('Expected')} ${t('Waste')}`}
                            className="form-control margin-bottom  required" name="expected_waste"  value={formData.expected_waste} onChange={handleInputChange} required/>
                  </div>
              </div> 

              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"
                        for="date">{t('Date')}</label>
                  
                  <div className="col-sm-6">
       

<DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      required
                      onChange={(date) => {
      
                        const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                        const updatedEvent = { target: { value: formattedDate, name: 'date' } };
                        handleInputChange(updatedEvent);
                        setStartDate(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Start Date"
                      name="date"
                    />


                      {/* <input type="date"
                            className="form-control margin-bottom  required" name="date"  value={formData.date} onChange={handleInputChange} required/> */}
                  </div>
              </div> 

              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"></label>

                  <div className="col-sm-4">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value={t('Add')} data-loading-text="Adding..." />
                      
                  </div>
              </div>

              </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default AddNewWasteMaster;
