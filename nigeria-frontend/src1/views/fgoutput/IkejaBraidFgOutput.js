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

function IkejaBraidFgOutput() {
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
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this FG Output?');
    
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
          
        })
        .catch((error) => console.error('Error deleting Fg Output:', error));
    }
}; 

const [formData, setFormData] = useState({
     date: '',
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
      url: `${config.apiUrl}/get_fg_output_default_ikeja`,
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

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv', 'excel'],
          data: response,
          columns: [
           {
                data: null,
                render: function (data, type, row, meta) {
                  return meta.row + 1; // Auto-increment for each row
                }
              },
              { data: 'item_description' },
              { data: 'color_name' },
              { data: 'tar' },
              { data: 'date' },
              { data: 'site' },
              { data: 'name' },
          ],
          
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
    window.handleDelete = handleDelete;
  
}, []);

const handleSubmit = (event) => {
    event.preventDefault();

    if (startDate) {
    // Adjust the selected date based on the time zone offset
    const offset = startDate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
    const adjustedDate = new Date(startDate.getTime() - offset);

    const dateValue = adjustedDate.toISOString().split('T')[0];


      $.ajax({
        url: `${config.apiUrl}/get_fg_output_search_ikeja`,
        method: 'POST',
        headers: customHeaders,
        data: { date: dateValue },
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
                  return meta.row + 1; // Auto-increment for each row
                }
              },
              { data: 'item_description' },
              { data: 'color_name' },
              { data: 'tar' },
              { data: 'date' },
              { data: 'site' },
              /*{
                data: 'emp_id',
                render: function (data, type, row) {
                  // Conditionally render the 'name' based on the 'emp_id'
                  return data === 1 ? 'admin' : row.name;
                }
              },*/
              { data: 'name' },
              
              ]
          });
        },
        error: function (error) {
          console.error(error);
        },
      });
    }
  };

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
               
              </CardHeader>
              <CardBody>
               Date Range
              <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                     
                      <div className="col-sm-3">
                        <span className="textgreen"> Date &nbsp;</span>
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
                      <th>Color </th>
                      <th>FG</th>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Added By</th>
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

export default IkejaBraidFgOutput;
