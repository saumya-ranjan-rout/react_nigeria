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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
function AddItemColor() {
  const { t } = useTranslation();
const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [colorOptions, setColorOptions] = useState([]); // Added state for color options
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
 const location = useLocation();
 const { id } = useParams();

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

  const handleEdit = (id) => {
    navigate(`/admin/master/itemcodeedit/${id}`);
  };

useEffect(() => {
    document.title = 'Add Color For Item';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      const itemId = id;
    const formDataWithItemId = { ...formData, item_id: itemId };
      const { item_description } = location.state || {};


        //setItemId(itemId);
      

      $.ajax({
        url: `${config.apiUrl}/getsections/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {

          //alert("hi1");
          setSections(response);
         // initializeTable(response);
         // alert("Sections: " +  JSON.stringify(response));
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



      // Fetch item_code table data
      $.ajax({
         url: `${config.apiUrl}/getdata/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
         // alert("hi2");
          setItemData(response);
           initializeTable(response);

         //  alert("Item Data: " +JSON.stringify( response));
          // const table = tableRef.current;
          // table.clear().rows.add(response).draw();
        },
        error: function (xhr, status, error) {
          console.error('Error fetching item data:', error);
        },
      });

      // $.ajax({
      //   url: `${config.apiUrl}/getcolors`, // Assuming this endpoint fetches the color options from the database
      //   method: 'GET',
      //   headers: customHeaders,
      //   success: function (response) {
      //     setColorOptions(response); // Set the color options in the state
      //   },
      //   error: function (xhr, status, error) {
      //     console.error('Error fetching colors:', error);
      //   },
      // });
      

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv'],
        });
      });
   
    window.handleEdit = handleEdit;
     window.handleDelete = handleDelete;
   } 
  }, []);

 const initializeTable = (data) => {
  //alert("hi3");
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
          { data: 'product_code' },
          { data: 'product_des' },
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
          targets: 3, // Update this to 5 for the last column
          render: function (data, type, row, meta) {
            const id = row.id;

            return `
              <button class="btn btn-sm btn-warning" onclick="window.handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
              <button class="btn btn-sm btn-danger" onclick="window.handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true" title="delete"></i></button>
            `;
          },
        },
      ],
    });
  }
};

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
    code: '',
    desc: '',
   // color: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const itemId = id;
    const formDataWithItemId = { ...formData, item_id: itemId };

    $.ajax({
      url: `${config.apiUrl}/additemcolor/${itemId}`,
      method: 'POST',
      headers: customHeaders,
      data: formDataWithItemId,
      success: function (response) {
        console.log(response);
         setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Color code already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
        navigate(0);
       }, 3000);  // Adjust the delay time as needed   
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
    const confirmDelete = window.confirm('Do You Really Want To Delete color??');
    if (confirmDelete) {
       fetch(`${config.apiUrl}/deleteitemcode/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(' deleted:', data);
         
         
          // Set the server message and style it
          setServerMessage('Deleted successfully');
          setServerMessageClass('alert alert-success');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
           // window.location.reload();
           navigate(0);
          }, 5000);
        })
        .catch((error) => {
          console.error('Error deleting color:', error);
          // Set the server error message and style it
          setServerMessage('An error occurred while deleting color');
          setServerMessageClass('alert alert-danger');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
           
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
                <CardTitle tag="h5">Add New Color Code For <span className="textred">{formData.item_description}</span>
             </CardTitle>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                 
                   <div className="form-group row space">
        <div className="form-group col-sm-3 ">
          <span className="textgreen">Product Code<span className="textred">*</span> </span>
                   
                <input type="text" className="form-control" name="code"  value={formData.code}  onChange={handleInputChange}/>
                               
                </div>
                <div className="form-group col-sm-3 ">
               <span className="textgreen">Product Description <span className="textred">*</span> </span>
                    

                      <input type="text" className="form-control" name="desc" value={formData.desc}  onChange={handleInputChange} />
                    
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
              <th>{t('Product Code')}</th>
                <th>{t('Product Description')}</th>                  
                    <th>{t('Action')}</th>
                      
                    </tr>
                    </thead>
                   

                    <tfoot>
                    <tr>
                    <th>#</th>
              <th>{t('Product Code')}</th>
                <th>{t('Product Description')}</th>                  
                    <th>{t('Action')}</th>
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

export default AddItemColor;
