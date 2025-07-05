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

function EditColor() {
  const { t } = useTranslation();
const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const [categories, setCategories] = useState([]);
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
console.log(id);

  const [formData, setFormData] = useState({
    subcategory_name: '',
    category_id: '',
   
  });

  

  useEffect(() => {
    document.title = 'Edit Item Subcategory';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      

      fetch(`${config.apiUrl}/ic`, { headers: customHeaders })
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
          fetch(`${config.apiUrl}/itemsubcategory/${id}`, { headers: customHeaders })
            .then(response => response.json())
            .then(response => {
              const { subcategory_name, category_id } = response;
              setFormData({ subcategory_name, category_id });
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
  }, [navigate, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id, // Ensure `id` is defined
      category_id: formData.category_id, // Ensure `formData` is defined and populated
      subcategory_name: formData.subcategory_name,
    };
  
  //  alert(JSON.stringify(updatedData));
  
    $.ajax({
      url: `${config.apiUrl}/updateitemsubcategory`,
      method: 'PUT',
      headers: customHeaders, // Ensure `customHeaders` is defined
      data: JSON.stringify(updatedData),
      contentType: 'application/json',
      success: function (response) {
     //   alert('Updated data: ' + response);
        setServerMessage(response.message); // Ensure `setServerMessage` is defined
        setServerMessageClass(response.message === 'Category and Subcategory name already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page after a delay
        setTimeout(() => {
          navigate(-1); // Ensure `navigate` is defined
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Category and Subcategory name already exists'); // Set a generic error message
        setServerMessageClass('alert alert-danger');
      },
    });
  };
  
  

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
                <CardTitle tag="h5">Edit Item Subcategory</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                  <div className="form-group row space">
                <label className="col-sm-2 col-form-label" htmlFor="category">
                {t('Category Name')}  <span style={{ color: 'red'}}>*</span>
                </label>
                <div className="col-sm-6">
                  {categories.length > 0 ? (
                    <select className="form-control" name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                      <option value="">{t('Select')} {t('Category Name')}</option>
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
                <label className="col-sm-2 col-form-label" htmlFor="subcategory_name">
                {t('Subcategory Name')} <span style={{ color: 'red'}}>*</span>
                </label>
                <div className="col-sm-6">
                  <input
                    type="text"
                    placeholder={t('Subcategory Name')}
                    className="form-control margin-bottom required"
                    name="subcategory_name"
                    value={formData.subcategory_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label"></label>
                      <div className="col-sm-4">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Update"
                          data-loading-text="Updating..."
                        />
                       
                      </div>
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

export default EditColor;
