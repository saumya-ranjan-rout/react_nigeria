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


function PlanVsTargetImport() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
   const [itemCategories, setItemCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
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
    document.title = 'Import Target Vs Plan';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      
    }
  }, []);

  const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  }; 


  const handleSubmit = (event) => {
  event.preventDefault();

  if (!selectedFile) {
    return;
  }

  const formData = new FormData();
  formData.append('userfile', selectedFile);

  $.ajax({
      url: `${config.apiUrl}/uploadplanvstarget`,
      method: 'POST',
      headers: customHeaders,
      data: formData,
      contentType: false,
      processData: false,
      xhr: function () {
        const xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
          }
        });
        return xhr;
      },
      success: function (response) {
        console.log(response); // File uploaded and data inserted
        setImportStatus('Data Imported Successfully!');
      },
      error: function (error) {
        console.error(error);
        setImportStatus('Import Error! Please check your file and its content.');
      },
    });
  };


  /*const baseUrl = 'http://192.168.29.60:3000'; // Replace with your base URL
  const templatePath = '/importfiles/Color-Master.csv';
  const templateURL = baseUrl + templatePath;*/

  const templateURL = process.env.PUBLIC_URL + '/importfiles/Item-Master.csv';

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
              Import Target VS Plan
              <hr class="mb-2"></hr>
              <div className="centered-container">
                 
               
                <p>
                 <span style={{ color: 'red' }}>
                  *</span> Your Plan Vs Target data file should as per this template{' '}
                  <a href={templateURL} download>
                    <strong>Download Template</strong>
                  </a>
                </p>
              </div>
             <br></br>
              <form onSubmit={handleSubmit} method='POST' encType="multipart/form-data" >
                  <div>

                    <div className="form-group row">

                                <label className="col-sm-2 col-form-label" for="name">File
                                </label>

                                <div class="col-sm-6">
                                    <input type="file" name="userfile" onChange={handleInputChange} />(.csv format only)
                                </div>
                    </div>
                      
                    <div className="form-group row">

                        <label className="col-sm-2 col-form-label"></label>

                        <div className="col-sm-4">
                            <input type="submit" id="submit-data" className="btn btn-success margin-top"
                                  value="Import Target Plan" data-loading-text="Adding..." />
                           
                        </div>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {`${uploadProgress}%`}
                      </div>
                    </div>
                  )}

                  {uploadProgress === 100 && importStatus && (
                    <div>
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-success"
                          role="progressbar"
                          style={{ width: '100%' }}
                          aria-valuenow="100"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          100%
                        </div>
                      </div>
                      <span className="text-success">{importStatus}</span>
                    </div>
                  )}
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

export default PlanVsTargetImport;
