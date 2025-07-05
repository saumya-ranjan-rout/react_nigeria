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
import { saveAs } from 'file-saver';

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

function ProductionDashboardReport() {
  const [loading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
 
  const [data, setData] = useState([]);

  const [fdate, setFDate] = useState("");
  const [tdate, setTDate] = useState("");
  const [period, setMonthsArray] = useState([new Date()]);
  console.log(period,"---")
  const [items , setItems] = useState([]);
  const [count ,setRows] = useState([]);

  //Today date format
  const currentDate = new Date();
  const todaydate = currentDate.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
   
 
  const tDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).split('/').reverse().join('-');
  
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
    fromdate: "",
    todate: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "fromdate") {
      setStartDate(new Date(value));
    } else if (name === "todate") {
      setEndDate(new Date(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    setLoading(true)
    event.preventDefault();
    const updatedFormData = {
      ...formData,
      fromdate: startDate,
      todate: endDate,
    };

    const jsonData = JSON.stringify(updatedFormData);

    $.ajax({
     url: `${config.apiUrl}/braid/get_dashboard_search_data`,
      method: "POST",
      headers: customHeaders,
      data: jsonData,
      processData: false,
      contentType: "application/json",
      success: function (response) {
       
        setItems(response.results);
        setMonthsArray(response.Dates);
        setRows(response.results.length);
        //alert(response.Dates)
        setLoading(false)
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  };

  useEffect(() => {
    //setLoading(true)
    document.title = "Production Dashboard Report";
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      $.ajax({
       url: `${config.apiUrl}/braid/get_dashboard_default_data`,
        method: "GET",
        headers: customHeaders,
        processData: false,
        contentType: "application/json",
        success: function (response) {
          
           setItems(response.results);
        setMonthsArray(response.Dates);
        setRows(response.results.length);
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

// Function to fetch data for a specific item and date for production output
const [tp, setTp] = useState(Array.from({ length: items.length }, () => Array(period.length).fill('Loading...')));
const [tp1, setTp1] = useState(Array(period.length).fill(0));

const fetchDataForItemAndDate = async (itemId, date) => {
  //alert(date)
   const apiUrl = `${config.apiUrl}/braid/get_fg_output_data?item=${itemId}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      let fg = 0;
      data.forEach((ws) => {
        fg += ws.fg_output;
      });
      return fg;
    }
  } catch (error) {
    console.error(`Failed to fetch data for item ${itemId}, date ${date}`);
  }

  return 0; // Return a default value if an error occurs
}

const fetchDataAndProcess = async () => {
  const updatedTp = [];
  let updatedTp1 = Array.from({ length: period.length }, () => 0);
  for (let i = 0; i < items.length; i++) {
    const itemData = [];
    for (let k = 0; k < period.length; k++) {
      
      const fgValue = await fetchDataForItemAndDate(items[i].id, period[k]);
      itemData.push(fgValue);
      updatedTp1[k] += fgValue;
    }
    updatedTp.push(itemData);
  }

  setTp(updatedTp);
  setTp1(updatedTp1);
  console.log(updatedTp1)
};

useEffect(() => {
  fetchDataAndProcess();
}, [items, period]);

// Function to fetch data for a specific item and date for Fiver used(In KG)
const [fb, setFb] = useState(Array.from({ length: items.length }, () => Array(period.length).fill('Loading...')));
const [fb1, setFb1] = useState(Array(period.length).fill(0));

const fetchDataForItemAndDate2 = async (itemId, date) => {
  const apiUrl = `${config.apiUrl}/braid/get_fg_output_data?item=${itemId}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      let fd = 0;
      data.forEach((ws) => {
        fd +=+ ws.fiber;
      });
      return fd;
    }
  } catch (error) {
    console.error(`Failed to fetch data for item ${itemId}, date ${date}`);
  }

  return 0; // Return a default value if an error occurs
}

const fetchDataAndProcess2 = async () => {
  const updatedFb = [];
  let updatedFb1 = Array.from({ length: period.length }, () => 0);
  for (let i = 0; i < items.length; i++) {
    const itemData = [];
    for (let k = 0; k < period.length; k++) {
      const fdValue = await fetchDataForItemAndDate2(items[i].id, period[k]);
      itemData.push(fdValue);
      //alert(fdValue)
      updatedFb1[k] += fdValue;
    }
    updatedFb.push(itemData);
  }

  setFb(updatedFb);
  setFb1(updatedFb1);
  console.log(updatedFb1)
};

useEffect(() => {
  fetchDataAndProcess2();
}, [items, period]);

// Function to fetch data for a specific item and date for waste (In KG)
const [wst, setWst] = useState(Array.from({ length: items.length }, () => Array(period.length).fill('Loading...')));
const [wst1, setWst1] = useState(Array(period.length).fill(0));

const fetchDataForItemAndDate3 = async (itemId, date) => {
  const apiUrl = `${config.apiUrl}/braid/get_fg_output_data?item=${itemId}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      let wst = 0;
      data.forEach((ws) => {
        wst +=+ ws.waste_weight;
      });
      return wst;
    }
  } catch (error) {
    console.error(`Failed to fetch data for item ${itemId}, date ${date}`);
  }

  return 0; // Return a default value if an error occurs
}

const fetchDataAndProcess3 = async () => {
  const updatedWst = [];
  let updatedWst1 = Array.from({ length: period.length }, () => 0);
  for (let i = 0; i < items.length; i++) {
    const itemData = [];
    for (let k = 0; k < period.length; k++) {
      const fdValue = await fetchDataForItemAndDate3(items[i].id, period[k]);
      itemData.push(fdValue/1000);
      //alert(fdValue)
      updatedWst1[k] += fdValue/1000;
    }
    updatedWst.push(itemData);
  }

  setWst(updatedWst);
  setWst1(updatedWst1);
};

useEffect(() => {
  fetchDataAndProcess3();
}, [items, period]);


// Function to fetch data for a specific item and date for labour used/workers (In KG)
const [lbr, setLbr] = useState(Array.from({ length: items.length }, () => Array(period.length).fill('Loading...')));
const [lbr1, setLbr1] = useState(Array(period.length).fill(0));

const fetchDataForItemAndDate4 = async (itemId, date) => {
  const apiUrl = `${config.apiUrl}/braid/get_labour_worker_data?item=${itemId}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      let lbr = 0;
      data.forEach((ws) => {
        lbr +=+ ws.at + +ws.it; // Include ws.it in the addition operation
      });
      return lbr;
    }
  } catch (error) {
    console.error(`Failed to fetch data for item ${itemId}, date ${date}`);
  }

  return 0; // Return a default value if an error occurs
}

const fetchDataAndProcess4 = async () => {
  const updatedLbr = [];
  let updatedLbr1 = Array.from({ length: period.length }, () => 0);
  for (let i = 0; i < items.length; i++) {
    const itemData = [];
    for (let k = 0; k < period.length; k++) {
      const lbrValue = await fetchDataForItemAndDate4(items[i].id, period[k]);
      itemData.push(lbrValue);
      //alert(fdValue)
      updatedLbr1[k] += lbrValue;
    }
    updatedLbr.push(itemData);
  }

  setLbr(updatedLbr);
  setLbr1(updatedLbr1);
};

useEffect(() => {
  fetchDataAndProcess4();
}, [items, period]);


// Function to fetch data for a specific item and date for PPP 
const [ppp, setPpp] = useState(Array.from({ length: items.length }, () => Array(period.length).fill('Loading...')));
//const [ppp1, setPpp1] = useState(Array(period.length).fill(0));

const fetchDataForItemAndDate5 = async (itemId, date) => {
  const apiUrl = `${config.apiUrl}/braid/get_ppp_data?item=${itemId}&date=${date}`;

  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      
      return data;
    }
  } catch (error) {
    console.error(`Failed to fetch data for item ${itemId}, date ${date}`);
  }

  return 0; // Return a default value if an error occurs
}

const fetchDataAndProcess5 = async () => {
  const updatedPpp = [];
 // let updatedLbr1 = Array.from({ length: period.length }, () => 0);
  for (let i = 0; i < items.length; i++) {
    const itemData = [];
    for (let k = 0; k < period.length; k++) {
      const pppValue = await fetchDataForItemAndDate5(items[i].id, period[k]);
      itemData.push(pppValue);
      //alert(fdValue)
      //updatedLbr1[k] += lbrValue;
    }
    updatedPpp.push(itemData);
  }

  setPpp(updatedPpp);
  //setLbr1(updatedLbr1);
};

useEffect(() => {
  fetchDataAndProcess5();
}, [items, period]);
//csv download
//csv download
const downloadCSV = () => {
  const table = document.querySelector('.table');
  const rows = table.querySelectorAll('tr');
  const csvData = [];

  rows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('th, td');

    cells.forEach(cell => {
      const rowspan = cell.rowSpan;
      const colspan = cell.colSpan;
      const content = cell.innerText;

      if (rowspan > 1 || colspan > 1) {
        // Duplicate content for rowspan or colspan
        for (let i = 0; i < colspan; i++) {
          rowData.push(content);
        }
      } else {
        rowData.push(content);
      }
    });

    csvData.push(rowData.join(','));
  });

  // Create a CSV string
  const csvContent = csvData.join('\n');

  // Create a Blob and trigger the download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'Production_dashboard.csv');
}


const copyTable = () => {
  // Select the table content
  const range = document.createRange();
  range.selectNode(tableRef.current);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  // Copy the selected content to the clipboard
  document.execCommand('copy');

  // Deselect the content
  window.getSelection().removeAllRanges();

  alert('Table copied to clipboard!');
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
               <CardTitle tag="h5"> Production Dashboard
                <hr></hr>
                Search Between Dates Reports
                 <hr></hr>
               </CardTitle>
               </CardHeader>
                <CardBody>
            
            <form onSubmit={handleSubmit} method="POST">
              <div className="row space">
                <div className="col-sm-3">
                  <span className="textgreen">Start Date</span>
                  <DatePicker
                    className="form-control margin-bottom"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
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
                    onChange={(date) => setEndDate(date)}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select End Date"
                    name="todate"
                  />
                </div>
                <div className="col-sm-2">
                  <button type="submit" className="btn btn-success btn-md">
                    View
                  </button>
                </div>
              </div>
            </form>

            <div>
              <h6 class="header-title">
                <span class="textgreen">
                  [{fdate}-{tdate}]
                </span>
              </h6>
            </div>

            <div>
              <h6 class="header-title">
                <span class="textred">{todaydate}</span>
              </h6>
            </div>
              
            <button onClick={downloadCSV} className="btn btn-primary">
              CSV
            </button>
            &nbsp;
            <button onClick={copyTable} className="btn btn-warning">Copy </button>
            <div className="table-responsive">
            <table className="table table-striped dt-responsive nowrap" style={{ border: "1px solid black" }} ref={tableRef}>
              <thead style={{ border: "1px solid black" }}>
                <tr style={{ border: "1px solid black" }}>
                  <th style={{ border: "1px solid black" }}>#</th>
                  <th style={{ border: "1px solid black" }}>ITEM NAME</th>
                  {period && period.length > 0 ? (
                      period.map((dt, index) => {
                        // Check if dt is a string
                        if (typeof dt === 'string') {
                          // Extract day, month, and year components
                          const [day, month, year] = dt.split("-").map(component => parseInt(component));

                          // Create a new Date object using the correct format
                          const dateObject = new Date(year, month - 1, day); // month is 0-based in JavaScript Date

                          // Check if the date is valid
                          if (!isNaN(dateObject.getTime())) {
                            // Format the date as dd-mm-yyyy
                            const formattedDay = day.toString().padStart(2, '0'); // Add leading zero if needed
                            const formattedMonth = (month < 10 ? '0' : '') + month.toString(); // Add leading zero if needed
                            const formattedYear = year.toString();

                            const formattedDate = `${formattedDay}-${formattedMonth}-${formattedYear}`;

                            return (
                              <th key={index} style={{ border: "1px solid black" }}>
                                {formattedDate}
                              </th>
                            );
                          }
                        }

                        // Handle invalid date or non-string case (optional)
                        //console.error(`Invalid date at index ${index}: ${dt}`);
                        return (
                          <th key={index} style={{ border: "1px solid black" }}>
                           {todaydate}
                          </th>
                        );
                      })
                    ) : (
                      <th>{todaydate}</th>
                    )}
                </tr>
              </thead>
              <tbody style={{ border: "1px solid black" }}>
                <tr>
                  <td style={{ border: "1px solid black" }} rowspan={count + 2}>
                    Production (fg) Output (Pcs)
                  </td>
                </tr>
                
                {items.map((item, i) => (
                    <tr key={i} style={{ border: "1px solid black" }}>
                      <td style={{ fontWeight: "bold", fontSize: "10px", border: "1px solid black" }}>{item.item_description}</td>
                      {period.map((dt, k) => (
                        <td key={k} style={{ border: "1px solid black" }}>
                          {tp[i] && typeof tp[i][k] !== 'undefined' ? tp[i][k] : 'Loading...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ color: "red", fontWeight: "bold", border: "1px solid black" }}>Total</td>
                  {period.map((dt, k) => (
                    <td key={k} style={{ border: "1px solid black" }}>
                      <span>
                        {tp1[k]}
                      </span>
                    </td>
                  ))}
                </tr>


                {/* Fiber use row */}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black" }} rowspan={count + 2}>
                    Fiber Used (in KG)
                  </td>
                </tr>
                {items.map((item, i) => (
                    <tr key={i} style={{ border: "1px solid black" }}>
                      <td style={{ fontWeight: "bold", fontSize: "10px", border: "1px solid black" }}>{item.item_description}</td>
                      {period.map((dt, k) => (
                        <td key={k} style={{ border: "1px solid black" }}>
                          {fb[i] && typeof fb[i][k] !== 'undefined' ? fb[i][k] : 'Loading...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                 <tr style={{ border: "1px solid black" }}>
                  <td style={{ color: "red", fontWeight: "bold", border: "1px solid black" }}>Total</td>
                  {period.map((dt, k) => (
                    <td key={k} style={{ border: "1px solid black" }}>
                      <span>
                        {fb1[k]}
                      </span>
                    </td>
                  ))}
                </tr>
           

                {/* Waste (in KG) */}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black" }} rowspan={count + 2}>
                    Waste (in KG)
                  </td>
                </tr>
                {items.map((item, i) => (
                    <tr key={i} style={{ border: "1px solid black" }}>
                      <td style={{ fontWeight: "bold", fontSize: "10px", border: "1px solid black" }}>{item.item_description}</td>
                      {period.map((dt, k) => (
                        <td key={k} style={{ border: "1px solid black" }}>
                          {wst[i] && typeof wst[i][k] !== 'undefined' ? wst[i][k] : 'Loading...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ color: "red", fontWeight: "bold", border: "1px solid black" }}>Total</td>
                  {period.map((dt, k) => (
                    <td key={k} style={{ border: "1px solid black" }}>
                      <span>
                        {wst1 && lbr1[k] !== undefined && typeof wst1[k] === "number" ? parseFloat(wst1[k].toFixed(4)) : ""}
                      </span>
                    </td>
                  ))}
                </tr>


                {/* Labour used */}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black" }} rowspan={count + 2}>
                    Labour used/workers
                  </td>
                </tr>
                {items.map((item, i) => (
                  <tr key={i} style={{ border: "1px solid black" }}>
                    <td style={{ fontWeight: "bold", fontSize: "10px", border: "1px solid black" }}>{item.item_description}</td>
                    {period.map((dt, k) => (
                      <td key={k} style={{ border: "1px solid black" }}>
                        {lbr[i] && typeof lbr[i][k] !== 'undefined' ? lbr[i][k].toFixed(4) : 'Loading...'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ color: "red", fontWeight: "bold", border: "1px solid black" }}>Total</td>
                  {period.map((dt, k) => (
                    <td key={k} style={{ border: "1px solid black" }}>
                      <span>
                      {lbr1 && lbr1[k] !== undefined && typeof lbr1[k] === "number" ? parseFloat(lbr1[k].toFixed(4)) : ""}
                      </span>
                    </td>
                  ))}
                </tr>


                {/* PPP ROWS */}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ border: "1px solid black" }} rowspan={count + 2}>
                    PPP
                  </td>
                </tr>
                {items.map((item, i) => (
                    <tr key={i} style={{ border: "1px solid black" }}>
                      <td style={{ fontWeight: "bold", fontSize: "10px", border: "1px solid black" }}>{item.item_description}</td>
                      {period.map((dt, k) => (
                        <td key={k} style={{ border: "1px solid black" }}>
                          {ppp[i] && ppp[i][k] !== undefined && typeof ppp[i][k] === 'number' ? ppp[i][k].toFixed(2) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                <tr style={{ border: "1px solid black" }}>
                  <td style={{ color: "red", fontWeight: "bold", border: "1px solid black" }}>Total</td>
                  {period.map((dt, k) => (
                    <td key={k} style={{ border: "1px solid black" }}>
                      <span>
                      {isNaN(tp1[k] / lbr1[k]) ? '' : (tp1[k] / lbr1[k]).toFixed(2)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
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

export default ProductionDashboardReport;
