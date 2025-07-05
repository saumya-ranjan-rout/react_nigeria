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
import Select from 'react-select';

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


function EditEmployeeTimesheetBraid() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
   const [itemCategories, setItemCategories] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [product, setProduct] = useState('');
  const [line, setLine] = useState('');
  const [section, setSection] = useState('');
  const [hour, setHour] = useState('');
  //const [shiftt, setShift] = useState('');
  const [absentEntryIdsMessage, setAbsentEntryIdsMessage] = useState('');
   const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [colorcodeOptions, setColorCodeOptions] = useState([]);
const [operators, setOperators] = useState([]);
const [qcs, setQcs] = useState([]);
const [comparisions, setComparisions] = useState([]);
const [rows, setRows] = useState([]);
const [empid, setEmpId] = useState('');
const [site, setSite] = useState('');
const [comparison, setComparison] = useState('');

const [siteValue, setSiteValue] = useState('');

 const [empIdValue, setEmpIdValue] = useState('');
const [shiftValue, setShiftValue] = useState('');
const [itemValue, setItemValue] = useState('');
const [colorIdValue, setColorIdValue] = useState('');
const [colorNameValue, setColorNameValue] = useState('');
const [zoneValue, setZoneValue] = useState('');
const [machineValue, setMachineValue] = useState('');
const [fiberValue, setFiberValue] = useState('');
const [hrStartValue, setHrStartValue] = useState('');
const [hrEndValue, setHrEndValue] = useState('');
const [fgOutputValue, setFgOutputValue] = useState('');
const [waste1Value, setWaste1Value] = useState('');
const [waste2Value, setWaste2Value] = useState('');
const [waste3Value, setWaste3Value] = useState('');
const [wasteWeightValue, setWasteWeightValue] = useState('');
const [dateValue, setDateValue] = useState('');
const [monthValue, setMonthValue] = useState('');
const [timestampValue, setTimestampValue] = useState('');
const [datetimeValue, setDatetimeValue] = useState('');
const [iempCountValue, setIempCountValue] = useState('');
const [dempCountValue, setDempCountValue] = useState('');
const [upperValue, setUpperValue] = useState('');
const [lowerValue, setLowerValue] = useState('');
const [perheatingValue, setPerheatingValue] = useState('');
const [machineSpeedValue, setMachineSpeedValue] = useState('');
const [tensionValue, setTensionValue] = useState('');
const [spreadingValue, setSpreadingValue] = useState('');
const [updateTimeValue, setUpdateTimeValue] = useState('');
const [opNameValue, setOpNameValue] = useState('');
const [opIdValue, setOpIdValue] = useState('');


 const [sectionfilteredData, setSectionFilteredData] = useState([]);

const [shift, setShift] = useState('');
  const [item, setItem] = useState('');
  const [zone, setZone] = useState('');
  const [machine, setMachine] = useState('');
  const [hr_start, setHrStart] = useState('');
  const [hr_end, setHrEnd] = useState('');
  const [fiber, setFiber] = useState('');
  const [fg_output, setFgOutput] = useState('');
  const [waste1, setWaste1] = useState('');
  const [waste2, setWaste2] = useState('');
  const [waste3, setWaste3] = useState('');
  const [waste_weight, setWasteWeight] = useState('');
  const [upper, setUpper] = useState('');
  const [lower, setLower] = useState('');
  const [perheating, setPerheating] = useState('');
  const [machine_speed, setMachineSpeed] = useState('');
  const [tension, setTension] = useState('');
  const [spreading, setSpreading] = useState('');
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

   const { id } = useParams();
console.log(id);


  const [formData, setFormData] = useState({
   item: '',
   color_description: '',
   site: '',
   shift: '',
   zone: '',
   machine: '',
   hr_start: '',
   hr_end: '',
   fiber: '',
   fg_output: '',
   waste1: '',
   waste2: '',
   waste3: '',
   waste_weight: '',  
   upper: '',
   lower: '',
   perheating: '',
   machine_speed: '',
   spreading: '',
   tension: '',
  });

 const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

