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


function PlanVsTarget() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [data, setData] = useState([]);
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

  const handleView = (id, item_description) => {
   navigate(`/admin/master/viewitem/${id}`, { state: { itemId: id, item_description: item_description } });
  };

  const handleAdd = (id, item_description) => {
    navigate(`/admin/master/additemcolor/${id}`, { state: { itemId: id, item_description: item_description } });
  };

  const handleEdit = (id) => {
    navigate(`/admin/master/edititem/${id}`);
  };


   const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
    if (confirmDelete) {
      fetch(`${config.apiUrl}/planvstargetdelete/${id}`, {
        method: 'DELETE',
        headers: customHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Plan vs Target deleted:', data);
          // Refresh the list of items
          fetchData();
        })
        .catch((error) => console.error('Error deleting item:', error));
    }
  };

  const [formData, setFormData] = useState({
     fromdate: '', 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'fromdate') {
    setStartDate(new Date(value));
  } else {
    setFormData({ ...formData, [name]: value });
  }
};

  const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/get_default_planvstarget`,
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
            { data: 'product_code' },
            { data: 'product_des' },
            { data: 'target_plan' },
            { data: 'date' },
            { data: 'id' },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              }
            },
            {
              targets: 5,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true"></i></button>
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
  document.title = 'Plan vs Target';
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
    window.handleDelete = handleDelete;
  
}, []);

const handleSubmit = (event) => {
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate};

  const jsonData = JSON.stringify(updatedFormData);
  //alert(jsonData);

  $.ajax({
    url: `${config.apiUrl}/get_search_planvstarget`,
    method: "POST",
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
    // Update the component state with the response data
      setData(response);

      // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }

      // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
         dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ['copy', 'csv', 'excel'],
        data: response, // Use the updated data state
        columns: [
          { data: null },
          { data: 'product_code' },
          { data: 'product_des' },
          { data: 'target_plan' },
          { data: 'date' },
          { data: 'id' },
        ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              }
            },
            {
              targets: 5,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true"></i></button>
                `;
              },
            },
          ]
        });
      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
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
                <CardTitle tag="h5">Plan vs Target <Link to="/admin/master/addnewplan" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new
            </Link>Datewise <Link to="/admin/master/planview" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
             View
            </Link>Import <Link to="/admin/import/planvstargetimport" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Plan
            </Link></CardTitle>
              </CardHeader>
              <CardBody>
               Date Range
          <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                     
                      <div className="col-sm-6">
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
               
                 <Table responsive id="example">
                    <thead className="text-primary">
                      <tr>
                      <th>#</th>
	                  <th>Product Code</th>
	                  <th>Product Desc</th>
	                  <th>Plan</th>
	                  <th>Date</th>
	                  <th>Action</th>
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                      <tr>
                        <th>#</th>
	                    <th>Product Code</th>
	                    <th>Product Desc</th>
	                    <th>Plan</th>
	                    <th>Date</th>
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

export default PlanVsTarget;
