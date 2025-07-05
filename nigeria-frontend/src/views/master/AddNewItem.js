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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function AddNewItem() {
  const { t } = useTranslation();
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


      $.ajax({
        url:`${config.apiUrl}/getsectiontargett`, // Replace 'your-api-endpoint' with the actual endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          const sections = response.data; // Assuming the response data is an array of section objects
          // Update the state with the fetched section data
          setSections(sections);
    
                // Initialize the formData state
                // const initialFormData = {
                //   category_id: '',
                //   subcategory_id: '',
                //   item_description: '',
                //   line: '',
                //   country: '',
                //   ppp_benchmark: '',
                //   kg: '0',
                //   string: '0',
                //   pcs: '0',
                //   item_code: '',
                //   ...sections.reduce((acc, row, index) => {
                //     acc[`tar${index}`] = '';
                //     acc[`unit${index}`] = row.target_unit;
                //     acc[`utar${index}`] = '';
                //     return acc;
                //   }, {}),
                // };
        
                // // Set the initial state for formData
                // setFormData(initialFormData);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching section data:', error);
        },
      });

      $.ajax({
        url:`${config.apiUrl}/getcategories`, // Replace with the actual API endpoint for fetching categories
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

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    // Fetch subcategories based on the selected category
    $.ajax({
      url:`${config.apiUrl}/getcatsubcat/${categoryId}`, // Replace 'your-api-endpoint' with the actual endpoint URL for fetching subcategories based on the category ID
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        const subcategories = response.data; // Assuming the response data is an array of subcategory objects
        // Update the state with the fetched subcategories
        setSubcategories(subcategories);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching subcategories:', error);
      },
    });
  };
  const handleSectionChange = (event, selectedCategoryId) => {
    const category_name = event.target.options[event.target.selectedIndex].text;
    // alert(category_name);
    // You can also use selectedCategoryId if needed
    $.ajax({
      url:`${config.apiUrl}/getsectiontarget/${category_name}`, // Replace 'your-api-endpoint' with the actual endpoint URL
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
  
  }
  const handleLineChange = (event) => {
    const lineValue = event.target.value;
  
    // Check if the line is already selected
    if (!selectedLines.includes(lineValue)) {
      // If not selected, add it to the array
      const updatedSelectedLines = [...selectedLines, lineValue];
      setSelectedLines(updatedSelectedLines);
      setFormData({ ...formData, line: updatedSelectedLines.join(",") });
    }
  };


  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    item_description: '',
    line: '',
    country: '',
    ppp_benchmark: '',
    kg: '0',
    string: '0',
    pcs: '0',
    item_code: '', 
  });

//   const handleInputChange = (event) => {
//   const { name, value } = event.target;

//   // Check if the input element is within the table
//   if (event.target.closest('tbody')) {
//     const index = event.target.closest('tr').rowIndex - 1;
//     const updatedTableData = [...tableData];
//     updatedTableData[index][name] = value;
//     setTableData(updatedTableData);
//   } else {
//     setFormData({ ...formData, [name]: value });
//   }
// };

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
  setFormData((prevFormData) => {
    const updatedFormData = { ...prevFormData, [name]: value };

    sections.forEach((row, index) => {
      if (row.target_unit === 'KG') {
        let res = Math.ceil((parseInt(prevFormData.kg) * parseInt(prevFormData[`tar${index}`])) / 1000);
        updatedFormData[`utar${index}`] = res;
      } else if (row.target_unit === 'STRING') {
        let res = Math.ceil(parseInt(prevFormData.string) * parseInt(prevFormData[`tar${index}`]));
        updatedFormData[`utar${index}`] = res;
      } else if (row.target_unit === 'PCS') {
        let res = Math.ceil(parseInt(prevFormData[`tar${index}`]));
        updatedFormData[`utar${index}`] = res;
      } else {
        updatedFormData[`utar${index}`] = 0;
      }
    });

    return updatedFormData;
  });


 };




  
 const handleSubmit = (event) => {
  event.preventDefault();

  const itemSections = sections.map((section, index) => ({
      section_id: section.id,
      target: formData[`tar${index}`] || 0,
      utarget: formData[`utar${index}`] || 0,
  }));

  const requestData = {
      formData,
      itemSections,
  };

  $.ajax({
      url: `${config.apiUrl}/additemmasterr`,
      method: 'POST',
      headers: customHeaders,
      contentType: 'application/json',
      data: JSON.stringify(requestData),
      success: function (response) {
          console.log(response);

          if (response.status === 'Success') {
              setServerMessage(response.message);
              setServerMessageClass('alert alert-success');

              setTimeout(() => {
                  navigate(-1);
              }, 2000);
          } else if (response.status === 'Error' && response.message === 'Item already exists') {
              setServerMessage(response.message);
              setServerMessageClass('alert alert-warning');

              setTimeout(() => {
                  window.location.reload();
              }, 5000);
          } else {
              setServerMessage('An unexpected error occurred.');
              setServerMessageClass('alert alert-danger');
          }
      },
      error: function (xhr, status, error) {
          console.error(error);
          setServerMessage('Failed to add item. Please try again.');
          setServerMessageClass('alert alert-danger');
      },
  });
};





