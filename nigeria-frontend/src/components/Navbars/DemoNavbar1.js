import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
} from "reactstrap";

import routes from "routes.js";
import $ from 'jquery'; 
import axios from 'axios';
import eta from './eta.png'; // Adjust the path as per your project structure
import './Loader.css' // Import the CSS file
//DB Connection
import config from '../../config';

function Header(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dropdownOpen1, setDropdownOpen1] = React.useState(false);
  const [dropdownOpen2, setDropdownOpen2] = React.useState(false);
  const [dropdownOpen3, setDropdownOpen3] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();
  const location = useLocation();
  const [taskCount, setTaskCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const [userdetails, setUserDetails] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [loading, setLoading] = useState(false);
  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("dark");
    }
    setIsOpen(!isOpen);
  };
  const dropdownToggle = (e) => {
    setDropdownOpen(!dropdownOpen);
  };
  const dropdownToggle1 = (e) => {
    setDropdownOpen1(!dropdownOpen1);
  };
  const dropdownToggle2 = (e) => {
    setDropdownOpen2(!dropdownOpen2);
  };
  const dropdownToggle3 = (e) => {
    setDropdownOpen3(!dropdownOpen3);
  };


  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = sessionStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
    // alert(token);

  const getBrand = () => {
  let brandContent;
  if (window.innerWidth >= 768) {
    // Render buttons for larger screens
    brandContent = (
      <>
          <a className="navbar-brand" > <img src="https://mz.3sd.website/video/smart-tv.png" alt="Logo" className="logotv1" /> </a>
            
      </>
    );
  } else {
    // Render image for smaller screens
    brandContent = (
      <img src={eta} alt="Image" className="img-fluid" style={{ width: '80px', height: 'auto' }}/>
    );
  }
  return brandContent;
};
  const openSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    sidebarToggle.current.classList.toggle("toggled");
  };
  // function that adds color dark/transparent to the navbar on resize (this is for the collapse)
  const updateColor = () => {
    if (window.innerWidth < 993 && isOpen) {
      setColor("dark");
    } else {
      setColor("transparent");
    }
  };
  React.useEffect(() => {
    window.addEventListener("resize", updateColor.bind(this));
  });
  React.useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);


  const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');

    // Navigate to the login page
    navigate('/login');
  };


useEffect(() => {

        //get data accuracy
         const updatedFormData = { userid: userid, roleid: roleId };
         const jsonData = JSON.stringify(updatedFormData);
         $.ajax({
           url: `${config.apiUrl}/getdataaccuracy`,
           method: 'POST',
           headers: customHeaders,
           data: jsonData,
           processData: false,
           contentType: 'application/json',
           success: function (response) {
             const { timesheet, date } = response;
             // Update the component state with the timesheet data
             setNotificationCount(timesheet.length);
           },
           error: function (xhr, status, error) {
             console.error('Error:', error);
           },
         });

        const fetchData = async () => {
          try {
            const response = await axios.get(`${config.apiUrl}/getnotificationbellcount`,{headers: customHeaders});
            const data = response.data;
            
            // Ensure data.output is a string and remove trailing comma and space before splitting
            const output = typeof data.output === 'string' 
              ? data.output.trim().replace(/,\s*$/, '').split(', ')
              : [];
              
            setNotifications(output);
            setTaskCount(data.count);
          } catch (error) {
            console.error('Error fetching notification bell count:', error);
          }
        };

      fetchData();
}, []);

const [loadingUserDetails, setLoadingUserDetails] = useState(true);

