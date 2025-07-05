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



function EditSection() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [sectiontypeOptions, setSectionTypeOptions] = useState([]);
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
console.log(id);

  const [formData, setFormData] = useState({
    section_name: '',
    target_unit: '', 
     section_type: '',
   
  });

  

  useEffect(() => {
   document.title = 'Edit Item Section';
     // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`${config.apiUrl}/getsection/${id}`,{headers: customHeaders})
         .then(response => response.json())
          .then(response => {
            const { section_name, target_unit, section_type } = response;
            setFormData({ section_name, target_unit, section_type });
          })
          .catch(error => {
            console.log(error);
          });
      }
    

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
      const fetchSectionTypeOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/getsectiontype`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSectionTypeOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

      fetchSectionTypeOptions();
    
  }, [navigate, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


 const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      section_name: formData.section_name,
      target_unit: formData.target_unit,
      section_type: formData.section_type,
     
    };
  
    $.ajax({
      url: `${config.apiUrl}/updatesection`,
      method: 'POST',
      headers: customHeaders,
      data: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Section already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          navigate(-1);
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Section already exists'); // Set the server message in state for other errors
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
                <CardTitle tag="h5">Edit Color</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label" htmlFor="product_catname">
                        Section Name<span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          placeholder="Name"
                          className="form-control margin-bottom required"
                          name="section_name"
                          value={formData.section_name}  onChange={handleInputChange} required
                        />

                      </div>
                    </div>
                    <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="target_unit"><span className='textblack'>Target Unit</span></label>

                    <div class="col-sm-6">
                    <select
                        name="target_unit"
                        className="form-control margin-bottom"
                        id="target_unit"
                        value={formData.target_unit}
                        onChange={handleInputChange}
                      >
                         <option value="">Select Target</option>
                        <option value="BUNDLE">BUNDLE</option>
                              <option value="%">%</option>
                            <option value="PCS">PCS</option>
                               <option value="CARTON">CARTON</option>
                      </select>
                    </div>
              </div>
              <div class="form-group row">

                    <label class="col-sm-2 col-form-label"
                           for="product_catname"><span className='textblack'>Section Type</span></label>

                    <div class="col-sm-6">
                    
                          <select
                          name="section_type"
                          className="form-control margin-bottom"
                          id="target_unit"
                          value={formData.section_type}
                          onChange={handleInputChange}
                          required>
          
                              <option value="">Select Section Type</option>
                                {sectiontypeOptions.map((sectiontypeOption) => (
                                  <option key={sectiontypeOption.id} value={sectiontypeOption.category_name}>
                                    {sectiontypeOption.category_name}
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

export default EditSection;
