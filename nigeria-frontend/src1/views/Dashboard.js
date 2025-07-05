
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
// Import your image
import teamwork from './teamwork.png'; // Adjust the path as per your project structure
import group from './group.png'; // Adjust the path as per your project structure
import unity from './unity.png'; // Adjust the path as per your project structure
//DB Connection
import config from '../config';

function Dashboard() {
  const [otadate, setOtadate] = useState([]);
  const [ikejadate, setIkejadate] = useState([]);
  const [items, setItems] = useState([]);
  const [rilTotalWorker, setRilTotalWorker] = useState([]);
  const [rilPresentWorker, setRilPresentWorker] = useState([]);
  const [rilAbsentWorker, setRilAbsentWorker] = useState([]);
  const [lornaTotalWorker, setLornaTotalWorker] = useState([]);
  const [lornaPresentWorker, setLornaPresentWorker] = useState([]);
  const [lornaAbsentWorker, setLornaAbsentWorker] = useState([]);
  const [ikejaTotalWorker, setIkejaTotalWorker] = useState([]);
  const [ikejaPresentWorker, setIkejaPresentWorker] = useState([]);
  const [ikejaAbsentWorker, setIkejaAbsentWorker] = useState([]);
  const [rilTotalOperator, setRilTotalOperator] = useState([]);
  const [lornaTotalOperator, setLornaTotalOperator] = useState([]);
  const [ikejaTotalOperator, setIkejaTotalOperator] = useState([]);
  //table data ota
  const [otaDirectExpectedDay, setOtaDirectExpectedDay] = useState([]);
  const [otaDirectPresentDay, setOtaDirectPresentDay] = useState([]);         
  const [otaDirectAbsentDay, setOtaDirectAbsentDay] = useState([]);          
  const [otaIndirectExpectedDay, setOtaIndirectExpectedDay] = useState([]);      
  const [otaIndirectPresentDay, setOtaIndirectPresentDay] = useState([]);       
  const [otaIndirectAbsentDay, setOtaIndirectAbsentDay] = useState([]);
  const [otaDirectExpectedNight, setOtaDirectExpectedNight] = useState([]);      
  const [otaDirectPresentNight, setOtaDirectPresentNight] = useState([]);       
  const [otaDirectAbsentNight, setOtaDirectAbsentNight] = useState([]);
  const [otaIndirectExpectedNight, setOtaIndirectExpectedNight] = useState([]);    
  const [otaIndirectPresentNight, setOtaIndirectPresentNight] = useState([]);     
  const [otaIndirectAbsentNight, setOtaIndirectAbsentNight] = useState([]); 
  //table data ikeja 
  const [ikejaDirectExpectedDay, setIkejaDirectExpectedDay] = useState([]);
  const [ikejaDirectPresentDay, setIkejaDirectPresentDay] = useState([]);         
  const [ikejaDirectAbsentDay, setIkejaDirectAbsentDay] = useState([]);          
  const [ikejaIndirectExpectedDay, setIkejaIndirectExpectedDay] = useState([]);      
  const [ikejaIndirectPresentDay, setIkejaIndirectPresentDay] = useState([]);       
  const [ikejaIndirectAbsentDay, setIkejaIndirectAbsentDay] = useState([]);
  const [ikejaDirectExpectedNight, setIkejaDirectExpectedNight] = useState([]);      
  const [ikejaDirectPresentNight, setIkejaDirectPresentNight] = useState([]);       
  const [ikejaDirectAbsentNight, setIkejaDirectAbsentNight] = useState([]);
  const [ikejaIndirectExpectedNight, setIkejaIndirectExpectedNight] = useState([]);    
  const [ikejaIndirectPresentNight, setIkejaIndirectPresentNight] = useState([]);     
  const [ikejaIndirectAbsentNight, setIkejaIndirectAbsentNight] = useState([]); 

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
  const token = localStorage.getItem('token');
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

      fetchotadate();
      fetchikejadate();
      fetchtotalworkerril();
      fetchpresentworkerril();
      fetchabsentworkerril();
      fetchtotalworkerlorna();
      fetchpresentworkerlorna();
      fetchabsentworkerlorna();
      fetchtotalworkerikeja();
      fetchpresentworkerikeja();
      fetchabsentworkerikeja();
      fetchtotaloperatorril();
      fetchtotaloperatorlorna();
      fetchtotaloperatorikeja();
      //table data ota
      fetchotadirectexpectedday();
      fetchotadirectpresentday();
      fetchotadirectabsentday();
      fetchotaindirectexpectedday();
      fetchotaindirectpresentday();
      fetchotaindirectabsentday();
      fetchotadirectexpectednight();
      fetchotadirectpresentnight();
      fetchotadirectabsentnight();
      fetchotaindirectexpectednight();
      fetchotaindirectpresentnight();
      fetchotaindirectabsentnight();
      //table data ikeja
      fetchikejadirectexpectedday();
      fetchikejadirectpresentday();
      fetchikejadirectabsentday();
      fetchikejaindirectexpectedday();
      fetchikejaindirectpresentday();
      fetchikejaindirectabsentday();
      fetchikejadirectexpectednight();
      fetchikejadirectpresentnight();
      fetchikejadirectabsentnight();
      fetchikejaindirectexpectednight();
      fetchikejaindirectpresentnight();
      fetchikejaindirectabsentnight();
      fetchAssignedZoneMachine();
     
    }

  }, []);

