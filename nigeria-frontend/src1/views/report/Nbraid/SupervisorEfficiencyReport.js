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

function SupervisorEfficiencyReport() {
 const [loading, setLoading] = useState(false);
 const [sectionOptions, setSectionOptions] = useState([]);
 const tableRef = useRef(null);
 const today = new Date(); // Get the current date
 const [startDate, setStartDate] = useState(today);
 const [endDate, setEndDate] = useState(null);
 const [productOptions, setProductOptions] = useState([]);
 const [data, setData] = useState([]);
 const [currentDate, setCurrentDate] = useState(0);
 const [searchDate, setSearchDate] = useState([]);
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

const [formData, setFormData] = useState({
        fromdate: '',
});

const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'section_id') {
            //console.log("section_id" + value);
            //console.log(sectionOptions);
            const selectedSection = sectionOptions.find(section => String(section.id) === value);
            const sectionName = selectedSection ? selectedSection.section_name : '';
            setFormData((prevFormData) => ({
                ...prevFormData,
                section_id: value,
                section_name: sectionName,
            }));
        }
        else if (name === 'product_id') {
            const selectedProduct = productOptions.find(product => String(product.id) === value);
            const productName = selectedProduct ? selectedProduct.item_description : '';
            setFormData((prevFormData) => ({
                ...prevFormData,
                product_id: value,
                product_name: productName,
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
};

const initializeTable = (timesheet, formattedDate, otaCount) => {
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
             dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
           buttons: [
      {
        extend: 'copy',
        
      },
      {
        extend: 'csv',
        filename: `NON-BRAID SUPERVISOR EFFICIENCY REPORT Date ${formattedDate}`, // Set your desired filename here
      },
    ],
            data: timesheet, // Update the data option here
            columns: [
            
                { data: 'supervisor_name' },
               
                { data: 'shift' },
                { data: 'line' },
                { data: 'section_name', },
                
                {
                // Render function to display otaCount
                render: function(data, type, row) {
                    return type === 'display' && otaCount !== undefined ? `<strong>${otaCount}</strong>` : '';
                }
            },
                { data: 'totalTarget1' },
              
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            // Calculate the total sum of hours for the current row
                            const complete = row.value_sum;
                            const totalComplete = complete;
                            // Return the total sum for display
                            return totalComplete;
                        }
                        return data;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            const complete = row.value_sum;
                            if (complete != 0) {
                                const st = row.totalTarget1;
                                const efficiency = (complete / st) * 100;
                                const formattedEfficiency = efficiency.toFixed(2);
                                return formattedEfficiency + '%';
                            }
                            else {
                                return "N/A";
                            }

                        }
                        return data;
                    },
                },
                { data: 'date_time' },
                { data: 'sup_site', },
                
            ],
        });
    };

useEffect(() => {
    setLoading(true);
    document.title = 'Supervisor Efficiency Report';

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
    } else {

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
            dom: 'Bfrtip',
            buttons: ['copy', 'csv'],
            data: data, // Use the 'data' state variable here
            // ...rest of your options
        });

        $.ajax({
            url: `${config.apiUrl}/eff_supervisor`,
            method: "GET",
            headers: customHeaders,
            data: [],
            processData: false,
            contentType: 'application/json',
            success: function (response) {

                // Access the timesheet results from the response object
                const { timesheet, date, worker_counts } = response;

                // Log the worker_counts object to verify structure
                console.log('worker_counts:', worker_counts);

                // Extract specific values from worker_counts if necessary
                const otaCount = worker_counts?.['1']?.['1']?.['DAY']?.['ota'];

                // Log the specific value to verify it
                console.log('otaCount:', otaCount);

                // Update the component state with the timesheet data
                setData(timesheet);
                setCurrentDate(date);
                setSearchDate(date);

                // Format the date as "DD-MM-YYYY"
                const formattedDate = date;

                // Initialize the DataTable with the updated data and filename
                 initializeTable(timesheet, formattedDate, otaCount);

                setLoading(false);
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            },
        });
    }
}, []);


const handleLogout = () => {
        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        navigate('/login');
};

return (
        <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
        <div className="content">
      <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
               <CardTitle tag="h5"> Supervisor Efficiency
                <hr></hr>
                
               </CardTitle>
               </CardHeader>
                <CardBody>
                        
 
                        <div>
                          {searchDate ? (
                            <h6 className="header-filter">
                              <span className="textred">{searchDate}</span>
                            </h6>
                          ) : (
                            <span className="textred">{currentDate}</span>
                          )}
                        </div>


                        <div className="table-responsive">


                             <table id="example" className="display">
                                <thead>
                                    <tr>
                                        <th>Supervisor Name</th>                                       
                                        <th>Shift</th>
                                        <th>Line</th>
                                        <th>Section</th>                                       
                                        <th>Worker</th>
                                        <th>Item/Supervisor Target</th>                                   
                                        <th>Complete</th>
                                        <th>Efficiency</th>
                                        <th>Date</th>
                                        <th>Site</th>
                                       
                                    </tr>
                                </thead>

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

export default SupervisorEfficiencyReport;
