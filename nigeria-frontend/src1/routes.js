import Dashboard from "views/Dashboard.js";
import Login from "views/Login.js";
import DataAccuracy from "views/employeetimesheet/DataAccuracy.js";


/*Master*/
//Color master
import AddNewColor from "views/master/AddNewColor.js";
import ColorMaster from "views/master/ColorMaster.js";
import EditColor from "views/master/EditColor.js";
//Line Master
import AddNewLine from "views/master/AddNewLine.js";
import LineMaster from "views/master/LineMaster.js";
import EditLine from "views/master/EditLine.js";
//Section Master
import AddNewSection from "views/master/AddNewSection.js";
import SectionMaster from "views/master/SectionMaster.js";
import EditSection from "views/master/EditSection.js";
//Machine Master
import AddNewMachine from "views/master/AddNewMachine.js";
import MachineMaster from "views/master/MachineMaster.js";
import EditMachine from "views/master/EditMachine.js";
//Waste Master
import AddNewWaste from "views/master/AddNewWaste.js";
import WasteMaster from "views/master/WasteMaster.js";
import EditWaste from "views/master/EditWaste.js";
//Item Master
import AddNewItem from "views/master/AddNewItem.js";
import ItemMaster from "views/master/ItemMaster.js";
import EditItem from "views/master/EditItem.js";
import ViewItem from "views/master/ViewItem.js";
import ItemSectionEdit from "views/master/ItemSectionEdit.js";
import AddItemColor from "views/master/AddItemColor.js";
import ItemCodeEdit from "views/master/ItemCodeEdit.js";
//PlanVsTarget
import PlanVsTarget from "views/master/PlanVsTarget.js";
import AddNewPlan from "views/master/AddNewPlan.js";
import PlanView from "views/master/PlanView.js";

/*ETA Settings*/

//Shift Master
import ShiftMaster from "views/master/ShiftMaster.js";
//Worker Type Master
import WorkerTypeMaster from "views/master/WorkerTypeMaster.js";
import AddNewWorkerType from "views/master/AddNewWorkerType.js";
//Employee Role Master
import EmployeeRoleMaster from "views/master/EmployeeRoleMaster.js";
//Item Category Master
import ItemCategoryMaster from "views/master/ItemCategoryMaster.js";
//QC Master
import QCMaster from "views/master/QCMaster.js";
import EditQCMaster from "views/master/EditQCMaster.js";
import CompanySetting from "views/master/CompanySetting";

/*HRM*/

//Admin
import AdminComponent from "views/hrm/Admin/AdminComponent.js";
import AddNewAdminComponent from "views/hrm/Admin/AddNewAdminComponent";
import ViewAdmin from "views/hrm/Admin/ViewAdmin";
import EditAdmin from "views/hrm/Admin/EditAdmin";
import AdminChangePassword from "views/hrm/Admin/AdminChangePassword";

//Admin
import AddEmployeeComponent from "views/hrm/AddEmployee/AddEmployeeComponent.js";

 //IKEJA 
//operator
import OperatorComponent from "views/hrm/Ikeja/Operator/OperatorComponent";
import AddOperatorComponent from "views/hrm/Ikeja/Operator/AddOperatorComponent";
import ConvertToCategory from "views/hrm/Ikeja/Operator/ConvertToCategory";
import AddAssignOperator from "views/hrm/Ikeja/Operator/AddAssignOperator";
import AddAssignOpNbraid from "views/hrm/Ikeja/Operator/AddAssignNbraid";
import ViewOperator from "views/hrm/Ikeja/Operator/ViewOperator";
import EditOperator from "views/hrm/Ikeja/Operator/EditOperator";
import ChangePassword from "views/hrm/Ikeja/Operator/ChangePassword";
import MultipleSectionAssign from "views/hrm/Ikeja/Operator/MultipleSectionAssign";

//Assign operator
import AssignList from "views/hrm/Ikeja/AssignOperator/AssignList";
import BraidList from "views/hrm/Ikeja/AssignOperator/BraidList";
import NonBraidList from "views/hrm/Ikeja/AssignOperator/NonBraidList";

//Change Shift operator
import ChangeShiftOp from "views/hrm/Ikeja/ChangeShiftOperator/ChangeShiftOperator";
import MultipleShiftChangeOperator from "views/hrm/Ikeja/ChangeShiftOperator/MultipleShiftChangeOperator";


//Employee
import EmployeeList from "views/hrm/Ikeja/Employees/EmployeeList";
import Employees from "views/hrm/Ikeja/Employees/Employees";
import ViewWorker from "views/hrm/Ikeja/Employees/ViewWorker";
import EditWorker from "views/hrm/Ikeja/Employees/EditWorker";
import ChangeToOperator from "views/hrm/Ikeja/Employees/ChangeToOperator";
import NbraidEmployees from "views/hrm/Ikeja/Employees/NbraidEmployees";
import ViewWorkerNbraid from "views/hrm/Ikeja/Employees/ViewWorkerNbraid";
import EditWorkerNbraid from "views/hrm/Ikeja/Employees/EditWorkerNbraid";

//Change zone
import ZoneType from "views/hrm/Ikeja/ChangeZone/ZoneType";
import ChangeZone from "views/hrm/Ikeja/ChangeZone/ChangeZone";
import MultipleZoneChange from "views/hrm/Ikeja/ChangeZone/MultipleZoneChange";
import ChangeZoneCheckbox from "views/hrm/Ikeja/ChangeZone/ChangeZoneCheckbox";

import ChangeZoneToNbraid from "views/hrm/Ikeja/ChangeZone/ChangeZoneToNbraid";
import MultipleZoneToNbraid from "views/hrm/Ikeja/ChangeZone/MultipleZoneToNbraid";
import ChangeZoneNbraid from "views/hrm/Ikeja/ChangeZone/ChangeZoneNbraid";
import MultipleZoneNbraid from "views/hrm/Ikeja/ChangeZone/MultipleZoneNbraid";
import ChangeZoneNbraidCheckbox from "views/hrm/Ikeja/ChangeZone/ChangeZoneNbraidCheckbox";

import ChangeZoneToBraid from "views/hrm/Ikeja/ChangeZone/ChangeZoneToBraid";
import MultipleZoneToBraid from "views/hrm/Ikeja/ChangeZone/MultipleZoneToBraid";
//Change Shift
import ChangeShiftComponent from "views/hrm/Ikeja/ChangeShift/ChangeShiftComponent";
import MultipleShiftChange from "views/hrm/Ikeja/ChangeShift/MultipleShiftChange";
//Change worker
import ChangeWorker from "views/hrm/Ikeja/ChangeWorker/ChangeWorker";
import MultipleWorkerChange from "views/hrm/Ikeja/ChangeWorker/MultipleWorkerChange";
//Employees fda
import FDA_EmployeeList from "views/hrm/Ikeja/EmployeeFda/FDA_EmployeeList";

