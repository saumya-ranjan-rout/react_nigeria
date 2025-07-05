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

function ItemCodeEdit() {

  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
 const [sections, setSections] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);
  const { id } = useParams();
  const location = useLocation();

  console.log(id);

  const getColorName = (colorId) => {
    const color = colorOptions.find((color) => color.id === colorId);
    return color ? color.color_name : '';
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    product_code: itemData.length > 0 ? itemData[0].product_code : '',
    product_des: itemData.length > 0 ? itemData[0].product_des : '',
    color_id: itemData.length > 0 ? itemData[0].color_id : '',
  });

  useEffect(() => {
    document.title = 'Edit Item Description';
 // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
    const itemId = id;


    // Fetch item data
  $.ajax({
        url: `${config.apiUrl}/getsections/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSections(response);
          
         const itemDescription = itemData.length > 0 ? itemData[0].product_des : '';

          setFormData((prevFormData) => ({
            ...prevFormData,
            item_description: itemDescription,
          }));
        },
        error: function (xhr, status, error) {
          console.error('Error fetching sections:', error);
        },
      });

   // Fetch item data
$.ajax({
  url: `${config.apiUrl}/getitemcodedata/${itemId}`,
  method: 'GET',
  headers: customHeaders,
  success: function (response) {
    setItemData(response);
  
    // Populate input fields with fetched data
    if (response.length > 0) {
      const { product_code, product_des, color_id } = response[0];
      setFormData((prevFormData) => ({
        ...prevFormData,
        product_code,
        product_des,
        color_id,
      }));
    }
  
    const table = tableRef.current;
    table.clear().rows.add(response).draw();
  },
  
  error: function (xhr, status, error) {
    console.error('Error fetching item data:', error);
  },
});

      $.ajax({
        url: `${config.apiUrl}/getcolors`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setColorOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching colors:', error);
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
    const itemId = id; // Accessing id from useParams()
  const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `${config.apiUrl}/updateitemcolor/${itemId}`,
      method: 'POST',
      headers: customHeaders,
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
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
                <CardTitle tag="h5">Item Section Edit</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} method='POST' >
                  <div>
                   
                    
                    <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Product Code <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <input
                    type="text"
                    className="form-control margin-bottom required"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Product Description <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <input
                    type="text"
                    className="form-control margin-bottom required"
                    name="product_des"
                    value={formData.product_des}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group row space">
                <label className="col-sm-3 col-form-label" htmlFor="name">
                  <span className="color">Color <span className="textred">*</span></span>
                </label>

                <div className="col-sm-8">
                <select
                    className="form-control"
                    id="color"
                    name="color_id"
                    value={formData.color_id}
                    onChange={handleInputChange}
                  >
                    <option>Select color</option>
                    {colorOptions.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.color_name}
                      </option>
                    ))}
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

export default ItemCodeEdit;
