import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Select from 'react-select';


function EditBaselinePPP() {
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

     const { id } = useParams();
     const [formData, setFormData] = useState({
      year: '',
      month: '', 
      product_id: '',
      cat_id: '',
      ppp: '',
    });

  

  useEffect(() => {
    document.title = 'Edit Baseline PPP';
     // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
     // alert(id);
     
    // alert(`${config.apiUrl}/getLaborRateById/${id}`);
    fetch( `${config.apiUrl}/productbaselineppp`,{headers: customHeaders })
    .then(response => response.json())
    .then(response => {
       setProducts(response);
    })
    .catch(error => {
      console.log(error);
    })

    // Fetch item categories from API
   fetch( `${config.apiUrl}/itemcategories`,{headers: customHeaders })
   .then(response => response.json())
   .then(response => {
     setCategories(response);
   })
   .catch(error => {
     console.log(error);
   })

   .then(() => {
     // Once the categories are fetched and set, fetch the subcategory by ID
     if (id) {
       console.log('Subcategory ID:', id);
       fetch( `${config.apiUrl}/getBaselinepppById/${id}`,{headers: customHeaders })
         .then(response => response.json())
         .then(response => {
           const { year, month, cat_id, product_id, ppp } = response;
           setFormData({ year, month, cat_id, product_id, ppp });
         })
         .catch(error => {
           console.log(error);
         });
     }
   });
    

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });

    }

       // Fetch section type options from API
    

 
    
  }, [navigate, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      year: formData.year,
      month: formData.month,
      cat_id: formData.cat_id,
      product_id: formData.product_id,
      ppp: formData.ppp,     
    };
  
    fetch(`${config.apiUrl}/updatebaselineppp`, {
      method: 'PUT',
      headers: {
        ...customHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
    
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data.message === 'PPP Baseline for this month and year already exists') {
          // If the message from the API response matches the error message, set it in state
          alert(data.message);
          window.location.reload();
        } else {
          // Handle other success scenarios here
          console.log('Updated data:', data);
          alert(data.message);
          navigate('/admin/master/baselineppp');
          // Perform any additional actions after successful update
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle the error case
        // For example, show an error message to the user
      });
  };
  const handleCategoryChange = (selectedOption, selectedProductId) => {
    //  console.log("selectedOption:", selectedOption);
      
      const category_id = selectedOption['data-categoryid'];
    
      if (category_id) {
        $.ajax({
          url:`${config.apiUrl}/getcategoryname/${category_id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            const category = response.data; // Assuming the response data is the category name
            // Set the selected category_id in formData
            formData.cat_id = category_id;
    
            // Trigger the input change event if needed
            handleInputChange({ target: { name: 'cat_id', value: category_id } });
          },
          error: function (xhr, status, error) {
            console.error('Error fetching category name:', error);
          },
        });
      }
    };

    const productOptions = products.map((product) => ({
      value: product.id,
      label: product.item_description,
    }));

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
                <CardTitle tag="h5">{t('Edit')} {t('Baseline PPP')}</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
              <form onSubmit={handleSubmit} method="POST">
            
              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="year">{t('Year')}</label>

                  <div className="col-sm-6">
                      <input type="text" 
                            className="form-control margin-bottom" name="year"  value={formData.year} readOnly/>
                  </div>
              </div>

              <div class="form-group row space">

                    <label class="col-sm-2 col-form-label"
                           for="month">{t('month')} <span style={{ color: 'red'}}>*</span></label>

                    <div class="col-sm-6">
                    <select
                    class="form-control"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('Select')} {t('month')}</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>                   
                  </select>
                    </div>
                </div>

                <div class="form-group row space">

                    <label class="col-sm-2 col-form-label"
                           for="product_id">{t('Product')} <span style={{ color: 'red'}}>*</span></label>

                    <div class="col-sm-6">
                    {products.length > 0 ? (
                  

                  <Select
  className="react-select-container"
  classNamePrefix="react-select"
  name="product_id"
  value={productOptions.find((option) => option.value === formData.product_id)}
  onChange={(selectedOption) => {
    console.log("Full event:", selectedOption);  // Log the entire event object
    const selectedProductId = selectedOption.value;
    handleInputChange({ target: { name: 'product_id', value: selectedProductId } });
    handleCategoryChange(selectedOption, selectedProductId);
  }}
  options={productOptions}
  placeholder={t('Select')}
  isSearchable
/>
                   ) : (
                    <p>Loading products...</p>
                  )}
                    </div>
                </div>

              <div className="form-group row space">
                <label className="col-sm-2 col-form-label" htmlFor="cat_id">
                {t('Category Name')} <span style={{ color: 'red'}}>*</span>
                </label>
                <div className="col-sm-6">
                  {categories.length > 0 ? (
                    <select className="form-control" name="cat_id" value={formData.cat_id} onChange={handleInputChange} required>
                      <option value="">{t('Select')} {t('Category')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>Loading categories...</p>
                  )}
                </div>
              </div>
              <div className="form-group row">

                  <label className="col-sm-2 col-form-label"
                        for="ppp">{t('Baseline PPP')} <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number" placeholder="Baseline PPP"
                            className="form-control margin-bottom  required" name="ppp"  value={formData.ppp} onChange={handleInputChange} required/>
                  </div>
              </div>  
              <div className="form-group row">
                <label className="col-sm-2 col-form-label"></label>
                <div className="col-sm-4">
                  <input type="submit" id="submit-data" className="btn btn-success margin-top" value={t('Update')} data-loading-text="Updating..." />
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

export default EditBaselinePPP;
