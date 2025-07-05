import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
function ItemSectionEdit() {
  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemData, setItemData] = useState([]);
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
  const { id } = useParams();
  const location = useLocation();

  console.log(id);

  const [formData, setFormData] = useState({
    sectionName: '',
    targetUnit: '',
    target: '',
    utarget: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    document.title = 'Edit Item Master';
 // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
    const itemId = id;


    // Fetch item data
   $.ajax({
        url: `${config.apiUrl}/getsectionandtarget/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          const { sectionName, targetUnit, target, utarget } = response;
        
          setFormData({
            sectionName: sectionName,
            targetUnit: targetUnit,
            target: target,
            utarget: utarget,
          });
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section and target:', error);
        },
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
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const itemId = id;

  
     const updatedData = {
      id: itemId,
      updatedtarget: formData.target,
      utarget: formData.utarget,
    };
    $.ajax({
      url: `${config.apiUrl}/updatesectiontarget`,
      method: 'POST',
      headers: customHeaders,
      data: updatedData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Target already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
         navigate(-1);
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
      },
    });
  };

  return (
    <>
      <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0', }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">{t('Edit')} {t('Target')}</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} method='POST' >
                  <div>
                   
                    
                  <div className="form-group row space">

<label className="col-sm-2 col-form-label" for="name"> {t('Section Name')}</label>

<div class="col-sm-8">
<input
type="text"
className="form-control margin-bottom required"
name="sectionName"
value={formData.sectionName}
readOnly
/>
</div>
</div>
<div className="form-group row space">

<label className="col-sm-2 col-form-label" for="name"> {t('UOM')}</label>

<div className="col-sm-8">
<input
type="text"
className="form-control margin-bottom required"
name="targetUnit"
value={formData.targetUnit}
readOnly
/>
</div>
</div>

<div className="form-group row space">

<label className="col-sm-2 col-form-label" for="name"> {t('Target')}<span class="textred">*</span></label>

<div className="col-sm-8">
<input
type="text"
className="form-control margin-bottom"
name="target"
value={formData.target}
onChange={handleInputChange}
required
/>
</div>
</div>

<div className="form-group row space">

<label className="col-sm-2 col-form-label" for="name">{t('UnitTarget')}<span class="textred">*</span></label>

<div className="col-sm-8">
<input
type="text"
className="form-control margin-bottom"
name="utarget"
value={formData.utarget}
onChange={handleInputChange}
required
/>
</div>
</div>

                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label"></label>
                      <div className="col-sm-4">
                      <input type="submit" id="submit-data" class="btn btn-success margin-bottom"
                               value={t('Update')} data-loading-text="Updating..." />

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

export default ItemSectionEdit;
