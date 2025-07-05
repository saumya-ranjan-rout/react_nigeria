
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
// react plugin used to create charts
import { Line, Pie } from "react-chartjs-2";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
// core components
import {
  dashboard24HoursPerformanceChart,
  dashboardEmailStatisticsChart,
  dashboardNASDAQChart,
} from "variables/charts.js";
import $ from 'jquery'; 
import axios from 'axios';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
// Import your image
import teamwork from './teamwork.png'; // Adjust the path as per your project structure
import group from './group.png'; // Adjust the path as per your project structure
import unity from './unity.png'; // Adjust the path as per your project structure
//DB Connection
import config from '../config';

function Dashboard() {
  const { t } = useTranslation();

  const [isActive, setActive] = useState(false);
  const tableRef = useRef(null);
  const toggleClass = () => {
    setActive(!isActive);
  };
  const [totalItem, setTotalItem] = useState(0);
  const [totalSection, setTotalSection] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalWorkersP, setTotalWorkersP] = useState(0);
  const [totalWorkersA, setTotalWorkersA] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [totalOperators, setTotalOperators] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [totalDirectWorkers, setTotalDirectWorkers] = useState(0);
  const [totalDirectWorkersP, setTotalDirectWorkersP] = useState(0);
  const [totalDirectWorkersA, setTotalDirectWorkersA] = useState(0);
  const [totalIndirectWorkers, setTotalIndirectWorkers] = useState(0);
  const [totalIndirectWorkersP, setTotalIndirectWorkersP] = useState(0);
  const [totalIndirectWorkersA, setTotalIndirectWorkersA] = useState(0);  
  const [totalProindirectWorkers, setTotalProindirectWorkers] = useState(0);
  const [totalProindirectWorkersP, setTotalProindirectWorkersP] = useState(0);
  const [totalProindirectWorkersA, setTotalProindirectWorkersA] = useState(0);
  const [totalStaffWorkers, setTotalStaffWorkers] = useState(0);
  const [totalStaffWorkersP, setTotalStaffWorkersP] = useState(0);
  const [totalStaffWorkersA, setTotalStaffWorkersA] = useState(0);
  const [totalExpatsWorkers, setTotalExpatsWorkers] = useState(0);
  const [totalExpatsWorkersP, setTotalExpatsWorkersP] = useState(0);
  const [totalExpatsWorkersA, setTotalExpatsWorkersA] = useState(0);
  const [categoryData, setCategoryData] =  useState([]);
  const [categoryitemcountall, setCategoryDataitemcountall] = useState(0);

  const [Timesheetmorningpresent, setTimesheetMorningPresent] = useState(0);

  const [file, setFile] = useState(null);





  const [slideIndex, setSlideIndex] = useState(1);
  const [assignedList, setAssignedList] = useState([]);

  function plusDivs(n) {
    const newIndex = slideIndex + n;
    setSlideIndex(newIndex > assignedList.length ? 1 : newIndex < 1 ? assignedList.length : newIndex);
  }

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook const roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const language = sessionStorage.getItem('language');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(token);
     //alert(ctype);

 useEffect(() => {
    document.title = 'Dashboard';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      setLanguage(language);
      // Fetch data from the server API
      fetchTotalItem();
      fetchTotalSection();
      fetchTotalWorkers();
      fetchTotalWorkersPresent();
      fetchTotalWorkersAbsent();
      fetchTotalSections();
      fetchTotalOperators();
      fetchAssignedLineSection();
      fetchTotalDirectWorkers();
      fetchTotalDirectWorkersPresent();
      fetchTotalDirectWorkersAbsent();
      fetchTotalIndirectWorkers();
      fetchTotalIndirectWorkersPresent();
      fetchTotalIndirectWorkersAbsent();
      fetchTotalProindirectWorkers();
      fetchTotalProindirectWorkersPresent();
      fetchTotalProindirectWorkersAbsent();
      fetchTotalStaffWorkers();
      fetchTotalStaffWorkersPresent();
      fetchTotalStaffWorkersAbsent();
      fetchTotalExpatsWorkers();
      fetchTotalExpatsWorkersPresent();
      fetchTotalExpatsWorkersAbsent();


      fetchData();
      fetchCategoryData();

      fetchTimesheetMorningPresent();
     
    }

  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post( `${config.apiUrl}/upload_image_video`, formData, {
          headers: customHeaders,
          contentType: 'multipart/form-data',
        });
      //  alert(response.data.message);
        console.log(response.data.message);
        window.location.reload();
      } catch (error) {
       // alert(error);
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('No file selected');
    }
  };
  const fetchData = () => {
    //alert('API request is being generated...'); // Alert to notify API request generation
    $.ajax({
      url: `${config.apiUrl}/getproduction?userid=${userid}&roleid=${roleId}`,
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // Set the fetched data in the state
        setItems(response);
        //alert(JSON.stringify(response));

        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }

        // Initialize the DataTable with the updated data
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
         // buttons: ['copy', 'csv'],
         //dom: '<"row"<"col-md-9"l><"col-md-3"f>>rt<"row"<"col-md-9"i><"col-md-3"p>>', // Position pagination controls on the right side
         dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: [
            {
              extend: 'copy',
              text: 'Copy',
              exportOptions: {
                columns: [0, 1], // Include only the first and second columns in copying
              },
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                columns: [0, 1], // Include only the first and second columns in CSV
              },
              action: function (e, dt, button, config) {
                // Hide the action column when CSV button is clicked
                tableRef.current.column(2).visible(false);
                $.fn.DataTable.ext.buttons.csvHtml5.action.call(this, e, dt, button, config);
                tableRef.current.column(2).visible(true); // Show the action column again
              },
            },
          ],
          data: response,
          columns: [
            { data: null },
            { data: 'item_description' },
            {
              data: 'tar',
              render: function (data, type, row) {
                return parseFloat(data).toFixed(2);
              },
            },
            {
              data: 'value_sum',
              render: function (data, type, row) {
                return parseFloat(data).toFixed(2);
              },
            },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                // Render the row index starting from 1
                return meta.row + 1;
              },
            },
          ],
        });
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
  };

 
  const fetchTotalItem = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_item`, { headers: customHeaders });
      const data = response.data;
      setTotalItem(data.totalItem);
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };

  const fetchTotalSection = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_section`, { headers: customHeaders });
      const data = response.data;
      setTotalSection(data.totalSection);
    } catch (error) {
      console.error('Error fetching total section:', error);
    }
  };

  const fetchTotalWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalWorkers(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalWorkersPresent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalWorkersP(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalWorkersAbsent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/total_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalWorkersA(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const fetchTotalSections = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_section`, { headers: customHeaders });
      const data = response.data;
      setTotalSections(data.totalSection);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };





  const fetchTotalOperators = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_operators`, { headers: customHeaders });
      const data = response.data;
      setTotalOperators(data.totalOperators);
    } catch (error) {
      console.error('Error fetching total operators:', error);
    }
  };

  const fetchAssignedLineSection = async () => {
   //alert(userid);
    try {
      const response = await axios.get( `${config.apiUrl}/get_assigned_line_section/${userid}`, { headers: customHeaders });
      const data = response.data;
      //alert(JSON.stringify(data));
      setAssignedList(data);
    } catch (error) {
     // alert(error);
      console.error('Error fetching assigned list:', error);
    }
  };

  const fetchTotalDirectWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_direct_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalDirectWorkers(data.totalWorkers);
     // alert(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalDirectWorkersPresent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_direct_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalDirectWorkersP(data.totalWorkersp);
   //   alert(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalDirectWorkersAbsent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_direct_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalDirectWorkersA(data.totalWorkersa);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const fetchTotalIndirectWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_indirect_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalIndirectWorkers(data.totalWorkers);
     // alert(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalIndirectWorkersPresent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_indirect_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalIndirectWorkersP(data.totalWorkersp);
   //   alert(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalIndirectWorkersAbsent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_indirect_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalIndirectWorkersA(data.totalWorkersa);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const fetchTotalProindirectWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_proindirect_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalProindirectWorkers(data.totalWorkers);
     // alert(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalProindirectWorkersPresent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_proindirect_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalProindirectWorkersP(data.totalWorkersp);
      //alert(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalProindirectWorkersAbsent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_proindirect_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalProindirectWorkersA(data.totalWorkersa);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };
  const fetchTotalStaffWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_staff_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalStaffWorkers(data.totalWorkers);
     // alert(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalStaffWorkersPresent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_staff_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalStaffWorkersP(data.totalWorkersp);
      //alert(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalStaffWorkersAbsent = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/total_staff_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalStaffWorkersA(data.totalWorkersa);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };
  const fetchTotalExpatsWorkers = async () => {
    try {
      const response = await axios.get( `${config.apiUrl}/dashbord_total_expats_workers`, { headers: customHeaders });
      const data = response.data;
      setTotalExpatsWorkers(data.totalWorkers);
     // alert(data.totalWorkers);
    } catch (error) {
      console.error('Error fetching total workers:', error);
    }
  };

  const fetchTotalExpatsWorkersPresent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/total_expats_workers_p`, { headers: customHeaders });
      const data = response.data;
      setTotalExpatsWorkersP(data.totalWorkersp);
      //alert(data.totalWorkersp);
    } catch (error) {
      console.error('Error fetching total workers present:', error);
    }
  };

  const fetchTotalExpatsWorkersAbsent = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/total_expats_workers_a`, { headers: customHeaders });
      const data = response.data;
      setTotalExpatsWorkersA(data.totalWorkersa);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/categoryData`, { headers: customHeaders });
      const data = response.data;
      const { responseData, item_count_all } = data[0];

      // alert('Response Data: ' + JSON.stringify(responseData));
      // alert('Item Count All: ' + item_count_all);
     setCategoryData(responseData);
     setCategoryDataitemcountall(item_count_all);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };
  
  const fetchTimesheetMorningPresent= async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/timesheet_morning_present`, { headers: customHeaders });
      const data = response.data;
      setTimesheetMorningPresent(data.totalWorkers);
     // alert(data.totalWorkersa);
    } catch (error) {
      console.error('Error fetching total workers absent:', error);
    }
  };

      // Function to change the language
      const setLanguage = async (language) => {
        try {
            await i18n.changeLanguage(language);
            console.log(`Language changed to ${language}`);
        } catch (error) {
            console.error(`Error changing language: ${error.message}`);
        }
    };
  return (
    <>
    <div className="content">
    
      

      <Row>
      {roleId == 5 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-cubes text-success"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Items')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalItem}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{/*{rilPresentWorker}*/}</h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{/*{rilAbsentWorker}*/}</h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
        {(roleId == 3 || roleId == 5) && (
        <Col lg="3" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-puzzle-piece text-warning" aria-hidden="true"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category">{t('Sections')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalSections}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 border-rights">
                      <div className="description-block">
                        <h5 className="description-header"></h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="description-block">
                        <h5 className="description-header"></h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
          )}

{roleId != 1 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-users text-primary"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Workers')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
{roleId == 6 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-user-circle text-success"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Direct')} {t('Workers')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalDirectWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalDirectWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalDirectWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
{roleId == 6 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-user-circle text-danger"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Indirect')} {t('Workers')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalIndirectWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalIndirectWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalIndirectWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
            {(roleId == 5 || roleId == 6) && (
        <Col lg="3" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-user-secret" aria-hidden="true"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category">{t('Operators')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalOperators}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 border-rights">
                      <div className="description-block">
                        <h5 className="description-header"></h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="description-block">
                        <h5 className="description-header"></h5>
                        <span className="description-text"></span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
          )}



{roleId == 3  && (
       
          <Col lg="6" md="12" sm="12">
            <style>
              {`.mySlides {
                display: none;
              }
              .active {
                display: block;
              }`}
            </style>
            {assignedList.map((row1, index) => (
              <div
                key={index}
                className={`mySlides ${index + 1 === slideIndex ? 'active' : ''}`}
                style={{ width: '100%' }}
              >
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col>
                        <div className="icon-big text-center icon-warning">
                          <p style={{  fontSize: '24px'}}>{t('Assigned')} {t('Product')},{t('Line')} & {t('Section')}</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="row" style={{ textAlign: 'center' }}>
                        <p className=" text-muted">
                        {row1.shift}
                        <br />
                      </p>
                      <p >
                        <a href="#" className="text-pink">
                        {row1.item_description}
                        </a>
                        <span className="text-grey">[{row1.line}]</span>
                      </p>

                      <p className=" text-muted">
                      {row1.section_name}
                        <br />
                      </p>
                    </div>
                    <div className="row" >
                      <button
                        className="btn btn-primary"
                        onClick={() => plusDivs(-1)}
                      >
                        &#10094;
                      </button>&nbsp;
                      <button
                        className="btn btn-primary "
                        onClick={() => plusDivs(1)}
                      >
                        &#10095;
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </Col>
        )}
         
         {roleId == 6 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-users text-danger"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Production')} {t('Indirect')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalProindirectWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalProindirectWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalProindirectWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
         {roleId == 6 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-users text-warning"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Staff')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalStaffWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalStaffWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalStaffWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}
         {roleId == 6 && (
        <Col lg="3" md="6" sm="6"> 
          <Card className="card-stats">
            <CardBody>
              <Row>
                <Col md="4" xs="5">
                  <div className="icon-big text-center icon-warning" style={{ width: '100px', height: '100px', borderRadius: '50%',  display: 'flex',  alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                  <i class="fa fa-users text-primary"></i>
                  </div>
                </Col>
                <Col md="8" xs="7">
                  <div className="numbers">
                    <p className="card-category border-rights">{t('Expats')}</p>
                    
                    <p />
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <hr />
              <div className="row">
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalExpatsWorkers}</h5>
                        <span className="description-text">Total </span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12 border-rights">
                      <div className="description-block">
                        <h5 className="description-header">{totalExpatsWorkersP}</h5>
                        <span className="description-text">Present</span>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="description-block">
                        <h5 className="description-header">{totalExpatsWorkersA}</h5>
                        <span className="description-text">Absent</span>
                      </div>
                    </div>
                  </div>
            </CardFooter>
          </Card>
        </Col>
         )}

{/* completed above */}


{roleId == 6 && ( 
<Col lg="3" md="6" sm="6"> 
<table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">

   <tr >
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Category')}</td>
     <td width="2%">&nbsp;</td>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>Item {t('Count')}</td>
   </tr>


   {categoryData.map((catdata, index) => (
                  <tr key={index}>
                    <td align="left">{catdata.category_name}</td>
                    <td align="left">{catdata.item_count}</td>
                  </tr>
                ))}
                <tr>
                  <th align="left">{t('TOTAL')}</th>
                  <th align="left">{categoryitemcountall}</th>
                </tr>
 </table>

</Col>
)}

{roleId == 6 && ( 
<Col lg="3" md="6" sm="6"> 
<table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
   <tr>
     <td colspan="3" align="center" style={{ backgroundColor: '#FFC2A7', textAlign: 'center'  }}>{t('Morning')} {t('Shift')}</td>
   </tr>
   <tr style={{ backgroundColor: '#b0bec5' }}>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Direct')}</td>
     <td width="2%">&nbsp;</td>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Indirect')}</td>
   </tr>
   <tr>
     <td align="left">{t('Expected')}: {totalDirectWorkers}</td>
     <td>&nbsp;</td>
     <td align="left">{t('Expected')}: {totalIndirectWorkers}</td>
   </tr>
  <tr>
     <td align="left">{t('Present')}: {totalDirectWorkersP}</td>
     <td>&nbsp;</td>
   <td align="left">{t('Present')}: {totalIndirectWorkersP}</td>
   </tr>
   <tr>
     <td align="left">{t('Absent')}: {totalDirectWorkersA}</td>
     <td>&nbsp;</td>
      <td align="left">{t('Absent')}: {totalIndirectWorkersA}</td>
   </tr>
 </table>

</Col>
)}

{roleId == 6 && ( 
<Col lg="3" md="6" sm="6"> 
<table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
   <tr>
     <td colspan="3" align="center" style={{ backgroundColor: '#FF6275', textAlign: 'center'  }}>{t('Evening')} {t('Shift')}</td>
   </tr>
   <tr style={{ backgroundColor: '#b0bec5' }}>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Direct')}</td>
     <td width="2%">&nbsp;</td>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Indirect')}</td>
   </tr>
   <tr>
     <td align="left">{t('Expected')}: </td>
     <td>&nbsp;</td>
     <td align="left">{t('Expected')}: </td>
   </tr>
  <tr>
     <td align="left">{t('Present')}: </td>
     <td>&nbsp;</td>
   <td align="left">{t('Present')}: </td>
   </tr>
   <tr>
     <td align="left">{t('Absent')}: </td>
     <td>&nbsp;</td>
      <td align="left">{t('Absent')}: </td>
   </tr>
 </table>

</Col>
)}

{roleId == 6 && ( 
<Col lg="3" md="6" sm="6"> 
<table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
   <tr>
     <td colspan="3" align="center" style={{ backgroundColor: '#5CE0B8', textAlign: 'center'  }}>{t('Timesheet Entry Status')}</td>
   </tr>
   <tr style={{ backgroundColor: '#b0bec5' }}>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Morning')}</td>
     <td width="2%">&nbsp;</td>
     <td width="24%" align="center" style={{ textAlign: 'center' }}>{t('Evening')}</td>
   </tr>
   <tr>
     <td align="left">{t('Expected')}: </td>
     <td>&nbsp;</td>
     <td align="left">{t('Expected')}: </td>
   </tr>
  <tr>
     <td align="left">{t('Present')}: </td>
     <td>&nbsp;</td>
   <td align="left">{t('Present')}: </td>
   </tr>
   <tr>
     <td align="left">{t('Absent')}: </td>
     <td>&nbsp;</td>
      <td align="left">{t('Absent')}: </td>
   </tr>
 </table>

</Col>
)}



{(roleId == 5 || roleId == 3) && ( 
<Col md="12">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">{t('Production')}</CardTitle>
              </CardHeader>
              <CardBody>
               
                 <div className="table-responsive">
                  <table id="example" className="display">
                    <thead className="text-primary">
                      <tr>
                      <th>#</th>
                    <th>Item</th>
                    <th>{t('Target')}</th>
                    <th>{t('Complete')}</th>
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                      <tr>
                      <th>#</th>
                    <th>Item</th>
                    <th>{t('Target')}</th>
                    <th>{t('Complete')}</th>
                      </tr>
                    </tfoot>
                   </table>
              </div>
              </CardBody>
            </Card>
          </Col>

)}
        
      </Row>

      
    </div>
  </>
  );
}

export default Dashboard;

