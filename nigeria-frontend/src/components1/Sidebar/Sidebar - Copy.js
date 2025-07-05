import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav, Collapse } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";

import eta from './eta.png'; // Adjust the path as per your project structure

var ps;

function Sidebar(props) {
  const location = useLocation();
  const sidebar = React.useRef();
  const [openSubMenu, setOpenSubMenu] = React.useState(null);
  const [openNestedSubMenu, setOpenNestedSubMenu] = React.useState(null);

  

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
    // Close nested submenu when toggling parent submenu
    setOpenNestedSubMenu(null);
  };

  const toggleNestedSubMenu = (index) => {
    setOpenNestedSubMenu(openNestedSubMenu === index ? null : index);
  };

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  }, []);

  return (
    <div
      className="sidebar"
      data-color={props.bgColor}
      data-active-color={props.activeColor}
    >
      <div className="logo" style={{ textAlign: 'center' }}>
        {/*<a href="#" className="simple-text logo-mini">
          <div className="logo-img">
            <img src={eta} alt="react-logo" />
          </div>
        </a>*/}
        <a href="#" className="simple-text logo-normal">
         <img src={eta} alt="react-logo" style={{ width: '50px' }}/>
        </a>
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {props.routes.map((prop, key) => {
            if (prop.hidden) {
              return null; // Skip rendering this route if it's hidden
            }
            return (
              <li
                className={activeRoute(prop.path) + (prop.pro ? " active-pro" : "")}
                key={key}
              >
                {prop.submenu ? (
                  <>
                    <NavLink
                      to="#"
                      className="nav-link"
                      onClick={() => toggleSubMenu(key)}
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                      <span className="caret" style={{ marginTop: '9px' }}></span>
                    </NavLink>
                   <Collapse isOpen={openSubMenu === key} className={openSubMenu === key ? "open-collapse" : ""}>
                      <Nav>
                        {prop.submenu.map((subItem, subKey) => (
                          <li key={subKey}>
                            {subItem.submenu ? (
                              <>
                                <NavLink
                                  to="#"
                                  className="nav-link"
                                  onClick={() => toggleNestedSubMenu(subKey)}
                                >
                                  <i className={subItem.icon} />
                                  <p>{subItem.name}</p>
                                  <span className="caret" style={{ marginTop: '9px' }}></span>
                                </NavLink>
                                <Collapse isOpen={openNestedSubMenu === subKey}>
                                  <Nav>
                                    {subItem.submenu.map((nestedSubItem, nestedSubKey) => (
                                      <li key={nestedSubKey}>
                                        <NavLink
                                          to={nestedSubItem.layout + nestedSubItem.path}
                                          className="nav-link"
                                          activeClassName="active"
                                        >
                                          <span className="sidebar-mini-icon">{nestedSubItem.icon}</span>
                                          <span className="sidebar-normal">{nestedSubItem.name}</span>
                                        </NavLink>
                                      </li>
                                    ))}
                                  </Nav>
                                </Collapse>
                              </>
                            ) : (
                              <NavLink
                                to={subItem.layout + subItem.path}
                                className="nav-link"
                                activeClassName="active"
                              >
                                <span className="sidebar-mini-icon">{subItem.icon}</span>
                                <span className="sidebar-normal">{subItem.name}</span>
                              </NavLink>
                            )}
                          </li>
                        ))}
                      </Nav>
                    </Collapse>
                  </>
                ) : (
                  <NavLink to={prop.layout + prop.path} className="nav-link" activeClassName="active">
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                )}
              </li>
            );
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
