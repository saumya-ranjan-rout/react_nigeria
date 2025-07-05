import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import '../../Loader.css';

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
import makeAnimated from 'react-select/animated';
import config from '../../../../config';

export function SupervisorComponent() {
  const [isActive, setActive] = useState(false);
  const animatedComponents = makeAnimated();
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [supervisors, setSupervisorData] = useState([]);
  const [items, setItems] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionName, setSectionName] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate();
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const token = localStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}`
  };

  const DeleteOperator = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/ota/delete_supervisor/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response.message);
          fetchData(); // Refetch data to refresh the table
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };

  const fetchData = () => {
    $.ajax({
      url: `${config.apiUrl}/ota/supervisor_data_view`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        console.log('Fetched Data:', response);
        if (response && response.timesheet) {
          const timesheets = response.timesheet;
          
          // Destroy the existing DataTable instance if it exists
          if ($.fn.DataTable.isDataTable('#example')) {
            $('#example').DataTable().clear().destroy();
          }

          // Initialize DataTable with new data
          tableRef.current = $('#example').DataTable({
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>',
            buttons: ['copy', 'csv', 'excel'],
            data: timesheets,
            columns: [
              {
                data: null,
                className: 'checkbox-column',
                render: function (data) {
                  return `<input type="checkbox" data-id="${data.id}" onChange="handleCheckboxChange(this)">`;
                }
              },
              {
                data: null,
                className: 'row-number-column',
                render: function (data, type, row, meta) {
                  return meta.row + 1;
                }
              },
              { data: 'name' },
              { data: 'entryid' },
              { data: 'line' },
              { data: 'section_name' },
              { data: 'shift' },
              {
                data: null,
                className: 'action-column',
                render: function (data, type, row) {
                  return `
                    <button class="btn btn-sm btn-danger" onclick="DeleteOperator('${row.id}')" title="Delete"><i class="fa fa-trash" aria-hidden="true"></i></button>
                  `;
                },
              },
            ],
          });

          // Add event listener to the header checkbox
          $('#example thead input[type="checkbox"]').click(function () {
            const isChecked = this.checked;
            $('#example tbody input[type="checkbox"]').prop('checked', isChecked);
            const ids = isChecked ? timesheets.map(item => item.id) : [];
            setSelectedRows(ids);
          });
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching data:', error);
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Define the handleCheckboxChange function globally or bind it to window object
  window.handleCheckboxChange = function(checkbox) {
    const id = parseInt(checkbox.getAttribute('data-id'));
    setSelectedRows((prevSelectedRows) => {
      if (checkbox.checked) {
        return [...prevSelectedRows, id];
      } else {
        return prevSelectedRows.filter(rowId => rowId !== id);
      }
    });
  };

   // Function to delete selected rows
  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) {
      alert("Please select rows to delete.");
      return;
    }

    // Alert all selected row IDs
  //alert("Selected row IDs: " + selectedRows.join(", "));
    
    const confirmDelete = window.confirm('Are you sure you want to delete selected rows?');
    if (confirmDelete) {
      // Send all selected row IDs to the server to delete them
      $.ajax({
        url: `${config.apiUrl}/ota/delete_multiple_supervisor`,
        method: 'DELETE',
        headers: customHeaders,
        contentType: 'application/json',
        data: JSON.stringify({ ids: selectedRows }),
        success: function (response) {
          alert(response.message);
          window.location.reload(); // Refresh the page after deletion
        },
        error: function (xhr, status, error) {
          console.error('Error deleting rows:', error);
        },
      });
    }
  };

useEffect(() => {
    document.title = 'Add Supervisor';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      // Fetch item categories from API
      fetchData();

      // Fetch shift options from API
      const fetchShiftOptions = () => {
        $.ajax({
          // API URL for fetching shift options
          url: `${config.apiUrl}/getShiftOptions`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setShiftOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching shift options:', error);
          },
        });
      };

      fetchShiftOptions();

      // Fetch section options from API
      const fetchSectionOptions = () => {
        $.ajax({
          url: `${config.apiUrl}/getSectionOptions`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSectionOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching section options:', error);
          },
        });
      };

      fetchSectionOptions();

      // Fetch line options from API
      const fetchLineOptions = () => {

        $.ajax({
          url: `${config.apiUrl}/getindividualLineOptionss`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setLineOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching line options:', error);
          },
        });
      };

      fetchLineOptions();

      // Fetch line options from API
      const fetchSupervisorOptions = () => {

        $.ajax({
          url: `${config.apiUrl}/supervisor_details`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setSupervisorOptions(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching line options:', error);
          },
        });
      };

      fetchSupervisorOptions();
    }

    // Attach the functions to the window object
    
   
    window.DeleteOperator = DeleteOperator;
    
   
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };

  //submit assign data
  const [formData, setFormData] = useState({

  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
      url: `${config.apiUrl}/addsupervisorota`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {

        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Supervisor already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Redirect to SectionComponent after successful addition
        //history.push('/master/color-master');
         // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
          window.location.reload(); // Refresh the page after deletion
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
    <div className="content">
      <Row>
       <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Add New Section For{' '}</CardTitle>
                <hr></hr>
            </CardHeader>
            <CardBody>
             <form onSubmit={handleSubmit} method='POST'>
   
              <div className="row space">

                <div className="col-sm-3">
                  <span className="textgreen">Supervisor <span className="textred">*</span></span>
                  <Select
                    options={supervisorOptions.map(option => ({
                      value: option.entryid,
                      label: `${option.name} [${option.entryid}]`
                    }))}

                    value={formData.supervisor ? { value: formData.supervisor, label: formData.name } : null}
                    onChange={(selectedOption) => {
                      setFormData({ ...formData, supervisor: selectedOption.value, name: selectedOption.label });
                    }}
                    isSearchable
                    placeholder="Select Supervisor"
                  />
                </div>


                <div className="col-sm-2">
                  <span className="textgreen">Shift</span>
                  <select
                    id="shift"
                    className="form-control"
                    name="shift" required
                    value={formData.shift} onChange={handleInputChange}
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map((shiftOption) => (
                      <option key={shiftOption.id} value={shiftOption.name}>
                        {shiftOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen">Line <span className="textred">*</span></span>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    options={lineOptions.map(option => ({ value: option.id, label: option.line_name }))}
                    value={formData.line_no ? formData.line_no.map(lineId => ({
                      value: lineId,
                      label: lineOptions.find(option => option.id === lineId)?.line_name
                    })) : null}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setFormData({
                        ...formData,
                        line_no: selectedValues,
                        line_name: selectedOptions.map(option => option.label)
                      });
                    }}
                    isSearchable
                    placeholder="Select Line No"
                  />

                </div>

                <div className="col-sm-2">
                  <span className="textgreen">Section Name <span className="textred">*</span></span>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    options={sectionOptions.map(option => ({ value: option.id, label: option.section_name }))}
                    value={formData.section ? formData.section.map(sectionId => ({
                      value: sectionId,
                      label: sectionOptions.find(option => option.id === sectionId)?.section_name
                    })) : null}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setFormData({
                        ...formData,
                        section: selectedValues,
                        section_name: selectedOptions.map(option => option.label)
                      });
                    }}
                    isSearchable
                    placeholder="Select Section"
                  />

                </div>

                <div className="col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-md"
                  >
                    Add
                  </button>
                </div>
              </div>
              <br />
            </form>
            <div className="row">
              <div className="col-sm-12">
                <button
                  onClick={deleteSelectedRows}
                  className="btn btn-danger"
                >
                  Multiple Delete 
                </button>
              </div>
            </div>
              <Table id="example" className="display" style={{ width: "100%" }}>
                <thead>
                  <tr>
                   <th>All<input type="checkbox" /></th> {/* Checkbox in the header */}
                  <th>#</th>
                  <th>Name</th>
                  <th>Entry Id</th>
                  <th>Line</th>
                  <th>Section Name</th>
                  <th>Shift</th>
                  <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Rows will be rendered by DataTable */}
                </tbody>
                
              </Table>
            </CardBody>
           
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SupervisorComponent;