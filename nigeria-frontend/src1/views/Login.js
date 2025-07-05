import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "assets/css/login.css"; // Import the login CSS file
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
  Row,
  Col,
} from "reactstrap";
//DB Connection
import config from '../config';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageClass, setServerMessageClass] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hookconst roleId = sessionStorage.getItem('roleid');
  
  const roleId = sessionStorage.getItem('roleid');
  const userid = sessionStorage.getItem('id');
  const ptype = sessionStorage.getItem('production_type');
  const ctype = sessionStorage.getItem('category_type');
  const token = localStorage.getItem('token');
  const customHeaders = {
      'Authorization': `${token}` // Include the token in the header
  };
     //alert(roleId);
     //alert(ctype);

 const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${config.apiUrl}/signin`, {
        method: 'POST',
        headers: {
          ...customHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password: password }),
      });

      if (response.ok) {
        // Successful response received
        const responseData = await response.json();

        if (responseData.success) {
          // Login success
          // Set session value
          const { roleid } = responseData.result[0];
          const { id } = responseData.result[0];
          const { username } = responseData.result[0];
          const { entryid } = responseData.result[0];
          const { email } = responseData.result[0];
          const { production_type } = responseData.result[0];
          const { category_type } = responseData.result[0];
          const token = responseData.token;
          //alert(token);
          console.log(JSON.stringify(responseData));
          sessionStorage.setItem('token', token); // Store the token
          sessionStorage.setItem('id', id); // Store the user id
          sessionStorage.setItem('username', username); // Store the username
          sessionStorage.setItem('email', email); // Store the email
          sessionStorage.setItem('entryid', entryid); // Store the entryid
          sessionStorage.setItem('roleid', roleid); // Store the roleid
          sessionStorage.setItem('production_type', production_type); // Store the entryid
          sessionStorage.setItem('category_type', category_type); // Store the roleid
          sessionStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', token);
        
          navigate("/admin/dashboard");
        } else {
          // Login failed
          setError(responseData.message);
        }
      } else {
        // Non-successful response received
        setError('An error occurred during login');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred during login');
    }
  };
 
  const h4Style = {
    marginTop: '-20px',
    marginBottom: '20px',
    color: '#3fadd4',
    fontWeight: 600, // Added font-weight
    fontSize: '18px', // Added font-size
    fontFamily: "'Source Sans Pro', sans-serif", // Added font-family
    textAlign: 'center' // Center alignment
  };

  const footerStyle = {
    marginTop: '80px',
    marginBottom: '15px',
    color: '#404E67',
    fontWeight: 400, // Added font-weight
    fontSize: '16px', // Added font-size
    fontFamily: "'Source Sans Pro', sans-serif", // Added font-family
    textAlign: 'center' // Center alignment
  };

  const inputStyle = {
    backgroundColor: '#262e49',
    border: 'none',
    color: '#fff',
  };


  return (
    <>
      <div className="login-page">
      <div className="container">
      
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-4">
      <div className=" loginBox">
      
        
      <h4 style={h4Style}>Sign in to your account.</h4>
        <div className="mb-3">
         
          <input
            type="text"
            id="username"
            name="username"
            placeholder='Your Email'
            className="form-control input-style"
            value={username}
            onChange={handleUsernameChange}
            style={inputStyle}
          />
        </div>
        <div className="mb-5">
         
          <input
            type="password"
            id="password"
            name="password"
            placeholder='Your Password '
            className="form-control input-style"
            value={password}
            onChange={handlePasswordChange}
            style={inputStyle}
          />
        </div>
        <button type="submit" className="btn btn-primary btn1">Sign In</button>
        <div className="row">
       {/*  <div className="col-md-9 mt-4 white"><p><i className="fa fa-key"></i> Forgot Password?</p></div> */}                              
      </div>
        <div style={footerStyle}>
            <span >Developed by <i class="fa fa-heart pulse"></i> <a href="https://3sdsolutions.com" style={{color: '#3fadd4' }}>3sdsolutions.com</a></span>
        </div>
      </div>
     
      </form>
      
    </div>
    </div>
    </>
  );
}

export default Login;
