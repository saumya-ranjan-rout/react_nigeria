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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';


function AddEmployeeTimesheet() {
  const { t } = useTranslation();
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
  const [srrpro, setSrrpro] = useState(0);
  const [line, setLine] = useState('');
  const [hour, setHour] = useState('');
  const [shiftt, setShift] = useState('');
  const [movedempp, setMovedemp] = useState('');
  const [saveDisable, setSaveDisable] = useState(true);
  const [targetAlert, SetTargetAlert] = useState(false);
  const [data, setData] = useState([]);
  const [totalComplete, setTotalComplete] = useState(0);
  const [product, setProduct] = useState('');
  const [section, setSection] = useState('');
  const [absentEntryIdsMessage, setAbsentEntryIdsMessage] = useState('');
  const [colorOptions, setColorOptions] = useState([]); // Define colorOptions state
  const [targetOptions, setTargetOptions] = useState([]); // Define colorOptions state
  const [targetValues, setTargetValues] = useState({});
  const [opOptions, setOpOptions] = useState([]);
  const [sites, setSites] = useState('');
  const [shiftts, setShiftts] = useState('');
  const [lines, setLines] = useState('');
  const [hours, setHours] = useState('');
  const [sectionnames, setSectionNames] = useState('');
  const [ent, setEnt] = useState('');
  const [inserted, setInserted] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const [absent, setAbsent] = useState('');
  const [wnames, setWNames] = useState('');
  const [hourOptions, sethourOptions] = useState([]);
  const [notWorkingEmps, setNotWorkingEmps] = useState('');
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
     //alert(roleId);
     //alert(ctype);


 const [formData, setFormData] = useState({
    //fromdate: '',
    //todate: '',
    shift: '',
    product_name: '',
    line_no: '',
    section: '',
    hour: '',
    userid: userid,
    
  });



  const handleInputChange = (event) => {
    if (event && event.target) {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });

   
    } else {
      console.error('Event or event.target is undefined:', event);
    }
  };



 

  const handleSubmit = (event) => {
    event.preventDefault();
    //const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };
    const updatedFormData = { ...formData };

    const jsonData = JSON.stringify(updatedFormData);
    //alert(jsonData);

    $.ajax({
      url: `${config.apiUrl}/getaddemployeetimesheetfilterdata`,
      method: 'POST',
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        if (response && response.length > 0) {
          const { responseData, product, line, section, hour, shiftt, r, movedemp, ent, op_id, tar } = response[0];
      
          if (product) setProduct(product);
          if (line) setLine(line);
          if (section) setSection(section);
          if (hour) setHour(hour);
          if (shiftt) setShift(shiftt);
          if (r) setInserted(r);
          if (ent) setEnt(ent);
          if (movedemp) setMovedemp(movedemp);
          if (responseData) setData(responseData);
          // If there are other fields to set, check and set them similarly

          if (tar > 0) {
            setSaveDisable(false);
            SetTargetAlert(false);
          }
          else {
            SetTargetAlert(true);
            setSaveDisable(true);
          }
        } else {
          SetTargetAlert(false);
          setSaveDisable(true);
          console.log('Response is empty or undefined');
        }



      },
      error: function (xhr, status, error) {
        console.error('Error:', error);
      },
    });
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

  tableRows.forEach((row) => {
    const $row = $(row);
    const completes = $row.find('input[name^="achievement_"]').val();
    if (completes !== '') {

      const rowData = {
        worker_names: $row.find('td:eq(0)').text(),
        emp_ids: $row.find('td:eq(1)').text(),
        shifts: $row.find('td:eq(2)').text(),
        user_id: $row.find('td:eq(3)').text(),
       // site: $row.find('td:eq(4)').text(),
        productid: $row.find('td:eq(5)').text(),
        sectionid: $row.find('td:eq(6)').text(),
        product_name: $row.find('td:eq(7)').text(),
        line: $row.find('td:eq(8)').text(),
        section: $row.find('td:eq(9)').text(),
        hour: $row.find('td:eq(10)').text(),
        target: $row.find('td:eq(11)').text(),
        y_date: $row.find('td:eq(12)').text(),
        completes: $row.find('input[name^="achievement_"]').val(),
        remarks: $row.find('select[name^="remark_"]').val(),
        wastes: $row.find('input[name^="waste_"]').val(),
      };
      dataToSend.push(rowData); // Add the current row data to the array
    }
  });
  //alert(JSON.stringify(dataToSend));
  //return;


  
  $.ajax({
    url: `${config.apiUrl}/insertemployeetimesheetfilterdata`,
    type: 'POST',
    headers: customHeaders,
    data: JSON.stringify(dataToSend),
    contentType: 'application/json',
    success: function (response) {
    
      // Redirect to the view page after the AJAX call succeeds
      setServerMessage('Details added successfully');
      setServerMessageClass('alert alert-success');
      setTimeout(() => {
        
        navigate('/admin/employeetimesheet/employeetimesheetlist');
      }, 3000);
    },
    error: function (error) {
      setServerMessage('Failed to add details. Please try again.');
      setServerMessageClass('alert alert-danger');
      console.error('Failed to post data to the API server.');
      // Handle error or display an error message
    },
  });
};