const fetchotadate = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadate`, { headers: customHeaders });
    const data = response.data[0];
    setOtadate(data.date);
  } catch (error) {
    console.error('Error fetching dates:', error);
  }
};

const fetchikejadate = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadate`, { headers: customHeaders });
    const data = response.data[0];
    setIkejadate(data.date);
  } catch (error) {
    console.error('Error fetching dates:', error);
  }
};

const fetchtotalworkerril = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totalworkerril`, { headers: customHeaders });
    const data = response.data[0];
    setRilTotalWorker(data.totalWorkerCount);
  } catch (error) {
    console.error('Error fetching total workers:', error);
  }
};

const fetchpresentworkerril = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/presentworkerril`, { headers: customHeaders });
    const data = response.data[0];
    setRilPresentWorker(data.totalPresentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchabsentworkerril = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/absentworkerril`, { headers: customHeaders });
    const data = response.data[0];
    setRilAbsentWorker(data.totalAbsentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchtotalworkerlorna = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totalworkerlorna`, { headers: customHeaders });
    const data = response.data[0];
    setLornaTotalWorker(data.totalWorkerCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchpresentworkerlorna = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/presentworkerlorna`, { headers: customHeaders });
    const data = response.data[0];
    setLornaPresentWorker(data.totalPresentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchabsentworkerlorna = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/absentworkerlorna`, { headers: customHeaders });
    const data = response.data[0];
    setLornaAbsentWorker(data.totalAbsentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchtotalworkerikeja = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totalworkerikeja`, { headers: customHeaders });
    const data = response.data[0];
    setIkejaTotalWorker(data.totalWorkerCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchpresentworkerikeja = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/presentworkerikeja`, { headers: customHeaders });
    const data = response.data[0];
    setIkejaPresentWorker(data.totalPresentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchabsentworkerikeja = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/absentworkerikeja`, { headers: customHeaders });
    const data = response.data[0];
    setIkejaAbsentWorker(data.totalAbsentCount);
  } catch (error) {
    console.error('Error fetching category items:', error);
  }
};

const fetchtotaloperatorril = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totaloperatorril`, { headers: customHeaders });
    const data = response.data[0];
    setRilTotalOperator(data.rilOpCount);
  } catch (error) {
    console.error('Error fetching total operators:', error);
  }
};

const fetchtotaloperatorlorna = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totaloperatorlorna`, { headers: customHeaders });
    const data = response.data[0];
    setLornaTotalOperator(data.lornaOpCount);
  } catch (error) {
    console.error('Error fetching total operators:', error);
  }
};

const fetchtotaloperatorikeja = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/totaloperatorikeja`, { headers: customHeaders });
    const data = response.data[0];
    setIkejaTotalOperator(data.ikejaOpCount);
  } catch (error) {
    console.error('Error fetching total operators:', error);
  }
};



//table ota data fetch

//fetch ota direct data day
const fetchotadirectexpectedday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectexpectedday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectExpectedDay(data.otaDEDCount);
    } else {
      setOtaDirectExpectedDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct expected day:', error);
    setOtaDirectExpectedDay(0);
  }
};

const fetchotadirectpresentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectpresentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectPresentDay(data.otaDPDCount);
    } else {
      setOtaDirectPresentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct present day:', error);
    setOtaDirectPresentDay(0);
  }
};

const fetchotadirectabsentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectabsentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectAbsentDay(data.otaDADCount);
    } else {
      setOtaDirectAbsentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct absent day:', error);
    setOtaDirectAbsentDay(0);
  }
};


//fetch ota indirect data day
const fetchotaindirectexpectedday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectexpectedday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectExpectedDay(data.otaIEDCount);
    } else {
      setOtaIndirectExpectedDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect expected day:', error);
    setOtaIndirectExpectedDay(0);
  }
};

const fetchotaindirectpresentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectpresentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectPresentDay(data.otaIPDCount);
    } else {
      setOtaIndirectPresentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect present day:', error);
    setOtaIndirectPresentDay(0);
  }
};

const fetchotaindirectabsentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectabsentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectAbsentDay(data.otaIADCount);
    } else {
      setOtaIndirectAbsentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect absent day:', error);
    setOtaIndirectAbsentDay(0);
  }
};


//fetch ota direct data night
const fetchotadirectexpectednight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectexpectednight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectExpectedNight(data.otaDENCount);
    } else {
      setOtaDirectExpectedNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct expected night:', error);
    setOtaDirectExpectedNight(0);
  }
};

const fetchotadirectpresentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectpresentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectPresentNight(data.otaDPNCount);
    } else {
      setOtaDirectPresentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct present night:', error);
    setOtaDirectPresentNight(0);
  }
};

const fetchotadirectabsentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otadirectabsentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaDirectAbsentNight(data.otaDANCount);
    } else {
      setOtaDirectAbsentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota direct absent night:', error);
    setOtaDirectAbsentNight(0);
  }
};


//fetch ota indirect data night
const fetchotaindirectexpectednight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectexpectednight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectExpectedNight(data.otaIENCount);
    } else {
      setOtaIndirectExpectedNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect expected night:', error);
    setOtaIndirectExpectedNight(0);
  }
};

const fetchotaindirectpresentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectpresentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectPresentNight(data.otaIPNCount);
    } else {
      setOtaIndirectPresentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect present night:', error);
    setOtaIndirectPresentNight(0);
  }
};

const fetchotaindirectabsentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/otaindirectabsentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setOtaIndirectAbsentNight(data.otaIANCount);
    } else {
      setOtaIndirectAbsentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ota indirect absent night:', error);
    setOtaIndirectAbsentNight(0);
  }
};


//table ikeja data fetch

//fetch ikeja direct data day
const fetchikejadirectexpectedday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectexpectedday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectExpectedDay(data.ikejaDEDCount);
    } else {
      setIkejaDirectExpectedDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct expected day:', error);
    setIkejaDirectExpectedDay(0);
  }
};

const fetchikejadirectpresentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectpresentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectPresentDay(data.ikejaDPDCount);
    } else {
      setIkejaDirectPresentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct present day:', error);
    setIkejaDirectPresentDay(0);
  }
};

const fetchikejadirectabsentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectabsentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectAbsentDay(data.ikejaDADCount);
    } else {
      setIkejaDirectAbsentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct absent day:', error);
    setIkejaDirectAbsentDay(0);
  }
};


//fetch ikeja indirect data day
const fetchikejaindirectexpectedday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectexpectedday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectExpectedDay(data.ikejaIEDCount);
    } else {
      setIkejaIndirectExpectedDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect expected day:', error);
    setIkejaIndirectExpectedDay(0);
  }
};

const fetchikejaindirectpresentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectpresentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectPresentDay(data.ikejaIPDCount);
    } else {
      setIkejaIndirectPresentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect present day:', error);
    setIkejaIndirectPresentDay(0);
  }
};

