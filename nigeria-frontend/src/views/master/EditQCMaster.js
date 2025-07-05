import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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


function EditQCMaster() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  
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

const { id } = useParams();
console.log(id);

  const [formData, setFormData] = useState({
    name: '',
   
  });

  

  useEffect(() => {
    document.title = 'Edit Color';
    
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
     navigate('/login');
    } else {
     
     
      if (id) {
        console.log('ID:', id);
        fetch(`${config.apiUrl}/editqc/${id}`,{headers: customHeaders})
          .then(response => response.json())
          .then(response => {
            const { name, value } = response;
            setFormData({
            name,
            value: parseFloat(value).toFixed(2), // Parse the value as a float
          });
          })
          .catch(error => {
            console.log(error);
          });
      }

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, [navigate, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
  
    const updatedData = {
      id: id,
      name: formData.name,
      value: formData.value,
      
     
    };
  
    $.ajax({
     url: `${config.apiUrl}/updateqc`,
      method: 'POST',
      headers: customHeaders,
      data: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
      },
      success: function (response) {
        console.log('Updated data:', response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'QC already exists' ? 'alert alert-warning' : 'alert alert-success');
        // Navigate back to the previous page
        // Wait for 2 seconds before navigating back
        setTimeout(() => {
           navigate(-1);
        }, 3000); // Adjust the delay time as needed
      },
      error: function (xhr, status, error) {
        console.log(error);
        setServerMessage('Color already exists'); // Set the server message in state for other errors
        setServerMessageClass('alert alert-danger');
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
                <CardTitle tag="h5">Edit QC</CardTitle>
                 <hr></hr>
              </CardHeader>
              <CardBody>
               <form onSubmit={handleSubmit} method='POST' >
                  <div>
                   <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="QC_name"><span className='textblack'>Name</span> <span className="textred" >*</span></label>
                <div class="col-sm-6">
                        <input type="text" 
                               class="form-control margin-bottom" name="name" id="name" value={formData.name} readOnly onChange={handleInputChange} required  />
                    </div>
              </div>

              <div className="form-group row space">
              <label class="col-sm-2 col-form-label"
                           for="QC_name"><span className='textblack'>Value</span> <span className="textred" >*</span></label>
                <div class="col-sm-6">
                        <input type="text" 
                               class="form-control margin-bottom  " name="value" id="value" value={formData.value}  onChange={handleInputChange} required />
                    </div>
              </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label"></label>
                      <div className="col-sm-4">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Update"
                          data-loading-text="Updating..."
                        />
                       
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

export default EditQCMaster;