useEffect(() => {
  setLoadingUserDetails(true);
  $.ajax({
    url: `${config.apiUrl}/getuserbyid/${userid}`,
    method: 'GET',
    headers: customHeaders,
    success: function (response) {
      //alert(JSON.stringify(response));
      setUserDetails(response);
      setLoadingUserDetails(false);
    }
  });
}, [userid]);





 const getAttendance = async () => {
    setLoading(true);
    console.log('Starting getAttendance function');
    
    try {
      const response = await fetch(`${config.apiUrl}/getattendance`, { headers: customHeaders });
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.error('Unauthorized: Redirecting to login');
        navigate('/login'); // Explicitly navigate to login page if unauthorized
        return;
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      if (data === '1') {
        navigate('/admin/attendance/datacomponent');
      } else if (data === '2') {
        alert("No Existing Entry IDs Found.");
      } else {
        alert("Unexpected response: " + JSON.stringify(data));
        navigate('/admin/attendance/sorrycomponent');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert("Error fetching attendance: " + error.message);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

// const getAttendancebraid = () => {
//   setLoading(true);
//   // Make your API call here
//   fetch(`${config.apiUrl}/getattendanceikeja`,{ headers: customHeaders })
//     .then(response => response.json())
//     .then(data => {
//       // Handle the API response data
//       setLoading(false);
//       if (data == 'Yes') {
//         // If 'data' is equal to 'yes', navigate to the '/data' route
//         navigate('/admin/attendance/datacomponent');
//       } else {
//         // If 'data' is not equal to 'yes', navigate to the '/sorry' route
//         navigate('/admin/attendance/sorrycomponent');
//       }


//     })
//     .catch(error => console.error('Error fetching attendance:', error));
// };

  return (
    // add or remove classes depending if we are on full-screen-maps page or not
    <Navbar
      color={
        location.pathname.indexOf("full-screen-maps") !== -1 ? "dark" : color
      }
      expand="lg"
      className={
        location.pathname.indexOf("full-screen-maps") !== -1
          ? "navbar-absolute fixed-top"
          : "navbar-absolute fixed-top " +
            (color === "transparent" ? "navbar-transparent " : "")
      }
    >
      <Container fluid>
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button
              type="button"
              ref={sidebarToggle}
              className="navbar-toggler"
              onClick={() => openSidebar()}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
            
          </div>
          {roleId == 5 && (
          <NavbarBrand href="/">{getBrand()}</NavbarBrand>
           )}
        </div>
        <NavbarToggler onClick={toggle}>
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
        </NavbarToggler>
        <a onClick={() => { navigate('/admin/dashboard'); }} className="btn btn-danger mr-2">
        
        <i className="nc-icon nc-chart-bar-32" aria-hidden="true"></i> Dashboard
      </a>
        <Collapse isOpen={isOpen} navbar className="justify-content-end">
        {/* <a href="/admin/languagechange" className="btn btn-danger mr-2" style={{ margin: '0', padding: '4px', fontSize: '12px' }}>Languages</a> */}
      
          <Nav navbar>
           {/* {roleId == 5 && (
          <Dropdown
              nav
              isOpen={dropdownOpen}
              toggle={(e) => dropdownToggle(e)}
            >
              <DropdownToggle caret nav>
              <i class="fa fa-bell" aria-hidden="true" style={{ color: 'yellow' }}></i>
                
                <span className="badge badge-pill badge-default badge-danger badge-default badge-up">{notificationCount}</span>
              </DropdownToggle>
              <DropdownMenu right>
                
                <DropdownItem tag="a">Data Accuracy <span className="textred">New</span></DropdownItem>
                {notificationCount > 0 && (
                    <li>There are entries with efficiency greater than 150. Please check!</li>
                  )}
                <DropdownItem className="divider"></DropdownItem>
                <DropdownItem ></DropdownItem> 
                <DropdownItem tag={Link} to="/admin/employeetimesheet/dataaccuracy">More Details</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            )} */}
            {/* {roleId == 5 && (
            <Dropdown
              nav
              isOpen={dropdownOpen1}
              toggle={(e) => dropdownToggle1(e)}
            >
            
              <DropdownToggle caret nav>
                <p>
                  <span className="d-lg d-md-block">ETA Settings</span>
                </p>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag={Link} to="/admin/master/shiftmaster">Shift</DropdownItem> 
                <DropdownItem tag={Link} to="/admin/master/workertypemaster">Worker Type</DropdownItem>
                <DropdownItem tag={Link} to="/admin/master/employeerolemaster">Employee Role</DropdownItem>
                <DropdownItem tag={Link} to="/admin/master/itemcategorymaster">Item Category</DropdownItem>
                <DropdownItem tag={Link} to="/admin/master/companysetting">Company Setting</DropdownItem>
                <DropdownItem tag={Link} to="/admin/master/qcmaster">QC Master</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            )} */}
            {/* {roleId == 5 && (
            <Dropdown
              nav
              isOpen={dropdownOpen2}
              toggle={(e) => dropdownToggle2(e)}
            >
              <DropdownToggle caret nav>
                <i class="fa fa-bell" aria-hidden="true" style={{ color: 'white' }}></i>
                <span className="badge badge-pill badge-default badge-danger badge-default badge-up">{taskCount}</span>
              </DropdownToggle>
              <DropdownMenu right>
                
                <DropdownItem tag="a">QC Alert <span className="textred">New</span></DropdownItem>
                <DropdownItem className="divider"></DropdownItem> 
                <DropdownItem >{notifications.map((notification, index) => (
                  <div key={index}>{notification}</div>
                ))}</DropdownItem> 
                <DropdownItem tag={Link} to="/admin/employeetimesheet/employeetimesheetbraidlist">More Details</DropdownItem>
              </DropdownMenu>
            </Dropdown>
             )} */}
             {/*<img src="https://w7.pngwing.com/pngs/1008/377/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-black-hair-computer.png"
        alt="Profile" style={{ width: '50px',borderRadius: '70px' }}/>*/}
        <a href="#" className="btn btn-primary mr-2" style={{ margin: '0', padding: '4px', fontSize: '12px' }} onClick={handleLogout}>Logout</a>
            
            {/* <NavItem>
              <Link to="#pablo" className="nav-link btn-rotate">
                <i className="nc-icon nc-settings-gear-65" />
                <p>
                  <span className="d-lg d-md-block">Account</span>
                </p>
              </Link>
            </NavItem> */}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
