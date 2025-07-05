import Dashboard from "views/Dashboard.js";
import Login from "views/Login.js";
import ChangeLanguage from "views/ChangeLanguage.js";
import PasswordChange from "views/PasswordChange.js";
import CompanySetting from "views/master/CompanySetting";
import ItemCategory from "views/master/ItemCategory.js";
import AddNewItemCategory from "views/master/AddNewItemCategory.js";
import ItemSubcategory from "views/master/ItemSubcategory.js";
import AddNewItemSubcategory from "views/master/AddNewItemSubcategory.js";
import EditItemSubcategory from "views/master/EditItemSubcategory.js";
import AddNewSection from "views/master/AddNewSection.js";
import SectionMaster from "views/master/SectionMaster.js";
import EditSection from "views/master/EditSection.js";
import ShiftMaster from "views/master/ShiftMaster.js";
import AddNewShift from "views/master/AddNewShift.js";
import WorkerTypeMaster from "views/master/WorkerTypeMaster.js";
import AddNewWorkerType from "views/master/AddNewWorkerType.js";
import EmployeeRoleMaster from "views/master/EmployeeRoleMaster.js";
import AddNewItem from "views/master/AddNewItem.js";
import ItemMaster from "views/master/ItemMaster.js";
import EditItem from "views/master/EditItem.js";
import ViewItem from "views/master/ViewItem.js";
import ItemSectionEdit from "views/master/ItemSectionEdit.js";
import AddItemColor from "views/master/AddItemColor.js";
import ItemCodeEdit from "views/master/ItemCodeEdit.js";
import ItemSectionTarget from "views/master/ItemSectionTarget.js";  
import AddNewMonthlyLaborRate from "views/master/AddNewMonthlyLaborRate.js";
import MonthlyLaborRate from "views/master/MonthlyLaborRate.js";
import EditMonthlyLaborRate from "views/master/EditMonthlyLaborRate.js";
import AddNewBaselinePPP from "views/master/AddNewBaselinePPP.js";
import BaselinePPP from "views/master/BaselinePPP.js";
import EditBaselinePPP from "views/master/EditBaselinePPP.js";
import AddNewWorkingDays from "views/master/AddNewWorkingDays.js";
import WorkingDays from "views/master/WorkingDays.js";
import EditWorkingDays from "views/master/EditWorkingDays.js";
import AddNewWasteMaster from "views/master/AddNewWasteMaster.js";
import WasteMaster from "views/master/WasteMaster.js";
import EditWasteMaster from "views/master/EditWasteMaster.js";

import OperatorComponent from "views/hrm/Operator/OperatorComponent";
import AssignList from "views/hrm/AssignOperator/AssignList";
import ChangeShiftOp from "views/hrm/ChangeShiftOperator/ChangeShiftOperator";
import EmployeeList from "views/hrm/Employees/EmployeeList";
import ZoneType from "views/hrm/ChangeZone/ZoneType";
import ChangeShiftComponent from "views/hrm/ChangeShift/ChangeShiftComponent";
import ViewOperator from "views/hrm/Operator/ViewOperator";
import AddOperatorComponent from "views/hrm/Operator/AddOperatorComponent";
import AddAssignOp from "views/hrm/Operator/AddAssignNbraid";
import MultipleSectionAssign from "views/hrm/Operator/MultipleSectionAssign";
import EditOperator from "views/hrm/Operator/EditOperator";
import AssignWorkList from "views/hrm/AssignOperator/AssignWorkList";
import MultipleShiftChangeOperator from "views/hrm/ChangeShiftOperator/MultipleShiftChangeOperator";
import Employees from "views/hrm/Employees/Employees";
import ViewWorker from "views/hrm/Employees/ViewWorker";
import EditWorker from "views/hrm/Employees/EditWorker";
import AddWorker from "views/hrm/Employees/AddEmployeeComponent";
import ChangeZone from "views/hrm/ChangeZone/ChangeZone";
import MultipleZoneChange from "views/hrm/ChangeZone/MultipleZoneChange";
import MultipleShiftChange from "views/hrm/ChangeShift/MultipleShiftChange";
import EmployeeTimesheet from "views/employeetimesheet/EmployeeTimesheetList.js";
import AddEmployeeTimesheet from "views/employeetimesheet/AddEmployeeTimesheet.js";
import EmployeeTimesheetBack from "views/employeetimesheet/AddEmployeeTimesheetBack.js";
import FGOutputList from "views/fgoutput/FgOutput.js";
import AddNewFg from "views/fgoutput/AddNewFg.js";
import EditFg from "views/fgoutput/EditFg.js";
import EmployeeTimesheetReport from "views/report/EmployeeTimesheetReport";
import PPPReport from "views/report/PPPReport";
import HourLossReport from "views/report/HourLossReport";
import WorkerEfficiencyReport from "views/report/WorkerEfficiencyReport";
import SupervisorEfficiencyReport from "views/report/SupervisorEfficiencyReport";  
import SectionwiseEfficiencyReport from "views/report/SectionwiseEfficiencyReport";  
import ProductivityReport from "views/report/ProductivityReport";
import FGOutputReport from "views/report/FGOutputReport";
import PerformanceEfficiencyReport from "views/report/PerformanceEfficiencyReport";
import PerformanceOverviewReport from "views/report/PerformanceOverviewReport";
import WastageReport from "views/report/WastageReport";
import ImportTimesheet from "views/importtimesheet/ImportTimesheet.js";
import TvDisplay from "views/tvdisplay/TvDisplay.js";
import MediaContentUpload from "views/MediaContentUpload.js";