//OTA START//
//operator
 import SupervisorComponent from "views/hrm/Ota/Supervisor/SupervisorComponent"; 
 import OperatorComponentOta from "views/hrm/Ota/Operator/OperatorComponent";    
 import AddOperatorComponentOta from "views/hrm/Ota/Operator/AddOperatorComponent"; 
 import AddAssignOperatorOta from "views/hrm/Ota/Operator/AddAssignOperator"; 
 import AddAssignOpNbraidOta from "views/hrm/Ota/Operator/AddAssignNbraid";
 import MultipleSectionAssignOta from "views/hrm/Ota/Operator/MultipleSectionAssign";
 import ViewOperatorOta from "views/hrm/Ota/Operator/ViewOperator";   
 import EditOperatorOta from "views/hrm/Ota/Operator/EditOperator";   
 import ChangePasswordOta from "views/hrm/Ota/Operator/ChangePassword"; 
import ConvertToCategoryOta from "views/hrm/Ota/Operator/ConvertToCategory";  
 

 //Assign operator
import AssignListOta from "views/hrm/Ota/AssignOperator/AssignList";
import BraidListOta from "views/hrm/Ota/AssignOperator/BraidList";
import NonBraidListOta from "views/hrm/Ota/AssignOperator/NonBraidList";
//Change Shift operator
import ChangeShiftOpOta from "views/hrm/Ota/ChangeShiftOperator/ChangeShiftOperator";
import MultipleShiftChangeOperatorOta from "views/hrm/Ota/ChangeShiftOperator/MultipleShiftChangeOperator";
//Employee list
import EmployeeListOta from "views/hrm/Ota/Employees/EmployeeList";
import EmployeesOta from "views/hrm/Ota/Employees/Employees";
import ViewWorkerBraidOta from "views/hrm/Ota/Employees/ViewWorkerBraids";
 import EditWorkerBraidOta from "views/hrm/Ota/Employees/EditWorkerBraid";
import ChangeToOperatorOta from "views/hrm/Ota/Employees/ChangeToOperator";
import NbraidEmployeesOta from "views/hrm/Ota/Employees/NbraidEmployees";
import ViewWorkerOta from "views/hrm/Ota/Employees/ViewWorker";
import EditWorkerOta from "views/hrm/Ota/Employees/EditWorker"; 
//Change zone
import ZoneTypeOta from "views/hrm/Ota/ChangeZone/ZoneType";
import ChangeZoneOta from "views/hrm/Ota/ChangeZone/ChangeZone";
import MultipleChangeZoneOta from "views/hrm/Ota/ChangeZone/MultipleZoneChange";
import ChangeZoneCheckboxOta from "views/hrm/Ota/ChangeZone/ChangeZoneCheckbox";
import ChangeZoneToNbraidOta from "views/hrm/Ota/ChangeZone/ChangeZoneToNbraid";
import MultipleZoneToNbraidOta from "views/hrm/Ota/ChangeZone/MultipleZoneToNbraid";
import ChangeZoneNbraidOta from "views/hrm/Ota/ChangeZone/ChangeZoneNbraid";
import MultipleZoneNbraidOta from "views/hrm/Ota/ChangeZone/MultipleZoneNbraid";
import ChangeZoneNbraidCheckboxOta from "views/hrm/Ota/ChangeZone/ChangeZoneNbraidCheckbox";

import ChangeZoneToBraidOta from "views/hrm/Ota/ChangeZone/ChangeZoneToBraid";
import MultipleZoneToBraidOta from "views/hrm/Ota/ChangeZone/MultipleZoneToBraid";
//Change Shift
import ChangeShiftComponentOta from "views/hrm/Ota/ChangeShift/ChangeShiftComponent";
import MultipleShiftChangeOta from "views/hrm/Ota/ChangeShift/MultipleShiftChange";
//Change worker
import ChangeWorkerComponentOta from "views/hrm/Ota/ChangeWorker/ChangeWorker";
import MultipleWorkerTypeChangeOta from "views/hrm/Ota/ChangeWorker/MultipleWorkerChange";
//Employees fda
import EmployeesFdaComponentOta from "views/hrm/Ota/EmployeeFda/FDA_EmployeeList";


/*FG Output*/

//Ikeja
import IkejaBraidFgOutput from "views/fgoutput/IkejaBraidFgOutput.js";
import IkejaNbraidFgOutput from "views/fgoutput/IkejaNbraidFgOutput.js";
import AddNewNbraidIkejaFg from "views/fgoutput/AddNewNbraidIkejaFg.js";
import EditIkejaNbraidFg from "views/fgoutput/EditIkejaNbraidFg.js";
//Ota
import OtaBraidFgOutput from "views/fgoutput/OtaBraidFgOutput.js";
import OtaNbraidFgOutput from "views/fgoutput/OtaNbraidFgOutput.js";
import AddNewNbraidOtaFg from "views/fgoutput/AddNewNbraidOtaFg.js";
import EditOtaNbraidFg from "views/fgoutput/EditOtaNbraidFg.js";

/*Employee Time Sheet */

//Braid
import AddEmployeeTimesheetBraid from "views/employeetimesheet/AddEmployeeTimesheetBraid.js";
import AddEmployeeTimesheetBraidIkejaOperator from "views/employeetimesheet/AddEmployeeTimesheetBraidIkejaOperator.js";
import EmployeeTimesheetBraidList from "views/employeetimesheet/EmployeeTimesheetBraidList.js";
import EmployeeTimesheetBraidListIkejaOperator from "views/employeetimesheet/EmployeeTimesheetBraidListIkejaOperator.js";

import ViewEmployeeTimesheetBraid from "views/employeetimesheet/ViewEmployeeTimesheetBraid.js";
import EditEmployeeTimesheetBraid from "views/employeetimesheet/EditEmployeeTimesheetBraid.js";

//Non-Braid
import AddEmployeeTimesheetNBraid from "views/employeetimesheet/AddEmployeeTimesheetNBraid.js";
import AddEmployeeTimesheetNbraidOpLogin from "views/employeetimesheet/AddEmployeeTimesheetNbraidOpLogin.js";
import EmployeeTimesheetNBraidList from "views/employeetimesheet/EmployeeTimesheetNBraidList.js";
import EmployeeTimesheetNbraidListopLogin from "views/employeetimesheet/EmployeeTimesheetNbraidListopLogin.js";

import EditEmployeeTimesheetNBraid from "views/employeetimesheet/EditEmployeeTimesheetNBraid.js"; 

/*Data & Reports*/

//braid report

