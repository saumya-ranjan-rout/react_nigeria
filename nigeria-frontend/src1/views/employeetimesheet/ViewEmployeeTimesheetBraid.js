import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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


function ViewEmployeeTimesheetBraid() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [itemId, setItemId] = useState('');
  const [results, setResults] = useState([]);
  const [employees, setEmployees] = useState([]);
   const [sections, setSections] = useState([]);
  const tableRef = useRef(null);
  const today = new Date();
  
 const location = useLocation();
  
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

    const { id } = useParams();
console.log(id);

 useEffect(() => {
    document.title = 'View Comparison';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
     const itemId = id;
      const { item_description } = location.state || {};


        setItemId(itemId);
      

      $.ajax({
        url: `${config.apiUrl}/getviewcomparisonbraid/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {

          // Access the timesheet results from the response object
          const { comparison } = response;
          setSections(comparison);

           // Show an alert with the data from the response
          //alert('Received Data:\n' + JSON.stringify(response));

           // Extract the 'id' from the first response
        const firstResponseId = comparison.id;

        // Second API request with the 'id' from the first response
        $.ajax({
          url: `${config.apiUrl}/getemployeeproductivity/${firstResponseId}`, // Replace with your second API URL
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            // Handle the second API response here
            // You can set another state variable to store the data, e.g., setSecondData(secondApiResponse);

            // Access the timesheet results from the response object
           const { results} = response;
          setResults(results);
          //setEmployees(employeeData);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching data from second API:', error);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error('Error fetching sections:', error);
      },
    });

    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv'],
      });
    });
  }
}, []);

 

  const [formData, setFormData] = useState({
   //id: '',
    section: '',
    target: '', 
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
    
 const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

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
              View Comparison
                <hr></hr>
             
                  <div class="container mb-4">
                    <div className="form-group row">
                      <div class="container mb-4" style={{ textAlign: 'center' }}>
                        <b>Item Name : </b>
                        <span className="textred">{sections.item_description}</span>&nbsp;&nbsp;&nbsp;
                        <b>Zone & Machine:</b>
                        <span className="textgreen"> {sections.zone}[{sections.machine}]</span>&nbsp;&nbsp;&nbsp;
                        <b> Color:</b>
                        <span className="textblue"> {sections.color}</span>
                      </div>
                      <div class="container mb-4" style={{ textAlign: 'center' }}>
                      <table id="" class="table table-striped table-bordered zero-configuration">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Fiber</th>
                              <th>FG Output</th>
                              <th>Waste Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: 'bold' }}>Targeted</td>
                              <td>40 kg</td>
                              <td>
                                {Math.round((40 * 1000) / (parseInt(sections.net_weight, 10) + parseInt(sections.targeted_waste, 10)))} Pcs
                              </td>
                              <td>
                                {(40 * 1000) - (parseInt(sections.net_weight, 10) * (Math.round((40 * 1000) / (parseInt(sections.net_weight, 10) + parseInt(sections.targeted_waste, 10)))))} gm
                              </td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: 'bold' }}>Expected</td>
                              <td>{sections.fiber} Kg</td>
                              <td>{sections.fg_output} Pcs</td>
                              <td>{(parseInt(sections.fiber, 10) * 1000) - (parseInt(sections.net_weight, 10) * parseInt(sections.fg_output, 10))} gm</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: 'bold' }}>Inputted</td>
                              <td>{sections.fiber} Kg</td>
                              <td>{sections.fg_output} Pcs</td>
                              <td>
                                Short Length : ({sections.waste1})<br/>
                                First Comb: ({sections.waste2})<br/>
                                2nd Comb: ({sections.waste3})<br/>
                                Total : {sections.waste_weight} gm
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        </div>
                    </div>
                    <div className="form-group row space">
                    <h5><b>QC Details</b></h5>
                    <hr></hr>
                      <div class="container mb-4" >
                        <h6><span className="textgreen">Upper Roller Temp :</span> {sections.upper}</h6>
                        <h6><span className="textgreen">Lower Roller Temp. :</span> {sections.lower}</h6>
                        <h6><span className="textgreen">Perheating Chamber Temp. :</span> {sections.perheating}</h6>
                        <h6><span className="textgreen">Machine speed :</span> {sections.machine_speed}</h6>
                        <h6><span className="textgreen">Tension (Nm) :</span> {sections.tension}</h6>
                        <h6><span className="textgreen">Spreading of fiber (cm) :</span> {sections.spreading}</h6>
                      </div>
                      <br />
                    </div>
                    <div className="form-group row space">
                   
                      <h5><b>Employee Productivity</b></h5>
                       <div class="container mb-4" >
                      <table id="" class="table table-striped table-bordered zero-configuration">
                        <thead>
                          <tr>
                            <th>EntryId</th>
                            <th>Section</th>
                            <th>Employee</th>
                            <th>Target</th>
                            <th>Achievement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((item) => (
                            <tr key={item.id}>
                              <td>{item.empid}</td>
                              <td style={{ fontWeight: 'bold' }}>{item.sectionName}</td>
                              <td>{item.emp}</td>
                              <td>{item.target}</td>
                              <td>{parseInt(item.complete.split(',')[0], 10)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </div>
                  </div>
                 
                  
                
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ViewEmployeeTimesheetBraid;