const handleProductChange = async (e) => {
  const selectedProduct = e.target.value;

  try {
     const response = await fetch(`${config.apiUrl}/getcolordescription/${selectedProduct}`,{headers: customHeaders});
    
    if (!response.ok) {
      throw new Error('Failed to fetch color options');
    }

    const data = await response.json();
    setColorOptions(data);

    // Update the selected product in the state
    setItemValue(selectedProduct);
  } catch (error) {
    console.error('Error fetching color options:', error.message);
  }
};


  

  


const handleDeleteRow = (id) => {
  // Display an alert with the index of the row being deleted
  //alert(`Deleting row with index: ${id}`);
  
   setData((prevData) => {
    const newData = prevData.filter((item) => item.id !== id);
    return newData;
  });
};


const handleSubmitnew = (event) => {
  event.preventDefault(); // Prevent the default form submission
  

  const tableRows = Array.from(document.querySelectorAll('table#tblCustomers tbody tr'));
  const dataToSend = []; // Create an array to store the data

   const operator = 1; // Create an array to store the data

  // Include other form data...
  const formDataToSend = {
    catid: id,
    operator: opNameValue,
    opid: opIdValue,
    shift: formData.shift,
    product_name: formData.item,
    site: formData.site,
    zone: formData.zone,
    machinec: formData.machine,
    hr_start: formData.hr_start,
    hr_end: formData.hr_end,
    fiber: formData.fiber,
    fg_output: formData.fg_output,
    waste1: formData.waste1,
    waste2: formData.waste2,
    waste3: formData.waste3,
    waste_weight: formData.waste_weight,
    temp0: formData.upper,
    temp1: formData.lower,
    temp2: formData.perheating,
    temp3: formData.machine_speed,
    temp4: formData.tension,
    temp5: formData.spreading,
    fdate: formData.update_time,
    color_description: formData.color_description,
    
  };

  //alert('Form Data to Send:'+  JSON.stringify(formDataToSend));

  tableRows.forEach((row) => {
    const $row = $(row);
    const completes = $row.find('input[name^="achievement_"]').val();
    if (completes !== '') {
      const rowData = {
        emp_ids: $row.find('td:eq(0)').text(),
        worker_names: $row.find('td:eq(1)').text(),
        section: $row.find('td:eq(2)').text(),
        target: $row.find('td:eq(3)').text(),
        section_id: $row.find('td:eq(4)').text(),
        secid: $row.find('td:eq(5)').text(),
        completes: $row.find('input[name^="achievement_"]').val(),

      };

      dataToSend.push(rowData); // Add the current row data to the array
    }
  });

  // Add form data to the array
  dataToSend.unshift(formDataToSend);

  // Send the data to the API server
  $.ajax({
    url: `${config.apiUrl}/updateemployeetimesheetfilterdata`,
    type: 'POST',
    headers: customHeaders,
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
      console.log('Data successfully posted to the API server.');
      // Handle any further actions or UI updates if needed
      if (response.success) {
      console.log('Success Message:', response.successMessage);
      setServerMessage(response.successMessage);
      setServerMessageClass('alert alert-success'); // Set your desired error class
      // Display success message to the user
      setTimeout(() => {
            setServerMessage('');
            setServerMessageClass('');
            // Navigate back in the browser history after displaying the success message
            window.history.back();
          }, 5000);
      }
    },
    error: function (error) {
      console.error('Failed to post data to the API server.');
      // Handle error or display an error message
    },
  });
};



const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
  };