import BraidPerformanceEffIndividual from "views/report/Braid/PerformanceEffIndividual";
import BraidPlanVsActualReport from "views/report/Braid/PlanVsActualReport";
import BraidMTDPPPAverageReport from "views/report/Braid/MTDPPPAverageReport";
import EmployeeTimesheetReportBraid from "views/report/Braid/EmployeeTimesheetReportBraid";
import EmployeeTimesheetNewReport from "views/report/Braid/EmployeeTimesheetNewReport";
import PerformanceEfficiencyReport from "views/report/Braid/PerformanceEfficiencyReport";
import PerformanceEfficiencyNewReport from "views/report/Braid/PerformanceEfficiencyNewReport";
import ProductionBreakdown from "views/report/Braid/ProductionBreakdown";
import DaywiseProductionReport from "views/report/Braid/DaywiseProductionReport";
import Wastage from "views/report/Braid/Wastage";
import WastagePerItemReport from "views/report/Braid/WastagePerItemReport";
import ProductionDashboardReport from "views/report/Braid/ProductionDashboardReport";
import PPPOverall from "views/report/Braid/PPPOverall";
import MachineDowntimeReport from "views/report/Braid/MachineDowntimeReport";
import MachineEffFgoutputReport from "views/report/Braid/MachineEffFgoutputReport";
import MachineEffWasteReport from "views/report/Braid/MachineEffWasteReport";
import MachineEffPpmReport from "views/report/Braid/MachineEffPpmReport";
import MachineHoursReport from "views/report/Braid/MachineHoursReport"; 

//nbraid report

import AttendanceReport from "views/report/Nbraid/AttendanceReport";
import FGMonthlyReport from "views/report/Nbraid/FGMonthlyReport";
import PerformanceEffIndividual from "views/report/Nbraid/PerformanceEffIndividual";
import PlanVsActualReport from "views/report/Nbraid/PlanVsActualReport";
import MTDPPPAverageReport from "views/report/Nbraid/MTDPPPAverageReport";
import EfficiencyOverviewReport from "views/report/Nbraid/EfficiencyOverviewReport";
import EfficiencyOverviewDetailsReport from "views/report/Nbraid/EfficiencyOverviewDetailsReport";
import PerformanceEfficiencyNBraidReport from "views/report/Nbraid/PerformanceEfficiencyNBraidReport";
import PerformanceOverviewNbraidReport from "views/report/Nbraid/PerformanceOverviewNbraidReport";
import ProductivityReport from "views/report/Nbraid/ProductivityReport";
import EmployeeTimesheetReport from "views/report/Nbraid/EmployeeTimesheetReport";
import PPPReport from "views/report/Nbraid/PPPReport";
import FGOutputReport from "views/report/Nbraid/FGOutputReport";
import ProductiveManpowerReport from "views/report/Nbraid/ProductiveManpowerReport";
import WorkerEfficiencyReport from "views/report/Nbraid/WorkerEfficiencyReport";
import OperatorEfficiencyReport from "views/report/Nbraid/OperatorEfficiencyReport"; 
import SupervisorEfficiencyReport from "views/report/Nbraid/SupervisorEfficiencyReport";  

/*Import Module*/
import ColorImport from "views/import/ColorImport.js"; 
import LineImport from "views/import/LineImport.js";
import SectionImport from "views/import/SectionImport.js";
import ItemImport from "views/import/ItemImport.js";
import PlanVsTargetImport from "views/import/PlanVsTargetImport.js";
import ItemCodeImport from "views/import/ItemCodeImport.js";
import BraidUpdateAttendanceImport from "views/import/BraidUpdateAttendanceImport.js";
import NonBraidUpdateAttendanceImport from "views/import/NonBraidUpdateAttendanceImport.js";
import FgOutputImport from "views/import/FgOutputImport.js";

/*Attrition & Attendance*/
import DashboardAttrition from "views/attrition/DashboardAttrition.js";

/*Import Timesheet*/
import FilterTimesheet from "views/importtimesheet/FilterTimesheet.js";
import ImportTimesheet from "views/importtimesheet/ImportTimesheet.js";
import ViewTimesheet from "views/importtimesheet/ViewTimesheet.js";

/*Get Attendance*/
import DataComponent from "views/attendance/DataComponent";
import SorryComponent from "views/attendance/SorryComponent";


/*TV Display*/

