import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import { Link } from 'react-router-dom';
import 'jquery/dist/jquery.min.js';
import Select from 'react-select';

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
  Table,
  Row,
  Col,
} from "reactstrap";
import $ from 'jquery';
//DB Connection
import config from '../../config';


function ViewItem() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
 const [itemId, setItemId] = useState('');
 const [sections, setSections] = useState([]);
 const [sectionOptions, setSectionOptions] = useState([]);
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
 const location = useLocation();
 const { id } = useParams();

  const handleEdit = (id) => {
    navigate(`/admin/master/itemsectionedit/${id}`);
  };

useEffect(() => {
    document.title = 'Item Section';
   // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      const itemId = id;
    const formDataWithItemId = { ...formData, item_id: itemId };
      const { item_description } = location.state || {};


        setItemId(itemId);
      

      $.ajax({
         url: `${config.apiUrl}/getsections/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSections(response);
          initializeTable(response);
           const itemDescription = item_description || (response.length > 0 ? response[0].item_description : '');
          setFormData((prevFormData) => ({
            ...prevFormData,
            item_description: itemDescription,
          }));
          //alert('Item Description: ' + itemDescription); // Alert the item description
        },
        error: function (xhr, status, error) {
          console.error('Error fetching sections:', error);
        },
      });
      

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv'],
        });
      });
   }
    window.handleEdit = handleEdit;
     window.handleDelete = handleDelete;
     // Fetch section options from API
    const fetchSectionOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getSectionOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSectionOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section options:', error);
        },
      });
    };

    fetchSectionOptions();
  }, []);

  const initializeTable = (data) => {
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }

      if (data.length > 0) {
        tableRef.current = $('#example').DataTable({
          data: data,
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv'],
          columns: [
            { data: null },
            { data: 'section_name' },
            { data: 'target_unit' },
            { data: 'target' },
            { data: null },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                return meta.row + 1;
              },
            },
            {
              targets: 4,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="window.handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
               
                 <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true" title="delete"></i></button>
               `;
              },
            },
          ],
        });
      }
    });
  };

  const [formData, setFormData] = useState({
   //id: '',
    section: '',
    target: '', 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const itemId = id;
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `${config.apiUrl}/addsectionitemmaster/${itemId}`,
      method: 'POST',
      headers: customHeaders,
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
         setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Color already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        //history.goBack();
         window.location.reload();
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

  const handleDelete = (id) => {
  const confirmDelete = window.confirm('Delete Section');
  if (confirmDelete) {
    fetch(`${config.apiUrl}/delete_target/${id}`, {
      method: 'DELETE',
      headers: customHeaders,
    })
      .then((response) => response.json())
      .then((data) => {
        // Set the server message and style it
        setServerMessage(data.message);
        setServerMessageClass('alert alert-success');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();
        }, 5000);

        // Fetch updated sections data after successful delete
        $.ajax({
          url: `${config.apiUrl}/getsections/${itemId}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSections(response);
            // Reinitialize DataTable with updated data
            initializeTable(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching sections:', error);
          },
        });
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        // Set the server error message and style it
        setServerMessage('Invalid Request');
        setServerMessageClass('alert alert-danger');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();

        }, 3000);
      });
  }
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
                <CardTitle tag="h5">Add New Section for: <span className="textred">{formData.item_description}</span>
             </CardTitle>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                  <input
                    type="hidden"
                    className="form-control margin-bottom required"
                    name="id"
                    value={itemId}
                    onChange={handleInputChange}
                  />
                    <div className="form-group row">
                     <div className="col-sm-4">
                                  <span className="textgreen">Section Name <span className="textred">*</span></span>
                                  <Select
                                  options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                                 value={formData.section ? { value: formData.section, label: formData.section_name } : null}
                                  onChange={(selectedOption) => {
                                    
                                    setFormData({ ...formData, section: selectedOption.value, section_name: selectedOption.label });
                                  }}
                                  isSearchable
                                  placeholder="Select Section"
                                  required
                                />
                                </div>

                <div className="col-md-4">

                       <span className="textgreen">Target(Hourly) <span className="textred">*</span></span>
                       
                           <input
                    type="text"
                    className="form-control margin-bottom "
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-1 mt-2">

                
                  <input type="submit" id="submit-data" className="btn btn-success margin-bottom" value="Add" data-loading-text="Updating..." />
               
                </div>
                    </div>
                    
                  </div>
                 
                  
                </form>

<h5>Product Name: <span className="pdesc">{formData.item_description}</span></h5> {/* Updated line */}
            <div className="table-responsive">
                  <table id="example" className="display">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>UOM</th>
                    <th>Target(Hourly)</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, index) => (
                    <tr key={section.id}>
                      <td>{index + 1}</td>
                      <td>{section.section_name}</td>
                      <td>{section.target_unit}</td>
                      <td>{section.target}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>UOM</th>
                    <th>Target(Hourly)</th>
                    <th>Edit</th>
                  </tr>
                </tfoot>
              </table>
            </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ViewItem;
