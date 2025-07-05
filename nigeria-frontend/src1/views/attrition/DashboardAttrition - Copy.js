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
import axios from 'axios';
import $ from 'jquery';
//DB Connection
import config from '../../config';


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



function DashboardAttrition() {

const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const tableRef = useRef(null);
  //Attendance Dashboard
  const [otabraidTotalWorker, setOtaBraidTotalWorker] = useState([]);
  const [otabraidPresentWorker, setOtaBraidPresentWorker] = useState([]);
  const [otabraidAbsentWorker, setOtaBraidAbsentWorker] = useState([]);
  const [otanbraidTotalWorker, setOtanBraidTotalWorker] = useState([]);
  const [otanbraidPresentWorker, setOtanBraidPresentWorker] = useState([]);
  const [otanbraidAbsentWorker, setOtanBraidAbsentWorker] = useState([]);
  const [ikejabraidTotalWorker, setIkejaBraidTotalWorker] = useState([]);
  const [ikejabraidPresentWorker, setIkejaBraidPresentWorker] = useState([]);
  const [ikejabraidAbsentWorker, setIkejaBraidAbsentWorker] = useState([]);
  const [ikejanbraidTotalWorker, setIkejanBraidTotalWorker] = useState([]);
  const [ikejanbraidPresentWorker, setIkejanBraidPresentWorker] = useState([]);
  const [ikejanbraidAbsentWorker, setIkejanBraidAbsentWorker] = useState([]);
  const [staffCountbraid, setStaffCountbraid] = useState([]);
  const [staffPresentCountbraid, setStaffPresentCountbraid] = useState([]);
  const [staffAbsentCountbraid, setStaffAbsentCountbraid] = useState([]);
  const [contractCountbraid, setContractCountbraid] = useState([]);
  const [contractPresentCountbraid, setContractPresentCountbraid] = useState([]);
  const [contractAbsentCountbraid, setContractAbsentCountbraid] = useState([]);
  const [casualCountbraid, setCasualCountbraid] = useState([]);
  const [casualPresentCountbraid, setCasualPresentCountbraid] = useState([]);
  const [casualAbsentCountbraid, setCasualAbsentCountbraid] = useState([]);
  const [outsourcingCountbraid, setOutsourcingCountbraid] = useState([]);
  const [outsourcingPresentCountbraid, setOutsourcingPresentCountbraid] = useState([]);
  const [outsourcingAbsentCountbraid, setOutsourcingAbsentCountbraid] = useState([]);
  const [staffCountnbraid, setStaffCountnbraid] = useState([]);
  const [staffPresentCountnbraid, setStaffPresentCountnbraid] = useState([]);
  const [staffAbsentCountnbraid, setStaffAbsentCountnbraid] = useState([]);
  const [contractCountnbraid, setContractCountnbraid] = useState([]);
  const [contractPresentCountnbraid, setContractPresentCountnbraid] = useState([]);
  const [contractAbsentCountnbraid, setContractAbsentCountnbraid] = useState([]);
  const [casualCountnbraid, setCasualCountnbraid] = useState([]);
  const [casualPresentCountnbraid, setCasualPresentCountnbraid] = useState([]);
  const [casualAbsentCountnbraid, setCasualAbsentCountnbraid] = useState([]);
  const [outsourcingCountnbraid, setOutsourcingCountnbraid] = useState([]);
  const [outsourcingPresentCountnbraid, setOutsourcingPresentCountnbraid] = useState([]);
  const [outsourcingAbsentCountnbraid, setOutsourcingAbsentCountnbraid] = useState([]);
  const [indirectikeja, setindirectikeja] = useState([]);
  const [indirectota, setindirectota] = useState([]);

  //Attrition Dashboard table
  const [attritionbraid, setattritionbraid] = useState([]);
  const [attritionnbraid, setattritionnbraid] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [totalSection, setTotalSection] = useState(0);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalOperators, setTotalOperators] = useState(0);
  const [categories, setCategories] = useState([]);
  const [otadate, setOtadate] = useState([]);
  const [ikejadate, setIkejadate] = useState([]);
  const [items, setItems] = useState([]);
  
  //table data ota
    const [otaBraidTotalDay, setOtaBraidTotalDay] = useState([]);
    const [otaBraidPresentDay, setOtaBraidPresentDay] = useState([]);         
    const [otaBraidAbsentDay, setOtaBraidAbsentDay] = useState([]); 

    const [otaBraidTotalNight, setOtaBraidTotalNight] = useState([]);      
    const [otaBraidPresentNight, setOtaBraidPresentNight] = useState([]);       
    const [otaBraidAbsentNight, setOtaBraidAbsentNight] = useState([]);

    const [otaNbraidTotalDay, setOtaNbraidTotalDay] = useState([]);      
    const [otaNbraidPresentDay, setOtaNbraidPresentDay] = useState([]);       
    const [otaNbraidAbsentDay, setOtaNbraidAbsentDay] = useState([]);

    const [otaNbraidTotalNight, setOtaNbraidTotalNight] = useState([]);    
    const [otaNbraidPresentNight, setOtaNbraidPresentNight] = useState([]);     
    const [otaNbraidAbsentNight, setOtaNbraidAbsentNight] = useState([]); 
  //table data ikeja 
    const [ikejaBraidTotalDay, setIkejaBraidTotalDay] = useState([]);
    const [ikejaBraidPresentDay, setIkejaBraidPresentDay] = useState([]);         
    const [ikejaBraidAbsentDay, setIkejaBraidAbsentDay] = useState([]); 

    const [ikejaBraidTotalNight, setIkejaBraidTotalNight] = useState([]);      
    const [ikejaBraidPresentNight, setIkejaBraidPresentNight] = useState([]);       
    const [ikejaBraidAbsentNight, setIkejaBraidAbsentNight] = useState([]);

    const [ikejaNbraidTotalDay, setIkejaNbraidTotalDay] = useState([]);      
    const [ikejaNbraidPresentDay, setIkejaNbraidPresentDay] = useState([]);       
    const [ikejaNbraidAbsentDay, setIkejaNbraidAbsentDay] = useState([]);

    const [ikejaNbraidTotalNight, setIkejaNbraidTotalNight] = useState([]);    
    const [ikejaNbraidPresentNight, setIkejaNbraidPresentNight] = useState([]);     
    const [ikejaNbraidAbsentNight, setIkejaNbraidAbsentNight] = useState([]); 


  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
 const token = localStorage.getItem('token');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

