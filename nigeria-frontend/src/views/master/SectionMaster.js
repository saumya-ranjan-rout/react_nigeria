import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import { Link } from 'react-router-dom';
import 'jquery/dist/jquery.min.js';

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

function SectionMaster() {
  const { t } = useTranslation();
const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
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

  const handleEdit = (id) => {
    navigate(`/admin/master/editsection/${id}`);
  };


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do You Really Want To Delete Section??');
    if (confirmDelete) {

      // Destroy the DataTable instance before making the fetch request
    if (tableRef.current) {
      tableRef.current.destroy();
    }
      fetch(`${config.apiUrl}/sectiondelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Section deleted:', data);
          // Refresh the list of items
          fetchData();
          // Set the server message and style it
          setServerMessage('Section deleted successfully');
          setServerMessageClass('alert alert-success');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
          }, 5000);
        })
        .catch((error) => {
          console.error('Error deleting Section:', error);
          // Set the server error message and style it
          setServerMessage('An error occurred while deleting Section');
          setServerMessageClass('alert alert-danger');
          // Clear the server message after 3 seconds
          setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
          }, 3000);
        });
    }
  };

  const fetchData = () => {
    //alert('API request is being generated...'); // Alert to notify API request generation
    $.ajax({
      url: `${config.apiUrl}/section`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // Set the fetched data in the state
        setItemCategories(response);
        //alert(JSON.stringify(response));

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
         // buttons: ['copy', 'csv'],
         //dom: '<"row"<"col-md-9"l><"col-md-3"f>>rt<"row"<"col-md-9"i><"col-md-3"p>>', // Position pagination controls on the right side
         dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
            {
              extend: 'copy',
              text: 'Copy',
              exportOptions: {
                columns: [0, 1], // Include only the first and second columns in copying
              },
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                columns: [0, 1], // Include only the first and second columns in CSV
              },
              action: function (e, dt, button, config) {
                // Hide the action column when CSV button is clicked
                tableRef.current.column(2).visible(false);
                $.fn.DataTable.ext.buttons.csvHtml5.action.call(this, e, dt, button, config);
                tableRef.current.column(2).visible(true); // Show the action column again
              },
            },
          ],
          data: response,
          columns: [
            { data: null },
            { data: 'section_name' },
            { data: 'target_unit' },
            { data: 'id' },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              },
            },
            {
              targets: 3,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})"><i class=" bx bx-edit"></i> Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true"></i></button>
                `;
              },
            },
          ],
        });
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  };

useEffect(() => {
  document.title = 'Section';
 // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
 
    console.log('Fetching data...'); // Log statement to verify if fetchData is called
    fetchData();
}
     // Attach the functions to the window object
    window.handleEdit = handleEdit;
    window.handleDelete = handleDelete;
  
}, []);



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
                <CardTitle tag="h5">Section <Link to="/admin/master/addnewsection" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new
            </Link></CardTitle>
              </CardHeader>
              <CardBody>
               
                 <div className="table-responsive">
                  <table id="example" className="display">
                    <thead className="text-primary">
                      <tr>
                       <th>#</th>
                    <th>Section Name</th>
                    <th>Target Unit</th>
             
                    <th>Action</th>
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                      <tr>
                       <th>#</th>
                    <th>Section Name</th>
                    <th>Target Unit</th>
         
                    <th>Action</th>
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

export default SectionMaster;
