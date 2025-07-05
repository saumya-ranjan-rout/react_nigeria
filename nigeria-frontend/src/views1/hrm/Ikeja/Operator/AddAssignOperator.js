import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import '../../Loader.css' // Import the CSS file

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
import config from '../../../../config';

function AddAssignOperator() {
  const { id } = useParams()
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [OpUserName, setOpUser] = useState('') 
  const [zone, setZone] = useState([]) 
  const [machines, setMachines] = useState([])
  const [subcat, setSubcat] = useState('');
  const [userId ,setUserid] = useState('');
  const [items ,setItems] = useState([]);
  const [serverMessage, setServerMessage] = useState('');
    const [serverMessageClass, setServerMessageClass] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
    
    const roleId = sessionStorage.getItem('roleid');
    const userid = sessionStorage.getItem('id');
    const token = sessionStorage.getItem('token');
    const customHeaders = {
        'Authorization': `${token}` // Include the token in the header
    };
    // alert(token);


    useEffect(() => {

       document.title = 'Add Assign Operator';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      const fetchUserName = () => {
        $.ajax({
          url: `${config.apiUrl}/ikeja/operator_data_single/${id}`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setOpUser(response);
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
  
      fetchUserName();
      //zone data get
      const fetchZone = () => {
        $.ajax({
          url: `${config.apiUrl}/ikeja/getzone`,
          method: 'GET',
          headers: customHeaders,
          success: function (response) {
            setZone(response);
           
          },
          error: function (xhr, status, error) {
            console.error('Error fetching operator name:', error);
          },
        });
      };
  
      fetchZone();
      //user id
     // Assuming OpUserName is defined and has a valid entryid


     
    }
  }, []);
 //get user id
  useEffect(() => {
    if (OpUserName && OpUserName.entryid) {
      $.ajax({
        url: `${config.apiUrl}/ikeja/getuserid/${OpUserName.entryid}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setUserid(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [OpUserName]);
  //get items
  useEffect(() => {
    if (userId && userId.id) {
      $.ajax({
        url: `${config.apiUrl}/ikeja/getItems/${userId.id}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setItems(response);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching operator name:', error);
        },
      });
    } else {
      console.error('OpUserName or entryid is undefined.');
    }
  }, [userId]);

  //Get changezone wise machine data
  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;
    $.ajax({
      url: `${config.apiUrl}/ikeja/getMachines/${selectedZone}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        const machinesSplit = response.split(',');
        setMachines(machinesSplit);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching line options:', error);
      },
    });
  };

  //Get Machine change 
  const handleMachineChange = (val) => {
    const data = val.target.value;
   
    if (subcat === '') {
      setSubcat(data + ',');
    } else {
      const ret = subcat.split(',');
      let d = '';
      let found = false;
      for (let i = 0; i < ret.length; i++) {
        if (ret[i] === data) {
          found = true;
          break;
        }
      }
      if (found) {
        d = subcat;
      } else {
        d = subcat + data + ',';
      }
      setSubcat(d);
    }
  };


 //submit assign data
 const [formData, setFormData] = useState({
  zone: '',
  machine:'',
  id:'',
  machiness:'',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const insertFormdata = { ...formData, id: userId.id,machiness: subcat};
  const jsonData = JSON.stringify(insertFormdata);
  $.ajax({
    url: `${config.apiUrl}/ikeja/add_zone`,
    method: 'POST',
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response){
         alert(response.message);
         window.location.reload();
        },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
}


  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      $.ajax({
        url: `${config.apiUrl}/ikeja/item_zone_delete/${id}`,
        method: 'DELETE',
        headers: customHeaders,
        success: function (response) {
          alert(response);
          window.location.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting', error);
        },
      });
    }
  };
  let btnStyle = {
    color: 'white',
    fontSize: '10px',
    padding: '3px',
  }

   const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
   navigate('/login');
  };

  return (


     <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Assign Zone & Machine For  <span style={{color:'red'}}>{OpUserName.name}</span></CardTitle>
              <hr></hr>
              </CardHeader>
              <CardBody>

    
            <form  onSubmit={handleSubmit} method='POST'>
              <div className="row space mb-4">
              <div className="col-sm-2">
              
                     <span className="Password">Zone</span>
                     <select className="form-control"  name="zone" value={formData.zone} onChange={(e) => {
                      handleInputChange(e);
                      handleZoneChange(e);
                    }}>
                       <option value="">Choose</option>
                       {zone.map((data, index) => (
                          <option key={index} value={data.zone}>
                            {data.zone}
                          </option>
                        ))}
                        </select>
                     {/* {formErrors.zone && <span style={error}>{formErrors.zone}</span>} */}
                </div>
                <div className='col-sm-2'>
                  <span className="Password">Machine</span>
                  <select className="form-control"  name="machine" value={formData.machine} onChange={(e) => {
                      handleInputChange(e);
                      handleMachineChange(e);
                    }}>
                    <option value="">Select Machine</option>
                    {machines.map((machine, index) => (
                      <option key={index} value={machine}>
                        {machine}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div className='col-sm-6'>
                    <span className="Password">Change Machines</span>
                    <textarea className="form-control" value={subcat}  name="machiness" onChange={handleInputChange} readOnly>{subcat}</textarea>
                    {/* {formErrors.machiness && <span style={error}>{formErrors.machiness}</span>} */}
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
            </form>

            
            {/* Display Input Field Values */}
            <p style={{color:'blue'}}>If you want to change the machine field of any particular ZONE what you have already inserted,Then change it in that same above form.The machine field will change</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Zone</th>
                    <th>Machines</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                {items.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.zone}</td>
                      <td>{row.machine}</td>
                      <td>
                        <button className="btn btn-danger" style={btnStyle} onClick={() => handleDelete(row.id)}>
                          <i class="fa fa-trash" aria-hidden="true"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
               <tfoot>
                  <tr>
                    <th>#</th>
                    <th>ZONE</th>
                    <th>MACHINES</th>
                    <th>ACTION</th>
                  </tr>
                </tfoot>
              </table>
            </div>


           </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    
  );
}

export default AddAssignOperator;