const saveFormData = (formData) => {
    // Replace this with your code to send the form data to your Node.js API
    console.log(formData);
};


const fetchHourOptionsbyshift = (shift) => {
  let hourOptions = [];
  const shiftValue = parseFloat(shift);
  const loopLimit = Math.round(shiftValue);

  for (let i = 1; i <= loopLimit; i++) {
    hourOptions.push({ id: i, label: `HOUR${i}`, value: `HOUR${i}` });
  }
//alert(hourOptions);
  sethourOptions(hourOptions);
}

// Example usage
const fetchLineOptions = (id) => {
  // alert(id);
   const urlline = roleId == 3
   ? `${config.apiUrl}/getLineOptionsoperator/${id}/${userid}`
   : `${config.apiUrl}/getLineOptions/${id}`;
  //  alert(id);
    $.ajax({
      url: urlline,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        setLineOptions(response);
        // alert(response);
     // setFormData({ ...formData, line: '' });
      },
      error: function (xhr, status, error) {
        console.error('Error fetching line options:', error);
      },
    });
  };

  const fetchSectionOptionsop = (line) => {

   //alert(line);

   const urlsection = roleId == 3
   ? `${config.apiUrl}/getSectionOptionsoperator/${userid}/${srrpro}/${line}`
   : `${config.apiUrl}/getSectionOptions`;

   $.ajax({
     url: urlsection,
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

useEffect(() => {

       document.title = 'Today Employee Timesheet';
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
    buttons: ['copy', 'csv', 'excel', 'pdf'],
    data: data, // Use the 'data' state variable here
    // ...rest of your options
  });

     
    }
 

    const fetchShiftOptions = () => {
      const urlshift = roleId == 3
   ? `${config.apiUrl}/getShiftOptionsoperator/${userid}`
   : `${config.apiUrl}/getShiftOptions`;

     $.ajax({
       url: urlshift,
       method: 'GET',
       headers: customHeaders,
       success: function (response) {
         setShiftOptions(response);
         //alert(response);
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
     const urlproduct = roleId == 3
     ? `${config.apiUrl}/getProductOptionsoperator/${userid}`
     : `${config.apiUrl}/getProductOptions`;

     $.ajax({
       url: urlproduct,
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

   fetchHourOptionsbyshift(0);
  }, []);

const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
};

const handleProductChange = (e) => {
  const selectedProduct = e.target.value;

  // Fetch line options based on the selected product
  $.ajax({
    url: `${config.apiUrl}/getLineOptions/${selectedProduct}`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      // setLineOptions(response);
    },
    error: function (xhr, status, error) {
      console.error('Error fetching line options:', error);
    },
  });
};

const [achievementValue, setAchievementValue] = useState('');
const [remarkValue, setRemarkValue] = useState('');
const [wasteValue, setWasteValue] = useState('');

const handleAchievementChange = (index, value) => {
  setAchievementValue(value);
  const rows = document.querySelectorAll(`input[name^="achievement_${index}"]`);
  rows.forEach((row) => {
    row.value = value;
  });
};

const handleReplicateClick = () => {
  const rows = document.querySelectorAll('input[name^="achievement_"]');

  rows.forEach((row) => {
    row.value = achievementValue;
  });
};

const handleReplicate1Click = () => {
 // const remarkRows = document.querySelectorAll('input[name^="remark_"]');
 const remarkRows = document.querySelectorAll(`select[name^="remark_"]`);
  remarkRows.forEach((row) => {
    row.value = remarkValue;
  });
};

const handleReplicate2Click = () => {
  const wasteRows = document.querySelectorAll('input[name^="waste_"]');
  wasteRows.forEach((row) => {
    row.value = wasteValue;
  });
};

const handleRemarkChange = (index, value) => {
  setRemarkValue(value);
//  const rows = document.querySelectorAll(`input[name^="remark_${index}"]`);
const rows = document.querySelectorAll(`select[name^="remark_${index}"]`);
  rows.forEach((row) => {
    row.value = value;
  });
};

const handleWasteChange = (index, value) => {
  setWasteValue(value);
  const rows = document.querySelectorAll(`input[name^="waste_${index}"]`);
  rows.forEach((row) => {
    row.value = value;
  });
};

const [searchValue, setSearchValue] = useState('');


const handleSearch = (event) => {
  setSearchValue(event.target.value);
  //alert(event.target.value);
};



//const messageRef = useRef(null); // Create a reference for the message container
  
/*useEffect(() => {
    // Scroll to the message container when serverMessage changes
    if (serverMessage) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serverMessage]); // Watch for changes in serverMessage state
*/
const filteredData = (data || []).filter((item) => {
  const lowerSearchValue = (searchValue || '').toLowerCase(); // Declare lowerSearchValue within the scope

  return (
      item &&
      (item.name || '').toLowerCase().includes(lowerSearchValue) ||
      (item.entryid || '').toLowerCase().includes(lowerSearchValue) ||
      (item.product || '').toLowerCase().includes(lowerSearchValue) ||
  //    (item.line || '').toLowerCase().includes(lowerSearchValue) ||
      (typeof item.line === 'string' && item.line.includes(searchValue)) ||
      (item.section || '').toLowerCase().includes(lowerSearchValue) ||
      (item.hour || '').toLowerCase().includes(lowerSearchValue) ||
      (item.target || '').toLowerCase().includes(lowerSearchValue)
  );
}) || [];

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
              Add Work Completes 
             
                <hr ></hr>
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                <div className="col-sm-2">
            <span className="textgreen">Shift</span>
          <Select
              options={shiftOptions.map((option) => ({
                value: option.nhrs,
                label: option.name,
              }))}
              value={
                formData.shift
                  ? { value: formData.shift, label: formData.shift_name }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  shift: selectedOption.value,
                  shift_name: selectedOption.label,
              
                });
         
                  fetchHourOptionsbyshift(selectedOption.value);
             
                   
              }}
              isSearchable
              placeholder="Select Shift"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">Product Name </span>
            <Select
              options={productOptions.map((option) => ({
                value: option.id,
                label: option.item_description,
              }))}
              value={
                formData.product_name
                  ? { value: formData.product_name, label: formData.item_description }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  product_name: selectedOption.value,
                  item_description: selectedOption.label,
                });
                fetchLineOptions(selectedOption.value);
                setSrrpro(selectedOption.value);
                   
              }}
              isSearchable
              placeholder="Select Product"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">Line </span>
            <Select
              options={lineOptions.map((option) => ({
                value: option.line,
                label: option.line,
              }))}
              value={
                formData.line_no
                  ? { value: formData.line_no, label: formData.line_no }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  line_no: selectedOption.value,
                
                });
                fetchSectionOptionsop(selectedOption.value);
              }}
              isSearchable
              placeholder="Select Line No"
            />
          </div>
          <div className="col-sm-2">
            <span className="textgreen">Section Name </span>
            <Select
              options={sectionOptions.map((option) => ({
                value: option.id,
                label: option.section_name,
              }))}
              value={
                formData.section
                  ? { value: formData.section, label: formData.section_name }
                  : null
              }
              onChange={(selectedOption) => {
                setFormData({
                  ...formData,
                  section: selectedOption.value,
                  section_name: selectedOption.label,
                });
              }}
              isSearchable
              placeholder="Select Section"
            />
            </div>
                 <div className="col-sm-2">
  <span className="textgreen">{t('Hour')}</span><span className="textred">*</span>
  <Select

    options={hourOptions.map((option) => ({
      value: option.value,
      label: option.value,
    }))}
    value={
      formData.hour
        ? { value: formData.hour, label: formData.hour }
        : null
    }
    onChange={(selectedOption) => {
      setFormData({
        ...formData,
        hour: selectedOption.value,
      
      });
    }}

    placeholder={`${t('Select')} ${t('Hour')}`}
    isSearchable
    required
  />
