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
import config from '../../config';


function AddNewItem() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [sections, setSections] = useState([]); // Define sections state variable
  const [cls, setCls] = useState(''); // Define cls state variable
  const [categories, setCategories] = useState([]); // Define categories state variable
  const [subcategories, setSubcategories] = useState([]); // Define subcategories state variable
  const [selectedLines, setSelectedLines] = useState([]); // Define selectedLines state variable as an empty array
  const [sectionTargets, setSectionTargets] = useState({});
const [tableData, setTableData] = useState([]);
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
    document.title = 'Add Item Master';
     // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

       // Fetch section data from the API
        $.ajax({
          url: `${config.apiUrl}/getsectiontarget`, // Replace 'your-api-endpoint' with the actual endpoint URL
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            const sections = response.data; // Assuming the response data is an array of section objects
            // Update the state with the fetched section data
            setSections(sections);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section data:', error);
          },
        });

         // Fetch categories from the API
         $.ajax({
          url: `${config.apiUrl}/getcategories`, // Replace with the actual API endpoint for fetching categories
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            const categories = response.data; // Assuming the response data is an array of category objects
            setCategories(categories); // Update the state with the fetched categories
          },
          error: function (xhr, status, error) {
            console.error('Error fetching categories:', error);
          },
        });

      

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

