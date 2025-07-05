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
import config from '../../config';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

function ItemSectionTarget() {
    const { t } = useTranslation();
const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [data, setData] = useState([]);
   const [itemCategories, setItemCategories] = useState([]);
  const tableRef = useRef(null);
  const [itemSection, setItemSection] = useState([]);  
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





     useEffect(() => {
        document.title = 'Item Section target';
        // Check if the user is logged in
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
          // Redirect to the login page if not logged in
          navigate('/login');
        } else {
            // Fetch item section from API
           // alert("srr");
            $.ajax({
                url:`${config.apiUrl}/getitemsection`,
                method: 'GET',
                headers: customHeaders,
                success: function (response) {
                  // Set the fetched data in the state
                  setItemSection(response);
                 // alert("sections:"+response);
                },
                error: function (error) {
                  console.error('Error fetching data:', error);
                },
              });
          // Fetch item categories from API
          $.ajax({
            url:`${config.apiUrl}/getitemmasternew`,
            method: 'GET',
            headers: customHeaders,
            success: function (response) {            
              // Set the fetched data in the state
             //  setItemSection(response);
            //   console.log(response);
            //alert("response:"+response)
            const { processedResult, indexcolumn} = response;
           // alert("main:"+processedResult); alert("index:"+indexcolumn);
              // Destroy the existing DataTable instance (if it exists)
              if ($.fn.DataTable.isDataTable('#example')) {
                $('#example').DataTable().destroy();
              }
      
      
      
              // Initialize the DataTable with the updated data
              tableRef.current = $('#example').DataTable({
                dom: 'Bfrtip',
                dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
                buttons: [
                  {
                    extend: 'copy',
                    text: 'Copy',
                    exportOptions: {
                      columns: [0, 1], // Include only the first and second columns in copying
                    },
                  },
                  {
                    extend: 'csv',
                    text: 'CSV',
                    exportOptions: {
                      columns: [0, 1], // Include only the first and second columns in CSV
                    },
                    action: function (e, dt, button, config) {
                      // Hide the action column when CSV button is clicked
                      tableRef.current.column(2).visible(false);
                      $.fn.DataTable.ext.buttons.csvHtml5.action.call(this, e, dt, button, config);
                      tableRef.current.column(2).visible(true); // Show the action column again
                    },
                  },
                ],
                data: processedResult,
                // columns: [
                //   { data: null },
                //   { data: 'category_name' },
                //   { data: 'item_group' },
                //   { data: 'item_description' }, 
                //   { data: null },              
                // ],
     columns: [
                  { data: null },
                  { data: 'category_name' },
                  { data: 'item_group' },
                  { data: 'item_description' }, 
                ...indexcolumn[0].map((dt) => {
                  return {
                    data: null,
                    render: function (data, type, row) {
                      if (type === 'display') {
                        const dd1 = `${"section" + dt}`;
                        return row[dd1];
                      }
                      return data;
                    },
                  };
                }),
                 ],
                columnDefs: [
                  {
                    targets: 0,
                    render: function (data, type, row, meta) {
                      // Render the row index starting from 1
                      return meta.row + 1;
                    }
                  },
                  {
                    targets: 5,
                    render: function (data, type, row, meta) {
                      const id = row.id;                 
                    },
                  },
                ]
              });
            },
            error: function (xhr, status, error) {
              console.log(error);
            }
          });
        }
      }, []);

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
                <CardTitle tag="h5">Item Section Target </CardTitle>
              </CardHeader>
              <CardBody>
              
          <hr></hr>
            
               
                 <Table responsive id="example">
                    <thead className="text-primary">
                      <tr>
                      <th>#</th>
                    <th>{t('Item Category')}</th>
                    <th>{t('Item Code')}</th>
                    <th>{t('Product Name')}</th>
                    {itemSection.map((items, index) => (
                    <th key={index}>{items.section_name}</th>
                     ))}                 
                      </tr>
                    </thead>
                    <tfoot className="text-primary">
                      <tr>
                      <th>#</th>
                    <th>{t('Item Category')}</th>
                    <th>{t('Item Code')}</th>
                    <th>{t('Product Name')}</th>
                    {itemSection.map((items, index) => (
                    <th key={index}>{items.section_name}</th>
                     ))}                 
                      </tr>
                    </tfoot>
                  </Table>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ItemSectionTarget;
