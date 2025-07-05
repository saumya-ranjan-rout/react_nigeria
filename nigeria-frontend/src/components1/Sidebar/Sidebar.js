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
  if (
    roleId === '5' ||
    (roleId === '3' &&
      (prop.path === '/dashboard' ||
        prop.name === 'Data & Reports' ||
        prop.name === 'Import Timesheet' ||
        prop.name === 'FG Output' ||
        prop.name === 'Employee Timesheet') &&
      (ctype === 'BRAID' || ctype === 'NBRAID'))
  ) {
    // Check if the menu is "Data & Reports"
if (prop.name === 'Data & Reports') {
  // Filter submenu items based on the user's category
  const filteredSubMenu = prop.submenu.filter(subItem => {
    // Include only non-braid reports if the user is in the NBRAID category
    if (ctype === 'NBRAID') {
      return subItem.name !== 'Braid';
    }
    // Include only braid reports if the user is in the BRAID category
    if (ctype === 'BRAID') {
      return subItem.name !== 'Non-braid';
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

/*
// Check if the menu is "Employee Timesheet"
if (prop.name === 'Employee Timesheet') {
  // Filter submenu items based on the user's category
  const filteredSubMenu = prop.submenu.filter(subItem => {
    // Include only braid submenu items if the user is in the BRAID category
    if (ctype === 'BRAID') {
      return subItem.name === 'Braid';
    }
    // Include only non-braid submenu items if the user is in the NBRAID category
    if (ctype === 'NBRAID') {
      return subItem.name === 'Non-braid';
    }
    // Include all submenu items if the user is not in either category
    return true;
  });

  // Skip rendering the "Employee Timesheet" menu if there are no submenu items left after filtering
  if (filteredSubMenu.length === 0) {
    return null;
  }

  // Render the "Employee Timesheet" menu with the filtered submenu
  return (
    <li
      className={activeRoute(prop.path) + (prop.pro ? ' active-pro' : '')}
      key={key}
    >
      <NavLink
        to="#"
        className="nav-link"
        onClick={() => toggleSubMenu(key)}
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
    </li>
  );
}
*/

if (prop.name === 'Employee Timesheet') {
  // Ensure submenu is defined
  if (!prop.submenu) {
    return null;
  }

  // Function to determine the correct path based on roleId
  const getAdjustedPath = (originalPath) => {
  let adjustedPath = originalPath;
  if (roleId === '5' && originalPath.includes('addemployeetimesheetbraid')) {
    adjustedPath = "/employeetimesheet/addemployeetimesheetbraid";
  } else if (roleId === '3' && originalPath.includes('addemployeetimesheetbraid')) {
    adjustedPath = "/employeetimesheet/addemployeetimesheetbraidikejaoperator";
  }
  console.log(`Original Path: ${originalPath}, Adjusted Path: ${adjustedPath}`);
  return adjustedPath;
};


  // Adjust submenu items based on the user's roleId
  const adjustedSubMenu = prop.submenu.map(subItem => {
    if (subItem.name === 'Braid' && subItem.submenu) {
      // Adjust nested submenu items for Braid category based on roleId
      const adjustedNestedSubMenu = subItem.submenu.map(nestedSubItem => {
        const adjustedPath = getAdjustedPath(nestedSubItem.path);
        return { ...nestedSubItem, path: adjustedPath };
      });
      return { ...subItem, submenu: adjustedNestedSubMenu };
    }
    return subItem;
  });

  // Filter submenu items based on the user's category
  const filteredSubMenu = adjustedSubMenu.filter(subItem => {
    if (ctype === 'BRAID') {
      return subItem.name === 'Braid';
    } else if (ctype === 'NBRAID') {
      return subItem.name === 'Non-braid';
    }
    return true;
  });

  // Skip rendering the "Employee Timesheet" menu if there are no submenu items left after filtering
  if (filteredSubMenu.length === 0) {
    return null;
  }

  // Render the "Employee Timesheet" menu with the filtered submenu
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
                            to={nestedSubItem.layout + getAdjustedPath(nestedSubItem.path)}
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
                  to={subItem.layout + getAdjustedPath(subItem.path)}
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


// Check if the menu is "FG Output"
if (prop.name === 'FG Output') {
  // Filter submenu items based on the user's roleId and ctype
  const filteredSubMenu = prop.submenu.filter(subItem => {
    // Hide "Ota" submenu if the user has roleId 3 and ctype braid
    if (roleId === '3' && ctype === 'BRAID') {
      return subItem.name !== 'Ota';
    }
    // Hide "Ikeja" submenu if the user has roleId 3 and ctype nbraid
    if (roleId === '3' && ctype === 'NBRAID') {
      return subItem.name !== 'Ikeja';
    }
    // Include all submenu items for other cases
    return true;
  });

  // Skip rendering the menu if there are no submenu items left after filtering
  if (filteredSubMenu.length === 0) {
    return null;
  }

  // Render the menu with the filtered submenu
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