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

function AddNewSOP() {

  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  
  const tableRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

  useEffect(() => {
    document.title = 'Add SOP';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
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
  }, []);

  const [formData, setFormData] = useState({
    file_type: '',
    title: '',
    embed_code: '',
    pdf_file: null,
    image_file: null,
  });

const handleInputChange = (event) => {
  const { name, value, files } = event.target;
  if (name === "pdf_file" || name === "image_file") {
    // If it's a file input, get the first file from the files array
    setFormData({ ...formData, [name]: files[0] });
  } else {
    // For other input types, directly set the value
    setFormData({ ...formData, [name]: value });
  }
};



const handleSubmit = (event) => {
  event.preventDefault();
  if (formData.file_type !== 'PPT') {
     //alert(JSON.stringify(formData));
     // Code to execute if file_type is not PPT
    const formDataToSend = new FormData();
    formDataToSend.append('file_type', formData.file_type);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('embed_code', formData.embed_code);
    formDataToSend.append('pdf_file', formData.pdf_file);
    formDataToSend.append('image_file', formData.image_file);

    $.ajax({
      url: `${config.apiUrl}/adddocument`,
      method: 'POST',
      headers: customHeaders,
      processData: false, // Important to prevent jQuery from processing the formData
      contentType: false, // Important to prevent jQuery from setting content type
      data: formDataToSend,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'Document already exists' ? 'alert alert-warning' : 'alert alert-success');
        
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
  } else {
    // Code to execute if file_type is not PPT
    $.ajax({
      url: `${config.apiUrl}/addsop`,
      method: 'POST',
      headers: customHeaders,
      data: formData,
      success: function (response) {
        console.log(response);
        setServerMessage(response.message); // Set the server message in state
        setServerMessageClass(response.message === 'SOP already exists' ? 'alert alert-warning' : 'alert alert-success');
        
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
  }
};


  return (
    <>
      <div className="content">
        <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0' }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">Add SOP</CardTitle>
                <hr></hr>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} method='POST'>
                  <div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label" htmlFor="file_type">
                        File Type<span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="col-sm-6">
                        <select className="form-control" name="file_type" value={formData.file_type} onChange={handleInputChange}>
                          <option value="">Select file type</option>
                          <option value="PPT">PPT</option>
                          <option value="PDF">PDF</option>
                          <option value="IMAGE">Image</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label" htmlFor="title">
                        Title<span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          placeholder="Title"
                          className="form-control margin-bottom required"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    {formData.file_type === 'PPT' && (
                      <div className="form-group row">
                        <label className="col-sm-2 col-form-label" htmlFor="embed_code">
                          Embedded Code<span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="col-sm-6">
                          <input
                            type="text"
                            placeholder="Embed Code"
                            className="form-control margin-bottom required"
                            name="embed_code"
                            value={formData.embed_code}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    )}
                    {formData.file_type === 'PDF' && (
                      <div className="form-group row">
                        <label className="col-sm-2 col-form-label" htmlFor="pdf_file">
                          Upload PDF<span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="col-sm-6">
                          <input
                            type="file"
                            className="form-control margin-bottom required"
                            name="pdf_file"
                            onChange={handleInputChange}
                            accept=".pdf"
                            required
                          />
                          <small>*Accepted file types: .pdf</small>
                        </div>
                      </div>
                    )}
                    {formData.file_type === 'IMAGE' && (
                      <div className="form-group row">
                        <label className="col-sm-2 col-form-label" htmlFor="image_file">
                          Upload Image<span style={{ color: "red" }}>*</span>
                        </label>
                        <div className="col-sm-6">
                          <input
                            type="file"
                            className="form-control margin-bottom required"
                            name="image_file"
                            onChange={handleInputChange}
                            accept=".jpg, .jpeg, .png"
                            required
                          />
                          <small>*Accepted file types: .jpg, .jpeg, .png</small>
                        </div>
                      </div>
                    )}
                    
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label"></label>
                      <div className="col-sm-4">
                        <input
                          type="submit"
                          id="submit-data"
                          className="btn btn-success margin-bottom"
                          value="Upload"
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

export default AddNewSOP;
