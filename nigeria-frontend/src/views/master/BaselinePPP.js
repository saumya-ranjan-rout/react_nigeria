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

function BaselinePPP() {
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
    navigate(`/admin/master/editbaselineppp/${id}`);
  };


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this Baseline PPP?');
    if (confirmDelete) {
      fetch(`${config.apiUrl}/baselinepppdelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders // Include custom headers here
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Baseline PPP deleted:', data);
          // Refresh the list of items
          fetchData();
        })
        .catch((error) => console.error('Error deleting Baseline PPP:', error));
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const fetchData = () => {
    //alert('API request is being generated...'); // Alert to notify API request generation
    $.ajax({
      url: `${config.apiUrl}/bppp`,
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
            { data: 'year' },
            {
                data: 'month',
                render: (monthNumber) => {
                  // Convert the month number to the month name
                  const monthName = monthNames[monthNumber - 1];
                  return monthName;
                },
            },
            { data: 'product_id' },
            { data: 'cat_id' },
            { data: 'ppp' },
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
              targets: 6,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})"><i class="fa fa-edit"></i> ${t('Edit')}</button>
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash"></i></button>
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
  document.title = 'Baseline PPP';
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
                <CardTitle tag="h5">{t('Baseline PPP')} <Link to="/admin/master/addnewbaselineppp" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new
            </Link></CardTitle>
              </CardHeader>
              <CardBody>
               
                 <div className="table-responsive">
                  <table id="example" className="display">
                  <thead>
                <tr>
                    <th>#</th>
                    <th>{t('Year')}</th>
                    <th>{t('month')}</th>
                    <th>{t('Product Name')}</th>
                    <th>{t('Category Name')}</th>
                    <th>PPP</th>
                    <th>{t('Action')}</th>
                </tr>
            </thead>
            
            <tfoot>
                <tr>
                    <th>#</th>
                    <th>{t('Year')}</th>
                    <th>{t('month')}</th>
                    <th>{t('Product Name')}</th>
                    <th>{t('Category Name')}</th>
                    <th>PPP</th>
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

export default BaselinePPP;
