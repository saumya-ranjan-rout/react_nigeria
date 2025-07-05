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


function QCMaster() {

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
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

  const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Navigate to the login page
    navigate('/login');
  };

  const handleEdit = (id) => {
    navigate(`/admin/master/editqcmaster/${id}`);
  };



 useEffect(() => {
    document.title = 'Item Category';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      // Fetch item categories from API
      $.ajax({
         url: `${config.apiUrl}/getqc`,
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
            buttons: ['copy', 'csv'],
            data: response,
            columns: [
              { data: null },
              { data: 'name' },
              {
                data: 'value',
                render: function (data) {
                  // Format the value with two decimal places
                  return parseFloat(data).toFixed(2);
                },
              },
              { data: 'limits' },
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
              targets: 4,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="handleEdit(${id})"><i class=" bx bx-edit"></i> Edit</button>
                 
                `;
              },
            },
            ]
          });
        },
        error: function (xhr, status, error) {
          console.log(error);
        }
      });
    }
     window.handleEdit = handleEdit;
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
                <CardTitle tag="h5">QC Master</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
               
                 <Table responsive id="example">
                    <thead className="text-primary">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Limit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Limit</th>
                        <th>Action</th>
                      </tr>
                    </tfoot>
                  </Table>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default QCMaster;
