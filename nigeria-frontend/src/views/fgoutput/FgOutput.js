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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import dateUtils from '../../utils/dateUtils';
function FgOutput() {
  const today = dateUtils.getCurrentDateTime();
  const oneMonthAgo = dateUtils.getOneMonthAgo();
  const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
  const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd-MM-yyyy");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const { t } = useTranslation();
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
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
     const handleDelete = (id) => {
      const confirmDelete = window.confirm('Are you sure you want to delete this FG Output?');
      
      //alert(id);
      if (confirmDelete) {
        fetch(`${config.apiUrl}/fgoutputdelete/${id}`, {
          method: 'DELETE',
          headers: customHeaders // Include custom headers here
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Fg Output deleted:', data);
            // Refresh the list of items
            window.location.reload();     
            
          })
          .catch((error) => console.error('Error deleting Fg Output:', error));
      }
    }; 


const [formData, setFormData] = useState({
  date: formattedToday,
});

const handleInputChange = (event) => {
 const { name, value } = event.target;

   setFormData({ ...formData, [name]: value });
 
 
};

const handleEdit = (id) => {
    navigate(`/admin/fgoutput/editfg/${id}`);
};

const handleSubmit = (event) => {
  event.preventDefault();
//alert(formData.date);
  if (formData.date) {

  //console.log(formData.date);


    $.ajax({
      url: `${config.apiUrl}/fg_output`,
      method: 'POST',
      headers: customHeaders,
      data: { date: formData.date },
      success: function (response) {


           // Access the timesheet results from the response object
          const { fgDetails } = JSON.stringify(response);

          // Update the component state with the timesheet data
          setData(fgDetails);
          initializeTable(response.fgDetails);
        // Handle response data
        //alert(JSON.stringify(response));
      },
      error: function (error) {
        console.error(error);
      },
    });
  }
};


const initializeTable = (fgDetails) => {
  // Destroy the existing DataTable instance (if it exists)
  if ($.fn.DataTable.isDataTable('#example')) {
    $('#example').DataTable().destroy();
  }

  // Initialize the DataTable with the updated data
  tableRef.current = $('#example').DataTable({
     dom: 'Bfrtip',
     dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
     buttons: ['copy', 'csv', 'excel'],
       data: fgDetails, // Use fgDetails as the data source
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
         { data: 'product_des' },
         // {
         //   data: 'shift',
         //   render: function(data, type, row) {
         //     return data + ' HRS';
         //   }
         // },
         { data: 'hour' },
         { data: 'fg_output' },
         { data: 'country' },
         { data: 'date_time' },
         {
          data: null,
          render: function (data, type, row) {
            return `
              <div>
                <button
                  class="btn btn-primary btn-sm"
                  onclick="handleEdit(${row.id})"
                >
                  <i class="bx bx-edit"></i>Edit
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  onclick="handleDelete(${row.id})"
                >
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            `;
          },
        },
         
         ]
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
 
      $.ajax({
        url: `${config.apiUrl}/todayfg_output`,
        method: "POST",
        headers: customHeaders, // Include custom headers here
        data: [],
        processData: false,
        contentType: 'application/json',
        success: function (response) {
            const { fgDetails } = response;
            // const { date } = response;
            // Update the component state with the timesheet data
            setData(fgDetails);                       
            // setCurrentDate(date);
            initializeTable(response.fgDetails);          
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        },
    });             

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
                <CardTitle tag="h5">FG Output <Link to="/admin/fgoutput/addnewfg" className="btn btn-primary mr-2" style={{ margin: '0', padding: '5px', fontSize: '12px' }}>
              Add new</Link>
            </CardTitle>
              </CardHeader>
              <CardBody>
               Date Range
              <hr></hr>
              <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row">
                     
                      <div className="col-sm-3">
                      <span className="textgreen">{t('Date')}</span>

<DatePicker
                      className="form-control margin-bottom"
                      selected={startDate}
                      required
                      onChange={(date) => {
      
                        const formattedDate = dateUtils.formatDateTime(date, 'dd-MM-yyyy');
                        const updatedEvent = { target: { value: formattedDate, name: 'date' } };
                        handleInputChange(updatedEvent);
                        setStartDate(date);
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText={`${t('Select')} ${t('Date')}`}
                      name="date"
                      id="date"
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
                 {/* <Table responsive id="example"> */}
                 <table id="example" className="display">
                    <thead >
                      <tr>
                      <th>#</th>
          <th>{t('Product Name')}</th>
          <th>{t('Product Code')}</th>          
          <th>{t('Hour')}</th>
          <th>{t('Fg Output')}</th>
          <th>{t('Country')}</th>
          <th>{t('Date')}</th>
          <th>{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tfoot >
                    <th>#</th>
          <th>{t('Product Name')}</th>
          <th>{t('Product Code')}</th>          
          <th>{t('Hour')}</th>
          <th>{t('Fg Output')}</th>
          <th>{t('Country')}</th>
          <th>{t('Date')}</th>
          <th>{t('Actions')}</th>
                    </tfoot>
                    </table>
                  {/* </Table> */}
                  </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default FgOutput;