const handleLogout = () => {
    

    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Redirect to the login page
    navigate('/login');
  };

 useEffect(() => {
    document.title = 'Dashboard';
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {

      //Attendance
      fetchtotalotabraid();
      fetchpresentotabraid();
      fetchabsentotabraid();
      fetchtotalotanbraid();
      fetchpresentotanbraid();
      fetchabsentotanbraid();

      fetchtotalikejabraid();
      fetchpresentikejabraid();
      fetchabsentikejabraid();
      fetchtotalikejanbraid();
      fetchpresentikejanbraid();
      fetchabsentikejanbraid();


      braid_daywise_active_employees_staff();
      braid_daywise_active_employees_staff_present();
      braid_daywise_active_employees_staff_absent();
   
      braid_daywise_active_employees_contract();
      braid_daywise_active_employees_contract_present();
      braid_daywise_active_employees_contract_absent();
   
      braid_daywise_active_employees_casual();
      braid_daywise_active_employees_casual_present();
      braid_daywise_active_employees_casual_absent();
  
      braid_daywise_active_employees_outsourcing();
      braid_daywise_active_employees_outsourcing_present();
      braid_daywise_active_employees_outsourcing_absent();

      nbraid_daywise_active_employees_staff();
      nbraid_daywise_active_employees_staff_present();
      nbraid_daywise_active_employees_staff_absent();
   
      nbraid_daywise_active_employees_contract();
      nbraid_daywise_active_employees_contract_present();
      nbraid_daywise_active_employees_contract_absent();
   
      nbraid_daywise_active_employees_casual();
      nbraid_daywise_active_employees_casual_present();
      nbraid_daywise_active_employees_casual_absent();
   
      nbraid_daywise_active_employees_outsourcing();
      nbraid_daywise_active_employees_outsourcing_present();
      nbraid_daywise_active_employees_outsourcing_absent();

      fetchindirectikeja();
      fetchindirectota();
      
      //Attrition
      fetchattritionbraid();
      fetchattritionNbraid();

      // Fetch data from the server API
      fetchTotalItem();
      
      fetchcountitems();
      fetchotadate();
      fetchikejadate();
      
      //table data ota
      ota_braid_total_day();
      ota_braid_total_present_day();
      ota_braid_total_absent_day();

      ota_braid_total_night();
      ota_braid_total_present_night();
      ota_braid_total_absent_night();

      ota_nbraid_total_day();
      ota_nbraid_total_present_day();
      ota_nbraid_total_absent_day();

      ota_nbraid_total_night();
      ota_nbraid_total_present_night();
      ota_nbraid_total_absent_night();

      //table data ikeja
      ikeja_braid_total_day();
      ikeja_braid_total_present_day();
      ikeja_braid_total_absent_day();

      ikeja_braid_total_night();
      ikeja_braid_total_present_night();
      ikeja_braid_total_absent_night();

      ikeja_nbraid_total_day();
      ikeja_nbraid_total_present_day();
      ikeja_nbraid_total_absent_day();

      ikeja_nbraid_total_night();
      ikeja_nbraid_total_present_night();
      ikeja_nbraid_total_absent_night();

    
      //initialize datatable
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          // Destroy the existing DataTable instance
          $('#example').DataTable().destroy();
        }

        // Create the new DataTable instance
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
        });
      });
    }
  }, []);


  //Attendance Dashboard

  const fetchtotalotabraid = async () => {
          try {
              const response = await axios.get(`${config.apiUrl}/fetchtotalotabraid`,{ headers: customHeaders });
              const data = response.data[0];
              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
              setOtaBraidTotalWorker(data.totalWorkerCount);
              //alert('IKEJA Date: ' + data.totalWorkerCount); // Display an alert with the fetched date
             
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

          const fetchpresentotabraid = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/fetchpresentotabraid`,{ headers: customHeaders });
                const data = response.data[0];
                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                setOtaBraidPresentWorker(data.totalPresentCount);
                //alert('IKEJA Date: ' + data.totalPresentCountate); // Display an alert with the fetched date
               
              } catch (error) {
                console.error('Error fetching category items:', error);
              }
            };

            const fetchabsentotabraid = async () => {
              try {
                  const response = await axios.get(`${config.apiUrl}/fetchabsentotabraid`,{ headers: customHeaders });
                  const data = response.data[0];
                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                  setOtaBraidAbsentWorker(data.totalAbsentCount);
                  //alert('IKEJA Date: ' + data.totalAbsentCountate); // Display an alert with the fetched date
                 
                } catch (error) {
                  console.error('Error fetching category items:', error);
                }
              };

         const fetchtotalotanbraid = async () => {
          try {
              const response = await axios.get(`${config.apiUrl}/fetchtotalotanbraid`,{ headers: customHeaders });
              const data = response.data[0];
              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
              setOtanBraidTotalWorker(data.totalWorkerCount);
              //alert('IKEJA Date: ' + data.totalWorkerCount); // Display an alert with the fetched date
             
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

          const fetchpresentotanbraid = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/fetchpresentotanbraid`,{ headers: customHeaders });
                const data = response.data[0];
                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                setOtanBraidPresentWorker(data.totalPresentCount);
                //alert('IKEJA Date: ' + data.totalPresentCountate); // Display an alert with the fetched date
               
              } catch (error) {
                console.error('Error fetching category items:', error);
              }
            };

            const fetchabsentotanbraid = async () => {
              try {
                  const response = await axios.get(`${config.apiUrl}/fetchabsentotanbraid`,{ headers: customHeaders });
                  const data = response.data[0];
                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                  setOtanBraidAbsentWorker(data.totalAbsentCount);
                  //alert('IKEJA Date: ' + data.totalAbsentCountate); // Display an alert with the fetched date
                 
                } catch (error) {
                  console.error('Error fetching category items:', error);
                }
              };

   const fetchtotalikejabraid = async () => {
          try {
              const response = await axios.get(`${config.apiUrl}/fetchtotalikejabraid`,{ headers: customHeaders });
              const data = response.data[0];
              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
              setIkejaBraidTotalWorker(data.totalWorkerCount);
              //alert('IKEJA Date: ' + data.totalWorkerCount); // Display an alert with the fetched date
             
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

          const fetchpresentikejabraid = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/fetchpresentikejabraid`,{ headers: customHeaders });
                const data = response.data[0];
                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                setIkejaBraidPresentWorker(data.totalPresentCount);
                //alert('IKEJA Date: ' + data.totalPresentCountate); // Display an alert with the fetched date
               
              } catch (error) {
                console.error('Error fetching category items:', error);
              }
            };

            const fetchabsentikejabraid = async () => {
              try {
                  const response = await axios.get(`${config.apiUrl}/fetchabsentikejabraid`,{ headers: customHeaders });
                  const data = response.data[0];
                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                  setIkejaBraidAbsentWorker(data.totalAbsentCount);
                  //alert('IKEJA Date: ' + data.totalAbsentCountate); // Display an alert with the fetched date
                 
                } catch (error) {
                  console.error('Error fetching category items:', error);
                }
              };

         const fetchtotalikejanbraid = async () => {
          try {
              const response = await axios.get(`${config.apiUrl}/fetchtotalikejanbraid`,{ headers: customHeaders });
              const data = response.data[0];
              //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
              setIkejanBraidTotalWorker(data.totalWorkerCount);
              //alert('IKEJA Date: ' + data.totalWorkerCount); // Display an alert with the fetched date
             
            } catch (error) {
              console.error('Error fetching total workers:', error);
            }
          };

          const fetchpresentikejanbraid = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/fetchpresentikejanbraid`,{ headers: customHeaders });
                const data = response.data[0];
                //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                setIkejanBraidPresentWorker(data.totalPresentCount);
                //alert('IKEJA Date: ' + data.totalPresentCountate); // Display an alert with the fetched date
               
              } catch (error) {
                console.error('Error fetching category items:', error);
              }
            };

            const fetchabsentikejanbraid = async () => {
              try {
                  const response = await axios.get(`${config.apiUrl}/fetchabsentikejanbraid`,{ headers: customHeaders });
                  const data = response.data[0];
                  //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
                  setIkejanBraidAbsentWorker(data.totalAbsentCount);
                  //alert('IKEJA Date: ' + data.totalAbsentCountate); // Display an alert with the fetched date
                 
                } catch (error) {
                  console.error('Error fetching category items:', error);
                }
              }; 



  const fetchTotalItem = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/dashbord_total_item`,{ headers: customHeaders });
      const data = response.data;
      setTotalItem(data.totalItem);
    } catch (error) {
      console.error('Error fetching total item:', error);
    }
  };


  const fetchcountitems = async () => {
    try {
        const response = await axios.get(`${config.apiUrl}/icf`,{ headers: customHeaders });
        const data = response.data;
        setCategories(data.categories);
        setItems(data.totalItems);
      } catch (error) {
        console.error('Error fetching category items:', error);
      }
    };

    const fetchotadate = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/otadate`,{ headers: customHeaders });
          const data = response.data[0];
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOtadate(data.date);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

      const fetchikejadate = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/ikejadate`,{ headers: customHeaders });
            const data = response.data[0];
            //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
            setIkejadate(data.date);
            //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
           
          } catch (error) {
            console.error('Error fetching dates:', error);
          }
        };

       

                                //table ota data fetch

                                //fetch ota braid day

                                const ota_braid_total_day = async () => {
                                  try {
                                      const response = await axios.get(`${config.apiUrl}/ota_braid_total_day`,{ headers: customHeaders });
                                      const data = response.data;
                                     
                                      setOtaBraidTotalDay(data.totalEmployees);
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected day:', error);
                                    }
                                  };

                                  const ota_braid_total_present_day = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_braid_total_present_day`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setOtaBraidPresentDay(data.presentEmployees);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present day:', error);
                                      }
                                    };

                                    const ota_braid_total_absent_day = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ota_braid_total_absent_day`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setOtaBraidAbsentDay(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent day:', error);
                                        }
                                      };

                                  //fetch ota braid night

                                  const ota_braid_total_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_braid_total_night`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setOtaBraidTotalNight(data.totalEmployees);
                                        
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected day:', error);
                                      }
                                    };

                                  const ota_braid_total_present_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_braid_total_present_night`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setOtaBraidPresentNight(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present day:', error);
                                      }
                                    };

                                    const ota_braid_total_absent_night = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ota_braid_total_absent_night`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setOtaBraidAbsentNight(data.absentEmployees);
                                          
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent day:', error);
                                        }
                                      };

                                //fetch ota nbraid day

                                const ota_nbraid_total_day = async () => {
                                  try {
                                      const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_day`,{ headers: customHeaders });
                                      const data = response.data;
                                      
                                      setOtaNbraidTotalDay(data.totalEmployees);
                                      
                                     
                                    } catch (error) {
                                      console.error('Error fetching ota direct expected night:', error);
                                    }
                                  };

                                  const ota_nbraid_total_present_day = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_present_day`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setOtaNbraidPresentDay(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota direct present night:', error);
                                      }
                                    };

                                    const ota_nbraid_total_absent_day = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_absent_day`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setOtaNbraidAbsentDay(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota direct absent night:', error);
                                        }
                                      };

                                  //fetch ota nbraid night

                                  const ota_nbraid_total_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_night`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setOtaNbraidTotalNight(data.totalEmployees);
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ota indirect expected night:', error);
                                      }
                                    };

                                  const ota_nbraid_total_present_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_present_night`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setOtaNbraidPresentNight(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ota indirect present night:', error);
                                      }
                                    };

                                    const ota_nbraid_total_absent_night = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ota_nbraid_total_absent_night`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setOtaNbraidAbsentNight(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ota indirect absent night:', error);
                                        }
                                      };

                              //table ikeja data fetch

                               //fetch ikeja braid day

                                const ikeja_braid_total_day = async () => {
                                  try {
                                      const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_day`,{ headers: customHeaders });
                                      const data = response.data;
                                     
                                      setIkejaBraidTotalDay(data.totalEmployees);
                                     
                                     
                                    } catch (error) {
                                      console.error('Error fetching ikeja direct expected day:', error);
                                    }
                                  };

                                  const ikeja_braid_total_present_day = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_present_day`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setIkejaBraidPresentDay(data.presentEmployees);
                                       
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present day:', error);
                                      }
                                    };

                                    const ikeja_braid_total_absent_day = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_absent_day`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setIkejaBraidAbsentDay(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent day:', error);
                                        }
                                      };

                                  //fetch ikeja braid night

                                  const ikeja_braid_total_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_night`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setIkejaBraidTotalNight(data.totalEmployees);
                                        
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected day:', error);
                                      }
                                    };

                                  const ikeja_braid_total_present_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_present_night`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setIkejaBraidPresentNight(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present day:', error);
                                      }
                                    };

                                    const ikeja_braid_total_absent_night = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ikeja_braid_total_absent_night`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setIkejaBraidAbsentNight(data.absentEmployees);
                                          
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent day:', error);
                                        }
                                      };

                                //fetch ikeja nbraid day

                                const ikeja_nbraid_total_day = async () => {
                                  try {
                                      const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_day`,{ headers: customHeaders });
                                      const data = response.data;
                                      
                                      setIkejaNbraidTotalDay(data.totalEmployees);
                                      
                                     
                                    } catch (error) {
                                      console.error('Error fetching ikeja direct expected night:', error);
                                    }
                                  };

                                  const ikeja_nbraid_total_present_day = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_present_day`,{ headers: customHeaders });
                                        const data = response.data;
                                        
                                        setIkejaNbraidPresentDay(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja direct present night:', error);
                                      }
                                    };

                                    const ikeja_nbraid_total_absent_day = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_absent_day`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setIkejaNbraidAbsentDay(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja direct absent night:', error);
                                        }
                                      };

                                  //fetch ikeja nbraid night

                                  const ikeja_nbraid_total_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_night`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setIkejaNbraidTotalNight(data.totalEmployees);
                                       
                                      
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect expected night:', error);
                                      }
                                    };

                                  const ikeja_nbraid_total_present_night = async () => {
                                    try {
                                        const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_present_night`,{ headers: customHeaders });
                                        const data = response.data;
                                       
                                        setIkejaNbraidPresentNight(data.presentEmployees);
                                        
                                       
                                      } catch (error) {
                                        console.error('Error fetching ikeja indirect present night:', error);
                                      }
                                    };

                                    const ikeja_nbraid_total_absent_night = async () => {
                                      try {
                                          const response = await axios.get(`${config.apiUrl}/ikeja_nbraid_total_absent_night`,{ headers: customHeaders });
                                          const data = response.data;
                                          
                                          setIkejaNbraidAbsentNight(data.absentEmployees);
                                         
                                         
                                        } catch (error) {
                                          console.error('Error fetching ikeja indirect absent night:', error);
                                        }
                                      };



const braid_daywise_active_employees_staff = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_staff`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };


 const braid_daywise_active_employees_staff_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_staff_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffPresentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const braid_daywise_active_employees_staff_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_staff_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffAbsentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 


  const braid_daywise_active_employees_contract = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_contract`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const braid_daywise_active_employees_contract_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_contract_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractPresentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const braid_daywise_active_employees_contract_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_contract_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractAbsentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };   

  const braid_daywise_active_employees_casual = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_casual`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const braid_daywise_active_employees_casual_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_casual_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualPresentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const braid_daywise_active_employees_casual_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_casual_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualAbsentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };   
      
  const braid_daywise_active_employees_outsourcing = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_outsourcing`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const braid_daywise_active_employees_outsourcing_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_outsourcing_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingPresentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const braid_daywise_active_employees_outsourcing_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/braid_daywise_active_employees_outsourcing_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingAbsentCountbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };  


const nbraid_daywise_active_employees_staff = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_staff`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const nbraid_daywise_active_employees_staff_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_staff_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffPresentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const nbraid_daywise_active_employees_staff_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_staff_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setStaffAbsentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 


  const nbraid_daywise_active_employees_contract = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_contract`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const nbraid_daywise_active_employees_contract_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_contract_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractPresentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const nbraid_daywise_active_employees_contract_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_contract_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setContractAbsentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };   

  const nbraid_daywise_active_employees_casual = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_casual`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const nbraid_daywise_active_employees_casual_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_casual_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualPresentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const nbraid_daywise_active_employees_casual_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_casual_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setCasualAbsentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };   
      
  const nbraid_daywise_active_employees_outsourcing = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_outsourcing`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

 const nbraid_daywise_active_employees_outsourcing_present = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_outsourcing_present`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingPresentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 
      
  const nbraid_daywise_active_employees_outsourcing_absent = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/nbraid_daywise_active_employees_outsourcing_absent`,{ headers: customHeaders });
          const data = response.data;
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setOutsourcingAbsentCountnbraid(data.totalEmployeeCount);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      }; 





   const fetchindirectikeja = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/fetchindirectikeja`,{ headers: customHeaders });
          const data = response.data[0];
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setindirectikeja(data.count);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

      const fetchindirectota = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/fetchindirectota`,{ headers: customHeaders });
            const data = response.data[0];
            //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
            setindirectota(data.count);
            //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
           
          } catch (error) {
            console.error('Error fetching dates:', error);
          }
        };                                        


  //Attrition table
  
  const fetchattritionbraid = async () => {
      try {
          const response = await axios.get(`${config.apiUrl}/fetchattritionbraid`,{ headers: customHeaders });
          const data = response.data[0];
          //alert('Ota Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
          setattritionbraid(data.count);
          //alert('OTA Date: ' + data.date); // Display an alert with the fetched date
        
        } catch (error) {
          console.error('Error fetching dates:', error);
        }
      };

      const fetchattritionNbraid = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/fetchattritionNbraid`,{ headers: customHeaders });
            const data = response.data[0];
            //alert('Ikeja Date Data:' + JSON.stringify(data, null, 2)); // Log the fetched data
            setattritionnbraid(data.count);
            //alert('IKEJA Date: ' + data.date); // Display an alert with the fetched date
           
          } catch (error) {
            console.error('Error fetching dates:', error);
          }
        };                                    
                      

  const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' });
  const parts = date.split('/');
  const formattedDay = parts[0].padStart(2, '0');
  const formattedMonth = parts[1].padStart(2, '0');
  const year = parts[2];
  const date1 = `${formattedDay}-${formattedMonth}-${year}`;
  const mon = `${formattedMonth}-${year}`;



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
             <div style={{ textAlign: 'center' }}>
            <span>Attendance Showing: </span>
            <span class="textgreen">Date: {otadate} </span>for <span class="textblue">OTA</span> 
            <span> and </span>
            <span class="textgreen">Date: {ikejadate}</span> for  <span class="textblue">IKEJA</span>
            </div>
               

                 <div class="  bg-blue-subtle text-white rounded">
                    <h4 style={{ textAlign: 'center' }}>Attendance Dashboard</h4>    
                  </div>
              
                  <div>

                   <div className="mt-4 row">
                       <div className="col-md-3">
                            <div class="cardatt">
                              <div class="cardatt-header1">
                                OTA(Braid)
                              </div>
                              <div class="cardatt-body">
                                 <div class="py-3">
                                         <div class="d-flex align-items-center gy-3 ">
                                            <p class="text-muted mb-0 me-2">Total:    <span class="badge bg-info-subtle text-info fs-12">{otabraidTotalWorker}</span></p>
                                           
                                        </div>
                                        <div class="row mt-1">
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Present</p>
                                                    <div class="badge bg-success-subtle text-success fs-12">{otabraidPresentWorker}</div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Absent</p>
                                                   <div class="badge bg-danger-subtle text-danger fs-12">{otabraidAbsentWorker}</div>
                                                </div>
                                            </div>
                                        </div>

                                       
                                    </div>
                                </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div class="cardatt">
                                <div class="cardatt-header2">
                                  OTA(Non Braid)
                                </div>
                                <div class="cardatt-body">
                                  <div class="py-3">
                                         <div class="d-flex align-items-center gy-3 ">
                                            <p class="text-muted mb-0 me-2">Total:    <span class="badge bg-info-subtle text-info fs-12">{otanbraidTotalWorker}</span></p>
                                           
                                        </div>
                                        <div class="row mt-1">
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Present</p>
                                                    <div class="badge bg-success-subtle text-success fs-12">{otanbraidPresentWorker}</div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Absent</p>
                                                   <div class="badge bg-danger-subtle text-danger fs-12">{otanbraidAbsentWorker}</div>
                                                </div>
                                            </div>
                                        </div>

                                       
                                    </div>
                                  </div>
                                </div>
                           </div>
                           <div className="col-md-3">
                               <div class="cardatt">
                                  <div class="cardatt-header3">
                                    IKEJA(Braid)
                                  </div>
                                  <div class="cardatt-body">
                                    <div class="py-3">
                                        <div class="d-flex align-items-center gy-3 ">
                                            <p class="text-muted mb-0 me-2">Total:    <span class="badge bg-info-subtle text-info fs-12">{ikejabraidTotalWorker}</span></p>
                                           
                                        </div>
                                        <div class="row mt-1">
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Present</p>
                                                    <div class="badge bg-success-subtle text-success fs-12">{ikejabraidPresentWorker}</div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Absent</p>
                                                   <div class="badge bg-danger-subtle text-danger fs-12">{ikejabraidAbsentWorker}</div>
                                                </div>
                                            </div>
                                        </div>

                                       
                                    </div>
                                  </div>
                                </div>
                           </div>
                           <div className="col-md-3">
                                <div class="cardatt">
                                  <div class="cardatt-header4">
                                    IKEJA(Non Braid)
                                  </div>
                                  <div class="cardatt-body">
                                    <div class="py-3">
                                         <div class="d-flex align-items-center gy-3 ">
                                            <p class="text-muted mb-0 me-2">Total:    <span class="badge bg-info-subtle text-info fs-12">{ikejanbraidTotalWorker}</span></p>
                                           
                                        </div>
                                        <div class="row mt-1">
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Present</p>
                                                    <div class="badge bg-success-subtle text-success fs-12">{ikejanbraidPresentWorker}</div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div>
                                                    <p class="text-muted mb-1">Absent</p>
                                                   <div class="badge bg-danger-subtle text-danger fs-12">{ikejanbraidAbsentWorker}</div>
                                                </div>
                                            </div>
                                        </div>

                                       
                                    </div>
                    </div>
                  </div>
             </div>
          </div>       
        <div className='row'>
          <div className="col-md-6">
            <table width="100%" border="1" cellspacing="0" className="border-class">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>OTA</strong></td>
              </tr>
              <tr>
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center' }} >BRAID</td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center' }} >NBRAID</td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DAY</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>NIGHT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DAY</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>NIGHT</td>
              </tr>
              <tr>
                <td align="left">Expected: </td>
                <td style={{ textAlign: 'center' }}>{otaBraidTotalDay}</td>
                <td align="left" style={{ textAlign: 'center' }}> {otaBraidTotalNight}</td>
                <td align="left">Expected: </td>
                <td style={{ textAlign: 'center' }} >{otaNbraidTotalDay}</td>
              <td align="left" style={{ textAlign: 'center' }}>{otaNbraidTotalNight}</td>
              </tr>
             <tr>
                <td align="left">Present: </td>
                <td style={{ textAlign: 'center' }}>{otaBraidPresentDay}</td>
              <td align="left" style={{ textAlign: 'center' }}> {otaBraidPresentNight}</td>
                <td align="left">Present: </td>
                <td style={{ textAlign: 'center' }}>{otaNbraidPresentDay}</td>
               <td align="left" style={{ textAlign: 'center' }}>{otaNbraidPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: </td>
                <td style={{ textAlign: 'center' }}>{otaBraidAbsentDay}</td>
                 <td align="left" style={{ textAlign: 'center' }}> {otaBraidAbsentNight}</td>
                <td align="left">Absent: </td>
                <td style={{ textAlign: 'center' }}>{otaNbraidAbsentDay}</td>
                <td align="left" style={{ textAlign: 'center' }}>{otaNbraidAbsentNight}</td>
              </tr>
            </table>
          
          </div>
          <div className="col-md-6">
            <table width="100%" border="1" cellspacing="0" className="border-class">
              <tr style={{ backgroundColor: '#fbc02d' }}>
                <td colspan="6" align="center" style={{ textAlign: 'center' }}><strong>IKEJA</strong></td>
              </tr>
              <tr >
                <td colspan="3" align="center" style={{ backgroundColor: '#e57373', textAlign: 'center' }}>BRAID</td>
                <td colspan="3" align="center" style={{ backgroundColor: '#0097a7', textAlign: 'center' }}>NBRAID</td>
              </tr>
              <tr style={{ backgroundColor: '#b0bec5' }}>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DAY</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>NIGHT</td>
                <td width="2%">&nbsp;</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>DAY</td>
                <td width="24%" align="center" style={{ textAlign: 'center' }}>NIGHT</td>
              </tr>
               <tr>
                <td align="left">Expected: </td>
                <td style={{ textAlign: 'center' }}>{ikejaBraidTotalDay}</td>
                <td align="left" style={{ textAlign: 'center' }}> {ikejaBraidTotalNight}</td>
                <td align="left">Expected: </td>
                <td style={{ textAlign: 'center' }}>{ikejaNbraidTotalDay}</td>
              <td align="left" style={{ textAlign: 'center' }}>{ikejaNbraidTotalNight}</td>
              </tr>
             <tr>
                <td align="left">Present: </td>
                <td style={{ textAlign: 'center' }}>{ikejaBraidPresentDay}</td>
              <td align="left" style={{ textAlign: 'center' }}>{ikejaBraidPresentNight}</td>
                <td align="left">Present: </td>
                <td style={{ textAlign: 'center' }}>{ikejaNbraidPresentDay}</td>
               <td align="left" style={{ textAlign: 'center' }}>{ikejaNbraidPresentNight}</td>
              </tr>
              <tr>
                <td align="left">Absent: </td>
                <td style={{ textAlign: 'center' }}>{ikejaBraidAbsentDay}</td>
                 <td align="left" style={{ textAlign: 'center' }}>{ikejaBraidAbsentNight}</td>
                <td align="left">Absent: </td>
                <td style={{ textAlign: 'center' }}>{ikejaNbraidAbsentDay}</td>
                <td align="left" style={{ textAlign: 'center' }}>{ikejaNbraidAbsentNight}</td>
              </tr>
            </table>
          
                  
          </div>
          </div>

              <div className="mt-4 row">
                <div class="col-md-6">

                <table width="100%" border="1" cellspacing="0" className="border-class">
                          <tr>
                        <td colspan="4" style={{ textAlign: 'center' }}><strong>EMPLOYEES BREAKDOWN BY CATEGORY - BRAID</strong></td>
                    </tr>
                         
                    <tr>
                        <th>TYPE</th>
                        <th>ACTIVE</th>
                        <th>PRESENT</th>
                        <th>ABSENT</th>
                    </tr>
                    <tr>
                        <td>STAFF</td>
                        <td>{staffCountbraid}</td>
                        <td>{staffPresentCountbraid}</td>
                        <td>{staffAbsentCountbraid}</td>
                    </tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>{contractCountbraid}</td>
                        <td>{contractPresentCountbraid}</td>
                        <td>{contractAbsentCountbraid}</td>
                    </tr>
                    <tr>
                        <td>CASUAL</td>
                        <td>{casualCountbraid}</td>
                        <td>{casualPresentCountbraid}</td>
                        <td>{casualAbsentCountbraid}</td>
                    </tr>
                    <tr>
                        <td>OUTSOURCE</td>
                        <td>{outsourcingCountbraid}</td>
                        <td>{outsourcingPresentCountbraid}</td>
                        <td>{outsourcingAbsentCountbraid}</td>
                    </tr>
                </table>
                </div>
                <div class="col-md-6">
                <table width="100%" border="1" cellspacing="0" className="border-class">
                          <tr>
                        <td colspan="4" style={{ textAlign: 'center' }}><strong>EMPLOYEES BREAKDOWN BY CATEGORY - NON BRAID</strong></td>
                    </tr>
                         
                    <tr>
                        <th>TYPE</th>
                        <th>ACTIVE</th>
                        <th>PRESENT</th>
                        <th>ABSENT</th>
                    </tr>
                     <tr>
                        <td>STAFF</td>
                        <td>{staffCountnbraid}</td>
                        <td>{staffPresentCountnbraid}</td>
                        <td>{staffAbsentCountnbraid}</td>
                    </tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>{contractCountnbraid}</td>
                        <td>{contractPresentCountnbraid}</td>
                        <td>{contractAbsentCountnbraid}</td>
                    </tr>
                    <tr>
                        <td>CASUAL</td>
                        <td>{casualCountnbraid}</td>
                        <td>{casualPresentCountnbraid}</td>
                        <td>{casualAbsentCountnbraid}</td>
                    </tr>
                    <tr>
                        <td>OUTSOURCE</td>
                        <td>{outsourcingCountnbraid}</td>
                        <td>{outsourcingPresentCountnbraid}</td>
                        <td>{outsourcingAbsentCountnbraid}</td>
                    </tr>
                </table>
                </div>

              </div>     




              <div className="mt-4 row">
                  <div className="col-4">
                    <table width="100%" border="1" cellspacing="0" className="border-class">
                      <tr>
                        <td colspan="2" style={{ textAlign: 'center' }}><strong>INDIRECT EMPLOYEE</strong></td>
                      </tr>
                      <tr>
                        <th>SITE</th>
                        <th>TOTAL</th>
                      </tr>
                      <tr>
                        <td>IKEJA</td>
                        <td>{indirectikeja}</td>
                      </tr>
                      <tr>
                        <td>OTA</td>
                        <td>{indirectota}</td>
                      </tr>
                    </table>
                  </div>
                </div>



              <div className="mt-4 bg-green-subtle text-white rounded">
                <h4 style={{ textAlign: 'center' }}>Attrition Dashboard</h4>    
              </div>

              <div className="mt-4 mb-4 row">
                <div className="col-4">
                  <table width="100%" border="1" cellspacing="0" className="border-class">
                    <tr>
                      <td colspan="2" style={{ textAlign: 'center' }}><strong>ATTRITION - MTD</strong> ({mon})</td>
                    </tr>
                    <tr>
                      <th>CATEGORY</th>
                      <th>TOTAL</th>
                    </tr>
                    <tr>
                      <td>BRAID(ikeja)</td>
                      <td>{attritionbraid}</td>
                    </tr>
                    <tr>
                      <td>NON BRAID(ota)</td>
                      <td>{attritionnbraid}</td>
                    </tr>
                  </table>
                </div>
              </div>


              </div>
                
      
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default DashboardAttrition;
