import React, { useEffect, useRef, useState } from "react"; // Import useState hook
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import DemoNavbar1 from "components/Navbars/DemoNavbar1.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";

import routes from "routes.js";

var ps;

function Dashboard(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const mainPanel = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState("black"); // Initialize useState hook
  const [activeColor, setActiveColor] = useState("info"); // Initialize useState hook

  useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    return () => {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.body.classList.toggle("perfect-scrollbar-on");
      }
    };
  }, []);

  useEffect(() => {
    mainPanel.current.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [location]);

  useEffect(() => {
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleActiveClick = (color) => {
    setActiveColor(color);
  };

  const handleBgClick = (color) => {
    setBackgroundColor(color);
  };

  return (
    <div className="wrapper">
      {/* <Sidebar
        {...props}
        routes={routes}
        roleId={5}
        bgColor={backgroundColor}
        activeColor={activeColor}
      /> */}
      <div className="main-panel" ref={mainPanel}  style={{ width: 'calc(100% - 0px)' }}>
        {/* className="main-panel" */}
        <DemoNavbar1 {...props} />
        <Routes>
          {routes.map((prop, key) => (
            <Route
              path={prop.path}
              element={prop.component}
              key={key}
              exact
            />
          ))}
        </Routes>
        {/* <Footer fluid /> */}
      </div>
      {/* <FixedPlugin
        bgColor={backgroundColor}
        activeColor={activeColor}
        handleActiveClick={handleActiveClick}
        handleBgClick={handleBgClick}
      /> */}
    </div>
  );
}

export default Dashboard;
