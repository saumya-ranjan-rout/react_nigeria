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

function EditItem() {

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
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);
  const { id } = useParams();
  const location = useLocation();

  console.log(id);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [formData, setFormData] = useState({
    category_id: '',
    item_group: '',
    item_description: '',
    tppp: '',
    net_weight: '',
    targeted_waste: '',
  });

  useEffect(() => {
    document.title = 'Edit Item Master';
 // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
    // Fetch item data
    $.ajax({
      
      url: `${config.apiUrl}/edititemmaster/${id}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setItemData(response);

        // Populate input fields with fetched data
        if (response.length > 0) {
          const { category_id, item_group, item_description, tppp, net_weight, targeted_waste } = response[0];
          setFormData((prevFormData) => ({
            ...prevFormData,
            category_id,
            item_group,
            item_description,
            tppp,
            net_weight,
            targeted_waste,
          }));
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching item data:', error);
      },
    });

    // Fetch item categories from API
    $.ajax({
      url: `${config.apiUrl}/itemcategories`, // Replace with your API endpoint
        method: 'GET',
        headers: customHeaders,
      success: function (response) {
        setCategories(response);
      },
      error: function (xhr, status, error) {
        console.log(error);
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
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `${config.apiUrl}/updateitemmaster/${itemId}`,
      method: 'POST',
      headers: customHeaders,
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Item already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
         navigate(-1);
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Item already exists'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
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
                <CardTitle tag="h5">Item Master Edit</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row space">
                      <div className="col-md-4">

                        <span className="textgreen">Category Name <span className="textred">*</span></span>

                        <select
                          className="form-control"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.category_name}
                            </option>
                          ))}
                        </select>

                      </div>
                      <div className="col-md-4">
                        <span className="textgreen">ETA Code <span className="textred">*</span></span>

                        <input
                          type="text"
                          className="form-control margin-bottom "
                          name="item_group"
                          value={formData.item_group}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">

                        <span className="textgreen">Item Name <span className="textred">*</span></span>

                        <input
                          type="text"
                          className="form-control margin-bottom "
                          name="item_description"
                          value={formData.item_description}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group row space">
                      <div className="col-md-4">

                        <span className="textgreen">Targeted PPP <span className="textred">*</span></span>

                        <input
                          type="text"
                          className="form-control margin-bottom "
                          name="tppp"
                          value={formData.tppp}
                          onChange={handleInputChange}
                          required
                        />

                      </div>
                      <div className="col-md-4">
                        <span className="textgreen">Net Weight  <span className="textred">*</span></span>

                        <input
                          type="text"
                          className="form-control margin-bottom "
                          name="net_weight"
                          value={formData.net_weight}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">

                        <span className="textgreen">Targeted Waste <span className="textred">*</span></span>

                        <input
                          type="text"
                          className="form-control margin-bottom "
                          name="targeted_waste"
                          value={formData.targeted_waste}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-11 col-form-label"></label>
                      <div className="col-sm-1">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Edit"
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

export default EditItem;