</div>
                

                  <div className="col-sm-2">
                    <button type="submit" className="btn btn-success btn-md">
                      Get Emp
                    </button>
                  </div>
                </div>
              </form>

                <form onSubmit={handleSubmitnew} method='POST'>
               
                  
                <div>
              {filterDate && (
                <div>
                  <span className='textred'>
                    *{t('You are filtering the data for Date')} : </span><span className="textgreen">{filterDate}</span><span className='textred'> {t('from employee master')}</span>
                </div>
              )}
            </div>

     
            <div>

              <h6 className="header-title"> <span className="textgreen"> {product} -{line} - {section}[{hour}] -{shiftt}HRS </span></h6>

            </div>

            <div>
            {movedempp !== '' && (
  <span><b style={{ color: 'blue' }}>{movedempp}</b>{t('worker is working for another product in')} {hour} {t('Hour')}.</span>
)}

{ent !== '' && (
  <span>
    {t('Workers')} {t('having')} {t('entryid')} <span style={{ color: 'blue' }}>{ent}</span> {t('are absent')}.
  </span> 
)}

{inserted !== 0 && (
   <span>
        {t('You have already inserted data for')} <span className="textgreen">{product}</span> {t('Product')},
        <span className="textred">{line}</span> {t('Line')}, <span className="textgreen" style={{ color: '#E8AB2D' }}>{section}</span> {t('Section')},
        {t('and')} <span className="textgreen" style={{ color: 'blue' }}>{hour}</span> {t('Hour')}.
        {t('For')} {t('editing')}, {t('click on')} <a href="/admin/employeetimesheet/employeetimesheetlist"><span style={{ color: 'red' }}><b>{t('Edit')}</b></span></a>


  </span>
 )}
            </div>
            <div className="message-container">
              {notWorkingEmps && inserted == 0 && (
                <div>
                  {notWorkingEmps}
                </div>
              )}
            </div>
            <div className="message-container">
              {absentEntryIdsMessage && (
                <div className="absent-message">
                  {absentEntryIdsMessage}
                </div>
              )}
            </div>

                    <div className="row space">
              <div className="col-sm-6"> <input className="form-control" id="myInput" type="text" placeholder={`${t('Search')}${t('...')}`} value={searchValue}
                onChange={handleSearch} />
              </div>
              <div className="col-sm-2"><input className="btn btn-primary btn-sm" value={t('Replicate Qty')} id="btn" readonly="" style={{ width: '150px' }} onClick={handleReplicateClick} />
              </div>
              <div className="col-sm-2"><input className="btn btn-primary btn-sm" value={t('Replicate Remark')} id="btnr" readonly="" style={{ width: '150px' }} onClick={handleReplicate1Click} />
              </div>


              <div className="col-sm-2">
                <input className="btn btn-primary btn-sm" value={t('Replicate Waste')} id="btnw" readonly="" style={{ width: '150px' }} onClick={handleReplicate2Click} />
              </div>

            </div>

                    <div className="table-responsive">
                      <table id="tblCustomers" className="table table-striped dt-responsive nowrap tdl bordered table" cellPadding="0" cellSpacing="0" border="1">
                        <thead>
                        <tr style={{ backgroundColor: '#ABDD93' }}>
                      <th>{t('Name')}</th>
                      <th>{t('Entryid')}</th>
                   
                      <th>{t('Product')}</th>
                      <th>{t('Line')}</th>
                      <th>{t('Section')}</th>
                      <th>{t('Hour')}</th>
                      <th>{t('Target')}</th>
                      <th>{t('Achievement')}</th>
                      <th>{t('Remark')}</th>
                      <th>{t('Waste')} [gms]</th>
                      <th><i class="fas fa-cog"></i></th>
                    </tr>
                        </thead>
                        <tbody>
                        {product !== '' ? (
  inserted === 0 && (
    <>
      {filteredData.map((item, index) => (
       item.row1 === 0 && (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td >{item.entryid}</td>
            <td hidden>{item.shift}</td>
            <td hidden>{item.op_id}</td>
            <td hidden>{item.site}</td>
            <td hidden>{item.productid}</td>
            <td hidden>{item.sectionid}</td>
            <td>{item.product}</td>
            <td>{item.line}</td>
            <td>{item.section}</td>
            <td>{item.hour}</td>
            <td>{item.target}</td>
            <td hidden>{item.y_date}</td>
            <td>
              <input
                type="text"
                name={`achievement_${index}`}
                value={item.Achievement}
                className="form-control margin-bottom"
                onChange={(e) => handleAchievementChange(index, e.target.value)}
              />
            </td>
            <td>
              <select
                className="form-control margin-bottom"
                name={`remark_${index}`}
                value={item.Remark}
                onChange={(e) => handleRemarkChange(index, e.target.value)}
              >
                <option value=" "> </option>
                <option value="Corte de Energia">Corte de Energia</option>
                <option value="Pedido de dispensa ">Pedido de dispensa </option>
                <option value="Doenca">Doenca</option>
                <option value="Acidente de trabalho">Acidente de trabalho </option>
                <option value="Falta de material">Falta de material</option>
                <option value="Transferencia para naoproducao"> Transferencia para naoproducao</option>
                <option value="Avaria de Maquina">Avaria de Maquina</option>
                <option value="Mudanca de Plano">Mudanca de Plano</option>
                <option value="Sem ProducaoPlanificada">Sem ProducaoPlanificada</option>
                <option value="Mae de Bebe"> Mae de Bebe</option> 
                <option value="Trabalhador indirecto">Trabalhador indirecto</option> 
                <option value="Produçao do Forno"> Produçao do Forno</option> 
                <option value="Criativiade">Criativiade</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                name={`waste_${index}`}
                value={item.Waste}
                className="form-control margin-bottom"
                onChange={(e) => handleWasteChange(index, e.target.value)}
              />
            </td>
            <td>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteRow(item.id)}
              >
                <i className="fa fa-trash"></i>
              </button>
            </td>
          </tr>
        ) 
      ))}
       
    </>
  )
) : (
  <tr>
    <td colSpan="11"></td>
  </tr>
)}
                        </tbody>
                      </table>
                    </div>

                    <div className="form-group row">

                
<label className="col-sm-11 col-form-label">
      {targetAlert && (
        <span className='textred'>Target showing null or 0. Please ask the admin to add target for this product and section first.</span>
      )}
    </label>
    </div>
    <div className="form-group row">
    <div className="col-sm-11 d-flex justify-content-end">
      </div>
  <div className="col-sm-1 d-flex justify-content-end">
    <input type="submit" id="submit-data" className="btn btn-success margin-top "
      value={t('Save')} data-loading-text="Adding..." disabled={saveDisable}  />

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

export default AddEmployeeTimesheet;
