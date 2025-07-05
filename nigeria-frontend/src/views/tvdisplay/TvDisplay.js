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
import 'bootstrap/dist/css/bootstrap.min.css';
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
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import config from '../../config';
import throttle from 'lodash/throttle';
import Carousel from 'react-bootstrap/Carousel';
import dateUtils from '../../utils/dateUtils';


function TvDisplay() {
  const today = dateUtils.getCurrentDateTime();
    const oneMonthAgo = dateUtils.getOneMonthAgo();
    const formattedToday = dateUtils.getCurrentDateTime("dd-MM-yyyy");
    const formattedOneMonthAgo = dateUtils.getOneMonthAgo("dd-MM-yyyy");
    const dt = dateUtils.getCurrentDateTime("dd-MM-yyyy");
    const { t } = useTranslation();

    const tableRef = useRef(null);
    const videoRef = useRef(null);
    
    const [fgslide, setFGSlide] = useState([]);
    const [pvtslide, setPVTSlide] = useState([]);
    const [iwpppslide, setIWPPPSlide] = useState([]);
    const [mtdpppslide, setMTDPPPSlide] = useState([]);
    const [twslide, setTWSlide] = useState([]);
    const [twmtdslide, setTWMTDSlide] = useState([]);
    const [isActive, setActive] = useState(false);
    const [isSubMenuOpen, setSubMenuOpen] = useState(false);
    const [itemCategories, setItemCategories] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [sections, setSections] = useState([]);
    const [bottomsections, setbottomSections] = useState([]);
    const [allachieversections, setallachieverSections] = useState([]);
    const [id, setid] = useState('');
    const [allemployees, setallemployees] = useState([]);
    const [allabsentemployees, setallabsentemployees] = useState([]);
    const [products, setproducts] = useState([]);
    const [ppp, setppp] = useState([]);
    const [topachievers, settopachievers] = useState([]);
    const [bottomachievers, setbottomachievers] = useState([]);
    const [videoSource, setVideoSource] = useState('');
    const [extension, setextension] = useState('');
    const [nameQuery, setNameQuery] = useState('');
    const [sectionQuery, setSectionQuery] = useState('');
    const [carouselData, setCarouselData] = useState([]);
    const [scrollDirection, setScrollDirection] = useState(1); // 1 for scrolling down, -1 for scrolling up
    const [scrolling, setScrolling] = useState(0);
    const divRef = useRef(null);
    const [intervalId, setIntervalId] = useState(null);
    const [userdetails, setUserDetails] = useState([]);

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(ptype);
     //alert(ctype);

     const handleLogout = () => {
    

      // Clear the session
      sessionStorage.removeItem('isLoggedIn');
  
      // Redirect to the login page
      navigate('/login');
    };

    useEffect(() => {
      // alert("roleId:",roleId);alert("userid:",userid);
   
       $.ajax({
         url:  `${config.apiUrl}/getuserbyid/${userid}`,
         method: 'GET',
         headers: customHeaders,
         success: function (response) {
          // alert(response);
           setUserDetails(response);
         }
       });
     }, [userdetails]);


     useEffect(() => {
      const errorHandler = (e) => {
          if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
             // console.log("krishna:", e.message);
              const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
              const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
              if (resizeObserverErr) {
                 // console.log("krishna1:", e.message);
                  resizeObserverErr.setAttribute('style', 'display: none');
              }
              if (resizeObserverErrDiv) {
                 // console.log("krishna2:", e.message);
                  resizeObserverErrDiv.setAttribute('style', 'display: none');
              }
              // Remove the event listener once the error is handled
              window.removeEventListener('error', errorHandler);
          }
      };
    
      window.addEventListener('error', errorHandler);
    
      // Cleanup function to remove the event listener when component unmounts
      return () => {
          window.removeEventListener('error', errorHandler);
      };
    }, []);


    useEffect(() => {
      const id = setInterval(() => {
        // Write your logic here
      }, 300000); // Interval set to 5 minutes
  
      setIntervalId(id);
  
      return () => {
        clearInterval(intervalId);
      };
    }, []); // Run only once on component mount





   useEffect(() => {
    document.title = 'Tv Display';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      

       $.ajax({
      url:  `${config.apiUrl}/getvideo`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);  
        // const isMp4Video = response.endsWith('.mp4');       
        // Update the state with the video source URL from the response
        const fileExtension = response.split('.').pop();
        setextension(fileExtension);
          // alert(fileExtension);\
         // alert(response);
        setVideoSource(response);                 
      //    alert(response);

      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });


    $.ajax({
      url:  `${config.apiUrl}/gettvdisplaysection?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        setSections(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for bottom achievers
    $.ajax({
      url:  `${config.apiUrl}/gettvdisplaybottomsection?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        setbottomSections(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for all achievers id
    $.ajax({
      url:  `${config.apiUrl}/getid?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        setid(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for all achievers
    $.ajax({
      url:  `${config.apiUrl}/getallachieversection?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        setallachieverSections(response);
        setScrolling(1);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for present employees
    $.ajax({
      url:  `${config.apiUrl}/getpresentemployees?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);
        setallemployees(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for absent employees
    $.ajax({
      url: `${config.apiUrl}/getabsentemployees?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);       
        setallabsentemployees(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for list of products
    $.ajax({
      url: `${config.apiUrl}/getproducts?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);
        setproducts(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for list of products
    $.ajax({
      url: `${config.apiUrl}/getppp?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      processData: false,
      contentType: 'application/json',
      success: function (response) {
        // console.log(response);
        setppp(response.timesheet);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for top achievers sidebar
    $.ajax({
      url: `${config.apiUrl}/gettopachievers?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        settopachievers(response);
       
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });

    // data fetch for bottom achievers sidebar
    $.ajax({
      url: `${config.apiUrl}/getbottomachievers?dt=${dt}&operatorId=${userid}`, // Replace 'your-api-endpoint' with the actual endpoint URL
      method: 'GET',
      headers: customHeaders,
      success: function (response) {
        // console.log(response);        
        setbottomachievers(response);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching section data:', error);
      },
    });
  
    }
  }, [navigate]);



  const filteredAchievers = nameQuery
  ? allachieversections.filter(achiever => {
      const formattedNameQuery = nameQuery.trim().toLowerCase().replace(/\s/g, '');
      const formattedWorker = achiever.worker.trim().toLowerCase().replace(/\s/g, '');
      return formattedWorker.includes(formattedNameQuery);
    })
  : sectionQuery
  ? allachieversections.filter(achiever => {      
      const formattedSectionQuery = sectionQuery.trim().toLowerCase().replace(/\s/g, '');
      const formattedSection = achiever.section_name.trim().toLowerCase().replace(/\s/g, '');
      return formattedSection.includes(formattedSectionQuery);
    })
  : allachieversections; // If no search input is active, show all data

  // console.log(`Name Query: ${nameQuery}`);
  // console.log(`Section Query: ${sectionQuery}`);
  // console.log('Filtered Achievers:', filteredAchievers);
  

  const handleNameInputChange = (e) => {
    setNameQuery(e.target.value);
  };
  
  const handleSectionInputChange = (e) => {
    setSectionQuery(e.target.value);
  };
  


  //const [scrollDirection, setScrollDirection] = useState(1); // 1 for scrolling down, -1 for scrolling up
const tbodyContainerRef = useRef(null);
const scrollIntervalRef = useRef(null);

useEffect(() => {
  const tbodyContainerElement = tbodyContainerRef.current;

  if (!tbodyContainerElement) {
    return; // If tbodyContainerElement is null, return early
  }

  const scrollTbody = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    scrollIntervalRef.current = setInterval(() => {
      if (scrollDirection === 1) {
        tbodyContainerElement.scrollTop += 1;
        if (tbodyContainerElement.scrollTop + tbodyContainerElement.clientHeight >= tbodyContainerElement.scrollHeight) {
          setScrollDirection(-1);
        }
      } else {
        tbodyContainerElement.scrollTop -= 1;
        if (tbodyContainerElement.scrollTop <= 0) {
          setScrollDirection(1);
        }
      }
    }, 70);
  };

  scrollTbody();

  const handleMouseEnter = () => {
    clearInterval(scrollIntervalRef.current);
  };

  const handleMouseLeave = () => {
    scrollTbody();
  };

  tbodyContainerElement.addEventListener('mouseenter', handleMouseEnter);
  tbodyContainerElement.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup event listeners
  return () => {
    clearInterval(scrollIntervalRef.current);
    tbodyContainerElement.removeEventListener('mouseenter', handleMouseEnter);
    tbodyContainerElement.removeEventListener('mouseleave', handleMouseLeave);
  };
}, [scrollDirection,scrolling]);






  // const slides = [
  //   { id: 1, title: 'Slide 1', content: 'Content for Slide 1' },
  //   { id: 2, title: 'Slide 2', content: 'Content for Slide 2' },
  //   { id: 3, title: 'Slide 3', content: 'Content for Slide 3' },
  //   { id: 4, title: 'Slide 4', content: 'Content for Slide 4' },
  // ];

  // Slick slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    // autoplay: true,
    // autoplaySpeed: 5000, 
  };
  

  const h5Style = {
    textAlign: 'center',
    border: '2px solid',
    borderRadius: '5px',
    borderImage: 'linear-gradient(45deg, orange, #8000FF)',
    borderImageSlice: '1',
    padding: '5px',
    backgroundColor: 'white',
  };
  const h6Style = {
    textAlign: 'center',
    border: '2px solid',
    borderRadius: '5px',
    borderImage: 'linear-gradient(45deg, #4CAF50, #D9534F)',
    borderImageSlice: '1',
    padding: '5px',
    backgroundColor: 'white',
    marginBottom: '8px',
  };

  const bgorange = {
    backgroundColor: '#FF9800',
    color: '#fff',
  };
  const bgsky = {
    backgroundColor: '#8000FF',
    color: '#fff',
  };
  const bggreen = {
    backgroundColor: '#4CAF50',
    color: '#fff',
  };
  const bgred = {
    backgroundColor: '#DA5552',
    color: '#fff',
  };
  const inputStyle = {
    backgroundPosition: '10px 10px',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    fontSize: '16px',
    border: '1px solid #ddd',
    marginBottom: '8px',
    padding: '6px',
  };
  const idStyles = {
    height: '700px',
    overflowY: 'hidden',
  };
  

  // useEffect(() => {
  //   if (videoSource) {
  //     const playVideo = () => {
  //       if (videoRef.current) {
  //         videoRef.current.play()
  //           .then(() => {
  //             console.log('Video playback started successfully');
  //           })
  //           .catch((error) => {
  //             console.error('Error starting video playback:', error);
  //           });
  //       } else {
  //         setTimeout(playVideo, 100); // Retry after a short delay
  //       }
  //     };
  //     playVideo(); // Start playback
  //   }
  // }, [videoSource]);



 // Use this useEffect to see the updated state
useEffect(() => {
  //alert('fgslide:' + JSON.stringify(fgslide));
  

    const updatedCarouselData = [
      [
      {
        
        content: (
<div className="container-fluid" style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '850px' }}>
            <div className="row"  style={{ height: '1200px'}}>
              {/* Sidebar */}
              <div className="col-md-3" >
                <div className="sidebarr" >
                <div className="container-fluid">
                   <div className="row">
                    <h5 align="center" className="hh5">{t('TOP ACHIEVERS')}</h5>
                    <hr/>
                    <section>
      <div className="row"> 
    {topachievers.map((topachiever) => (
      <div className="col-md-12" style={{ marginBottom: '10px' }} key={topachiever.sectionName}>
        <div className="card h-100">
          <div className="card-header white-text" style={bggreen}>
            <div className="row">
              <div className="col-md-10">                
              {topachiever.sectionName}
              </div>
              <div className="col-md-2">% </div>
            </div>
          </div>
          <div className="card-block">
            <div className="row">
              <div className="col-md-12">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', align: 'left', paddingLeft: '10px' }}>
                  {topachiever.sectionData.map((dataItem, index) => (
                      <div key={index}>
                        {dataItem.worker}                        
                      </div>
                    ))}
                  </span>
                  <span style={{ fontSize: '20px', color: 'blue', align: 'right' }}>
                  {topachiever.sectionData.map((dataItem, index) => (
                      <div key={index}>                        
                        {dataItem.value_sum}                        
                      </div>
                    ))}
                  </span>
                </div>
              </div>                         
            </div>
          </div>
        </div>
      </div>
      ))}
      </div>
      </section>
      

                    </div>
                    <div className="row">
                    <h5 align="center" className="hh5">{t('BOTTOM ACHIEVERS')}</h5>
                    <hr/>
                   
                    <section>
      <div className="row"> 
    {bottomachievers.map((bottomachiever) => (
      <div className="col-md-12" style={{ marginBottom: '10px' }} key={bottomachiever.sectionName}>
        <div className="card h-100">
          <div className="card-header white-text" style={bgred}>
            <div className="row">
              <div className="col-md-10">                
              {bottomachiever.sectionName}
              </div>
              <div className="col-md-2">% </div>
            </div>
          </div>
          <div className="card-block">
            <div className="row">
              <div className="col-md-12">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', align: 'left', paddingLeft: '10px' }}>
                  {bottomachiever.sectionData.map((dataItem, index) => (
                      <div key={index}>
                        {dataItem.worker}                        
                      </div>
                    ))}
                  </span>
                  <span style={{ fontSize: '20px', color: 'blue', align: 'right' }}>
                  {bottomachiever.sectionData.map((dataItem, index) => (
                      <div key={index}>                        
                        {dataItem.value_sum}                        
                      </div>
                    ))}
                  </span>
                </div>
              </div>                         
            </div>
          </div>
        </div>
      </div>
      ))}
      </div>
      </section>
                  </div>
                </div>
                </div>
              </div>



              {/* Main Content */}
         
              <div className="col-md-7" >
                <div className="cardslides"  style={{ height: '1200px'}}>
                <div className="container" >
                  <div className="row">
                  <h5 align="center" className="hh6">{t('5 TOP ACHIEVERS SECTION-WISE')}</h5>
                  <hr/>
                  <section>  
    <div className="row"> 
    {sections.map((section) => (
      <div className="col-md-4" style={{ marginBottom: '10px'}} key={section.sectionName}>
        <div className="card h-100">
          <div className="card-header white-text" style={bgorange}>
            <div className="row">
              <div className="col-md-10">                
                {section.sectionName}
              </div>
              <div className="col-md-2">% </div>
            </div>
          </div>
          <div className="card-block">
            <div className="row">
              <div className="col-md-12">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '18px', align: 'left', paddingLeft: '10px' }}>
                  {section.sectionData.map((dataItem, index) => (
                      <div key={index} style={{ marginBottom: '10px'}}>
                        {dataItem.worker}                        
                      </div>
                    ))}
                  </span>
                  <span style={{ fontSize: '18px', color: 'blue', align: 'right' }}>
                  {section.sectionData.map((dataItem, index) => (
                      <div key={index} style={{ marginBottom: '10px'}}>                        
                        {dataItem.value_sum}                        
                      </div>
                    ))}
                  </span>
                </div>
              </div>                                                             
            </div>
          </div>
        </div>        
      </div>
    ))}
      </div> 
      </section>
                  </div>
                  <div className="row">
                  <h5 align="center" className="hh6">{t('5 BOTTOM ACHIEVERS SECTION-WISE')}</h5>
                  <hr/>
                  <section>
      <div className="row"> 
    {bottomsections.map((bottomsection) => (
      <div className="col-md-4" style={{ marginBottom: '10px' }} key={bottomsection.sectionName}>
        <div className="card h-100">
          <div className="card-header white-text" style={bgsky}>
            <div className="row">
              <div className="col-md-10">                
              {bottomsection.sectionName}
              </div>
              <div className="col-md-2">% </div>
            </div>
          </div>
          <div className="card-block">
            <div className="row">
              <div className="col-md-12">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '18px', align: 'left', paddingLeft: '10px' }}>
                  {bottomsection.sectionData.map((dataItem, index) => (
                      <div key={index} style={{ marginBottom: '10px'}}>
                        {dataItem.worker}                        
                      </div>
                    ))}
                  </span>
                  <span style={{ fontSize: '18px', color: 'blue', align: 'right' }}>
                  {bottomsection.sectionData.map((dataItem, index) => (
                      <div key={index} style={{ marginBottom: '10px'}}>                        
                        {dataItem.value_sum}                        
                      </div>
                    ))}
                  </span>
                </div>
              </div>                         
            </div>
          </div>
        </div>
      </div>
      ))}
      </div>
      </section>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
       
        content: (
          <div className="container-fluid" style={{ height: '850px'}}>
      <div className="row">
        <div className="col-md-12">
          <div className="cardslides">
            <div className="container">
              <div className="row">
                <h5 align="center" className="hh5">{t('ALL ACHIEVERS SECTION WISE')}</h5>
                <hr/>
              </div>
              <div className="row">
                <div className="col-md-6"><input type="text" id="myInput" className="search"  onKeyUp={handleNameInputChange} placeholder={t('Search For Names...')} title={t('Type in a name')}/></div>
                <div className="col-md-6"><input type="text" id="myInput" className="search"  onKeyUp={handleSectionInputChange} placeholder={t('Search For Sections...')} title={t('Type in a section')}/></div>
              </div>
              <div className="row">
              <div style={{ overflow: 'hidden', height: '700px' }}  ref={tbodyContainerRef}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dddddd' }}>
   
   
              <thead   style={{
            backgroundColor: 'gray',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
                      <tr style={{ backgroundColor: 'gray', color: 'white' }}>
                        <th style={{ borderRight: '1px solid #2e6398' }}>{t('Id')}</th>
                        <th style={{ borderRight: '1px solid #2e6398' }}>{t('Name')}</th>                       
                        <th style={{ borderRight: '1px solid #2e6398' }} hidden>{t('Section')}</th>
                        <th style={{ borderRight: '1px solid #2e6398' }}>{t('Efficiency')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Your table rows go here */}
                      {filteredAchievers.map((filteredAchiever) => (
                        <tr key={filteredAchiever.id} style={{ border: '1px solid #dddddd' }}>
                          <td style={{ borderRight: '1px solid #2e6398' }}><span style={{ fontSize: '20px' }}>{filteredAchiever.entry_id}</span></td>
                          <td style={{ borderRight: '1px solid #2e6398' }}><span style={{ fontSize: '20px' }}>{filteredAchiever.worker}</span></td>
                          <td hidden>{filteredAchiever.section_name}</td>
                          <td style={{ borderRight: '1px solid #2e6398' }}><span style={{ fontSize: '20px' }}>{filteredAchiever.value_sum}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        ),
      },
      {
        
        content: (
          <div className="container-fluid" style={{ height: '850px', overflow: 'auto' }}>
            <div className="cardslides"  
          
            >
             
       
{videoSource && (
  extension === 'mp4' ? (
  
      <video
        style={{
          position: 'absolute',

          objectFit: 'cover',
        }}
        controls
      
        loop
        muted
        autoPlay
      >

        <source src={require(`../../../public/video/${videoSource}`)} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    //   <video
    //   ref={videoRef}
    //   style={{
    //     position: 'absolute',
    //     width: '100%',
    //     height: '100%',
    //     objectFit: 'cover',
    //   }}
    //   controls
    //   muted
    // >
    //   <source src={require(`./video/${videoSource}`)} type="video/mp4" />
    //   Your browser does not support the video tag.
    // </video>

  ) : (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img
        src={require(`../../../public/video/${videoSource}`)}
        alt="Image"
        style={{ width: '1110px', height: '600px' }}
      />
    </div>
  )
  )}

              </div>
          </div>
        ),
      },
      {
       
        content: (
          <div className="container" style={{ height: '850px'}}>
            <div className="cardslides">
              <div className="row">
              {allemployees.map((allemployee) => (
                     <div className="col-md-3">
                    <h5 align="center" className="hh5">{t('Present Employees')}:<span style={{ color: 'green' }}><b>{allemployee.count}</b></span></h5>
                    
                 </div>
                 ))}
                 <div className="col-md-6">
                    <h5 align="center" className="hh5">{t('List of Products produced & PPP')}</h5>
                    
                 </div>
                 <div className="col-md-3">
                    <h5 align="center" className="hh5">{t('Absent Employees')} :<span style={{ color: 'red' }}><b>{allabsentemployees}</b></span></h5>
                    
                 </div>
           </div>
           <div className="row">
                     <div className="col-md-4">
                    <table className="table table-striped dt-responsive nowrap" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ border: '1px solid gray', borderTop: '1px solid gray' }}>
                    <th colSpan="3" align="center">{t('List of Products produced')}</th>
                  </tr>
                  <tr style={{ backgroundColor: 'gray', color: 'white' }}>
                    <th style={{ borderRight: '1px solid #2e6398',borderLeft: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Product_Name')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Target')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Achievement')}</th>
                  </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                  <tr style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }} key={product.itemDescriptionname}>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{product.itemDescriptionname}</td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>
                    {product.sectionData.map((dataItem, index) => (
                      <div key={index}>
                        {dataItem.tar}                        
                      </div>
                    ))}
                    </td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>
                    {product.sectionData.map((dataItem, index) => (
                      <div key={index}>
                        {dataItem.summ}                        
                      </div>
                    ))}
                    </td>
                  </tr> 
                ))} 
                </tbody>
              </table>
                    
                 </div>
                 <div className="col-md-6">
                    <table className="table table-striped dt-responsive nowrap" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ border: '1px solid gray', borderTop: '1px solid gray' }}>
                    <th colSpan="6" align="center">PPP</th>
                  </tr>
                  <tr style={{ backgroundColor: 'gray', color: 'white' }}>
                    <th style={{ borderRight: '1px solid #2e6398',borderLeft: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Product_Name')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Shift')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Fg Output')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('No Of Hours Worked')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>{t('Man Days')}</th>
                    <th style={{ borderRight: '1px solid #2e6398',backgroundColor: 'gray', color: 'white' }}>PPP</th>
                  </tr>
                </thead>
                <tbody>
                {ppp.map((ppp_product) => (
                  <tr style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{ppp_product.item_description}</td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{ppp_product.shift}</td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>
                      <span style={{ color: 'green' }}><b>{ppp_product.sum}</b></span>
                    </td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{ppp_product.count}</td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{ppp_product.mandays}</td>
                    <td style={{ borderRight: '1px solid #2e6398' }}>{ppp_product.reww}</td>
                  </tr> 
                ))}                 
                </tbody>
              </table>
                    
                 </div>
                 
           </div>
                    
              </div>
          </div>
        ),
      },
      
    ]
  ];
    setCarouselData(updatedCarouselData);

}, [fgslide,videoSource,extension,sections,bottomsections,filteredAchievers,products,ppp,allemployees,allabsentemployees]);
 

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
              {carouselData.map((carouselContent, index) => (
<Carousel>
{carouselContent.map((content, contentIndex) => (
      <Carousel.Item interval={900000}>
       {content.content}
        <Carousel.Caption>
        
        </Carousel.Caption>
      </Carousel.Item>
 ) )}
    </Carousel>
    ) )}

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default TvDisplay;
