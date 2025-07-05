import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle, Row, Col } from "reactstrap";
import $ from 'jquery';
import config from '../../config';

function ViewSOP() {
  const [sop, setSOP] = useState(null); // State to hold fetched data
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { id } = useParams();

  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
    'Authorization': `${token}` // Include the token in the header
  };

useEffect(() => {
    document.title = 'View SOP';
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetch(`${config.apiUrl}/viewsop?id=${id}`, {
        headers: {
          'Authorization': localStorage.getItem('token') // Include the token in the header
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch SOP.');
          }
          return response.json();
        })
        .then(data => {
          setSOP(data[0]);
          setServerMessage('SOP fetched successfully!');
          setServerMessageClass('alert alert-success');
        })
        .catch(error => {
          console.error(error);
          setServerMessage('Failed to fetch SOP.');
          setServerMessageClass('alert alert-danger');
        });
    }
  }, [id, navigate]);

useEffect(() => {
    if (sop) {
      // Alert the file type of sop for debugging
      //alert(`File Type: ${sop.file_type}`);
    }
  }, [sop]);

useEffect(() => {
  if (sop) {
    console.log('SOP:', sop);
    console.log('File Type:', sop.file_type);
    console.log('File Extension:', sop.file_extension);
    console.log('PDF URL:', `${config.apiUrl}/uploads/${sop.file_name}`);
  }
}, [sop]);

const openPDFInNewTab = () => {
    if (sop) {
      const pdfUrl = `${config.apiUrl}/uploads/${sop.file_name}`;
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="content">
      <Row>
        {/*<div className={serverMessageClass} style={{ padding: '2px', margin: '5px 0' }}>
          {serverMessage && <div className="alert">{serverMessage}</div>}
        </div>*/}
        <Col md="12">
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">View SOP</CardTitle>
              <hr />
            </CardHeader>
            <CardBody>
              {sop && (
                <React.Fragment>
                  {sop.file_type === 'IMAGE' && (
                    <img alt="image" id="dpic" className="col" src={`${config.apiUrl}/uploads/${sop.file_name}`} />
                  )}
                 {sop && sop.file_type === 'PDF' && (
                 
                    <div id="pdfContainer" style={{ overflow: 'auto', height: '100vh' }}>
                      <object
                        id="pdfViewer"
                        data={`${config.apiUrl}/uploads/${sop.file_name}`}
                        type="application/pdf"
                        width="100%"
                        height="2000px"
                      >
                        <embed
                          src={`${config.apiUrl}/uploads/${sop.file_name}`}
                          type="application/pdf"
                        />
                      </object>
                    </div>
                  )}

                  {sop.file_type === 'PPT' && (
                    <div dangerouslySetInnerHTML={{ __html: sop.embedded_code }} />
                  )}
                  {sop.file_type === 'Video' && (
                    <div className="fullscreen-video">
                      <div className="video-container">
                        <video height="100%" muted autoPlay loop playsInline preload="auto" style={{ width: '100%', objectFit: 'cover' }}>
                          <source src={`/uploads/${sop.file_name}`} type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}
              <br /><br /><br />
      <button className="btn btn-sm btn-info"><a onClick={() => window.history.back()} ><span className="textblack">Go to Back Page</span></a></button>
            
            </CardBody>
          </Card>
        </Col>
      </Row>
      
    </div>
  );
}

export default ViewSOP;


