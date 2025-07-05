import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
// Datatable Modules
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net-buttons/js/dataTables.buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import { Link } from 'react-router-dom';
import 'jquery/dist/jquery.min.js';
import Select from 'react-select';

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

function ViewItem() {
  const { t } = useTranslation();
const [isActive, setActive] = useState(false);
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
 const [itemId, setItemId] = useState('');
 const [sections, setSections] = useState([]);
 const [sectionOptions, setSectionOptions] = useState([]);
  const tableRef = useRef(null);
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
 const location = useLocation();
 const { id } = useParams();

  const handleEdit = (id) => {
    navigate(`/admin/master/itemsectionedit/${id}`);
  };



useEffect(() => {
    document.title = 'Item Section';
   // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      navigate('/login');
    } else {
      const itemId = id;
    const formDataWithItemId = { ...formData, item_id: itemId };
    const { item_description } = location.state || {};
    const { kg } = location.state || {};
    const { string } = location.state || {};
    const { pcs } = location.state || {};

      $.ajax({
         url: `${config.apiUrl}/getsections/${itemId}`,
        method: 'GET',
        headers: customHeaders,
        success: function (response) {
          setSections(response);
          initializeTable(response);
           const itemDescription = item_description || (response.length > 0 ? response[0].item_description : '');
           const kgg = kg || (response.length > 0 ? response[0].kg : '');
           const stringg = string || (response.length > 0 ? response[0].string : '');
           const pcss = pcs || (response.length > 0 ? response[0].pcs : '');
           // alert(kg);
           setFormData((prevFormData) => ({
             ...prevFormData,
             item_description: itemDescription,
             kg: kgg,
             string: stringg,
             pcs: pcss,
           }));
          //alert('Item Description: ' + itemDescription); // Alert the item description
        },
        error: function (xhr, status, error) {
          console.error('Error fetching sections:', error);
        },
      });
      

      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }
        tableRef.current = $('#example').DataTable({
          dom: 'Bfrtip',
          buttons: ['copy', 'csv'],
        });
      });
   }
    window.handleEdit = handleEdit;
     window.handleDelete = handleDelete;
     // Fetch section options from API

  }, []);

  const initializeTable = (data) => {
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy();
      }

      if (data.length > 0) {
        tableRef.current = $('#example').DataTable({
          data: data,
          dom: 'Bfrtip',
          dom: '<"row justify-content-end"<"col-md-9"B><"col-md-3"f>>t<"row justify-content-end"<"col-md-9"i><"col-md-3"p>>', // Position controls accordingly
          buttons: ['copy', 'csv'],
          columns: [
            { data: null },
            { data: 'section_name' },
            { data: 'target_unit' },
            { data: 'target' },
            { data: 'utarget' },
            { data: null },
          ],
          columnDefs: [
            {
              targets: 0,
              render: function (data, type, row, meta) {
                return meta.row + 1;
              },
            },
            {
              targets: 5,
              render: function (data, type, row, meta) {
                const id = row.id;

                return `
                  <button class="btn btn-sm btn-warning" onclick="window.handleEdit(${id})"><i class="bx bx-edit"></i> Edit</button>
               
                 <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})"><i class="fa fa-trash" aria-hidden="true" title="delete"></i></button>
               `;
              },
            },
          ],
        });
      }
    });
  };

  const handleDelete = (id) => {
  const confirmDelete = window.confirm('Delete Section');
  if (confirmDelete) {
    fetch(`${config.apiUrl}/delete_target/${id}`, {
      method: 'DELETE',
      headers: customHeaders,
    })
      .then((response) => response.json())
      .then((data) => {
        // Set the server message and style it
        setServerMessage(data.message);
        setServerMessageClass('alert alert-success');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();
        }, 5000);
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        // Set the server error message and style it
        setServerMessage('Invalid Request');
        setServerMessageClass('alert alert-danger');
        // Clear the server message after 3 seconds
        setTimeout(() => {
          setServerMessage('');
          setServerMessageClass('');
          // Reload the page
            window.location.reload();

        }, 3000);
      });
  }
};


const [formData, setFormData] = useState({
  category_id: '',
  subcategory_id: '',
  item_description: '', // Updated to explicitly set the item_description    
  line: '',
  kg: '',
  string: '',
  pcs: '',
});

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};
  


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
                <CardTitle > <h5>{t('Product Name')}: <span className="pdesc">{formData.item_description}</span></h5> {/* Updated line */}
            <h6><u>{t('Conversion Factor')} : </u></h6>
            <span><b>KG : </b><b className="pdesc">{formData.kg}</b></span> , <b style={{ textTransform: 'uppercase' }}>{t('String')} : <b className="pdesc">{formData.string}</b></b> , <b>PCS : <b className="pdesc">{formData.pcs}</b></b>
             </CardTitle>
              </CardHeader>
              <CardBody>
     


            <div className="table-responsive">
                  <table id="example" className="display">
                <thead>
                  <tr>
                  <th>#</th>
                    <th>{t('Section Name')}</th>
                    <th>{t('UOM')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Unit Target')}</th>
                    <th>{t('Action')}</th>
                  </tr>
                </thead>
                <tbody>
                {sections.map((section, index) => (
                    <tr key={section.id}>
                      <td>{index + 1}</td>
                      <td>{section.section_name}</td>
                      <td>{section.target_unit}</td>
                      <td>{section.target}</td>
                      <td>{section.utarget}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                  <th>#</th>
                    <th>{t('Section Name')}</th>
                    <th>{t('UOM')}</th>
                    <th>{t('Target')}</th>
                    <th>{t('Unit Target')}</th>
                    <th>{t('Action')}</th>
                  </tr>
                </tfoot>
              </table>
            </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ViewItem;