//SOP & Safety
import SOPComponent from "views/tvdisplay/SOPComponent.js";
import AddNewSOP from "views/tvdisplay/AddNewSOP.js";
import ViewSOP from "views/tvdisplay/ViewSOP.js";


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
    path: "/master/addnewcolor",
    name: "Add Color",
    icon: "nc-icon nc-bank",
    component: <AddNewColor />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/colormaster",
    name: "Color Master",
    icon: "nc-icon nc-bank",
    component: <ColorMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editcolor/:id", // Route with dynamic ID
    name: "Edit Color",
    icon: "nc-icon nc-bank",
    component: <EditColor />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewline",
    name: "Add Line",
    icon: "nc-icon nc-bank",
    component: <AddNewLine />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/linemaster",
    name: "Line Master",
    icon: "nc-icon nc-bank",
    component: <LineMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editline/:id", // Route with dynamic ID
    name: "Edit Line",
    icon: "nc-icon nc-bank",
    component: <EditLine />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
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
  },
  {
    path: "/master/addnewmachine",
    name: "Add Section",
    icon: "nc-icon nc-bank",
    component: <AddNewMachine />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/machinemaster",
    name: "Machine Master",
    icon: "nc-icon nc-bank",
    component: <MachineMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editmachine/:id", // Route with dynamic ID
    name: "Edit Section",
    icon: "nc-icon nc-bank",
    component: <EditMachine />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/addnewwaste",
    name: "Add Waste",
    icon: "nc-icon nc-bank",
    component: <AddNewWaste />,
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
    path: "/master/editwaste/:id", // Route with dynamic ID
    name: "Edit Waste",
    icon: "nc-icon nc-bank",
    component: <EditWaste />,
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
    path: "/master/addnewplan", 
    name: "Plan Vs Target",
    icon: "nc-icon nc-bank",
    component: <AddNewPlan />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/planvstarget", 
    name: "Add New Plan",
    icon: "nc-icon nc-bank",
    component: <PlanVsTarget />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/planview", 
    name: "Plan View",
    icon: "nc-icon nc-bank",
    component: <PlanView />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/shiftmaster", 
    name: "Shift",
    icon: "nc-icon nc-bank",
    component: <ShiftMaster />,
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
    path: "/master/itemcategorymaster", 
    name: "Item Category",
    icon: "nc-icon nc-bank",
    component: <ItemCategoryMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/qcmaster", 
    name: "QC Master",
    icon: "nc-icon nc-bank",
    component: <QCMaster />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/master/editqcmaster/:id", 
    name: "Edit QC Master",
    icon: "nc-icon nc-bank",
    component: <EditQCMaster />,
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
    path: "/fgoutput/ikejabraidfgoutput", 
    name: "Ikeja Braid FG Output",
    icon: "nc-icon nc-bank",
    component: <IkejaBraidFgOutput />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/ikejanbraidfgoutput", 
    name: "Ikeja Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <IkejaNbraidFgOutput />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/addnewnbraidikejafg", 
    name: "Add New Ikeja Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <AddNewNbraidIkejaFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/editikejanbraidfg/:id", 
    name: "Edit Ikeja Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <EditIkejaNbraidFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/otabraidfgoutput", 
    name: "Ota Braid FG Output",
    icon: "nc-icon nc-bank",
    component: <OtaBraidFgOutput />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/otanbraidfgoutput", 
    name: "Ota Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <OtaNbraidFgOutput />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/addnewnbraidotafg", 
    name: "Add New Ota Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <AddNewNbraidOtaFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/fgoutput/editotanbraidfg/:id", 
    name: "Edit Ota Nbraid FG Output",
    icon: "nc-icon nc-bank",
    component: <EditOtaNbraidFg />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/addemployeetimesheetbraid", 
    name: "Add Employee Timesheet Braid",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeTimesheetBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/addemployeetimesheetbraidikejaoperator", 
    name: "Add Employee Timesheet NBraid Operator",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeTimesheetBraidIkejaOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/employeetimesheetbraidlist", 
    name: "Employee Timesheet Braid List",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetBraidList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/employeetimesheetbraidlistikejaoperator", 
    name: "Employee Timesheet Braid List",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetBraidListIkejaOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/viewemployeetimesheetbraid/:id", 
    name: "View Employee Timesheet Braid ",
    icon: "nc-icon nc-bank",
    component: <ViewEmployeeTimesheetBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/editemployeetimesheetbraid/:id", 
    name: "Edit Employee Timesheet Braid ",
    icon: "nc-icon nc-bank",
    component: <EditEmployeeTimesheetBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/addemployeetimesheetnbraid", 
    name: "Add Employee Timesheet NBraid ",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeTimesheetNBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/addemployeetimesheetnbraidoplogin", 
    name: "Add Employee Timesheet NBraid Operator Login",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeTimesheetNbraidOpLogin />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/employeetimesheetnbraidlist",
    name: "Add Employee Timesheet NBraid ",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetNBraidList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/employeetimesheetnbraidlistoplogin",
    name: "Add Employee Timesheet NBraid Operator Login",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetNbraidListopLogin />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/editemployeetimesheetnbraid/:id",
    name: "Add Employee Timesheet NBraid ",
    icon: "nc-icon nc-bank",
    component: <EditEmployeeTimesheetNBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/attrition/dashboardattrition",
    name: "Attrition & Attendance Dashboard ",
    icon: "nc-icon nc-bank",
    component: <DashboardAttrition />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/colorimport",
    name: "Color Import",
    icon: "nc-icon nc-bank",
    component: <ColorImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/lineimport",
    name: "Line Import",
    icon: "nc-icon nc-bank",
    component: <LineImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/sectionimport",
    name: "Section Import",
    icon: "nc-icon nc-bank",
    component: <SectionImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/itemimport",
    name: "Item Import",
    icon: "nc-icon nc-bank",
    component: <SectionImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/planvstargetimport",
    name: "Target Vs Plan  Import",
    icon: "nc-icon nc-bank",
    component: <PlanVsTargetImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/itemcodeimport",
    name: "Item Code Import",
    icon: "nc-icon nc-bank",
    component: <ItemCodeImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/import/braidupdateattendanceimport",
    name: "Braid Update Attendance Import",
    icon: "nc-icon nc-bank",
    component: <BraidUpdateAttendanceImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/nonbraidupdateattendanceimport",
    name: "Non Braid Update Attendance Import",
    icon: "nc-icon nc-bank",
    component: <NonBraidUpdateAttendanceImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/import/fgoutputimport",
    name: "Non Braid Fg Details Import",
    icon: "nc-icon nc-bank",
    component: <FgOutputImport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/importtimesheet/filtertimesheet",
    name: "Filter Timesheet",
    icon: "nc-icon nc-bank",
    component: <FilterTimesheet />,
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
    path: "/importtimesheet/viewtimesheet",
    name: "View Timesheet",
    icon: "nc-icon nc-bank",
    component: <ViewTimesheet />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/braidperformanceeffindividual",
    name: "Braid Performance Efficiency Individual Report",
    icon: "nc-icon nc-bank",
    component: <BraidPerformanceEffIndividual />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/braidplanvsactualreport",
    name: "Braid Plan Vs Actual Report",
    icon: "nc-icon nc-bank",
    component: <BraidPlanVsActualReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/braidmtdpppaveragereport",
    name: "Braid MTD PPP Average Report",
    icon: "nc-icon nc-bank",
    component: <BraidMTDPPPAverageReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/employeetimesheetreportbraid",
    name: "Braid EmployeeTimesheet Report",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetReportBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/employeetimesheetnewreport",
    name: "Braid EmployeeTimesheet Report",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetNewReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/performanceefficiencyreport",
    name: "Braid Performance Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/performanceefficiencynewreport",
    name: "Braid Performance Efficiency New Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceEfficiencyNewReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/productionbreakdown",
    name: "Braid Production Breakdown Report",
    icon: "nc-icon nc-bank",
    component: <ProductionBreakdown />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/daywiseproductionreport",
    name: "Braid Daywise Production Report",
    icon: "nc-icon nc-bank",
    component: <DaywiseProductionReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/wastage",
    name: "Braid Wastage Report",
    icon: "nc-icon nc-bank",
    component: <Wastage />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/wastageperitemreport",
    name: "Braid Wastage Per Item Report",
    icon: "nc-icon nc-bank",
    component: <WastagePerItemReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/productiondashboardreport",
    name: "Braid Production Dashboard Report",
    icon: "nc-icon nc-bank",
    component: <ProductionDashboardReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/pppoverall",
    name: "Braid PPP Overall Report",
    icon: "nc-icon nc-bank",
    component: <PPPOverall />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/machinedowntimereport",
    name: "Braid Machine Downtime Report",
    icon: "nc-icon nc-bank",
    component: <MachineDowntimeReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/machineefffgoutputreport",
    name: "Braid Machine Eff Fgoutput Report",
    icon: "nc-icon nc-bank",
    component: <MachineEffFgoutputReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/machineeffwastereport",
    name: "Braid Machine Eff Waste Report",
    icon: "nc-icon nc-bank",
    component: <MachineEffWasteReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/machineeffppmreport",
    name: "Braid Machine Eff Ppm Report",
    icon: "nc-icon nc-bank",
    component: <MachineEffPpmReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/machinehoursreport",
    name: "Braid Machine Hours Report",
    icon: "nc-icon nc-bank",
    component: <MachineHoursReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  
  {
    path: "/report/attendancereport",
    name: "Non Braid Attendance Report",
    icon: "nc-icon nc-bank",
    component: <AttendanceReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/fgmonthlyreport",
    name: "Non Braid FG Monthly Report",
    icon: "nc-icon nc-bank",
    component: <FGMonthlyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/report/performanceeffindividual",
    name: "Non Braid Performance Eff Individual Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceEffIndividual />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/planvsactualreport",
    name: "Non Braid Plan Vs Actual Report",
    icon: "nc-icon nc-bank",
    component: <PlanVsActualReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/mtdpppaveragereport",
    name: "Non Braid MTD PPP Average Report",
    icon: "nc-icon nc-bank",
    component: <MTDPPPAverageReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/efficiencyoverviewreport",
    name: "Non Braid Efficiency Overview Report",
    icon: "nc-icon nc-bank",
    component: <EfficiencyOverviewReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/efficiencyoverviewdetailsreport/:id1/:id2",
    name: "Non Braid Efficiency Overview Details Report",
    icon: "nc-icon nc-bank",
    component: <EfficiencyOverviewDetailsReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/performanceefficiencynbraidreport",
    name: "Non Braid Performance Efficiency NBraid Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceEfficiencyNBraidReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/performanceoverviewnbraidreport",
    name: "Non Braid Performance Overview Nbraid Report",
    icon: "nc-icon nc-bank",
    component: <PerformanceOverviewNbraidReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/productivityreport",
    name: "Non Braid Productivity Report",
    icon: "nc-icon nc-bank",
    component: <ProductivityReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/employeetimesheetreport",
    name: "Non Braid Employee Timesheet Report",
    icon: "nc-icon nc-bank",
    component: <EmployeeTimesheetReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/pppreport",
    name: "Non Braid PPP Report",
    icon: "nc-icon nc-bank",
    component: <PPPReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/fgoutputreport",
    name: "Non Braid FGOutput Report",
    icon: "nc-icon nc-bank",
    component: <FGOutputReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/productivemanpowerreport",
    name: "Non Braid Productive Manpower Report",
    icon: "nc-icon nc-bank",
    component: <ProductiveManpowerReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/report/workerefficiencyreport",
    name: "Non Braid Worker Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <WorkerEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/report/operatorefficiencyreport",
    name: "Non Braid Operator Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <OperatorEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/report/supervisorefficiencyreport",
    name: "Non Braid Supervisor Efficiency Report",
    icon: "nc-icon nc-bank",
    component: <SupervisorEfficiencyReport />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/hrm/admincomponent",
    name: "HRM Admin Component",
    icon: "nc-icon nc-bank",
    component: <AdminComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/hrm/addnewadmincomponent",
    name: "HRM Add New Admin Component",
    icon: "nc-icon nc-bank",
    component: <AddNewAdminComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/hrm/viewadmin/:id",
    name: "HRM View Admin Component",
    icon: "nc-icon nc-bank",
    component: <ViewAdmin />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/hrm/editadmin/:id",
    name: "HRM Edit Admin Component",
    icon: "nc-icon nc-bank",
    component: <EditAdmin />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 
  {
    path: "/hrm/adminchangepassword/:id",
    name: "HRM Change Password Admin Component",
    icon: "nc-icon nc-bank",
    component: <AdminChangePassword />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/addemployee",
    name: "HRM Add Employee Component",
    icon: "nc-icon nc-bank",
    component: <AddEmployeeComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/operatorcomponent",
    name: "HRM Ikeja Operator Component",
    icon: "nc-icon nc-bank",
    component: <OperatorComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/addoperatorcomponent",
    name: "HRM Ikeja Operator Add Component",
    icon: "nc-icon nc-bank",
    component: <AddOperatorComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/addassignoperator/:id",
    name: "HRM Ikeja Operator Add Assign Component",
    icon: "nc-icon nc-bank",
    component: <AddAssignOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/viewoperator/:id",
    name: "HRM Ikeja Operator Add Assign Component",
    icon: "nc-icon nc-bank",
    component: <ViewOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/editoperator/:id",
    name: "HRM Ikeja Operator Edit Component",
    icon: "nc-icon nc-bank",
    component: <EditOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changepassword/:id",
    name: "HRM Ikeja Operator Edit Component",
    icon: "nc-icon nc-bank",
    component: <ChangePassword />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/addassignopnbraid/:id",
    name: "HRM Ikeja Operator Add Nbraid Component",
    icon: "nc-icon nc-bank",
    component: <AddAssignOpNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multiplesectionassign/:id1/:id2",
    name: "HRM Ikeja Operator Multi Sec Assign Component",
    icon: "nc-icon nc-bank",
    component: <MultipleSectionAssign />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/converttocategory/:id",
    name: "HRM Ikeja Operator Convert category Component",
    icon: "nc-icon nc-bank",
    component: <ConvertToCategory />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },

  {
    path: "/hrm/ikeja/assignlist",
    name: "HRM Ikeja Assign List",
    icon: "nc-icon nc-bank",
    component: <AssignList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/braidlist",
    name: "HRM IkejaBraidList",
    icon: "nc-icon nc-bank",
    component: <BraidList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/nonbraidlist",
    name: "HRM Ikeja NonBraidList ",
    icon: "nc-icon nc-bank",
    component: <NonBraidList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changeshiftop",
    name: "HRM IkejaBraidList",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftOp />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multipleshiftchangeoperator",
    name: "HRM Ikeja NonBraidList ",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChangeOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/employeelist",
    name: "HRM Ikeja Employees",
    icon: "nc-icon nc-bank",
    component: <EmployeeList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/employees",
    name: "HRM Ikeja Employees braid ",
    icon: "nc-icon nc-bank",
    component: <Employees />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/viewworker/:id",
    name: "HRM Ikeja Employees braid view worker",
    icon: "nc-icon nc-bank",
    component: <ViewWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/editworker/:id",
    name: "HRM Ikeja Employees braid edit worker",
    icon: "nc-icon nc-bank",
    component: <EditWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changetooperator/:id",
    name: "HRM Ikeja Employees braid change to operator",
    icon: "nc-icon nc-bank",
    component: <ChangeToOperator />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/nbraidemployees",
    name: "HRM Ikeja Employees nbraid ",
    icon: "nc-icon nc-bank",
    component: <NbraidEmployees />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/viewworkernbraid/:id",
    name: "HRM Ikeja Employees nbraid view worker",
    icon: "nc-icon nc-bank",
    component: <ViewWorkerNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/editworkernbraid/:id",
    name: "HRM Ikeja Employees nbraid edit worker",
    icon: "nc-icon nc-bank",
    component: <EditWorkerNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/zonetype",
    name: "HRM Ikeja Change Zone Type",
    icon: "nc-icon nc-bank",
    component: <ZoneType />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezone",
    name: "HRM Ikeja Change Zone Braid Without Checkbox",
    icon: "nc-icon nc-bank",
    component: <ChangeZone />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multiplezonechange",
    name: "HRM Ikeja Change Zone Braid Without Checkbox multichange",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezonecheckbox",
    name: "HRM Ikeja Change Zone Braid With Checkbox ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneCheckbox />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezonetonbraid",
    name: "HRM Ikeja Change Zone Convert Braid to Nbraid ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneToNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multiplezonetonbraid",
    name: "HRM Ikeja Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneToNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezonenbraid",
    name: "HRM Ikeja Change Zone NBraid Without Checkbox",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multiplezonenbraid",
    name: "HRM Ikeja Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneNbraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezonenbraidcheckbox",
    name: "HRM Ikeja Change Zone NBraid With Checkbox ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneNbraidCheckbox />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changezonetobraid",
    name: "HRM Ikeja Change Zone NBraid to Braid",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneToBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multiplezonetobraid",
    name: "HRM Ikeja Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneToBraid />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changeshiftcomponent",
    name: "HRM Ikeja Change Shift",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multipleshiftchange",
    name: "HRM Ikeja Multiple Change Shift",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/changeworker",
    name: "HRM Ikeja Change Worker",
    icon: "nc-icon nc-bank",
    component: <ChangeWorker />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/multipleworkerchange",
    name: "HRM Ikeja Multiple Change Worker",
    icon: "nc-icon nc-bank",
    component: <MultipleWorkerChange />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ikeja/fda_employeelist",
    name: "HRM Ikeja Employees FDA",
    icon: "nc-icon nc-bank",
    component: <FDA_EmployeeList />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/supervisorcomponent",
    name: "HRM OTA Supervisor Component",
    icon: "nc-icon nc-bank",
    component: <SupervisorComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/operatorcomponentota",
    name: "HRM Ota Operator Component",
    icon: "nc-icon nc-bank",
    component: <OperatorComponentOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/addoperatorcomponentota",
    name: "HRM Ota Add new Operator ",
    icon: "nc-icon nc-bank",
    component: <AddOperatorComponentOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/addassignoperatorota/:id",
    name: "HRM Ota Assign Operator ",
    icon: "nc-icon nc-bank",
    component: <AddAssignOperatorOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/addassignopnbraidota/:id",
    name: "HRM Ota Assign Operator ",
    icon: "nc-icon nc-bank",
    component: <AddAssignOpNbraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multiplesectionassignota/:id1/:id2",
    name: "HRM Ota Multiple section Assign Operator ",
    icon: "nc-icon nc-bank",
    component: <MultipleSectionAssignOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/viewoperatorota/:id",
    name: "HRM Ota View Operator ",
    icon: "nc-icon nc-bank",
    component: <ViewOperatorOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/editoperatorota/:id",
    name: "HRM Ota Edit Operator ",
    icon: "nc-icon nc-bank",
    component: <EditOperatorOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changepasswordota/:id",
    name: "HRM Ota Change Password Operator ",
    icon: "nc-icon nc-bank",
    component: <ChangePasswordOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/converttocategoryota/:id",
    name: "HRM Ota Convert Operator ",
    icon: "nc-icon nc-bank",
    component: <ConvertToCategoryOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  
  {
    path: "/hrm/ota/assignlistota",
    name: "HRM Ota Assign List",
    icon: "nc-icon nc-bank",
    component: <AssignListOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/braidlistota",
    name: "HRM Ota BraidList",
    icon: "nc-icon nc-bank",
    component: <BraidListOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/hrm/ota/nonbraidlistota",
    name: "HRM Ota NonBraidList ",
    icon: "nc-icon nc-bank",
    component: <NonBraidListOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 
  {
    path: "/hrm/ota/employeelistota",
    name: "HRM Ota Employees",
    icon: "nc-icon nc-bank",
    component: <EmployeeListOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/employeesota",
    name: "HRM Ota Employees braid ",
    icon: "nc-icon nc-bank",
    component: <EmployeesOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/hrm/ota/viewworkerbraidota/:id",
    name: "HRM Ota Employees braid view worker",
    icon: "nc-icon nc-bank",
    component: <ViewWorkerBraidOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/editworkerbraidota/:id",
    name: "HRM Ota Employees braid edit worker",
    icon: "nc-icon nc-bank",
    component: <EditWorkerBraidOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 {
    path: "/hrm/ota/changetooperatorota/:id",
    name: "HRM Ota Employees braid change to operator",
    icon: "nc-icon nc-bank",
    component: <ChangeToOperatorOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
   {
    path: "/hrm/ota/nbraidemployeesota",
    name: "HRM Ota Employees nbraid ",
    icon: "nc-icon nc-bank",
    component: <NbraidEmployeesOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/viewworkerota/:id",
    name: "HRM Ota Employees nbraid view worker",
    icon: "nc-icon nc-bank",
    component: <ViewWorkerOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/editworkerota/:id",
    name: "HRM Ota Employees nbraid edit worker",
    icon: "nc-icon nc-bank",
    component: <EditWorkerOta  />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  }, 

{
    path: "/hrm/ota/zonetypeota",
    name: "HRM Ota Change Zone Type",
    icon: "nc-icon nc-bank",
    component: <ZoneTypeOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezoneota",
    name: "HRM Ota Change Zone Braid Without Checkbox",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multiplezonechangeota",
    name: "HRM Ota Change Zone Braid Without Checkbox multichange",
    icon: "nc-icon nc-bank",
    component: <MultipleChangeZoneOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezonecheckboxota",
    name: "HRM Ota Change Zone Braid With Checkbox ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneCheckboxOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezonetonbraidota",
    name: "HRM Ota Change Zone Convert Braid to Nbraid ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneToNbraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multiplezonetonbraidota",
    name: "HRM Ota Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneToNbraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezonenbraidota",
    name: "HRM Ota Change Zone NBraid Without Checkbox",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneNbraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multiplezonenbraidota",
    name: "HRM Ota Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneNbraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezonenbraidcheckboxota",
    name: "HRM Ota Change Zone NBraid With Checkbox ",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneNbraidCheckboxOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changezonetobraidota",
    name: "HRM Ota Change Zone NBraid to Braid",
    icon: "nc-icon nc-bank",
    component: <ChangeZoneToBraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multiplezonetobraidota",
    name: "HRM Ota Change Zone Multiple change zone to nbraid",
    icon: "nc-icon nc-bank",
    component: <MultipleZoneToBraidOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
 
  {
    path: "/hrm/ota/changeshiftopota",
    name: "HRM Ota BraidList",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftOpOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multipleshiftchangeoperatorota",
    name: "HRM Ota NonBraidList ",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChangeOperatorOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changeshiftcomponentota",
    name: "HRM Ota Change Shift",
    icon: "nc-icon nc-bank",
    component: <ChangeShiftComponentOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multipleshiftchangeota",
    name: "HRM Ota Multiple Change Shift",
    icon: "nc-icon nc-bank",
    component: <MultipleShiftChangeOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/changeworkercomponentota",
    name: "HRM Ota Change Worker",
    icon: "nc-icon nc-bank",
    component: <ChangeWorkerComponentOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/multipleworkertypechangeota",
    name: "HRM Ota Multiple Change Worker",
    icon: "nc-icon nc-bank",
    component: <MultipleWorkerTypeChangeOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/hrm/ota/employeesfdacomponentota",
    name: "HRM Ota Employees FDA",
    icon: "nc-icon nc-bank",
    component: <EmployeesFdaComponentOta />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/employeetimesheet/dataaccuracy",
    name: "Data Accuracy",
    icon: "nc-icon nc-bank",
    component: <DataAccuracy />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
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
  {
    path: "/tvdisplay/sopcomponent",
    name: "SOP Component",
    icon: "nc-icon nc-bank",
    component: <SOPComponent />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/tvdisplay/addnewsop",
    name: "Add New SOP",
    icon: "nc-icon nc-bank",
    component: <AddNewSOP />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },
  {
    path: "/tvdisplay/viewsop/:id",
    name: "Add New SOP",
    icon: "nc-icon nc-bank",
    component: <ViewSOP />,
    layout: "/admin",
    hidden: true, // Add a hidden property to control visibility
  },



  
  
  
  
  //Main submenu
  {
    path: "#",
    name: "Master",
    icon: "nc-icon nc-credit-card",
    //component: <AddNewColor />,
    layout: "/admin",
    submenu: [
      {
        path: "/master/colormaster",
        name: "Color Master",
        //icon: "nc-icon nc-diamond",
        component: ColorMaster,
        layout: "/admin",
      },
      {
        path: "/master/linemaster",
        name: "Line Master",
        //icon: "nc-icon nc-diamond",
        component: LineMaster,
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
        path: "/master/machinemaster",
        name: "Machine Master",
        //icon: "nc-icon nc-diamond",
        component: MachineMaster,
        layout: "/admin",
      },
      {
        path: "/master/wastemaster",
        name: "Waste Master",
        //icon: "nc-icon nc-diamond",
        component: WasteMaster,
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
        path: "/master/planvstarget", 
        name: "Plan Vs Target",
        //icon: "nc-icon nc-diamond",
        component: PlanVsTarget,
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
        path: "/hrm/admincomponent",
        name: "Admin ",
        layout: "/admin",
      },
      {
        path: "/hrm/addemployee",
        name: "Add Employee ",
        layout: "/admin",
      },
      {
        path: "#",
        name: "Ikeja",
        layout: "/admin",
        submenu: [
          {
            path: "/hrm/ikeja/operatorcomponent",
            name: "Operator",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/assignlist",
            name: "Assign Operator Work",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/changeshiftop",
            name: "Change Shift[ Operator ]",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/employeelist",
            name: "Employees",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/zonetype",
            name: "Change Zone",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/changeshiftcomponent",
            name: "Change Shift",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/changeworker",
            name: "Change WorkerType",
            layout: "/admin",
          },
          {
            path: "/hrm/ikeja/fda_employeelist",
            name: "Emp(FDA)",
            layout: "/admin",
          },

        ],
      },
      {
        path: "#",
        name: "Ota",
        layout: "/admin",
        submenu: [
          {
            path: "/hrm/ota/supervisorcomponent",
            name: "Supervisor",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/operatorcomponentota",
            name: "Operator",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/assignlistota",
            name: "Assign Operator Work",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/changeshiftopota",
            name: "Change Shift[ Operator ]",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/employeelistota",
            name: "Employees",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/zonetypeota",
            name: "Change Zone",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/changeshiftcomponentota",
            name: "Change Shift",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/changeworkercomponentota",
            name: "Change WorkerType",
            layout: "/admin",
          },
          {
            path: "/hrm/ota/employeesfdacomponentota",
            name: "Emp(FDA)",
            layout: "/admin",
          },
         
        ],
      },
    ],
  },
 
  {
    path: "#",
    name: "FG Output",
    icon: "nc-icon nc-circle-10",
    /* component: <UserPage />, */
    layout: "/admin",
    submenu: [
      {
        path: "#",
        name: "Ikeja",
        layout: "/admin",
        submenu: [
          {
            path: "/fgoutput/ikejabraidfgoutput", 
            name: "braid fgoutput",
            layout: "/admin",
          },
          {
            path: "/fgoutput/ikejanbraidfgoutput", 
            name: "nbraid fgoutput",
            layout: "/admin",
          },
          
        ],
      },
      {
        path: "#",
        name: "Ota",
        layout: "/admin",
        submenu: [
          {
            path: "/fgoutput/otabraidfgoutput", 
            name: "braid fgoutput",
            layout: "/admin",
          },
          {
            path: "/fgoutput/otanbraidfgoutput", 
            name: "nbraid fgoutput",
            layout: "/admin",
          },
         
        ],
      },
   
    ],
  },
  {
    path: "#",
    name: "Employee Timesheet",
    icon: "nc-icon nc-single-02",
    /* component: <UserPage />, */
    layout: "/admin",
    submenu: [
      {
        path: "#",
        name: "Braid",
        layout: "/admin",
        submenu: [
          {
            path: "/employeetimesheet/addemployeetimesheetbraid", 
            name: "Add",
            layout: "/admin",
          },
          {
            path: "/employeetimesheet/employeetimesheetbraidlist", 
            name: "List",
            layout: "/admin",
          },
          
        ],
      },
      {
        path: "#",
        name: "Non-braid",
        layout: "/admin",
        submenu: [
          {
            path: "/employeetimesheet/addemployeetimesheetnbraid", 
            name: "Add",
            layout: "/admin",
          },
          {
            path: "/employeetimesheet/employeetimesheetnbraidlist",
            name: "List",
            layout: "/admin",
          },
         
        ],
      },
   
    ],
  },
  
  {
    path: "#",
    name: "Data & Reports",
    icon: "nc-icon nc-chart-pie-36",
    /* component: <UserPage />, */
    layout: "/admin",
    submenu: [
      {
        path: "#",
        name: "Braid",
        layout: "/admin",
        submenu: [
          {
            path: "/report/braidperformanceeffindividual",
            name: "Prf.Eff(Individual)",
            layout: "/admin",
          },
          {
            path: "/report/braidplanvsactualreport",
            name: "PLAN VS ACTUAL",
            layout: "/admin",
          },
          {
            path: "/report/braidmtdpppaveragereport",
            name: "MTD AVG PPP",
            layout: "/admin",
          },
          {
            path: "/report/employeetimesheetreportbraid",
            name: "Employee Timesheet",
            layout: "/admin",
          },
          {
            path: "/report/performanceefficiencyreport",
            name: "Performance Efficiency",
            layout: "/admin",
          },
          {
            path: "/report/productionbreakdown",
            name: "Production Breakdown",
            layout: "/admin",
          },
          {
            path: "/report/daywiseproductionreport",
            name: "Day wise Production",
            layout: "/admin",
          },
          {
            path: "/report/wastage",
            name: "Wastage ",
            layout: "/admin",
          },
          {
            path: "/report/wastageperitemreport",
            name: "Wastage % per item ",
            layout: "/admin",
          },
          {
            path: "/report/productiondashboardreport",
            name: "Production Dashboard",
            layout: "/admin",
          },
          {
            path: "/report/pppoverall",
            name: "PPP(Overall)",
            layout: "/admin",
          },
          {
            path: "/report/machinedowntimereport",
            name: "Machine Downtime",
            layout: "/admin",
          },
          {
            path: "/report/machineefffgoutputreport",
            name: "Machine η(FGOUTPUT)",
            layout: "/admin",
          },
          {
            path: "/report/machineeffwastereport",
            name: "Machine η(WASTE MGT)",
            layout: "/admin",
          },
          {
            path: "/report/machineeffppmreport",
            name: "Machine η(PPM)",
            layout: "/admin",
          },
          {
            path: "/report/machinehoursreport",
            name: "Machine Hour",
            layout: "/admin",
          },
          
        ],
      },
      {
        path: "#",
        name: "Non-braid",
        layout: "/admin",
        submenu: [
          {
            path: "/report/attendancereport",
            name: "Attendance Report",
            layout: "/admin",
          },
          {
            path: "/report/fgmonthlyreport",
            name: "FG MONTHLY",
            layout: "/admin",
          },
          {
            path: "/report/performanceeffindividual",
            name: "Prf.Eff(Individual)",
            layout: "/admin",
          },
          {
            path: "/report/planvsactualreport",
            name: "PLAN VS ACTUAL",
            layout: "/admin",
          },
          {
            path: "/report/mtdpppaveragereport",
            name: "MTD AVG PPP",
            layout: "/admin",
          },
          {
            path: "/report/efficiencyoverviewreport",
            name: "Efficiency Overview",
            layout: "/admin",
          },
          
          {
            path: "/report/performanceefficiencynbraidreport",
            name: "Performance Efficiency",
            layout: "/admin",
          },
          {
            path: "/report/performanceoverviewnbraidreport",
            name: "Performance Overview",
            layout: "/admin",
          },
          {
            path: "/report/productivityreport",
            name: "Productivity Report & Display ",
            layout: "/admin",
          },
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
            path: "/report/fgoutputreport",
            name: "FG OUTPUT ",
            layout: "/admin",
          },
          {
            path: "/report/productivemanpowerreport",
            name: "Productive Manpower ",
            layout: "/admin",
          },
          {
            path: "/report/workerefficiencyreport",
            name: "Worker Efficiency  ",
            layout: "/admin",
          },
          {
            path: "/report/operatorefficiencyreport",
            name: "Operator Efficiency",
            layout: "/admin",
          },
          {
            path: "/report/supervisorefficiencyreport",
            name: "Supervisor Efficiency",
            layout: "/admin",
          },
          
          
         
        ],
      },
   
    ],
  },
  {
    path: "#",
    name: "Data Export Import",
    icon: "nc-icon nc-money-coins",
    /* component: <UserPage />, */
    layout: "/admin",
    submenu: [
      {
        path: "#",
        name: "Braid",
        layout: "/admin",
        submenu: [
          {
            path: "/import/braidupdateattendanceimport",
            name: "Update Attendance ",
            layout: "/admin",
          },
        ],
      },
      {
        path: "#",
        name: "Non-braid",
        layout: "/admin",
        submenu: [
          {
            path: "/import/nonbraidupdateattendanceimport",
            name: "Update Attendance",
            layout: "/admin",
          },
          {
            path: "/import/fgoutputimport",
            name: "Fg Output",
            layout: "/admin",
          },
         
        ],
      },
      {
            path: "/import/colorimport",
            name: "Color Master ",
            layout: "/admin",
      },
      {
            path: "/import/lineimport",
            name: "Line Master ",
            layout: "/admin",
      },
      {
            path: "/import/sectionimport",
            name: "Section Master ",
            layout: "/admin",
      },
      {
            path: "/import/itemimport",
            name: "Item Master ",
            layout: "/admin",
      },
      {
            path: "/import/planvstargetimport",
            name: "Plan vs Target ",
            layout: "/admin",
      },
      {
            path: "/import/itemcodeimport",
            name: "Item Color Code",
            layout: "/admin",
      },
      
   
    ],
  },
  {
    path: "/attrition/dashboardattrition",
    name: "Attendance Dashboard",
    icon: "nc-icon nc-watch-time",
    component: <DashboardAttrition />,
    layout: "/admin",
  },
  {
    path: "#",
    name: "Import Timesheet",
    icon: "nc-icon nc-money-coins",
    layout: "/admin",
    submenu: [
      {
        path: "/importtimesheet/filtertimesheet",
        name: "Filter Timesheet",
        layout: "/admin",
      },
      {
        path: "/importtimesheet/importtimesheet",
        name: "Import Timesheet",
        layout: "/admin",
      },
      {
        path: "/importtimesheet/viewtimesheet",
        name: "View Timesheet",
        layout: "/admin",
      },
    ],
  },
  {
    path: "#",
    name: "TV Display",
    icon: "nc-icon nc-money-coins",
    layout: "/admin",
    submenu: [
      {
        path: "/tvdisplay/sopcomponent",
        name: "SOP & Safety",
        layout: "/admin",
      },
      {
        path: "/tvdisplay/analyticscomponent",
        name: "Analytics",
        layout: "/admin",
      },
      
    ],
  },
  
  
];
export default routes;
