import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Row,
  Col,
} from "reactstrap";
import $ from 'jquery';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
//import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
//DB Connection
import config from '../../config';


function AddNewMachine() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
   const [selectedMachines, setSelectedMachines] = useState([]);
  
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

useEffect(() => {
    document.title = 'Add Machine';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      

      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }


   
  }, []);


  const [formData, setFormData] = useState({
    zone: '',
    machine: '',
    
  });

  const renderSelectedMachines = () => {
  return selectedMachines.join(', ');
};

  const handleInputChange = (event) => {
  const { name, value } = event.target;

  if (name === 'machine1' && value) {
    // Check if the selected machine is already in the array
    if (!selectedMachines.includes(value)) {
      setSelectedMachines((prevSelectedMachines) => [...prevSelectedMachines, value]);
    }
    // Update the machine field in formData
    setFormData({ ...formData, machine: selectedMachines.join(',') });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};

  
 const handleSubmit = (event) => {
    event.preventDefault();

const postData = {
      zone: formData.zone,
      machine: selectedMachines.join(','), // Join the selected machines array into a comma-separated string
    };
    $.ajax({
      url: `${config.apiUrl}/addmachine`,
      method: 'POST',
      headers: customHeaders,
      data: postData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Machine already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
      // Wait for 2 seconds before navigating back
      setTimeout(() => {
      navigate(-1);
      }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        if (xhr.status === 409) {
          setServerMessage(xhr.responseJSON.message); // Set the server message in state
          setServerMessageClass('alert alert-danger');
        } else {
          setServerMessage('An error occurred'); // Set the server message in state for other errors
          setServerMessageClass('alert alert-danger');
        }
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
                <CardTitle tag="h5">Add Machine Master</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                    <div className="form-group row space">

              <label className="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Zone</span> <span className='textred'>*</span></label>

                    <div className="col-sm-6">
                        <select
                            className="form-control"
                            name="zone"
                            value={formData.zone}
                             onChange={handleInputChange} required
                          >
                            <option value=""disable>Select ZONE</option>
                               <option value="ZONE1">ZONE1</option>
                               <option value="ZONE2">ZONE2</option>
                               <option value="ZONE3">ZONE3</option>
                               <option value="ZONE4">ZONE4</option>
                               <option value="ZONE5">ZONE5</option>
                               <option value="ZONE6">ZONE6</option>
                               <option value="ZONE7">ZONE7</option>
                               <option value="ZONE8">ZONE8</option>
                               <option value="ZONE9">ZONE9</option>
                               <option value="ZONE10">ZONE10</option>
                               
                                <option value="ZONE11">ZONE11</option>
                               <option value="ZONE12">ZONE12</option>
                               <option value="ZONE13">ZONE13</option>
                               <option value="ZONE14">ZONE14</option>
                               <option value="ZONE15">ZONE15</option>
                               <option value="ZONE16">ZONE16</option>
                               <option value="ZONE17">ZONE17</option>
                               <option value="ZONE18">ZONE18</option>
                               <option value="ZONE19">ZONE19</option>
                               <option value="ZONE20">ZONE20</option>
                        </select>
                    </div>
                </div>

                
              
              <div className="form-group row space">

              <label className="col-sm-2 col-form-label"
                           for="section_name"><span className='textblack'>Machine</span> </label>

                    <div className="col-sm-6">
                        <select
                            className="form-control"
                            name="machine1"
                            value={formData.machine1}
                             onChange={handleInputChange}
                          >
                            <option value=""disable>Select Machine</option>
                           
                               <option value="MACH1">MACH1</option>
                               <option value="MACH2">MACH2</option>
                               <option value="MACH3">MACH3</option>
                               <option value="MACH4">MACH4</option>
                               <option value="MACH5">MACH5</option>
                               <option value="MACH6">MACH6</option>
                               <option value="MACH7">MACH7</option>
                               <option value="MACH8">MACH8</option>
                               <option value="MACH9">MACH9</option>
                               <option value="MACH10">MACH10</option>
                               
                                <option value="MACH11">MACH11</option>
                               <option value="MACH12">MACH12</option>
                               <option value="MACH13">MACH13</option>
                               <option value="MACH14">MACH14</option>
                               <option value="MACH15">MACH15</option>
                               <option value="MACH16">MACH16</option>
                               <option value="MACH17">MACH17</option>
                               <option value="MACH18">MACH18</option>
                               <option value="MACH19">MACH19</option>
                               <option value="MACH20">MACH20</option>
                        </select>
                    </div>
                </div>

                 <div class="form-group row space">

                  
                    <div class="col-sm-6"><span className='textred'>*</span>
                        <input type="text" className="gentxt1 subcat form-control " name="machine" readonly  value={renderSelectedMachines()}  required style={{ background: '#ECEFF1'  }}/>
                    </div>
                </div>

               
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label"></label>
                      <div className="col-sm-4">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Add"
                          data-loading-text="Adding..."
                        />
                        <input type="hidden" value="master_ota/addcolor" id="action-url" />
                      </div>
                    </div>
                  </div>
                 
                  
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default AddNewMachine;