const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    //alert(categoryId);
    // Fetch subcategories based on the selected category
    $.ajax({
      url: `${config.apiUrl}/getcatsection/${categoryId}`, // Replace 'your-api-endpoint' with the actual endpoint URL for fetching subcategories based on the category ID
      method: 'GET',
      headers: customHeaders,
     success: function (response) {
      const sections = response.data; // Assuming the response data is an array of section objects
      // Update the state with the fetched section data
      // Loop through the sections array and display the values of each section object
       /* sections.forEach((section) => {
          // Assuming the section object has properties like id, section_name, target_unit, etc.
          // Modify this according to the actual properties of your section object
          const sectionInfo = `ID: ${section.id}, Name: ${section.section_name}, Target Unit: ${section.target_unit}`;
          alert(sectionInfo);
        });*/
      setSections(sections);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching section data:', error);
    },
    });
  };


  const [formData, setFormData] = useState({
    category_id: '',
    item_description:'',
    item_group:'',
    tppp: '',
    net_weight:'',
    targeted_waste:'', 
  });

  const handleInputChange = (event) => {
  const { name, value } = event.target;

  // Check if the input element is within the table
  if (event.target.closest('tbody')) {
    const index = event.target.closest('tr').rowIndex - 1;
    const updatedTableData = [...tableData];
    updatedTableData[index][name] = value;
    setTableData(updatedTableData);
  } else {
    setFormData({ ...formData, [name]: value });
  }
};





  const handleSubmit11 = (event) => {
  event.preventDefault();

   // Collect the complete section wise target data from the table
  const sectionWiseTargets = sections.map((row, index) => ({
    sectionid: row.id,
    section: row.section_name,
    uom: row.target_unit,
    target: sectionTargets[row.id] || '',
  }));

  // Combine the form data and section wise target data
  const formDataWithSectionTargets = {
    ...formData,
    sectionWiseTargets,
  };

  //alert(JSON.stringify(formDataWithSectionTargets));
  // First, add the item master data to the "itemmaster" table
  $.ajax({
    url: `${config.apiUrl}/additemmaster`,
    method: 'POST',
    headers: customHeaders,
    data: formDataWithSectionTargets,
    success: function (response) {
      console.log(response);
      const itemId = response.id; // Assuming the response includes the ID of the inserted item master
      //alert(itemId); // Log the value of itemId
      // Insert section data to the "item_section_moz" table
      const itemSections = sections.map((section) => ({
        item_id: itemId,
        section_id: section.id,
        target: sectionTargets[section.id] || 0, // Use the target value from sectionTargets, or default to 0
        utarget: sectionTargets[section.id] || 0, // Use the target value from sectionTargets, or default to 0
      }));
      $.ajax({
        //url: 'http://192.168.29.243:4000/additemsections',
        method: 'POST',
        data: JSON.stringify(itemSections),
        contentType: 'application/json',
        success: function (response) {
          console.log(response);
           setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Item already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
       // Check if the response message indicates success
          if (response.message === 'Item added successfully') {
            // Navigate to a specific route after a successful item addition
           // history.push('/master/item-master'); // Replace '/your-target-route' with the desired route
          }
        },
       error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
           alert(xhr.responseJSON.message);
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('Item added successfully'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-success');
        }
      },
      });
    },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
  
 
};
  
  const handleSubmit = (event) => {
  event.preventDefault();

  const sectionWiseTargets = sections.map((row, index) => ({
    sectionid: row.id,
    section: row.section_name,
    uom: row.target_unit,
    target: sectionTargets[row.id] || '',
  }));

  const formDataWithSectionTargets = {
    ...formData,
    sectionWiseTargets,
  };

  $.ajax({
    url: `${config.apiUrl}/additemmaster`,
    method: 'POST',
    headers: customHeaders,
    data: formDataWithSectionTargets,
    success: function (response) {
      console.log(response);

      if (response.status === 'Success') {
        // Check if the item was added successfully
        setServerMessage(response.message);
        setServerMessageClass('alert alert-success');

        // Wait for 2 seconds before navigating back (optional)
        setTimeout(() => {
         navigate(-1);
        }, 2000);
      } else if (response.status === 'Error' && response.message === 'Item already exists') {
        // Item already exists
        setServerMessage(response.message);
        setServerMessageClass('alert alert-warning');

        // Reload the page after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        // Other errors
        setServerMessage('Item already exists');
        setServerMessageClass('alert alert-danger');
      }
    },
    error: function (xhr, status, error) {
      console.log(error);
      setServerMessage('Item already exists');
      setServerMessageClass('alert alert-danger');
    },
  });
};




  const handleDelete = (index) => {
    // Perform deletion logic based on the index or other identifier
    // Remove the corresponding section from the sections array
  
    // Create a copy of the sections array
    const updatedSections = [...sections];
    // Remove the section at the specified index
    updatedSections.splice(index, 1);
    // Update the state with the modified sections array
    setSections(updatedSections);
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
                <CardTitle tag="h5">Add New Item Master</CardTitle>
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
                             onChange={(e) => {
                                handleInputChange(e);
                                handleCategoryChange(e);
                              }}
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
                    className="form-control margin-bottom required"
                    name="item_description"
                    value={formData.item_description}
                    onChange={handleInputChange} 
                    placeholder="Item Description"
                    required
                  />
                </div>
              </div>
              <div className="form-group row space">
                <div className="col-md-4">
                       
                         <span className="textgreen">Targeted PPP <span className="textred">*</span></span>
                       
                           <input
                    type="number"
                    className="form-control margin-bottom "
                    name="tppp"
                    value={formData.tppp}
                    onChange={handleInputChange}
                     placeholder="Targeted PPP"
                    required
                  />
                        
                </div>
                <div className="col-md-4">
                     <span className="textgreen">Net Weight  <span className="textred">*</span></span>
                       
                          <input
                    type="number"
                    className="form-control margin-bottom "
                    name="net_weight"
                    value={formData.net_weight}
                    onChange={handleInputChange}
                     placeholder="Net Weight "
                    required
                  />
                </div>
                <div className="col-md-4">

                         <span className="textgreen">Targeted Waste <span className="textred">*</span></span>
                       
                           <input
                    type="number"
                    className="form-control margin-bottom "
                    name="targeted_waste"
                    value={formData.targeted_waste}
                    onChange={handleInputChange}
                     placeholder="Targeted Waste "
                    required
                  />
                </div>
              </div>

              <h5>Add section wise target</h5>
              <hr></hr>

              <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
      <thead>
        <tr style={{ backgroundColor: '#adb5bd' }}>
          {/*<th>#</th>*/}
          <th>Section</th>
          <th>UOM</th>
          <th>Target</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="item-section">
  {sections.map((row, index) => (
    <tr key={index}>
      {/*<td>{index + 1}</td>*/}
      <td hidden>{row.id}</td>
      <td>{row.section_name}</td>
      <td>{row.target_unit}</td>
      <td>
        <input
          type="text"
          className={`tar${row.id} ${row.target_unit} ${cls} bordered-input`}
          name="achieve"
          id={`ach${row.id}`}
          value={sectionTargets[row.id] || ''}
          onChange={(e) =>
            setSectionTargets({
              ...sectionTargets,
              [row.id]: e.target.value,
            })
          }
          required
        />
      </td>
      <td>
        <button
          onClick={() => handleDelete(index)}
          className="remCF"
          style={{ color: 'red' }}
        >
          <i class="fa fa-times" aria-hidden="true"></i>
        </button>
      </td>
    </tr>
  ))}
</tbody>

    </table>

                    <div className="form-group row">
                      <label className="col-sm-11 col-form-label"></label>
                      <div className="col-sm-1">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Add"
                          data-loading-text="Adding..."
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

export default AddNewItem;
