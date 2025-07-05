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
import axios from 'axios';
// Import your image
import teamwork from './teamwork.png'; // Adjust the path as per your project structure
import group from './group.png'; // Adjust the path as per your project structure
import unity from './unity.png'; // Adjust the path as per your project structure
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import config from '../config';

import 'datatables.net-dt/js/dataTables.dataTables';
//import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';


function ChangeLanguage() {
    const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  
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
    document.title = 'Change Language';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      

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
  }, []);


  const [formData, setFormData] = useState({
    line_name: '',
    
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Make an AJAX request using $.ajax
    $.ajax({
      url:  `${config.apiUrl}/changelanguage`,
      method: 'PUT',
      headers: customHeaders,
      data: JSON.stringify({ language: selectedLanguage ,userid:userid}),
      contentType: 'application/json',
      success: function (response) {
        setServerMessage("Language updated successfully");
        setServerMessageClass('alert alert-success');
       
      
        localStorage.setItem('language', selectedLanguage);
        setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
     
      },
      error: function (xhr, status, error) {
        // Error: handle the error case
       // alert('Failed to update language', error);
       setServerMessage('Failed to update language');
       setServerMessageClass('alert alert-danger');
      }
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
                <CardTitle tag="h5">Change Language</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label" htmlFor="product_catname">
                      {t('Language')}<span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="col-sm-6">
                      <select
                    name="language"
                    className="form-control"
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                  >
                    <option value="">{t('Select')} {t('Language')}</option>
                    <option value="english">English</option>
                    <option value="portuguese">Portuguese</option>
                  </select>
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
                          data-loading-text="updating..."
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

export default ChangeLanguage;
