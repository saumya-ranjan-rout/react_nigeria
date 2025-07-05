import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import maintenanceImage from './maintenance.svg';

function SorryComponent() {
  const navigate = useNavigate(); // Initialize useNavigate hook  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

return (
        <div className="authentication-bg mt-5 mb-5">
            <div className="container ">
                <div className="row justify-content-center mt-5">
                    <div className="col-12 mt-5">
                        <div className="text-center mt-5">
                            <img alt="error-image" width="200" src={maintenanceImage} />
                            <h3 className="mt-4">There is a problem connecting with the attendance database. Please ensure the attendance server is up and running.</h3>
                            <p className="text-muted">
                                <Link to="/admin/dashboard" className="link-button link-back-button">Go to Home Page</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SorryComponent;