const fetchikejaindirectabsentday = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectabsentday`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectAbsentDay(data.ikejaIADCount);
    } else {
      setIkejaIndirectAbsentDay(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect absent day:', error);
    setIkejaIndirectAbsentDay(0);
  }
};


//fetch ikeja direct data night
const fetchikejadirectexpectednight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectexpectednight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectExpectedNight(data.ikejaDENCount);
    } else {
      setIkejaDirectExpectedNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct expected night:', error);
    setIkejaDirectExpectedNight(0);
  }
};

const fetchikejadirectpresentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectpresentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectPresentNight(data.ikejaDPNCount);
    } else {
      setIkejaDirectPresentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct present night:', error);
    setIkejaDirectPresentNight(0);
  }
};

const fetchikejadirectabsentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejadirectabsentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaDirectAbsentNight(data.ikejaDANCount);
    } else {
      setIkejaDirectAbsentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja direct absent night:', error);
    setIkejaDirectAbsentNight(0);
  }
};


//fetch ikeja indirect data night
const fetchikejaindirectexpectednight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectexpectednight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectExpectedNight(data.ikejaIENCount);
    } else {
      setIkejaIndirectExpectedNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect expected night:', error);
    setIkejaIndirectExpectedNight(0);
  }
};

const fetchikejaindirectpresentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectpresentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectPresentNight(data.ikejaIPNCount);
    } else {
      setIkejaIndirectPresentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect present night:', error);
    setIkejaIndirectPresentNight(0);
  }
};

const fetchikejaindirectabsentnight = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/ikejaindirectabsentnight`, { headers: customHeaders });
    if (response.data.length > 0) {
      const data = response.data[0];
      setIkejaIndirectAbsentNight(data.ikejaIANCount);
    } else {
      setIkejaIndirectAbsentNight(0);
    }
  } catch (error) {
    console.error('Error fetching ikeja indirect absent night:', error);
    setIkejaIndirectAbsentNight(0);
  }
};


