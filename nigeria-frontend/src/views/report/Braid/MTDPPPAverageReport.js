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
import Select from 'react-select';
//DB Connection
import config from '../../../config';

function MTDPPPAverageReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  const [category, setCategory] = useState([]);
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [monthsArray, setMonthsArray] = useState([]);
  const currentDate = new Date();
  const monthYearString = `${currentDate.toLocaleDateString("en-US", { month: "long" })}`;
  

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

  const [formData, setFormData] = useState({
    category: "",
    start_month: "",
    start_year: "",
    end_month: "",
    end_year: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "start_year") {
      setFormData({ ...formData, start_year: value });
    } else if (name === "end_year") {
      setFormData({ ...formData, end_year: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    const updatedFormData = {
      ...formData,
    };
  
    const jsonData = JSON.stringify(updatedFormData);
   
    const monthsArrayy=[];
    $.ajax({
      url: `${config.apiUrl}/braid/getMtdPppAverageSearch`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
     
        setFDate(response.data.fdtt);
        setTDate(response.data.edtt);
       const startDate = new Date(response.data.fdt);
        const endDate = new Date(response.data.edt);
       
  

        const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        console.log('Start Date:', formattedStartDate);
        console.log('End Date:', formattedEndDate);

        // Calculate the difference in months between startDate and endDate
        const monthDifference = (endDate.getMonth() - startDate.getMonth()) + (12 * (endDate.getFullYear() - startDate.getFullYear()));

        for (let i = 0; i <= monthDifference; i++) {
          const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
          monthsArrayy.push(monthName);
        }

       
       const dataTable = $.fn.DataTable.isDataTable('#example') ? $('#example').DataTable() : null;
        // If the DataTable exists, hide the specific <th> with ID "achv-eff-th"
        if (dataTable) {

          // Clear and destroy the DataTable
          dataTable.clear().destroy();
        }

        setMonthsArray(monthsArrayy);
      // Initialize DataTable with the fetched data
      if ($.fn.DataTable.isDataTable("#example")) {
        $("#example").DataTable().destroy();
      }


      //----------------------------//
      setTimeout(() => {
      tableRef.current = $('#example').DataTable({
        autoWidth: false,
        dom: 'Bfrtip',
        dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ["copy", "csv", "excel"],
        data: response.data.items, // Update the data option here
        columns: [
        { data: "category" },
        { data: "item" },
        // Generate columns for each month's average
        ...monthsArrayy.map((avg, index) => ({
          data: `monthlyAverages.${index}`, // Access monthlyAverages by index
          render: function (data, type, row) {
            if (type === 'display') {
               if (data === 0 || data === '0.00') {
                return '-';
              } else if (data) {
                return `<span class="textgreen">${data}</span>`;
              }
            }
            return data ? data : "";
          },
        })),
        ],

      });
    }, 100); // Adjust the delay time as needed
      setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

 

  useEffect(() => {
    //setLoading(true)
    document.title = "MTD PPP";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      $.ajax({
        url: `${config.apiUrl}/braid/getMtdPppAverageDefaultData`,
        method: "GET",
        headers: customHeaders,
        processData: false,
        contentType: "application/json",
        success: function (response) {
          if ($.fn.DataTable.isDataTable("#example")) {
            $("#example").DataTable().destroy();
          }

          tableRef.current = $("#example").DataTable({
            dom: "Bfrtip",
            dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
            buttons: ["copy", "csv", "excel"],
            data: response,
            columns: [
              { data: "category" },
              { data: "item" },
              //{ data: "avg" },
              {
                data: "avg",
                render: function (data, type, row) {
                  if (type === 'display') {
                    if (data === 0 || data === '0.00') {
                      return '-';
                    } else if (data) {
                      return `<span class="textgreen">${data}</span>`;
                    }
                  }
                  return data ? data : "";
                },
              },
            ],
          });
          //setLoading(false)
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });

      const fetchCategory = () => {
        $.ajax({
          url: `${config.apiUrl}/braid/getCategoryOptions`,
          method: "GET",
          headers: customHeaders,
          success: function (response) {
            setCategory(response);
          },
          error: function (xhr, status, error) {
            console.error("Error fetching shift options:", error);
          },
        });
      };

      fetchCategory();
    }
  }, []);

  const handleLogout = () => {
        

        // Clear the session
        sessionStorage.removeItem('isLoggedIn');

        // Redirect to the login page
        navigate('/login');
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
               <CardTitle tag="h5"> MTD PPP AVERAGE
                <hr></hr>
                Month Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
          
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-2">
                  <span className="textgreen">Category</span>
                  <select
                    id="category"
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {category.map((data) => (
                      <option key={data.id} value={data.id}>
                        {data.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-2">
                  <span className="textgreen">Start Month</span>
                  <select
                    id="start_month"
                    className="form-control"
                    name="start_month"
                    value={formData.start_month}
                    onChange={handleInputChange}
                  >
                    <option value="">select</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen"> Year</span>
                  <select
                    name="start_year"
                    id="syear"
                    className="form-control"
                    value={formData.start_year}
                    onChange={handleInputChange}
                  >
                    <option value=''>Select</option>
                    <option value={currentYear}>{currentYear}</option>
                    <option value={lastYear}>{lastYear}</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen"> End Month</span>
                  <select
                    id="end_month"
                    className="form-control"
                    name="end_month"
                    value={formData.end_month}
                    onChange={handleInputChange}
                  >
                    <option value="">select</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <span className="textgreen"> Year</span>
                  <select
                    name="end_year"
                    id="end_year"
                    className="form-control"
                    value={formData.end_year}
                    onChange={handleInputChange}
                  >
                    <option value=''>Select</option>
                    <option value={currentYear}>{currentYear}</option>
                    <option value={lastYear}>{lastYear}</option>
                  </select>
                </div>

                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>
            <div>
              <h6 className="header-title">
                <span className="textred">
                [{fdate}]-[{tdate}]
                </span>
              </h6>
            </div>
            <div className="table-responsive">
              <table id="example" className="display" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>CATEGORY NAME</th>
                    <th>ITEM NAME</th>
                    {/* Render headers for months */}
                    {monthsArray && monthsArray.length > 0 ? (
                      monthsArray.map((monthName, index) => (
                        <th key={index}>{monthName}</th>
                      ))
                    ) : (
                      // Handle the case where monthsArray is empty or null
                      <th>{monthYearString}</th>
                    )}
                  </tr>
                </thead>
              </table>
            </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default MTDPPPAverageReport;