const handleDeleteRow = (id) => {
  // Display an alert with the index of the row being deleted
  //alert(`Deleting row with index: ${id}`);

  setSections((prevData) => {
    const newData = prevData.filter((item) => item.id !== id);
    return newData;
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
                <CardTitle tag="h5">Add New Item Master</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row space">
                <div className="col-md-4">
                       
                <span className="subcategory">{t('Category Name')} <span style={{ color: 'red'}}>*</span></span>
               
        <select
          className="form-control"
          id="category_id"
          name="category_id"
          value={formData.category_id}
  onChange={(event) => {
    handleInputChange(event);
    handleCategoryChange(event);
    handleSectionChange(event, formData.category_id);
  }}
     required     
        >
          <option value="">{t('Select')} {t('Category Name')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
                        
                </div>

            <div className="col-md-4">   
        <span className="subcategory">{t('Subcategory Name')} <span style={{ color: 'red'}}>*</span></span>
        <select className="form-control" id="subcategory_id" name="subcategory_id"
        value={formData.subcategory_id}
        onChange={handleInputChange}
        required
        >
          <option value="">{t('Select')} {t('Subcategory Name')}</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.subcategory_name}
            </option>
          ))}
        </select>
        </div>


        <div className="col-sm-4">
           <span className="color">{t('Item Description')} <span style={{ color: 'red'}}>*</span></span>
   <textarea  placeholder={t('Item Description')}
                       className="form-control margin-bottom  required" name="item_description" id="item_description" value={formData.item_description}  onChange={handleInputChange} required></textarea>
  
        </div>
        <div className="col-sm-4">

            <span className="color">{t('Line')} <span style={{ color: 'red'}}>*</span></span>
            <select
  className="form-control margin-bottom required"
  name="lines"
  id="sub"
  onChange={handleLineChange}
  required
>
  <option value="" >
  {t('Select')} {t('Line')}
  </option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
  <option value="10">10</option>
</select>           
            </div>


            <div className="col-sm-4">
  <span className="color">{t('Selected')} {t('Line')}</span>
  <input
    type="text"
    className="gentxt1 form-control"
    name="line"
    id="line"
    value={formData.line || selectedLines.join(",")} // Set the value of the textbox to the selectedLines array joined with commas
    
    onChange={handleInputChange}
  />
</div>

<div className="col-sm-2">

            <span className="color">{t('Country')} <span style={{ color: 'red'}}>*</span></span>
            <select
  className="form-control margin-bottom required"
  name="country"
  id="country"
  value={formData.country}
  onChange={handleInputChange}
  required
>
  <option value=""> {t('Select')} {t('Country')}</option>
  <option value="Mozambique">Mozambique</option>
  <option value="South Africa">South Africa</option>
</select>
</div>

<div className="col-sm-2">
  <span className="color">{t('PPP Bench Mark')}</span>
  <input
    type="text"
    className="gentxt1 form-control"
    name="ppp_benchmark"
    id="ppp_benchmark"
    value={formData.ppp_benchmark}
    onChange={handleInputChange}
  />
</div>
<div className="col-sm-4">
  <span className="color">{t('Item Code')} <span style={{ color: 'red'}}>*</span></span>
  <input
    type="text"
    className="gentxt1 form-control"
    name="item_code"
    id="item_code"
    value={formData.item_code}
    onChange={handleInputChange}
    required
  />
</div>
</div>

<h5>Conversion Factor</h5>
<hr></hr>
<div className="form-group row space">
<div className="col-sm-2">
  <span className="color">KG</span>
  <input
    type="number"
    className="gentxt1 form-control"
    name="kg"
    id="kg"
    value={formData.kg}
    onChange={handleInputChange}
  />
</div>

<div className="col-sm-2">
  <span className="color"  style={{ textTransform: 'uppercase' }}>{t('String')}</span>
  <input
    type="number"
    className="gentxt1 form-control"
    name="string"
    id="string"
    value={formData.string}
    onChange={handleInputChange}
  />
</div>

<div className="col-sm-2">
  <span className="color"  style={{ textTransform: 'uppercase' }}>{t('Sewing')}(Pcs)</span>
  <input
    type="number"
    className="gentxt1 form-control"
    name="pcs"
    id="pcs"
    value={formData.pcs}
    onChange={handleInputChange}
  />
</div>


              </div>

              <h5>Add section wise target</h5>
              <hr></hr>

              <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
      <thead>
        <tr style={{ backgroundColor: '#adb5bd' }}>
          <th>#</th>
          <th>{t('Section')}</th>
          <th>{t('UOM')}</th>
          <th>{t('Target')}</th>
          <th>{t('UnitTarget')}</th>
          <th>{t('Action')}</th>
        </tr>
      </thead>
      <tbody id="item-section">
  {sections.map((row, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{row.section_name}</td>
      <td>{row.target_unit}    </td>
      <td>
      <input
        type="number"
        className={`tar${row.id} ${row.target_unit} ${cls}`}
        name={`tar${index}`}
        id={`ach${row.id}`}
        value={formData[`tar${index}`]}
        onChange={handleInputChange}
        required
      />
      </td>
      <td>

        <input
          type="number"
          className={`tar${row.id} ${row.target_unit} ${cls}`}
          name={`utar${index}`}
          id={`ach${row.id}`}
          value={formData[`utar${index}`]}
          onChange={handleInputChange}
          required
          readOnly
        />
      </td>
      <td>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteRow(row.id)}
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
                      <input type="submit" id="submit-data" className="btn btn-success margin-top float-right"
                            value={t('Add')} data-loading-text="Adding..." />
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
