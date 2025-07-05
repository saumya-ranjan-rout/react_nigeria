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
import '../Loader.css' // Import the CSS file

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
import config from '../../../config';


function EfficiencyOverviewDetailsReport() {
  const { id1, id2 } = useParams();
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const [total_tar, setTargt] = useState('');
  const [total_sum, setSum] = useState('');
  const [total_eff, setEff] = useState('');
  const [date , setDate]= useState('');

  const tableRef = useRef(null);


  //Today date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const today= `${day}-${month}-${year}`;

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
  setLoading(true);
  document.title = "Efficiency Overview Details";
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    navigate("/login");
  } else {
    $.ajax({
     url: `${config.apiUrl}/Nbraid/get_efficiencyOverview_details_data/${id1}/${id2}`,
      method: "GET",
      headers: customHeaders,
      processData: false,
      contentType: "application/json",
      success: function (response) {
        setSum(response.tot_sum);
        setTargt(response.tot_tar);
        setEff(response.tot_eff);
        setDate(response.date);
        try {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }
          // Set the initial table data
           // Initialize the DataTable with the updated data
            tableRef.current = $("#example").DataTable({
              dom: "Bfrtip",
              dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
              buttons: [
                {
                  extend: "copy",
                  filename: `NON-BRAID EMPLOYEETIMESHEET REPORT ${response.date} `,
                },
                {
                  extend: "csv",
                  filename: `NON-BRAID EMPLOYEETIMESHEET REPORT ${response.date} `,
                  footer: true,
                },
                "excel",
                
              ],
              data: response.items, // Update the data option here
              columns: [
                { data: null, render: function (data) {
                  return data.worker + '[' + data.eid + ']';
                }},
                { data: 'prod'},
                { data: 'line'},
                { data: 'sec'},
                { data: 'target'},
                { data: 'h1'},
                { data: 'h2'},
                { data: 'h3'},
                { data: 'h4'},
                { data: 'h5'},
                { data: 'h6'},
                { data: 'h7'},
                { data: 'h8'},
                { data: 'h9'},
                { data: 'h10'},
                { data: 'h11'},
                { data: 'tar'},
                { data: 'sum'},
                { data: 'eff'},
              ],
            });
            setLoading(false);
        } catch (error) {
          console.error("Error handling initial data:", error);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  }
}, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };


  return (
    <>
    {loading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      ) : (
        <div>{/* Render your content */}</div>
      )}
       <div className="content">
      <Row>
          <div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0',  }}>
            {serverMessage && <div className="alert">{serverMessage}</div>}
          </div>
          <Col md="12">
            <Card className="card-user">
              <CardHeader>
               <CardTitle tag="h5"> Efficiency Overview Details
                <hr></hr>
                 Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
    

            <div>
              <h6 className="header-title">
                <span className="textred">
                  {date}
                </span>
              </h6>
            </div>

              <table id="example" className="display">
            <thead>
            <tr>
              <th>Emp Name/Emp Id</th>
              <th>Product<br/>Name</th>
              <th>Line</th>
              <th>Section</th>
              <th>Target</th>
              <th>HR<br/>1</th>
              <th>HR<br/>2</th>
              <th>HR<br/>3</th>
              <th>HR<br/>4</th>
              <th>HR<br/>5</th>
              <th>HR<br/>6</th>
              <th>HR<br/>7</th>
              <th>HR<br/>8</th>
              <th>HR<br/>9</th>
              <th>HR<br/>10</th>
              <th>HR<br/>11</th>
              <th>Total Target</th>
              <th>TOTAL<br/>COMPLETE</th>
              <th>EFFICIENCY</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
            <tfoot style={{border:'1px solid red'}}>
              <tr >
                <th colSpan={16}> </th>
                <th style={{ backgroundColor: 'yellow' }}>{total_tar}</th>
                <th style={{ backgroundColor: 'yellow' }}>{total_sum}</th>
                <th style={{ backgroundColor: 'yellow' }}>{total_eff}</th>
              </tr>
            </tfoot>
            </table>
           
            </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}


export default EfficiencyOverviewDetailsReport;
