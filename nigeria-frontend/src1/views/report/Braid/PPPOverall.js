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

function PPPOverall() {
    const [loading, setLoading] = useState(false);
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [itemCategories, setItemCategories] = useState([]);
    const [shiftOptions, setShiftOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const tableRef = useRef(null);
    const today = new Date(); // Get the current date
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    // Add one day to oneMonthAgo
    //oneMonthAgo.setDate(oneMonthAgo.getDate() + 1);

    const [startDate, setStartDate] = useState(oneMonthAgo);
    const [endDate, setEndDate] = useState(today);
   
    const [fdate, setFDate] = useState('');
    const [tdate, setTDate] = useState('');
  

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
  

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
 const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);

   const [formData, setFormData] = useState({
       fromdate: '',
       todate: '',
       zone: '',
       shift: '',
       machine1: '',
    });

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      if (name === 'fromdate') {
      setStartDate(new Date(value));
    } else if (name === 'todate') {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
    
    // Define an array to store the 'tw' values
          let twValues = []; 
           let tfgValues = []; 

    const generateDateColumns = (startDate, endDate) => {
        const dateColumns = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const formattedDate = currentDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).replace(/\//g, '-');
          dateColumns.push({ data: formattedDate, title: formattedDate });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateColumns;
      };


      // Modify the sendToAnotherRequest function to return a Promise
      function sendToAnotherRequest(dateColumns, responseData) {
        setLoading(true)
        return new Promise((resolve, reject) => {
          const otherJsonData = JSON.stringify({ dateColumns, responseData });

          $.ajax({
            url: `${config.apiUrl}/getpppvalue`,
            method: 'POST',
            headers: customHeaders,
            data: otherJsonData,
            processData: false,
            contentType: 'application/json',
            success: function (response) {
              const { data } = response;

              // Resolve the Promise with the response data
              resolve(data);
              setLoading(false)
            },
            error: function (xhr, status, error) {
              console.error('Error:', error);

              // Reject the Promise with the error
              reject(error);
            },
          });
        });
      }

// In your handleSubmit function, use the Promise
const handleSubmit = (event) => {
  setLoading(true);
  event.preventDefault();
  const updatedFormData = { ...formData, fromdate: startDate, todate: endDate };

  const jsonData = JSON.stringify(updatedFormData);

  $.ajax({
    url: `${config.apiUrl}/ppp_overall_daterangeview`,
    method: "POST",
    headers: customHeaders,
    data: jsonData,
    processData: false,
    contentType: 'application/json',
    success: function (response) {
      const { items, from, to } = response;
    
      setFDate(from);
      setTDate(to);

      const newDateColumns = generateDateColumns(startDate, endDate);
      

      // Use the Promise to get the response from sendToAnotherRequest
      sendToAnotherRequest(newDateColumns, response)
      .then((receivedData) => {
    //alert(JSON.stringify(receivedData));
    // Now you can use receivedData here to create the DataTable
    if ($.fn.DataTable.isDataTable('#example')) {
      $('#example').DataTable().destroy();
    }

    // Assuming receivedData is your original data
    const formattedData = receivedData[0].item_data.map((item) => ({
      date: item.date,
      pw: parseFloat(item.pw).toFixed(2), // Format 'pw' to two decimal places
    }));

    tableRef.current = $('#example').DataTable({
      dom: 'Bfrtip',
       dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
      buttons: ['copy', 'csv'],
      data: formattedData, // Use the received data here
      columns: [
        { data: 'date', title: 'Date' },
        { data: 'pw', title: 'PPP' }, // Use 'pw' data for the 'PPP' column
      ],
    });
  })
  
  .catch((error) => {
    console.error('Error:', error);
  });

  setLoading(false);
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    },
  });
};


      useEffect(() => {

         document.title = 'Productive Breakdown';
      // Check if the user is logged in
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        // Redirect to the login page if not logged in
        navigate('/login');
      } else {


      $.ajax({
         url: `${config.apiUrl}/getdefault_ppp_overall`,
        method: 'GET',
        headers: customHeaders,
        processData: false,
        contentType: 'application/json',
        success: function (response) {
        const { items, from, to } = response;
        setFDate(from);
        setTDate(to);
  
        const newDateColumns = generateDateColumns(today, today);

  
        // Use the Promise to get the response from sendToAnotherRequest
        sendToAnotherRequest(newDateColumns, response)
        .then((receivedData) => {
      //alert(JSON.stringify(receivedData));
      // Now you can use receivedData here to create the DataTable
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }
  
      // Assuming receivedData is your original data
      const formattedData = receivedData[0].item_data.map((item) => ({
        date: item.date,
        pw: parseFloat(item.pw).toFixed(2), // Format 'pw' to two decimal places
      }));
  
      tableRef.current = $('#example').DataTable({
        dom: 'Bfrtip',
         dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
        buttons: ['copy', 'csv'],
        data: formattedData, // Use the received data here
        columns: [
          { data: 'date', title: 'Date' },
          { data: 'pw', title: 'PPP' }, // Use 'pw' data for the 'PPP' column
        ],
      });
    })
          },
          error: function (xhr, status, error) {
            console.error('Error:', error);
          },
        });

       
      }
   

     
      
    }, []);

    const handleLogout = () => {
      // Perform any necessary logout actions here
      // For example, clearing session storage, removing tokens, etc.

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
               <CardTitle tag="h5"> PPP Overall
                <hr></hr>
                Date Range
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
             
              <form onSubmit={handleSubmit} method='POST'>
                <div className="row space">
                  <div className="col-sm-3">
                    <span className="textgreen">Start Date</span>
                  <DatePicker
                  className="form-control margin-bottom"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select Start Date"
                  name="fromdate"
                />
                  </div>
                  <div className="col-sm-3">
                    <span className="textgreen">To Date</span>
                   <DatePicker
                    className="form-control margin-bottom"
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                  </div>

                  
                  <div className="col-sm-4">
                    <button
                      type="submit"
                      className="btn btn-success btn-md"
                    >
                      View
                    </button>
                  </div>
                  
                </div>
               
              </form>

              
             {/* Display Input Field Values */}
             
              <br/>
              <div>
                <h6 className="header-title" style={{ textAlign: 'center' }}>
                  <span style={{ color: 'red' }}>
                    {fdate !== tdate
                      ? (
                        <>
                          <span style={{ color: 'black' }}> FROM </span>
                           [{fdate}] 
                          <span style={{ color: 'black' }}> TO </span> 
                          [{tdate}]
                        </>
                      ) :
                      <>
                   <span style={{ color: 'black' }}>  Today </span> <span style={{ color: 'red' }}>[{formatDate(today)}]</span>
                  </>
                   }
                  </span>
            
                </h6>
              </div>
             
              <div className="table-responsive">
             

                <table id="example" className="display">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>PPP</th>
                      
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

  export default PPPOverall;
