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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../Loader.css' // Import the CSS file

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
import Select from 'react-select';
//DB Connection
import config from '../../../config';

export function BraidAssignList() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [workList, setAssignList] = useState([])
  const tableRef = useRef(null);
  
   const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);

  useEffect(() => {
  document.title = 'Employee Details';
  // Check if the user is logged in
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    navigate('/login');
  } else {
    window.handleDelete = handleDelete;
    const fetchUsers = () => {
      $.ajax({
        url: `${config.apiUrl}/ikeja/get_operator_assign_list`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#asssignNbraid')) {
          $('#asssignNbraid').DataTable().destroy();
        }
        // Initialize the DataTable with the updated data
        tableRef.current = $('#asssignNbraid').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
              {
                  extend: 'copy',
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
              {
                  extend: 'csv',
                  filename: 'Employees_Details', // Removed space in filename
                  exportOptions: {
                      columns: ':not(.action-column)',
                  },
              },
          ],
          data: response,
          columns: [
              { data: null},
              { data: 'name'}, // Added defaultContent and orderable for the index column
              { data: 'entryid' },
              { data: 'zone' },
              { data: 'machine' },
              {
                data: null,
                render: function (data, type, row) {
                  const id = data.id;
                  
                    return `<button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :30px" onclick="handleDelete('${id}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                
                },
              }
          
          ],
          columnDefs: [
              {
                  targets: 0,
                  render: function (data, type, row, meta) {
                      // Render the row index starting from 1
                      return meta.row + 1; // Changed to use meta.row for the index
                  },
              },
          ],
          });
  
          setAssignList(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching shift options:', error);
        },
      });
    };
    fetchUsers();
  }
}, []); 

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/ikeja/delete_assign_list/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };
  return (

     <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Show List of work assign to operator</CardTitle>
              </CardHeader>
              <CardBody>
   
             <div className='row'>
                <div className='col-md-12'>
                <table id="asssignNbraid" className="display">
                        <thead>
                            <tr>
                                <th>Slno</th>
                                <th>Name</th>
                                <th>EntryId</th>
                                <th>Zone</th>
                                <th>Machine</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
             </div>
        
         </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default BraidAssignList;
