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

function EditWasteMaster() {
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
      product_id: '',
      cat_id: '',
      expected_waste_percentage: '',
      qty: '',
      fiber: '', 
      expected_waste: '', 
    });

  

  useEffect(() => {
    document.title = 'Edit Waste Master';
     // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
     // alert(id);
     
    // alert(`${config.apiUrl}/getLaborRateById/${id}`);
    fetch(`${config.apiUrl}/productbaselineppp`, { headers: customHeaders })
    .then(response => response.json())
    .then(response => {
       setProducts(response);


    })
    .catch(error => {
      console.log(error);
    })

    // Fetch item categories from API
   fetch(`${config.apiUrl}/itemcategories`, { headers: customHeaders })
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
       fetch(`${config.apiUrl}/getWasteMasterById/${id}`, { headers: customHeaders })
         .then(response => response.json())
         .then(response => {
           const { product_id, cat_id, expected_waste_percentage, qty, fiber, expected_waste } = response;
           setFormData({ product_id, cat_id, expected_waste_percentage, qty, fiber, expected_waste });
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
    product_id: formData.product_id,
    cat_id: formData.cat_id,
    expected_waste_percentage: formData.expected_waste_percentage,
    qty: formData.qty,
    fiber: formData.fiber,  
    expected_waste: formData.expected_waste,     
  };

  fetch(`${config.apiUrl}/updatewastemaster`, {
    method: 'PUT',
    headers: {
      ...customHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Wastage already exists for this product and category on this date!') {
        // If the message from the API response matches the error message, set it in state
        alert(data.message);
        window.location.reload();
      } else {
        // Handle other success scenarios here
        console.log('Updated data:', data);
        alert(data.message);
          navigate('/admin/master/wastemaster');
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
          url: `${config.apiUrl}/getcategoryname/${category_id}`,
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
                <CardTitle tag="h5">{t('Edit')} {t('Waste_Master')}</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
              <form onSubmit={handleSubmit} method="POST">
                      
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
  placeholder={`${t('Select')} ${t('Product Name')}`}
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
              <div className="form-group row space">

                  <label className="col-sm-2 col-form-label"
                        for="expected_waste_percentage">% {t('of')} {t('Expected')} {t('Waste')} <span style={{ color: 'red'}}>*</span></label>

                  <div className="col-sm-6">
                      <input type="number" placeholder={`% ${t('of')} ${t('Expected')} ${t('Waste')}`}
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
                        for="fiber">{t('Fiber')} {t('in')} gm  <span style={{ color: 'red'}}>*</span></label>

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

export default EditWasteMaster;
