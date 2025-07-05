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
import '../../Loader.css' // Import the CSS file

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
import config from '../../../../config';

function OperatorComponent() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);
 
 // All action buttons//
 const ConvertToCategory = (id) => {
 navigate(`/admin/hrm/ikeja/converttocategory/${id}`);
}
  const handleView = (id) => {
   navigate(`/admin/hrm/ikeja/viewoperator/${id}`);
  };

  const assignOperator = (id) => {
   navigate(`/admin/hrm/ikeja/addassignoperator/${id}`);
  };

  const assignOp_ndraid = (id) => {
   navigate(`/admin/hrm/ikeja/addassignopnbraid/${id}`);
  };

  const DeleteOperator = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
        $.ajax({
        url: `${config.apiUrl}/ikeja/operator_delete/${id}`,
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
 

  const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/ikeja/operator_data_view`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // Set the fetched data in the state
        setItemCategories(response);

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv', 'excel'],
          data: response,
          columns: [
            { data: null },
            {
              data: null,
              render: function (data, type, row) {
                return data.name + '<br>(' + data.entryid + ')<br>'
              },
            },
            { data: 'email' },
            {
              data: null,
              render: function (data, type, row) {
                const id = row.id;
                if(row.category_type === "BRAID"){
                  return data.category_type + '<br><span style="background-color:#5ed45e;border-radius:15px;color:#fff;font-size:10px;padding:2px;cursor: pointer;" onclick="ConvertToCategory(' + id + ')">Convert to NBRAID</span>'
                }else{
                  return data.category_type + '<br><span style="background-color:#ff6262;border-radius:15px;color:#fff;font-size:10px;padding:2px;cursor: pointer;" onclick="ConvertToCategory(' + id + ')">Convert to BRAID</span>'
                }
              },
            },
            { data: 'empname' },
            
            {
              data: null,
              render: function (data, type, row) {
                if(data.status === "P"){
                  return data.workertype + '<br>(' + data.shift + ')<br><span style="color:blue">Present</span>'
                }else{
                  return data.workertype + '<br>(' + data.shift + ')<br><span style="color:red">Absent</span>'
                }
              
              },
            },
            { data: null, className: 'action-column' }, // Add class 'action-column' to the action column
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1
              },
            },
            {
              targets: 6,
              render: function (data, type, row, meta) {
                const id = row.id;
                const eid = row.entryid
                let btn;
                let lnk;
                if(row.category_type === "BRAID"){
                   btn="primary"
                   lnk="assignOperator("+id+")";
                }else{
                  btn="warning"
                  lnk="assignOp_ndraid("+id+")"
                }
                return `
                <span style="display:inline;">
                  <button class="btn btn-sm btn-`+btn+`" style="color:#fff;font-size:12px;padding:auto;margin-bottom:2px;width :40px" onclick="`+lnk+`" title="Add"><i class="fa fa-plus" aria-hidden="true" ></i></button>
                  <button class="btn btn-sm btn-info" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;;width :40px" onclick="handleView(${id})" title="View"><i class="fa fa-eye" aria-hidden="true"></i></button>
                  <button class="btn btn-sm btn-danger" style="color:#fff;font-size:15px;padding:2px 3px;margin-bottom:2px;width :40px" onclick="DeleteOperator('${eid}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>
                </span>  
              `
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
    document.title = 'Employees List';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
     navigate('/login');
    } else {
      // Fetch item categories from API
      fetchData();
    }

    // Attach the functions to the window object
    window.ConvertToCategory = ConvertToCategory;
    window.assignOp_ndraid = assignOp_ndraid;
    window.assignOperator = assignOperator;
    window.DeleteOperator = DeleteOperator;
    window.handleView = handleView;
  }, []);

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
                <CardTitle tag="h5">Operator <Link to="/admin/hrm/ikeja/addoperatorcomponent" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new
            </Link></CardTitle>
              </CardHeader>
              <CardBody>
  

           <div className="table-responsive">
           <table id="example" className="display">
            <thead>
              <tr>
                <th>#</th>
                <th>Name/Entry Id</th>
                <th>Email</th>
                <th>Assigned Category</th>
                <th>Role</th>
                <th>Worker Type(Shift)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
             
            </tbody>
            <tfoot>
              <tr>
                <th>#</th>
                <th>Name/Entry Id</th>
                <th>Email</th>
                <th>Assigned Category</th>
                <th>Role</th>
                <th>Worker Type(Shift)</th>
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
    
  );
}


export default OperatorComponent;
