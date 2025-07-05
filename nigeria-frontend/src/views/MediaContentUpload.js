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
import axios from 'axios';
import config from '../config';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';


function ImportTimesheet() {

    const { t } = useTranslation(); 
    const [file, setFile] = useState(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const language = localStorage.getItem('language');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

     const handleFileChange = (e) => {
        const filee = e.target.files[0];
      //  alert(`File name: ${filee.name}\nFile size: ${filee.size} bytes`);
        setFile(filee);
      };

      const handleUpload = async (event) => {
        event.preventDefault();
      if (file) {
        const formData = new FormData();
        formData.append('video', file); // Use 'video' as the key
    
        try {
          const response = await axios.post(`${config.apiUrl}/upload_video`, formData, {
            headers: customHeaders,
            contentType: 'multipart/form-data',
          });
          alert(response.data.message);
          console.log(response.data.message);
        } catch (error) {
          alert(error);
          console.error('Error uploading file:', error);
        }
      } else {
        console.error('No file selected');
      }
    };
  
  


   useEffect(() => {
    document.title = 'Video Upload';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
        setLanguage(language);
    }
  }, []);

  const setLanguage = async (language) => {
    try {
        await i18n.changeLanguage(language);
        console.log(`Language changed to ${language}`);
    } catch (error) {
        console.error(`Error changing language: ${error.message}`);
    }
};

  const handleLogout = () => {
    

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
              <h5> 
              {t('Upload New image or video')}</h5>
              <hr class="mb-2"></hr>
              <p>
              <label for="fileupload"></label>
              <div>
              <form onSubmit={(e) => handleUpload(e)} encType="multipart/form-data">
        <input type="file" name="image" onChange={handleFileChange} accept=".gif, .jpeg, .png, .3gp, .mov, .mpeg, .mp3, .avi, .mp4" required /><br></br>
        <button type="submit" className="btn btn-success margin-bottom"> {t('Upload')}</button>
      </form>

                        </div>
                      </p>
                      <pre>{t('To allow')}:gif,jpeg,png,3gp,mov,mpeg,mp3,avi,mp4</pre>
                      <div id="progress" className="progress progress-sm mt-1 mb-0">
                        <div className="progress-bar bg-success" role="progressbar"
                          aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
               
                
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ImportTimesheet;
