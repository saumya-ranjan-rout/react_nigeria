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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import profile from 'views/default.png';
//DB Connection
import config from '../../config';

function CompanySetting() {
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [cdetails, setCdetails] = useState('');
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

  let red = {
    color: 'red',
    fontSize: '12px',
  }
  let error = {
    color: 'red',
    fontSize: '13px',
  }

  const [formData, setFormData] = useState({
    cname: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postbox: '',
    taxid: '',
    foundation: '',
  });

  const [formErrors, setFormErrors] = useState({
    cname: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postbox: '',
    taxid: '',
    foundation: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let errors = {}
    let isValid = true

    if (!formData.cname.trim()) {
      isValid = false
      errors.cname = 'red'
    }
    if (!formData.phone.trim()) {
      isValid = false
      errors.phone = 'red'
    }
    if (!formData.email.trim()) {
      isValid = false
      errors.email = 'red'
    }
    if (!formData.address.trim()) {
      isValid = false
      errors.address = 'red'
    }
    if (!formData.city.trim()) {
      isValid = false
      errors.city = 'red'
    }
    if (!formData.region.trim()) {
      isValid = false
      errors.region = 'red'
    }
    if (!formData.country.trim()) {
      isValid = false
      errors.country = 'red'
    }
    if (!formData.postbox.trim()) {
      isValid = false
      errors.postbox = 'red'
    }
    if (!formData.taxid.trim()) {
      isValid = false
      errors.taxid = 'red'
    }

    if (isValid) {
      const jsonData = JSON.stringify(formData);
      $.ajax({
        url: `${config.apiUrl}/update_company`,
      method: 'POST',
      headers: customHeaders,
        data: jsonData,
        contentType: 'application/json',
        success: function (response) {
          // Success: handle the successful update
        },
        error: function (xhr, status, error) {
          // Error: handle the error case
          //alert('Failed to update language', error);
        }
      });
    } else {
      setFormErrors(errors);
    }
  };

  useEffect(() => {
    document.title = 'Company Settings';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      $.ajax({
        url: `${config.apiUrl}/company`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          const foundationValue = new Date(response.foundation);
          const formattedFoundationDate = `${foundationValue.getDate().toString().padStart(2, '0')}-${(foundationValue.getMonth() + 1).toString().padStart(2, '0')}-${foundationValue.getFullYear()}`;
          setFormData({ ...response, foundation: formattedFoundationDate });
        }
      });
    }
  }, []);

  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (validateFile(file)) {
      setSelectedFile(file)
    } else {
      alert('Invalid file format')
    }
  }

  if (selectedFile) {
    const formData = new FormData()
    formData.append('file', selectedFile)

    fetch(`${config.apiUrl}/company_profile`, {
    method: 'POST',
    headers: customHeaders,
    body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert('File uploaded:', data)
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error uploading file:', error)
      })
  }

  const validateFile = (file) => {
    const allowedFormats = ['jpg', 'jpeg', 'png']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    return allowedFormats.includes(fileExtension)
  }

  let imgdiv
  if (!selectedFile) {
    imgdiv = (
      <div>
         <img src={profile} alt="My Image" style={{ height: '300px', width: '100%' }} />
      </div>
    )
  } else {
    imgdiv = ''
  }

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
                <CardTitle tag="h5">Edit Company Details </CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} method='POST' >
                  <div className="row" >
                    <div className="col-md-7">
                      <div className="form-group row">

                               <label className="col-sm-2 col-form-label"
                                       for="name"><span className='textblack'>Company Name</span></label>

                                <div className="col-sm-10">
                                    <input type="text"  style={{ borderColor: formErrors.postbox === 'red' ? 'red' : '' }}
                                           className="form-control margin-bottom  required" name="cname"
                                          value={formData.cname} onChange={handleInputChange}/>
                                </div>
                            </div>


                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="address"><span className='textblack'> Address</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="address"  style={{ borderColor: formErrors.postbox === 'red' ? 'red' : '' }}
                                           className="form-control margin-bottom  required" name="address"
                                           value={formData.address} onChange={handleInputChange}/>
                                </div>
                            </div>
                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="city"><span className='textblack'>City</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="city"
                                           className="form-control margin-bottom  required" name="city"
                                           value={formData.city} onChange={handleInputChange}/>
                                </div>
                            </div>
                            <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="city"><span className='textblack'>Region</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="city"
                                           className="form-control margin-bottom  required" name="region"
                                          value={formData.region} onChange={handleInputChange}/>
                                </div>
                            </div>
                             <div className="form-group row">

                                <label className="col-sm-2 col-form-label"
                                       for="country"><span className='textblack'>Country</span></label>

                                <div className="col-sm-10">
                                    <input type="text" placeholder="Country"
                                           className="form-control margin-bottom  required" name="country"
                                            value={formData.country} onChange={handleInputChange}/>
                                </div>
                            </div>

                           
                            <div className="form-group row">


                                <div className="col-sm-12"><label className=" col-form-label"
                                                              for="data_share"><span className='textblack'>Product Data Sharing with Other
                                        Locations</span></label><select name="data_share" className="form-control">

                                        <option value="1">** Yes **</option>                                        <option value="1">Yes</option>
                                        <option value="0">No</option>


                                    </select>

                                </div>
                            </div>

                                 

                            <br></br>
                           <div className="form-group row">

                                <label className="col-sm-2 col-form-label"></label>

                                <div className="col-sm-4 mt-4">
                                    <input type="submit" id="company_update" className="btn btn-success margin-bottom"
                                           value="Update Company"
                                           data-loading-text="Updating..." />
                                </div>
                            </div>
                    </div>
                    <div className="col-md-5">
                      <form method="post" id="product_action" className="form-horizontal">
                        <div className="grid_3 grid_4">
                          <h5>Company Logo</h5>
                          <hr></hr>
                          <input type="hidden" name="id" value="1"/>
                          <div className="ibox-content no-padding border-left-right">
                            {selectedFile && (
                              <div>
                                {selectedFile.type.includes('image') ? (
                                  <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Uploaded"
                                    style={{ height: '250px', width: '100%' }}
                                  />
                                ) : (
                                  <p>Preview not available for this file type.</p>
                                )}
                              </div>
                            )}
                            {imgdiv}
                          </div>
                          <hr></hr>
                          <p>
                            <label for="fileupload"></label>
                            <input
                              type="file"
                              accept=".jpg, .jpeg, .png"
                              onChange={handleFileUpload}
                              size="sm"
                              id="formFileSm"
                            />
                          </p>
                          <pre>Recommended logo size is 500x200px.</pre>
                          <div id="progress" className="progress progress-sm mt-1 mb-0">
                            <div className="progress-bar bg-success" role="progressbar" 
                                 aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                        </div>
                      </form>
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

export default CompanySetting;