/*Get Attendance*/
import DataComponent from "views/attendance/DataComponent";
import SorryComponent from "views/attendance/SorryComponent";



var routes = [
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-bank",
    component: <Login />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-bar-32",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/languagechange",
    name: "Change Language",
   // icon: "nc-icon nc-bank",
    component: <ChangeLanguage />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/changepassword/:id",
    name: "Change Password",
   // icon: "nc-icon nc-bank",
    component: <PasswordChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/companysetting", 
    name: "Company Setting",
    icon: "nc-icon nc-bank",
    component: <CompanySetting />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/itemcategory",
    name: "Item Category",
    icon: "nc-icon nc-bank",
    component: <ItemCategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },{
    path: "/master/addnewitemcategory",
    name: "Add Item Category",
    icon: "nc-icon nc-bank",
    component: <AddNewItemCategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, {
    path: "/master/itemsubcategory",
    name: "Item Subcategory",
    icon: "nc-icon nc-bank",
    component: <ItemSubcategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },{
    path: "/master/addnewitemsubcategory",
    name: "Add Item Subcategory",
    icon: "nc-icon nc-bank",
    component: <AddNewItemSubcategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/edititemsubcategory/:id", // Route with dynamic ID
    name: "Edit Item Subcategory",
    icon: "nc-icon nc-bank",
    component: <EditItemSubcategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },  {
    path: "/master/addnewsection",
    name: "Add Section",
    icon: "nc-icon nc-bank",
    component: <AddNewSection />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/sectionmaster",
    name: "Section Master",
    icon: "nc-icon nc-bank",
    component: <SectionMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editsection/:id", // Route with dynamic ID
    name: "Edit Section",
    icon: "nc-icon nc-bank",
    component: <EditSection />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },{
    path: "/master/shiftmaster", 
    name: "Shift",
    icon: "nc-icon nc-bank",
    component: <ShiftMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },{
    path: "/master/addnewshift",
    name: "Add Shift",
    icon: "nc-icon nc-bank",
    component: <AddNewShift />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/workertypemaster", 
    name: "Worker Type",
    icon: "nc-icon nc-bank",
    component: <WorkerTypeMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewworkertype", 
    name: "Add New Worker Type",
    icon: "nc-icon nc-bank",
    component: <AddNewWorkerType />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
{
    path: "/master/employeerolemaster", 
    name: "Employee Role",
    icon: "nc-icon nc-bank",
    component: <EmployeeRoleMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewitem",
    name: "Add Item",
    icon: "nc-icon nc-bank",
    component: <AddNewItem />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/itemmaster",
    name: "Item Master",
    icon: "nc-icon nc-bank",
    component: <ItemMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/edititem/:id", // Route with dynamic ID
    name: "Edit Item",
    icon: "nc-icon nc-bank",
    component: <EditItem />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/viewitem/:id", // Route with dynamic ID
    name: "View Item",
    icon: "nc-icon nc-bank",
    component: <ViewItem />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/itemsectionedit/:id", // Route with dynamic ID
    name: "Item Section Edit",
    icon: "nc-icon nc-bank",
    component: <ItemSectionEdit />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/additemcolor/:id", // Route with dynamic ID
    name: "Add Item Color",
    icon: "nc-icon nc-bank",
    component: <AddItemColor />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/itemcodeedit/:id", // Route with dynamic ID
    name: "Edit Item Code",
    icon: "nc-icon nc-bank",
    component: <ItemCodeEdit />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/itemsectiontarget", 
    name: "Item Section Target",
    icon: "nc-icon nc-bank",
    component: <ItemSectionTarget />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/monthlylaborrate", 
    name: "Monthly Labor Rate",
    icon: "nc-icon nc-bank",
    component: <MonthlyLaborRate />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewmonthlylaborrate",
    name: "Add Monthly Labor Rate",
    icon: "nc-icon nc-bank",
    component: <AddNewMonthlyLaborRate />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editmonthlylaborrate/:id", // Route with dynamic ID
    name: "Edit Monthly Labor Rate",
    icon: "nc-icon nc-bank",
    component: <EditMonthlyLaborRate />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/baselineppp", 
    name: "Baseline PPP",
    icon: "nc-icon nc-bank",
    component: <BaselinePPP />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewbaselineppp",
    name: "Add New Baseline PPP",
    icon: "nc-icon nc-bank",
    component: <AddNewBaselinePPP />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editbaselineppp/:id", // Route with dynamic ID
    name: "Edit Baseline PPP",
    icon: "nc-icon nc-bank",
    component: <EditBaselinePPP />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/master/workingdays", 
    name: "Working Days",
    icon: "nc-icon nc-bank",
    component: <WorkingDays />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewworkingdays",
    name: "Add New Working Days",
    icon: "nc-icon nc-bank",
    component: <AddNewWorkingDays />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editworkingdays/:id", // Route with dynamic ID
    name: "Edit Working Days",
    icon: "nc-icon nc-bank",
    component: <EditWorkingDays />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/master/wastemaster", 
    name: "Waste Master",
    icon: "nc-icon nc-bank",
    component: <WasteMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewwastemaster",
    name: "Add New Waste Master",
    icon: "nc-icon nc-bank",
    component: <AddNewWasteMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editwastemaster/:id", // Route with dynamic ID
    name: "Edit Waste Master",
    icon: "nc-icon nc-bank",
    component: <EditWasteMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/operatorcomponent",
    name: "HRM Operator Component",
    icon: "nc-icon nc-bank",
    component: <OperatorComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/assignlist",
    name: "HRM Assign List",
    icon: "nc-icon nc-bank",
    component: <AssignList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

 
  {
    path: "/hrm/zonetype",
    name: "HRM Change Zone Type",
    icon: "nc-icon nc-bank",
    component: <ZoneType />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },


  {
    path: "/hrm/viewoperator/:id",
    name: "HRM Operator Add Assign Component",
    icon: "nc-icon nc-bank",
    component: <ViewOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/addoperatorcomponent",
    name: "HRM Operator Add Component",
    icon: "nc-icon nc-bank",
    component: <AddOperatorComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/addassignop/:id",
    name: "HRM Operator Add Nbraid Component",
    icon: "nc-icon nc-bank",
    component: <AddAssignOp />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/multiplesectionassign/:id1/:id2",
    name: "HRM Operator Multi Sec Assign Component",
    icon: "nc-icon nc-bank",
    component: <MultipleSectionAssign />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/editoperator/:id",
    name: "HRM Operator Edit Component",
    icon: "nc-icon nc-bank",
    component: <EditOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/assignworklist",
    name: "HRM Assign Work List",
    icon: "nc-icon nc-bank",
    component: <AssignWorkList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/changeshiftop",
    name: "HRM Change Shift List",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftOp />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/multipleshiftchangeoperator",
    name: "HRM Shift List ",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChangeOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/employees",
    name: "HRM Employees ",
    icon: "nc-icon nc-bank",
    component: <Employees />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
    
  }, 

  {
    path: "/hrm/viewworker/:id",
    name: "HRM view worker",
    icon: "nc-icon nc-bank",
    component: <ViewWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/editworker/:id",
    name: "HRM edit worker",
    icon: "nc-icon nc-bank",
    component: <EditWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/addworker",
    name: "HRM add worker",
    icon: "nc-icon nc-bank",
    component: <AddWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/changezone",
    name: "HRM  Change Zone",
    icon: "nc-icon nc-bank",
    component: <ChangeZone />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/multiplezonechange",
    name: "HRM Change Zone multichange",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
    {
    path: "/hrm/changeshiftcomponent",
    name: "HRM Change Shift",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/multipleshiftchange",
    name: "HRM Multiple Change Shift",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/employeetimesheet/employeetimesheetlist",
    name: "Employee Timesheet ",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheet />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  
  {
    path: "/employeetimesheet/addemployeetimesheet", 
    name: "Add Employee Timesheet ",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeTimesheet />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/addemployeetimesheetback",
    name: "Back Date Entry",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetBack />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/fgoutputlist", 
    name: "FG Output",
    icon: "nc-icon nc-bank",
    component: <FGOutputList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/addnewfg", 
    name: "Add New FG Output",
    icon: "nc-icon nc-bank",
    component: <AddNewFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/editfg/:id", 
    name: "Edit FG Output",
    icon: "nc-icon nc-bank",
    component: <EditFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/employeetimesheetreport",
    name: "Employee Timesheet Report",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/pppreport",
    name: "PPP Report",
    icon: "nc-icon nc-bank",
    component: <PPPReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/hourlossreport",
    name: "Hour Loss Report",
    icon: "nc-icon nc-bank",
    component: <HourLossReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/workerefficiencyreport",
    name: "Worker Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <WorkerEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/supervisorefficiencyreport",
    name: "Supervisor Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <SupervisorEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/sectionwiseefficiencyreport",
    name: "Sectionwise Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <SectionwiseEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/productivityreport",
    name: "Productivity Report",
    icon: "nc-icon nc-bank",
    component: <ProductivityReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/fgoutputreport",
    name: "FGOutput Report",
    icon: "nc-icon nc-bank",
    component: <FGOutputReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/performanceefficiencyreport",
    name: "Performance Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/performanceoverviewreport",
    name: "Performance Overview Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceOverviewReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/wastagereport",
    name: "Wastage Report",
    icon: "nc-icon nc-bank",
    component: <WastageReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/importtimesheet/importtimesheet",
    name: "Import Timesheet",
    icon: "nc-icon nc-bank",
    component: <ImportTimesheet />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/tvdisplay/tvdisplay",
    name: "TV Display",
    icon: "nc-icon nc-bank",
    component: <TvDisplay />,
    layout: "/admin1",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/mediacontentupload",
    name: "Media Content Upload",
    icon: "nc-icon nc-bank",
    component: <MediaContentUpload />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  // srr











  
  {
    path: "/attendance/datacomponent",
    name: "Success Attendance",
    icon: "nc-icon nc-bank",
    component: <DataComponent/>,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/attendance/sorrycomponent",
    name: "Failed Attendance",
    icon: "nc-icon nc-bank",
    component: <SorryComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  
  
// srr



  //Main submenu
  {
    path: "#",
    name: "Master",
    icon: "nc-icon nc-credit-card",
    //component: <AddNewColor />,
    layout: "/admin",
    submenu: [
      {
        path: "/master/itemcategory",
        name: "Item Category",
        //icon: "nc-icon nc-diamond",
        component: ItemCategory,
        layout: "/admin",
      },
      {
        path: "/master/itemsubcategory",
        name: "Item Subcategory",
        //icon: "nc-icon nc-diamond",
        component: ItemSubcategory,
        layout: "/admin",
      },
      {
        path: "/master/sectionmaster",
        name: "Section",
        //icon: "nc-icon nc-diamond",
        component: SectionMaster,
        layout: "/admin",
      },
      {
        path: "/master/shiftmaster",
        name: "Shift",
        //icon: "nc-icon nc-diamond",
        component: ShiftMaster,
        layout: "/admin",
      },
      {
        path: "/master/workertypemaster",
        name: "Worker Type",
        //icon: "nc-icon nc-diamond",
        component: WorkerTypeMaster,
        layout: "/admin",
      },
      {
        path: "/master/employeerolemaster",
        name: "Employee Role",
        //icon: "nc-icon nc-diamond",
        component: EmployeeRoleMaster,
        layout: "/admin",
      },

      {
        path: "/master/itemmaster",
        name: "Item Master",
        //icon: "nc-icon nc-diamond",
       component: ItemMaster,
        layout: "/admin",
      },
      {
        path: "/master/itemsectiontarget", 
        name: "Item Section Target",
        //icon: "nc-icon nc-diamond",
        component: ItemSectionTarget,
        layout: "/admin",
      },
      {
        path: "/master/monthlylaborrate", 
        name: "Monthly Labor Rate",
        //icon: "nc-icon nc-diamond",
        component: MonthlyLaborRate,
        layout: "/admin",
      },
      {
        path: "/master/baselineppp", 
        name: "Baseline PPP",
        //icon: "nc-icon nc-diamond",
        component: BaselinePPP,
        layout: "/admin",
      },
      {
        path: "/master/workingdays", 
        name: "Working Days",
        //icon: "nc-icon nc-diamond",
        component: WorkingDays,
        layout: "/admin",
      },
      {
        path: "/master/wastemaster", 
        name: "Waste Master",
        //icon: "nc-icon nc-diamond",
        component: WasteMaster,
        layout: "/admin",
      },
    ],
  },
  {
    path: "#",
    name: "HRM",
    icon: "nc-icon nc-pin-3",
    /* component: <Maps />, */
    layout: "/admin",
    submenu: [
  {
            path: "/hrm/operatorcomponent",
            name: "Operator",
            layout: "/admin",
          },
          {
            path: "/hrm/assignworklist",
            name: "Assign Operator Work",
            layout: "/admin",
          },
          {
            path: "/hrm/changeshiftop",
            name: "Change Shift[ Operator ]",
            layout: "/admin",
          },
          {
            path: "/hrm/employees",
            name: "Employees",
            layout: "/admin",
          },
          {
            path: "/hrm/changezone",
            name: "Change Zone",
            layout: "/admin",
          },
          {
            path: "/hrm/changeshiftcomponent",
            name: "Change Shift",
            layout: "/admin",
          },

    ],
  },
  {
    path: "/employeetimesheet/employeetimesheetlist",
    name: "Employee Timesheet",
    icon: "nc-icon nc-watch-time",
    component: <EmployeeTimesheet />,
    layout: "/admin",
  },
  {
    path: "/employeetimesheet/addemployeetimesheetback",
    name: "Back Date Entry",
    icon: "nc-icon nc-watch-time",
    component: <EmployeeTimesheetBack />,
    layout: "/admin",
  },
  {
    path: "/fgoutput/fgoutputlist",
    name: "FGOutput",
    icon: "nc-icon nc-circle-10",
    component: <FGOutputList />,
    layout: "/admin",
  },
  {
    path: "#",
    name: "Data & Reports",
    icon: "nc-icon nc-chart-pie-36",
    /* component: <UserPage />, */
    layout: "/admin",
    submenu: [
      {
        path: "/report/employeetimesheetreport",
        name: "Emptimesheet Report ",
        layout: "/admin",
      },
      {
        path: "/report/pppreport",
        name: "PPP Report ",
        layout: "/admin",
      },
      {
        path: "/report/hourlossreport",
        name: "Hour Loss Report ",
        layout: "/admin",
      },
      {
        path: "/report/workerefficiencyreport",
        name: "Worker Efficiency Report  ",
        layout: "/admin",
      },
      {
        path: "/report/supervisorefficiencyreport",
        name: "Supervisor Efficiency Report  ",
        layout: "/admin",
      },
      {
        path: "/report/sectionwiseefficiencyreport",
        name: "Sectionwise Efficiency Report",
        layout: "/admin",
      },
      {
        path: "/report/productivityreport",
        name: "Productivity Report ",
        layout: "/admin",
      },
      {
        path: "/report/fgoutputreport",
        name: "FG Output Report ",
        layout: "/admin",
      },
      {
        path: "/report/performanceefficiencyreport",
        name: "Performance Efficiency Report",
        layout: "/admin",
      },
      {
        path: "/report/performanceoverviewreport",
        name: "Performance Overview Report",
        layout: "/admin",
      },
      {
        path: "/report/wastagereport",
        name: "Wastage Report",
        layout: "/admin",
      },
          

        
        
          
          
         
   
   
    ],
  },
  {
    path: "/tvdisplay/tvdisplay",
    name: "TV Display",
    icon: "nc-icon nc-circle-10",
    component: <TvDisplay />,
    layout: "/admin1",
  },
  {
    path: "/mediacontentupload",
    name: "Media Content Upload",
    icon: "nc-icon nc-circle-10",
    component: <MediaContentUpload />,
    layout: "/admin",
  },

  {
    path: "#",
    name: "Import Timesheet",
    icon: "nc-icon nc-money-coins",
    layout: "/admin",
    submenu: [
    
      {
        path: "/importtimesheet/importtimesheet",
        name: "Import Timesheet",
        layout: "/admin",
      }
    ],
  },
  
 
  
 
  
  
];
export default routes;
