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
import Select from 'react-select';
import config from '../../config';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function AddNewWorkingDays() {
  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  
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
    document.title = 'Add New Monthly Labor Rate';
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


    // Fetch section type options from API


  
  }, []);


  const [formData, setFormData] = useState({
    year: '2023',
    month: '', 
    days: '',    
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    $.ajax({
      url: `${config.apiUrl}/addworkingdays`,
      method: "POST",
      headers: customHeaders,
      data: formData,
      success: function (response) {
      console.log(response);
      if (response.message) {
              // If the message from the API response matches the error message, set it in state
              alert(response.message);
           
              navigate('/admin/master/workingdays');
            }   
      },
      error: function (xhr, status, error) {
        console.log(error);
        
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
                <CardTitle tag="h5">{t('Add New')} {t('Working Days')}</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
              <form onSubmit={handleSubmit} method='POST' >


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

<div className="form-group row">

    <label className="col-sm-2 col-form-label"
          for="days">{t('Working Days')} <span style={{ color: 'red'}}>*</span></label>

    <div className="col-sm-6">
        <input type="number" placeholder={t('Working Days')}
              className="form-control margin-bottom  required" name="days"  value={formData.days} onChange={handleInputChange} required/>
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

export default AddNewWorkingDays;