useEffect(() => {

       document.title = 'Edit ';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      $.ajax({
        url: `${config.apiUrl}/operator_edit/${id}`, // Replace with your API endpoint URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {

          // You can access specific properties from the response like this:
        const { comparison } = response;
         //alert(JSON.stringify(response));

          const { date } = comparison;
          setDateValue(date);
          
        const item = comparison.item;
         //alert(item);
        const site = comparison.site;
        const shift = comparison.shift;
        const zone = comparison.zone;
        const machine = comparison.machine;
        const color_description = comparison.color_id;
        const hr_start = comparison.hr_start;
        const hr_end = comparison.hr_end;
        const fiber = comparison.fiber;
        const fg_output = comparison.fg_output;
        const waste1 = comparison.waste1;
        const waste2 = comparison.waste2;
        const waste3 = comparison.waste3;
        const waste_weight = comparison.waste_weight;
        const upper = comparison.upper.toFixed(2);
        const lower = comparison.lower.toFixed(2);
        const perheating = comparison.perheating.toFixed(2);
        const machine_speed = comparison.machine_speed.toFixed(2);
        const tension = comparison.tension.toFixed(2);
        const spreading = comparison.spreading.toFixed(2);
        const update_time = comparison.update_time;
        const dateValue = comparison.date;
 
        setFormData({item, site, shift, zone, machine, color_description, hr_start, hr_end, fiber, fg_output, waste1, waste2, waste3, waste_weight, upper, lower, perheating, machine_speed, tension, spreading, update_time, dateValue });

         // Check if the 'id' property exists in the 'comparison' object
          if ('id' in comparison) {
            // 'id' property exists, which means the 'comparison' object is not empty
            const empid = comparison.emp_id;
            const site = comparison.site;
            const item = comparison.item;
            //alert("Emp Id: " + empid);
            // alert("site: " + site);
            setEmpId(empid);
            setSite(site);
            // Call fetchOperator and pass emp_id as an argument
            fetchOperator(empid, site);

            getcolordescriptionss(item);
          } else {
            // 'id' property does not exist, indicating the 'comparison' object is empty
            // Handle the case when 'comparison' is empty here.
          }

          setComparisions(response);

        },
        error: function (xhr, status, error) {
          console.error('Error fetching data:', error);
        },
      });
    
    // Destroy the existing DataTable instance (if it exists)
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
          // Initialize the DataTable with the updated data
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf'],
        data: data, // Use the 'data' state variable here
        // ...rest of your options
      });

         
    }
 

    // Fetch shift options from API
    const fetchShiftOptions = () => {
      $.ajax({
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

    const fetchProductOptions = () => {
      $.ajax({
        url: `${config.apiUrl}/getProductOptions`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setProductOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };
    fetchProductOptions();

    const fetchOperator = (empid, site) => {
      $.ajax({
        url: `${config.apiUrl}/getOperator/${empid}/${site}`, // Use emp_id in the URL
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          //alert(JSON.stringify(response));
          //setOperators(response);
          if (response) {
            const opname = response.name;
              const opid = response.id;


              // Now, set these values in the state using your setter functions
              setOpNameValue(opname);
              setOpIdValue(opid);

            } else {
              console.error('Invalid response format. Missing "comparison" property.');
            }

            },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };
    fetchOperator();

    const fetchQC = () => {
      $.ajax({
        url: `${config.apiUrl}/getqc`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setQcs(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };
    fetchQC();

    const getcolordescriptionss = (item) => {
       
      $.ajax({
        url: `${config.apiUrl}/getcolordescriptionss/${item}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setColorOptions(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching color options:', error);
          console.log('XHR status:', status);
        },
      });
    };
    getcolordescriptionss();
 
    const fetchoperatorsection = () => {
      $.ajax({
        url: `${config.apiUrl}/operatorsection/${id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          const { rows } = response;

          // Create an object to store achievement values dynamically
          const achievements = {};

          // Populate achievements object with default values or existing values
          rows.forEach((item) => {
            achievements[`achievement_${item.id}`] = item.cmp.split(',')[0] || '';
          });

          // Set the dynamic achievements object in the formData state,
          // preserving existing values from the useEffect block
          setFormData((prevFormData) => ({ ...prevFormData, ...achievements }));

          // Set the rows state
          setRows(rows);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching product options:', error);
        },
      });
    };
    fetchoperatorsection(); 
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };

  
   // Function to calculate and update waste_weight
  const updateWasteWeight = () => {
    const { waste1, waste2, waste3 } = formData;

    // Parse values, treating empty fields as 0
    const value1 = parseFloat(waste1) || 0;
    const value2 = parseFloat(waste2) || 0;
    const value3 = parseFloat(waste3) || 0;

    const sum = value1 + value2 + value3;
    setFormData((prevFormData) => ({
      ...prevFormData,
      waste_weight: sum, // Adjust precision as needed
    }));
  };

    // Call the function whenever waste1, waste2, or waste3 changes
    useEffect(() => {
      updateWasteWeight();
    }, [formData.waste1, formData.waste2, formData.waste3]);
  
  



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
             Employee Details ({dateValue})
                <hr class="mb-2"></hr>
              <form onSubmit={handleSubmitnew} method='POST' >
                  <div>

                    <div className="row space">

                          <div className="col-sm-6">
                              <span className="textgreen">Operator <span className="textred">*</span></span>
                               <input type="text" class="form-control" name="operator" id="pat"  value={`${opNameValue} / ${opIdValue}`}  disabled/>
                            </div>

                            
                            
                            <div className="col-sm-3">
                              <span className="textgreen">Shift <span className="textred">*</span></span>
                              
                              <input name="text"  id="shift"  name="shift"  class="form-control" value={formData.shift} onChange={handleInputChange} disabled/>
                              
                            </div>

                            <div className="col-sm-3">
                              <span className="textgreen">Item Master <span className="textred">*</span></span>
                              <select
                                className="form-control"
                                name="item"
                                id="item"
                               
                                value={formData.item}
                                onChange={(e) => {
                                  handleInputChange(e);
                                  handleProductChange(e);
                                }}

                              >
                                <option value="">Select Product Name </option>
                                {productOptions.map((productOption) => (
                                  <option
                                    key={productOption.id}
                                    value={productOption.id}
                                  >
                                    {productOption.item_description}
                                  </option>
                                ))}
                              </select>
                            </div>
                      </div>

                 <div className="row mt-2">

                    <div className="col-sm-3">
                      <span className="textgreen">Select Color <span className="textred">*</span></span>
                      <select
                        className="form-control"
                        name="color_description"
                        id="color_description"
                        value={formData.color_description}
                       onChange={(e) => {
                        handleInputChange(e);
                       
                      }}

                      >
                        <option value="">Select Color</option>
                        {colorOptions.map((colorOption) => (
                          <option key={colorOption.id} value={colorOption.id}>
                            {colorOption.product_des}
                          </option>
                        ))}
                      </select>
                    </div>


                    <div className="col-sm-3">
                        <span className="textgreen">Site <span className="textred">*</span></span>
                        
                        <select  className="form-control" name="site" id="site" value={formData.site} onChange={handleInputChange} disabled>
                          <option value="">Select</option>
                           <option value="ota">ota</option>
                           <option value="ikeja">ikeja</option>
                         </select>  
                      </div>

                      <div className="col-sm-3">
                        <span className="textgreen">Zone <span className="textred">*</span></span>
                            <select
                                className="form-control"
                                name="zone"
                                id="zone"
                                value={formData.zone}
                                 onChange={handleInputChange}
                                 disabled
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
                    <div className="col-sm-3">
                     <span className="textgreen">Machine <span className="textred">*</span></span>
                            <select
                                className="form-control"
                                name="machine"
                                id="machine"
                                value={formData.machine}
                                 onChange={handleInputChange}
                                 disabled
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

              <div className="row mt-2">
                <div class="col-sm-3 ">
                  <span className="textgreen">Start Hour <span className="textred">*</span></span>
                  <input type="text" name="hr_start" id="hr_start" class="form-control" placeholder="00.00"  value={formData.hr_start}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">End Hour <span className="textred">*</span></span>
                  <input type="text" name="hr_end" id="hr_end" class="form-control" placeholder="00.00" value={formData.hr_end}
                             onChange={handleInputChange} required />
                </div>
                 <div class="col-sm-3 ">
                  <span className="textgreen">Load Fiber <span className="textred">*</span></span>
                  <input type="text" name="fiber" id="fiber" class="form-control" placeholder="Fiber" value={formData.fiber}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">FG OUTPUT<span className="textred">*</span></span>
                  <input type="text" name="fg_output" id="fg_output" class="form-control" placeholder="FGOUTPUT" value={formData.fg_output}
                             onChange={handleInputChange} required />
                </div>
                </div>

                <div className="row mt-2">
                <div class="col-sm-3 ">
                  <span className="textgreen">Short Length <span className="textred">*</span></span>
                  <input type="text" name="waste1" id="waste1" class="form-control" placeholder="WASTE TYPE1"  value={formData.waste1}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">1st Comb <span className="textred">*</span></span>
                  <input type="text" name="waste2" id="waste2" class="form-control" placeholder="WASTE TYPE2" value={formData.waste2}
                             onChange={handleInputChange} required />
                </div>
                 <div class="col-sm-3 ">
                  <span className="textgreen">2nd Comb <span className="textred">*</span></span>
                  <input type="text" name="waste3" id="waste3" class="form-control" placeholder="WASTE TYPE3" value={formData.waste3}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textgreen">WASTE WEIGHT<span className="textred">*</span></span>
                  <input type="text" name="waste_weight" id="waste_weight" class="form-control" placeholder="WASTE" value={formData.waste_weight}
                             onChange={handleInputChange} required disabled/>
                </div>
                </div>

                 

                  <h5>Enter QC Parameter</h5>
              <hr></hr>
               

               <div className="row space">
                <div class="col-sm-3 ">
                  <span className="textblue">Upper Roller Temp</span>
                  <input type="text" name="upper" id="upper" class="form-control" placeholder="00.00" value={formData.upper}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textblue">Lower Roller Temp.</span>
                  <input type="text" name="lower" id="lower" class="form-control" placeholder="00.00" value={formData.lower}
                             onChange={handleInputChange} required />
                </div>
                 <div class="col-sm-3 ">
                  <span className="textblue">Perheating Chamber Temp.</span>
                  <input type="text" name="perheating" id="perheating" class="form-control" placeholder="00.00" value={formData.perheating}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textblue">Machine speed</span>
                  <input type="text" name="machine_speed" id="machine_speed" class="form-control" placeholder="00.00"  value={formData.machine_speed}
                             onChange={handleInputChange} required />
                </div>
                </div>
                 <div className="row space">
                 <div class="col-sm-3 ">
                  <span className="textblue">Tension (Nm)</span>
                  <input type="text" name="tension" id="tension" class="form-control" placeholder="00.00" value={formData.tension}
                             onChange={handleInputChange} required />
                </div>
                <div class="col-sm-3 ">
                  <span className="textblue">Spreading of fiber (cm)</span>
                  <input type="text" name="spreading" id="spreading" class="form-control" placeholder="00.00" value={formData.spreading}
                             onChange={handleInputChange} />
                </div>
                
                
              </div>

                <h5>Enter Employee Productivity</h5>
               <h5>are absent</h5>
              <hr></hr>
        

            
            <div className="message-container">
              {absentEntryIdsMessage && (
                <div className="absent-message">
                  {absentEntryIdsMessage}
                </div>
              )}
            </div>

            
        
    
              <div class="fixTableHead">
                        <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered" cellPadding="0" cellSpacing="0" border="1">
                              <thead>
                                <tr style={{ backgroundColor: '#ABDD93' }}>
                                   <th>Entryid</th>
                                    <th>Emp Name</th>
                                    <th>Section</th>
                                    
                                    <th>Target</th>
                                    <th>Achievement</th>
                                  </tr>
                              </thead>
                             <tbody>
                                    {rows.map((item) => (


                          <tr key={item.id}>
                            <td>{item.empid}</td>
                             <td>{item.emp}</td>
                            <td style={{ fontWeight: 'bold' }}><span className="textred">{item.sec}</span></td>
                           
                            <td>{item.target}</td>
                            <td hidden>{item.section_id}</td>
                            <td hidden>{item.id}</td>
                           <td>
                         <td>
                          <input
                      type="text"
                      name={`achievement_${item.id}`}
                      className={`bordered-input`}
                      value={formData[`achievement_${item.id}`] || ''}
                      onChange={(e) => handleInputChange(e)}
                      // Apply 'disabled' attribute based on the condition
                            disabled={(item.section_id === 24 || item.section_id === 23 || item.section_id === 7) ? 'disabled' : ''}
                    />
                        </td>
                        </td>
                          </tr>
                        ))}
                                  </tbody>

                      </table>
                      </div>
              <div className="form-group row">

                  <label className="col-sm-11 col-form-label"></label>

                  <div className="col-sm-11">
                      
                      
                  </div>
                  <div className="col-sm-1">
                      <input type="submit" id="submit-data" className="btn btn-success margin-top"
                            value="Save" data-loading-text="Updating..." />
                      
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

export default EditEmployeeTimesheetBraid;
