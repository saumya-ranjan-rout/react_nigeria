import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav, Collapse } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";

import eta from './eta.png'; // Adjust the path as per your project structure

import AddEmployeeTimesheetBraid from "views/employeetimesheet/AddEmployeeTimesheetBraid.js";
import AddEmployeeTimesheetBraidIkejaOperator from "views/employeetimesheet/AddEmployeeTimesheetBraidIkejaOperator.js";

var ps;

function Sidebar(props) {
  const location = useLocation();
  const sidebar = React.useRef();
  const [openSubMenu, setOpenSubMenu] = React.useState(null);
  const [openNestedSubMenu, setOpenNestedSubMenu] = React.useState(null);

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

  const toggleSubMenu = (index, event) => {
  event.preventDefault();
  setOpenSubMenu(openSubMenu === index ? null : index);
  // Close nested submenu when toggling parent submenu
  setOpenNestedSubMenu(null);
};

  const toggleNestedSubMenu = (index, event) => {
  event.preventDefault();
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

  // Check if the user's role ID allows access to this route
  if ((roleId === '5' &&  
    (prop.name !== 'TV Display' && prop.name !== 'Media Content Upload')) 
       || (roleId === '6' &&
    (prop.path === '/dashboard' ||
      prop.name === 'Master' ||
            prop.name === 'Data & Reports'
      ) ) || (roleId === '3' &&
      (prop.path === '/dashboard' ||
        prop.name === 'HRM' ||
        prop.name === 'TV Display' ||
         prop.name === 'Employee Timesheet' ||
          prop.name === 'Back Date Entry' ||
           prop.name === 'FGOutput' ||
            prop.name === 'Data & Reports'
       ) )
       || (roleId === '1' &&
        (prop.path === '/dashboard' ||
          prop.name === 'Media Content Upload'
         ) )
  ) {



    if (prop.name === 'Master') {
      // Filter submenu items based on the user's category
      const filteredSubMenu = prop.submenu.filter(subItem => {
        // Include only non-braid reports if the user is in the NBRAID category
        if (roleId === '6') {
          return (
            subItem.name === 'Waste Master' ||
            subItem.name === 'Working Days' ||
            subItem.name === 'Baseline PPP' ||
            subItem.name === 'Monthly Labor Rate'
          );
        }
        if (roleId === '5') {
          return (
            subItem.name === 'Item Category' ||
            subItem.name === 'Item Subcategory' ||
            subItem.name === 'Section' ||
            subItem.name === 'Shift' ||
            subItem.name === 'Worker Type' ||
            subItem.name === 'Employee Role' ||
            subItem.name === 'Item Master' ||
            subItem.name === 'Item Section Target'
          );
        }
        // Include only braid reports if the user is in the BRAID category
       
        // Include all reports if the user is not in either category
        return true;
      });
    
      // Skip rendering the "Data & Reports" menu if there are no submenu items left after filtering
      if (filteredSubMenu.length === 0) {
        return null;
      }
    
      // Render the "Data & Reports" menu with the filtered submenu
      return (
        <li
          className={activeRoute(prop.path) + (prop.pro ? ' active-pro' : '')}
          key={key}
        >
          <NavLink
      to="#"
      className="nav-link"
      onClick={(event) => toggleSubMenu(key, event)}
    >
      <i className={prop.icon} />
      <p>{prop.name}</p>
      <span className="caret" style={{ marginTop: '9px' }}></span>
    </NavLink>
    
          <Collapse isOpen={openSubMenu === key} className={openSubMenu === key ? 'open-collapse' : ''}>
            <Nav>
              {filteredSubMenu.map((subItem, subKey) => (
                <li key={subKey}>
                  {subItem.submenu ? (
                    <>
                      <NavLink
                          to="#"
                          className="nav-link"
                          onClick={(event) => toggleNestedSubMenu(subKey, event)}
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
        </li>
      );
    }

 
    // Check if the menu is "Data & Reports"
if (prop.name === 'Data & Reports') {
  // Filter submenu items based on the user's category
  const filteredSubMenu = prop.submenu.filter(subItem => {
    // Include only non-braid reports if the user is in the NBRAID category
    if (roleId === '5') {
      return (
        subItem.name !== 'Performance Overview Report' &&
        subItem.name !== 'Wastage Report' 
      
      );
    }
    // Include all reports if the user is not in either category
    return true;
  });

  // Skip rendering the "Data & Reports" menu if there are no submenu items left after filtering
  if (filteredSubMenu.length === 0) {
    return null;
  }

  // Render the "Data & Reports" menu with the filtered submenu
  return (
    <li
      className={activeRoute(prop.path) + (prop.pro ? ' active-pro' : '')}
      key={key}
    >
      <NavLink
  to="#"
  className="nav-link"
  onClick={(event) => toggleSubMenu(key, event)}
>
  <i className={prop.icon} />
  <p>{prop.name}</p>
  <span className="caret" style={{ marginTop: '9px' }}></span>
</NavLink>

      <Collapse isOpen={openSubMenu === key} className={openSubMenu === key ? 'open-collapse' : ''}>
        <Nav>
          {filteredSubMenu.map((subItem, subKey) => (
            <li key={subKey}>
              {subItem.submenu ? (
                <>
                  <NavLink
                      to="#"
                      className="nav-link"
                      onClick={(event) => toggleNestedSubMenu(subKey, event)}
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
    </li>
  );
}








// Render other menus as usual
return (
      <li
        className={activeRoute(prop.path) + (prop.pro ? ' active-pro' : '')}
        key={key}
      >
        {prop.submenu ? (
          <>
            <NavLink
  to="#"
  className="nav-link"
  onClick={(event) => toggleSubMenu(key, event)}
>
  <i className={prop.icon} />
  <p>{prop.name}</p>
  <span className="caret" style={{ marginTop: '9px' }}></span>
</NavLink>


            <Collapse isOpen={openSubMenu === key} className={openSubMenu === key ? 'open-collapse' : ''}>
              <Nav>
                {prop.submenu.map((subItem, subKey) => (
                  <li key={subKey}>
                    {subItem.submenu ? (
                      <>
                        <NavLink
                          to="#"
                          className="nav-link"
                          onClick={(event) => toggleNestedSubMenu(subKey, event)}
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
  }

  return null; 
})}


        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;