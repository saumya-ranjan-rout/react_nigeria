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

function OtaNbraidFgOutput() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = sessionStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

const handleDelete = (id) => {
    const confirmDelete = window.confirm('Do You Really Want To Delete fg detail ?');
    
    //alert(id);
    if (confirmDelete) {
      fetch(`${config.apiUrl}/fgoutputdelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fg Output deleted:', data);
          // Refresh the list of items
           // Reload the page after successful deletion
        window.location.reload();
          
        })
        .catch((error) => console.error('Error deleting Fg Output:', error));
    }
}; 

const shouldShowDeleteButton = () => {
  // Assuming you want to show the delete button only for a specific role (e.g., roleid === 5)
  return roleId === '5';
};

const [formData, setFormData] = useState({
  fromdate: '',
  todate: '',
});

const handleChange = (name, value) => {
  setFormData({ ...formData, [name]: value });
};

const handleEdit = (id) => {
    navigate(`/admin/fgoutput/editotanbraidfg/${id}`);
};

const handleSubmit = (event) => {
    event.preventDefault();
   const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
 /* if (startDate) {
    // Adjust the selected date based on the time zone offset
    const offset = startDate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(startDate.getTime() - offset);

    const dateValue = adjustedDate.toISOString().split('T')[0];*/


      $.ajax({
       url: `${config.apiUrl}/get_fg_output_search_ota_nbraid`,
        method: 'POST',
        headers: customHeaders,
        data: updatedFormData,
        success: function (response) {
         // Access the timesheet results from the response object
            const { fgDetails } = JSON.stringify(response);

            // Update the component state with the timesheet data
            setData(fgDetails);
          // Handle response data
          //alert(JSON.stringify(response));

       // Destroy the existing DataTable instance (if it exists)
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
          }

          // Reinitialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ['copy', 'csv', 'excel'],
            data: response, // Use fgDetails as the data source
            columns: [
              {
                data: null,
                render: function (data, type, row, meta) {
                  // Calculate the index of the row
                  var index = meta.row + meta.settings._iDisplayStart + 1;
                  return index;
                }
              },
              { data: 'item_description' },
              { data: 'product_code' },
              { data: 'product_des' },
              { data: 'line' },
              { data: 'color_name' },
              { data: 'shift' },
              { data: 'hour' },
              { data: 'fg_output' },
              { data: 'date_time' },
              { data: 'site' },
              { data: 'user_name' },
              {
              data: null,
              render: function (data, type, row) {
                return `
                  <div>
                    <button
                      class="btn btn-primary btn-sm"
                      onclick="handleEdit(${row.id})"
                    >
                      <i class="fa fa-pencil"></i>Edit
                    </button>
                    ${shouldShowDeleteButton() ? `
                      <button
                        class="btn btn-danger btn-sm"
                        onclick="handleDelete(${row.id})"
                      >
                         <i class="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    ` : ''}
                  </div>
                `;
                },
              },
                         
              ]
          });
        },
        error: function (error) {
          console.error(error);
        },
      });
}
  
const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/get_fg_output_default_ota_nbraid`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
         // Access the timesheet results from the response object
            const { fgDetails } = JSON.stringify(response);

            // Update the component state with the timesheet data
            setData(fgDetails);
          // Handle response data
          //alert(JSON.stringify(response));

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

         // Reinitialize the DataTable with the updated data
          tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ['copy', 'csv', 'excel'],
            data: response, // Use fgDetails as the data source
            columns: [
              {
                data: null,
                render: function (data, type, row, meta) {
                  // Calculate the index of the row
                  var index = meta.row + meta.settings._iDisplayStart + 1;
                  return index;
                }
              },
              { data: 'item_description' },
              { data: 'product_code' },
              { data: 'product_des' },
              { data: 'line' },
              { data: 'color_name' },
              { data: 'shift' },
              { data: 'hour' },
              { data: 'fg_output' },
              { data: 'date_time' },
              { data: 'site' },
              { data: 'user_name' },
              {
              data: null,
              render: function (data, type, row) {
                return `
                  <div>
                    <button
                      class="btn btn-primary btn-sm"
                      onclick="handleEdit(${row.id})"
                    >
                      <i class="fa fa-pencil"></i>Edit
                    </button>
                    ${shouldShowDeleteButton() ? `
                      <button
                        class="btn btn-danger btn-sm"
                        onclick="handleDelete(${row.id})"
                      >
                         <i class="fa fa-trash" aria-hidden="true"></i>
                      </button>
                    ` : ''}
                  </div>
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

useEffect(() => {
  document.title = 'FG Output';
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

const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
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
                <CardTitle tag="h5">FG Output <Link to="/admin/fgoutput/addnewnbraidotafg" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new</Link>
            </CardTitle>
              </CardHeader>
              <CardBody>
               Date Range
          <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                     
                      <div className="col-sm-2">
                        <span className="textgreen"> Date</span>
                    <DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select Start Date"
                      name="fromdate"

                    />

                      </div>

                       <div className="col-sm-2">
                          <span className="textgreen">To Date</span>
                          <DatePicker
                            className="form-control margin-bottom"
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                             dateFormat="dd-MM-yyyy"
                            placeholderText="Select End Date"
                            name="todate"
                          />
                        </div>
                      <div className="col-sm-6 mt-2">
                        
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="View"
                          data-loading-text="Adding..."
                        />

                      </div>
                    </div>
                    
                  </div>
                                  
                </form>
                <div className="table-responsive">
                 <Table responsive id="example">
                    <thead className="text-primary">
                      <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Product Desc</th>
                      <th>Line</th>
                      <th>Color</th>
                      <th>Shift</th>
                      <th>Hour</th>
                      <th>FG</th>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Added By</th>
                      <th>Actions</th>
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                     
                    </tfoot>
                  </Table>
                  </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default OtaNbraidFgOutput;