const fetchAssignedZoneMachine = async () => {
  try {
    const ptype = sessionStorage.getItem('production_type');
    const ctype = sessionStorage.getItem('category_type');
    const userid = sessionStorage.getItem('id'); // Make sure to get the user ID from the appropriate source

    const response = await axios.get(`${config.apiUrl}/get_assigned_zone_machine/${userid}`,{ headers: customHeaders },{
      params: {
        ptype: ptype,
        ctype: ctype,
      },
    });

    const data = response.data;
     //alert(JSON.stringify(data));
    setAssignedList(data);
  } catch (error) {
    console.error('Error fetching assigned list:', error);
  }
};

  return (
    <>
      <div className="content">
        
        {roleId == 5 && (
          <div className='row mt-3 mb-4' style={{ textAlign: 'center' }}>
              <div className='col'>
                    <span className='text-effect'>Attendance Showing: </span>
                    <span className="textgreen">Date: {otadate}</span> for <span className="textblue">OTA</span> 
                    <span> and </span>
                    <span className="textgreen">Date: {ikejadate}</span> for <span className="textblue">IKEJA</span>
              </div>
          </div>
        )}
        {roleId == 5 && (
        <Row>
          <Col lg="4" md="6" sm="6"> 
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                       <img src={teamwork} alt="Image" className="img-fluid" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">RIL STAFF<sup>(Workers)</sup></p>
                      
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
                          <h5 className="description-header">{rilTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-xs-12 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{rilPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-xs-12">
                        <div className="description-block">
                          <h5 className="description-header">{rilAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="4" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <img src={group} alt="Image" className="img-fluid" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">LORNA STAFF<sup>(Workers)</sup></p>
                      
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
                          <h5 className="description-header">{lornaTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{lornaPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="description-block">
                          <h5 className="description-header">{lornaAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="4" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <img src={unity} alt="Image" className="img-fluid" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">IKEJA STAFF<sup>(Workers)</sup></p>
                      
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
                          <h5 className="description-header">{ikejaTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{ikejaPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="description-block">
                          <h5 className="description-header">{ikejaAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
    )}    

  {/*ikeja operator login*/}

  {(ptype === 'ikeja') && (
      <Row>
        {(ptype === 'ikeja' && ctype === 'BRAID') && (
          <Col lg="8" md="12" sm="12">
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
                          <p style={{  fontSize: '24px'}}>Assigned Zone & Machine</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="row" style={{ textAlign: 'center' }}>
                      <p >
                        <a href="#" className="text-pink">
                          {row1.zone}>>
                        </a><br />
                        <span className="text-grey">{row1.machine}</span>
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
        {(ptype === 'ikeja' && ctype === 'NBRAID') && (
          <Col lg="8" md="12" sm="12">
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
                          <p style={{  fontSize: '24px'}}>Assigned Zone & Machine</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="row" style={{ textAlign: 'center' }}>
                      <p >
                        <a href="#" className="text-pink">
                          {row1.zone}>>
                        </a><br />
                        <span className="text-grey">{row1.machine}</span>
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
        <Col lg="4" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
            <Card className="card-stats">
              <CardBody>
                <Row >
                 
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">IKEJA STAFF<sup>(Workers)</sup></p>
                      
                      <p />
                    </div>
                  </Col>
                   <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <img src={unity} alt="Image" className="img-fluid" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="row">
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{ikejaTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{ikejaPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="description-block">
                          <h5 className="description-header">{ikejaAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
      </Row>
    )}

  {/*ota operator login*/}

  {(ptype === 'ota') && (
      <Row>
        {(ptype === 'ota' && ctype === 'BRAID') && (
          <Col lg="4" md="6" sm="6">
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
                          <p>Assigned Zone & Machine</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="row" style={{ textAlign: 'center' }}>
                      <p >
                        <a href="#" className="text-pink">
                          {row1.zone}>>
                        </a><br />
                        <span className="text-grey">{row1.machine}</span>
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
        {(ptype === 'ota' && ctype === 'NBRAID') && (
          <Col lg="4" md="6" sm="6">
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
                          <p>Assigned Zone & Machine</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="row" style={{ textAlign: 'center' }}>
                      <p >
                        <a href="#" className="text-pink">
                          {row1.zone}>>
                        </a><br />
                        <span className="text-grey">{row1.machine}</span>
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
        <Col lg="4" md="6" sm="6"> 
            <Card className="card-stats">
              <CardBody>
                <Row>
                  
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">RIL STAFF<sup>(Workers)</sup></p>
                      
                      <p />
                    </div>
                  </Col>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                       <img src={teamwork} alt="Image" className="img-fluid" />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="row">
                      <div className="col-sm-4 col-xs-12 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{rilTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-xs-12 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{rilPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4 col-xs-12">
                        <div className="description-block">
                          <h5 className="description-header">{rilAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="4" md="6" sm="6"> {/* Adjusted column size to cover full grid */}
            <Card className="card-stats">
              <CardBody>
                <Row>
                  
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">LORNA STAFF<sup>(Workers)</sup></p>
                      
                      <p />
                    </div>
                  </Col>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <img src={group} alt="Image" className="img-fluid" />
                    </div>
                  </Col>

                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="row">
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{lornaTotalWorker}</h5>
                          <span className="description-text">Total </span>
                        </div>
                      </div>
                      <div className="col-sm-4 border-rights">
                        <div className="description-block">
                          <h5 className="description-header">{lornaPresentWorker}</h5>
                          <span className="description-text">Present</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="description-block">
                          <h5 className="description-header">{lornaAbsentWorker}</h5>
                          <span className="description-text">Absent</span>
                        </div>
                      </div>
                    </div>
              </CardFooter>
            </Card>
          </Col>
      </Row>
    )}


        {roleId == 5 && (
          <Row >

            <div class="col-md-4">
              <div class="single-expense bg-light-info mb-2">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="warning circle"></div>
                    <div class="icon">
                      <i class="fa fa-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">RIL</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{rilTotalOperator}</span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="single-expense bg-light-warning mb-2">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="error circle"></div>
                    <div class="icon">
                      <i class="fa fa-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">LORNA</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{lornaTotalOperator}</span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="single-expense bg-light-primary">
                <div class="d-flex align-items-center">
                  <div class="circle-wrapper">
                    <div class="success circle"></div>
                    <div class="icon">
                      <i class="fa fa-user"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-15 strong">IKEJA</h6>
                    <p class="mb-0 font-13">Operator</p>
                  </div>
                </div>
                <span class="stronger">{ikejaTotalOperator}</span>
              </div>
            </div>
          </Row>
)}

         {roleId == 5 && ( 

           <Row className="mt-4">
          <Col> 
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>OTA</strong></td>
              </tr>
              <tr>
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT</td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT</td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
              </tr>
              <tr>
                <td align="left">Expected: {otaDirectExpectedDay}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {otaIndirectExpectedDay}</td>
                <td align="left">Expected: {otaDirectExpectedNight}</td>
                <td>&nbsp;</td>
              <td align="left">Expected: {otaIndirectExpectedNight}</td>
              </tr>
             <tr>
                <td align="left">Present: {otaDirectPresentDay}</td>
                <td>&nbsp;</td>
              <td align="left">Present: {otaIndirectPresentDay}</td>
                <td align="left">Present: {otaDirectPresentNight}</td>
                <td>&nbsp;</td>
               <td align="left">Present: {otaIndirectPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: {otaDirectAbsentDay}</td>
                <td>&nbsp;</td>
                 <td align="left">Absent: {otaIndirectAbsentDay}</td>
                <td align="left">Absent: {otaDirectAbsentNight}</td>
                <td>&nbsp;</td>
                <td align="left">Absent: {otaIndirectAbsentNight}</td>
              </tr>
            </table>
          
          </Col>
          <Col> 
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>IKEJA</strong></td>
              </tr>
              <tr >
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT </td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT </td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
              </tr>
              <tr>
                <td align="left">Expected: {ikejaDirectExpectedDay}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {ikejaIndirectExpectedDay}</td>
                <td align="left">Expected: {ikejaDirectExpectedNight}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {ikejaIndirectExpectedNight}</td>
              </tr>
              <tr>
                <td align="left">Present: {ikejaDirectPresentDay}</td>
                <td>&nbsp;</td>
              <td align="left">Present: {ikejaIndirectPresentDay}</td>
                <td align="left">Present: {ikejaDirectPresentNight}</td>
                <td>&nbsp;</td>
               <td align="left">Present: {ikejaIndirectPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: {ikejaDirectAbsentDay}</td>
                <td>&nbsp;</td>
                 <td align="left">Absent: {ikejaIndirectAbsentDay}</td>
                <td align="left">Absent: {ikejaDirectAbsentNight}</td>
                <td>&nbsp;</td>
                <td align="left">Absent: {ikejaIndirectAbsentNight}</td>
              </tr>
            </table>
          
                  
          </Col>
        </Row>)}

          {ctype == 'BRAID' && (

           <Row className="mt-4">
          <Col> 
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>IKEJA</strong></td>
              </tr>
              <tr >
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT </td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT </td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
              </tr>
              <tr>
                <td align="left">Expected: {ikejaDirectExpectedDay}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {ikejaIndirectExpectedDay}</td>
                <td align="left">Expected: {ikejaDirectExpectedNight}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {ikejaIndirectExpectedNight}</td>
              </tr>
              <tr>
                <td align="left">Present: {ikejaDirectPresentDay}</td>
                <td>&nbsp;</td>
              <td align="left">Present: {ikejaIndirectPresentDay}</td>
                <td align="left">Present: {ikejaDirectPresentNight}</td>
                <td>&nbsp;</td>
               <td align="left">Present: {ikejaIndirectPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: {ikejaDirectAbsentDay}</td>
                <td>&nbsp;</td>
                 <td align="left">Absent: {ikejaIndirectAbsentDay}</td>
                <td align="left">Absent: {ikejaDirectAbsentNight}</td>
                <td>&nbsp;</td>
                <td align="left">Absent: {ikejaIndirectAbsentNight}</td>
              </tr>
            </table>
          
                  
          </Col>
        </Row>)}

         {ctype == 'NBRAID' && (

           <Row className="mt-4">
          <Col> 
          <table width="100%" border="1" cellspacing="0" className="border-class" id="myDIV">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>OTA</strong></td>
              </tr>
              <tr>
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center'  }}>DAY SHIFT</td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center'  }}>NIGHT SHIFT</td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DIRECT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>INDIRECT</td>
              </tr>
              <tr>
                <td align="left">Expected: {otaDirectExpectedDay}</td>
                <td>&nbsp;</td>
                <td align="left">Expected: {otaIndirectExpectedDay}</td>
                <td align="left">Expected: {otaDirectExpectedNight}</td>
                <td>&nbsp;</td>
              <td align="left">Expected: {otaIndirectExpectedNight}</td>
              </tr>
             <tr>
                <td align="left">Present: {otaDirectPresentDay}</td>
                <td>&nbsp;</td>
              <td align="left">Present: {otaIndirectPresentDay}</td>
                <td align="left">Present: {otaDirectPresentNight}</td>
                <td>&nbsp;</td>
               <td align="left">Present: {otaIndirectPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: {otaDirectAbsentDay}</td>
                <td>&nbsp;</td>
                 <td align="left">Absent: {otaIndirectAbsentDay}</td>
                <td align="left">Absent: {otaDirectAbsentNight}</td>
                <td>&nbsp;</td>
                <td align="left">Absent: {otaIndirectAbsentNight}</td>
              </tr>
            </table>
          
          </Col>
          
        </Row>)}

        
      </div>
    </>
  );
}

export default Dashboard;
