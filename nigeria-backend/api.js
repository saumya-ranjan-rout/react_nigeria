const odbc = require('odbc');
const mysql = require('mysql');
const express = require("express");
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sqlString = require('sqlstring');
const multer = require('multer');
const csv = require('csv-parser');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');// ETA Nigeria
const jwt = require('jsonwebtoken');
const properties = require(`./properties.json`);
const authUtils = require('./auth/authUtils');
const environment = properties.env.environment || 'development';
const authenticateJWT = require('./middleware/authenticateJWT');
const config = require(`./config.${environment}.json`);
const dateUtils = require('./date/dateUtils');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');


const dbConfig = {
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  port: config.database.port,
  database: config.database.databaseName,
  connectionLimit: 10,
};
const db = mysql.createConnection(dbConfig);
db.connect();

// Create a MySQL connection pool
const dbPool = mysql.createPool(dbConfig);

// Utility function to get a connection from the pool
const getPoolConnection = () => {
  return new Promise((resolve, reject) => {
    dbPool.getConnection((err, connection) => {
      if (err) {
        console.error('Error acquiring connection:', err);
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

// Utility function to execute a query
const executeQuery = (connection, sqlQuery, values) => {
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Function to begin a transaction
const beginTransaction = async (connection) => {
  await connection.beginTransaction();
};

// Function to commit a transaction
const commitTransaction = async (connection) => {
  await connection.commit();
};

// Function to rollback a transaction
const rollbackTransaction = async (connection) => {
  await connection.rollback();
};

module.exports = db;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.urlencoded({
    extended:true
}));
app.use(express.json());
// Increase the payload size limit to 10MB (adjust the limit as per your requirement)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));



const secretKey = config.auth.secretKey;

const currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
//console.log("currentDate:: DD-MM-YYYY", currentDate);
const currentDate2 = dateUtils.getCurrentDate("DD/MM/YYYY");
//console.log("currentDate:: DD/MM/YYYY", currentDate2);
const currentDateTime = dateUtils.getCurrentDate("YYYY-MM-DD HH:mm:ss");
//console.log("currentDateTime:: DD-MM-YYYY", currentDateTime);
const currentMonthYear = dateUtils.getCurrentMonthYear();
//console.log("currentMonthYear:: MM/YYYY", currentMonthYear);
const currentYear = dateUtils.getCurrentYear();
//console.log("currentYear:: YYYY", currentYear);
const currentMonth = dateUtils.getCurrentMonth();
//console.log("currentMonth:: MM", currentMonth);
const currentTimestamp = dateUtils.getCurrentUnixTimestamp();

// API endpoint for login validation
app.post('/signin', async (req, res) => {
  let connection;
  //console.log("1");
  try {
  const { email, password } = req.body;
  //const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
  // Perform validation by querying the MySQL table
  connection = await getPoolConnection();

  // Perform validation by querying the MySQL table
  const user = await executeQuery(connection, 'SELECT id, roleid, username, entryid, email, pass FROM geopos_users WHERE (email = ? OR username = ? OR entryid = ?) AND banned = 0', [email, email, email]);

  if (user.length > 0) {
    const userId = `${user[0].id}`;
    const hashedPassword = authUtils.hashPassword(password, userId);
    console.log("hashedPassword", hashedPassword);

    if (hashedPassword === user[0].pass) {
      // Credentials are valid
      const user_details = {
        id: user[0].id,
        roleid: user[0].roleid,
        username: user[0].username,
        entryid: user[0].entryid,
        email: user[0].email,
      };

      const token = jwt.sign(user_details, secretKey);
      console.log("token:", token);
      console.log("user:", user);

      res.json({ success: true, result: user, token: token });
    } else {
      // Credentials are invalid
      res.json({ success: false, message: 'Invalid password' });
    }
  } else {
    // Credentials are invalid
    res.json({ success: false, message: 'Invalid username' });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


const configVars = {
  usePasswordHash: false,
  passwordHashOptions: {
    saltRounds: 10, // Adjust the number of salt rounds as needed
    // Other bcrypt options can be added here
  },
  hash: 'sha256', // Set your desired hash algorithm (e.g., 'sha256')
};

// Function to hash a password
function hashPassword(pass, userId) {
  if (configVars.usePasswordHash) {
    const saltRounds = configVars.passwordHashOptions.saltRounds || 10; // Set your desired salt rounds
    return bcrypt.hash(pass, saltRounds);
  } else {
    const salt = crypto.createHash('md5').update(userId).digest('hex'); // Calculate MD5 hash
    const hashAlgorithm = configVars.hash || 'sha256'; // Set your desired hash algorithm
    return crypto.createHash(hashAlgorithm).update(salt + pass).digest('hex');
  }  
}




/**
 * @swagger
 * /getattendance:
 *   get:
 *     summary: Retrieve attendance data
 *     tags:
 *       - Attendance
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Attendance data retrieved and updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Status message indicating success
 *               example: "1"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an issue retrieving attendance data
 *                   example: "Error retrieving attendance data"
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                   example: false
 */



app.get("/getattendance",authenticateJWT, async (req, res) => {
  console.log("hi-10");
  const dsn = 'mssql_odbc';
  const user = 'SABeleza';
  const password = '3SD_Beleza';
  const connectionString = `DSN=${dsn};UID=${user};PWD=${password}`;

  let str = '';
  let type = '';
  let etime = '';
  let actt = '';
  let sites = '';
  let i=1;  
  let connectionn;
  try{
  
      connectionn = await getPoolConnection();
    const connection = await odbc.connect(connectionString);
    const sqlQuery = `
      set nocount on;
      declare @page_size int = 6000;
      declare @page int = 1;

      with [data] as (
        select distinct 
          Chave, DtMarcacao, DtHrMarcacao, TpContratoCth, CdCampoAdc1, Activo
        from 
          RcsHumanos inner join CthMarcacoesLG on
          RcsHumanos.UIRcsHumano = CthMarcacoesLG.UIFuncionario
        where  
          cast(DtMarcacao as Date) = cast(getdate() as Date)
      )
      select
        Chave, DtMarcacao, DtHrMarcacao, TpContratoCth, CdCampoAdc1, Activo
      from 
        [data]   
      order by     
        DtMarcacao desc
      offset 
        @page_size * (@page - 1) rows
      fetch next 
        @page_size rows only;
    `;

    // Execute the SQL query
    const result = await connection.query(sqlQuery);

    // Process the result
    result.forEach(row => {
      i++;
      const sonuc = row.Chave;
      const ty = row.TpContratoCth;
      str += sonuc + ',';
      type += ty + ',';
      etime += row.DtHrMarcacao + ',';
      sites += row.CdCampoAdc1 + ',';
      actt += row.Activo + ',';
    });

    // Close the connection
    await connection.close();

  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors appropriately
    res.status(500).send('Error retrieving attendance data');
  }

  const date =  dateUtils.getCurrentDate("DD-MM-YYYY");
  const time = dateUtils.getCurrentDate('YYYY-MM-DD HH:mm:ss');
  //console.log("date",date);

  // Fetch employee data
  const [empRows] = await executeQuery(connectionn,'SELECT * FROM employees_moz LIMIT 1');
   const erow = empRows;
 //  console.log("erow",erow);

  // Check if the date needs to be updated
  if (erow.date !== date) {
    await executeQuery(connectionn,`UPDATE employees_moz SET status='A', date='${date}'`);
    console.log('Employee data updated successfully');
  }

 // console.log(str.length);
  const st = str.slice(0, -1); // remove the trailing comma
  const p = st.split(",");
  const typ = type.split(",");
  const entryTime = etime.split(",");
  const sites_s = sites.split(",");
  const actt_t = actt.split(",");
  let output = 'case';
  let entrytm = 'case';
  let active = 'case';
  let sitesm = 'case';;

  p.forEach((pr, key) => {
    output += ` when entryid = '${pr}' then '${typ[key]}'`;
    entrytm += ` when entryid = '${pr}' then '${entryTime[key]}'`;
    active += ` when entryid = '${pr}' then '${actt_t[key]}'`;
    sitesm += ` when entryid = '${pr}' then '${sites_s[key]}'`;
  });
  
  output += ' end';
  entrytm += ' end';
  active += ' end';
  sitesm += ' end';

  //console.log("entrytm",entrytm);

  if (st) {
   
    const escapedSt = db.escape(st).replace(/^'|'$/g, '');
  //  console.log("escapedSt",escapedSt);
    
    const existingEntryIds = [];
    const result = await executeQuery(connectionn,`SELECT entryid FROM employees_moz WHERE entryid IN (${escapedSt})`);
   // console.log("result",result.length);
    if (result) {
      result.forEach(row => {
        existingEntryIds.push(`'${row.entryid}'`);
      });

    

      if (existingEntryIds.length > 0) {
        const existingEntryIdsString = existingEntryIds.join(',');
      
        // Assuming 'conn' is your MySQL connection object
        const updateQuery = `UPDATE employees_moz SET status='P', update_date='${time}', Activo=(${active}), site=(${sitesm}), entry_time=(${entrytm}) WHERE entryid IN (${existingEntryIdsString})`;
      
        // Execute the update query
        const a1 = await executeQuery(connectionn,updateQuery);

        const mon = dateUtils.getCurrentMonthYear();
        const date =  dateUtils.getCurrentDate("DD-MM-YYYY");
        const formattedLastDay = dateUtils.convertDateFormat(date, 'DD-MM-YYYY', 'YYYY-MM-DD');
        const time_stamp = dateUtils.convertToUnixTimestamp(formattedLastDay);


        const r = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND roleid=?';
const r1 = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND status=? AND roleid=?';

const [rResult] =  await promisifyQuery(db,r, [date,'1']);
const row = rResult ? rResult.li : 0;

const [r1Result] =  await promisifyQuery(db,r1, [date, 'P', '1']);
const row1 = r1Result ? r1Result.li : 0;

const [r2Result] =  await promisifyQuery(db,r1, [date, 'A', '1']);
const row2 = r2Result ? r2Result.li : 0;


const re = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND Activo=? AND site=? AND roleid=?';
const re1 = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND Activo=? AND site=? AND status=? AND roleid=?';

const [reResult] =  await promisifyQuery(db,re, [date,'1','BELEZA','1']);
const rowe = reResult ? reResult.li : 0;

const [re1Result] =  await promisifyQuery(db,re1, [date,'1','BELEZA', 'P', '1']);
const rowe1 = re1Result ? re1Result.li : 0;

const [re2Result] =  await promisifyQuery(db,re1, [date,'1','BELEZA', 'A', '1']);
const rowe2 = re2Result ? re2Result.li : 0;



const ro = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND Activo=? AND site=? AND roleid=?';
const ro1 = 'SELECT COUNT(*) as li FROM employees_moz WHERE date=? AND Activo=? AND site=? AND status=? AND roleid=?';

const [roResult] =  await promisifyQuery(db,ro, [date,'1','BELEZA','3']);
const rowo = roResult ? roResult.li : 0;

const [ro1Result] =  await promisifyQuery(db,ro1, [date,'1','BELEZA', 'P', '3']);
const rowo1 = ro1Result ? ro1Result.li : 0;

const [ro2Result] =  await promisifyQuery(db,ro1, [date,'1','BELEZA', 'A', '3']);
const rowo2 = ro2Result ? ro2Result.li : 0;



const [resultAttendance] =  await promisifyQuery(db,'SELECT * FROM mz_attendance WHERE date=?', [date]);

//console.log("resultAttendance",resultAttendance);

if (resultAttendance !== undefined && resultAttendance.id !=='') {
 // console.log(attendanceRow);
  await promisifyQuery(db,
    'UPDATE mz_attendance SET present_employee=?, absent_employee=?, total_employee=?, total_operator=?, abs_operator=?, pr_operator=?, active_beleza_total_employee=?, active_beleza_present_employee=?, active_beleza_absent_employee=? WHERE id=?',
    [row1, row2, row, rowo, rowo2, rowo1, rowe, rowe1, rowe2, resultAttendance.id]
  );
} else {

  await promisifyQuery(db,
    'INSERT INTO mz_attendance (total_employee,present_employee,absent_employee,total_operator,abs_operator,pr_operator,active_beleza_total_employee,active_beleza_present_employee,active_beleza_absent_employee,date,mon,time_stamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [row, row1, row2, rowo, rowo2, rowo1, rowe, rowe1, rowe2, date, mon, time_stamp]
  );
}

console.log("hi0");
 if (a1) {
  console.log("hi1");
  
  res.json("1");
            } else {
              console.log("hi2");
              res.status(500).send('Connection Error');
            }
         } 
    else {
      console.log("hi3");
      res.json("2");
     
        }
    } 
   else {
    console.log("hi4");
    res.status(500).send('Connection Error');
    }
} else { 
  console.log("hi5");
  res.json("3");


    }


});


async function promisifyQuery(connection, sql, params) {
  try {
    const results = await executeQuery(connection, sql, params);
    return results;
  } catch (error) {
    console.error('Error:', error.message);
    return []; // Return an empty array if there's an error
  }
}





/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     geopos_users:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *         pass:
 *           type: string
 *         entryid:
 *           type: string
 *         username:
 *           type: string
 *         name:
 *           type: string
 *         banned:
 *           type: integer
 *         last_login:
 *           type: string
 *           format: date-time
 *         last_activity:
 *           type: string
 *           format: date-time
 *         date_created:
 *           type: string
 *           format: date-time
 *         forgot_exp:
 *           type: string
 *         verification_code:
 *           type: string
 *         totp_secret:
 *           type: string
 *         ip_address:
 *           type: string
 *         roleid:
 *           type: integer
 *         picture:
 *           type: string
 *         loc:
 *           type: integer
 *         cid:
 *           type: integer
 *         lang:
 *           type: string
 * 
 * /changelanguage:
 *   put:
 *     summary: Update user language preference.
 *     description: |
 *       This endpoint updates the language preference for a user in the 'geopos_users' table based on the provided language parameter.
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: The new language preference for the user.
 *     responses:
 *       '200':
 *         description: Successful response indicating the successful update of the user's language preference.
 *         content:
 *           application/json:
 *             example:
 *               message: "Language updated successfully"
 *       '500':
 *         description: Internal server error during the language update process.
 *         content:
 *           application/json:
 *             example:
 *               error: "Failed to update language"
 *
 * @function
 * @name updateUserLanguage
 * @memberof module:Routes/User
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the language update process.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

  
// API endpoint to update system language with authentication
app.put('/changelanguage',authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
  const { language } = req.body;
  const { userid } = req.body;

  // Update the language in the database
  const query = 'UPDATE geopos_users SET lang = ? WHERE id = ?';
 // Execute the query with placeholders
 const checkResult = await executeQuery(connection, query, [language, userid]);

 if (checkResult.affectedRows === 0) {
  res.status(404).json({ message: 'Language not updated' });
} else {
  res.status(200).json({ message: 'Language updated successfully' });
}
        

} catch (error) {
  /**
  * Handle exceptions and send an appropriate response.
  * @throws {InternalServerError} Will throw an error if there's an issue with handling exceptions.
  */
  console.error('Error:', error.message);
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


//update company settings
/**
 * @swagger
 *  
 * components:
 *   schemas:
 *     geopos_system:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 10
 *         cname:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         region:
 *           type: string
 *         country:
 *           type: string
 *         postbox:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         taxid:
 *           type: string
 *         tax:
 *           type: integer
 *         currency:
 *           type: string
 *         currency_format:
 *           type: integer
 *         prefix:
 *           type: string
 *         dformat:
 *           type: integer
 *         zone:
 *           type: string
 *         logo:
 *           type: string
 *         lang:
 *           type: string
 *         foundation:
 *           type: date
 * 
 * /update_company:
 *   post:
 *     summary: Update company information.
 *     description: Update company information in the geopos_system table.
 *     tags:
 *       - Company
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cname:
 *                 type: string
 *                 description: The name of the company.
 *                 example: "XYZ Corporation"
 *               phone:
 *                 type: string
 *                 description: The phone number of the company.
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the company.
 *                 example: "info@example.com"
 *               address:
 *                 type: string
 *                 description: The address of the company.
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 description: The city of the company's address.
 *                 example: "City"
 *               region:
 *                 type: string
 *                 description: The region of the company's address.
 *                 example: "Region"
 *               country:
 *                 type: string
 *                 description: The country of the company's address.
 *                 example: "Country"
 *               postbox:
 *                 type: string
 *                 description: The postbox of the company's address.
 *                 example: "12345"
 *               taxid:
 *                 type: string
 *                 description: The tax ID of the company.
 *                 example: "123456789"
 *               foundation:
 *                 type: string
 *                 format: date
 *                 
 *                 example: "2022-11-25"
 *     responses:
 *       200:
 *         description: Successfully updated company information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record Updated successfully"
 *       400:
 *         description: Bad request - Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 *       404:
 *         description: Record not found or updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found or updated"
 *       500:
 *         description: An error occurred while updating company information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating company record"
 *
 * @function
 * @name updateCompanyInfo
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with executing the MySQL query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post('/update_company', authenticateJWT, async (req, res) => {
  const { cname, phone, email, address, city, region, country, postbox, taxid, foundation } = req.body;

  // Validate input data
  if (!cname || !phone || !email || !address || !city || !region || !country || !postbox || !taxid || !foundation) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Convert the foundation date format from "25-11-2022" to "2022-11-25"
  const foundationParts = foundation.split('-');
  const convertedFoundation = `${foundationParts[2]}-${foundationParts[1]}-${foundationParts[0]}`;

  console.log('Received Data:');
  console.log('cname:', cname);
  console.log('phone:', phone);
  console.log('email:', email);
  console.log('address:', address);
  console.log('city:', city);
  console.log('region:', region);
  console.log('country:', country);
  console.log('postbox:', postbox);
  console.log('taxid:', taxid);
  console.log('foundation:', convertedFoundation);

  let connection;

  try {
    connection = await getPoolConnection(); // Assuming getPoolConnection is defined elsewhere
    const result = await executeQuery(connection, 'UPDATE geopos_system SET cname=?,phone=?,email=?,address=?,city=?,region=?,country=?,postbox=?,taxid=?,foundation=?  WHERE id = ?', [cname, phone, email, address, city, region, country, postbox, taxid, convertedFoundation, 1]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found or updated' });
    }

    return res.status(200).json({ message: 'Record Updated successfully' });
  } catch (error) {
    console.error('Error updating company record:', error);
    return res.status(500).json({ message: 'Error updating company record' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /company:
 *   get:
 *     summary: Get company information.
 *     description: Retrieves company information from the geopos_system table.
 *     tags:
 *       - Company
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the company information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the company.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The name of the company.
 *                   example: "XYZ Corporation"
 *                 address:
 *                   type: string
 *                   description: The address of the company.
 *                   example: "123 Main Street, City, Country"
 *                 phone:
 *                   type: string
 *                   description: The phone number of the company.
 *                   example: "+1234567890"
 *       500:
 *         description: An error occurred while fetching company information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching company information"
 *
 * @function
 * @name getCompanyInfo
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with executing the MySQL query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/company', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    // SQL query to retrieve company information
    const query = 'SELECT * FROM geopos_system WHERE id=?';
    // Execute the query
    const result = await executeQuery(connection,query, [1]);
    // Send the result as JSON response
    res.send(result[0]);
  } catch (error) {
    // Handle errors
    console.error('Error executing MySQL query: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});




/**
 * @swagger
 * /company_profile:
 *   post:
 *     summary: Upload company profile picture.
 *     description: Upload a company profile picture to be stored in the geopos_system table.
 *     tags:
 *       - Company
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully uploaded company profile picture.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *       500:
 *         description: An error occurred while uploading the file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error uploading file"
 *
 * @function
 * @name uploadCompanyProfile
 * @memberof module:Routes/Company
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with executing the MySQL query or uploading the file.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// const storage1 = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.resolve(__dirname, '../src/component/CompanyLogo')
//     cb(null, uploadPath)
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//     const originalExtension = path.extname(file.originalname)
//     cb(null, file.fieldname + '-' + uniqueSuffix + originalExtension)
//   },
// })


const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../public/CompanyLogo')
console.log(uploadPath);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    const generatedFilename = file.fieldname + '-' + uniqueSuffix + originalExtension;
    file.generatedFilename = generatedFilename; // Attach generated filename to the file object
    cb(null, generatedFilename);
  },
});

const upload_Path = multer({ storage: storage1 });

app.post('/company_profile', upload_Path.single('file'), authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const file = req.file;
    if (!file) {
      throw new Error('File not uploaded');
    }
    const { generatedFilename } = file; // Use the generated filename

    console.log(`Original Filename: ${file.originalname}`);
    console.log(`Generated Filename: ${generatedFilename}`);

    // MySQL query to store file information
    const query = 'UPDATE geopos_system SET logo=? WHERE id = ?';
    const result = await executeQuery(connection, query, [generatedFilename, 1]);

    console.log('File uploaded successfully');
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /change_password:
 *   post:
 *     summary: Change user password
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword123
 *               userId:
 *                 type: integer
 *                 example: 1
 *               entryid:
 *                 type: string
 *                 example: "50000"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       404:
 *         description: Password not updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password not updated
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name changePassword
 * @description Change user password
 * @memberof module:routes/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
// change password
app.post('/change_password', authenticateJWT, async (req, res) => {
  const { confirmPassword, entryid, adminid } = req.body;
  console.log('adminid:', adminid);
 let connection;
  try {
    connection = await getPoolConnection();
    // Hash the password asynchronously
    const hashedPassword = await hashPassword(confirmPassword, adminid);

    // Update the password in the database
    const result = await executeQuery(connection,'UPDATE geopos_users SET pass=? WHERE entryid = ?', [hashedPassword, entryid]);

    // Check if the record was updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not updated' });
    }

    // Return success message if the record was updated successfully
    return res.status(200).json({ message: 'Record updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Error changing password' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /get_assigned_line_section/{id}:
 *   get:
 *     summary: Get assignments for an operator.
 *     description: Retrieve assignments for an operator based on their ID from the `operator_assign` table.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the operator for whom assignments are to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with assignment details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name_id: 12
 *                 product_name: 97
 *                 line: 1
 *                 section: 28
 *                 shift: "8HRS"
 *                 date: "26-08-2021 01:05:25"
 *                 loc: 0
 *                 item_description: "BRANDI JUMBO"
 *                 section_name: "S.C.M.S.B.P.C"
 *               - id: 2
 *                 name_id: 13
 *                 product_name: 98
 *                 line: 2
 *                 section: 29
 *                 shift: "11HRS"
 *                 date: "26-08-2021 01:10:50"
 *                 loc: 0
 *                 item_description: "AVVIS BRAID"
 *                 section_name: "S.C.M.S.B.P.C"
 *       '404':
 *         description: Operator assignments not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "No assignments found for the operator with ID 123"
 *       '500':
 *         description: Internal server error during assignment retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during assignment retrieval"
 *
 * @function
 * @name getOperatorAssignments
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


//Get asign operator worker list
app.get("/get_assigned_line_section/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  //console.log("id", id);

  const totalassignedlinesectionQuery = 'SELECT operator_assign.*,operator_assign.shift,item_masterr.item_description,section.section_name FROM operator_assign LEFT JOIN item_masterr ON operator_assign.product_name = item_masterr.id LEFT JOIN section ON operator_assign.section = section.id WHERE name_id=? GROUP BY operator_assign.product_name';
  const totalassignedlinesectionResult = await executeQuery(connection, totalassignedlinesectionQuery, [id]);
  res.send(totalassignedlinesectionResult);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

const image_video_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../public/company/'); // Destination folder for uploads
  },
  filename: (req, file, cb) => {
    // Generate a random number between 10000 and 99999 (5-digit number)
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    // Get the file extension
    const fileExtension = file.originalname.split('.').pop();
    // Combine the random number, a timestamp, and the original filename
    const uniqueFilename = `${randomNumber}.${fileExtension}`;
    cb(null, uniqueFilename);

    // cb(null, file.originalname); // Use the original file name
  },
});

const upload_image_video = multer({ storage: image_video_storage });




/**
 * @swagger
 * /upload_image_video:
 *   post:
 *     summary: Upload an image or video
 *     tags:
 *       - Company
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successful file upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded and filename saved successfully
 *       404:
 *         description: Record not updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record not Updated
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the upload
 */

/**
 * @function
 * @name uploadImageOrVideo
 * @description Upload an image or video
 * @memberof module:routes/media
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




//Ensure that the field name matches the one in your frontend
app.post('/upload_image_video', authenticateJWT, upload_image_video.single('image'), async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const id = 1;
      // Get the uploaded filename
      const uploadedFilename = req.file.filename;
      // Update the 'logo' column in the 'geopos_system' table with id 1
      const updateQuery = `UPDATE geopos_system SET logo = ? WHERE id = ?`;
      const result = await executeQuery(connection, updateQuery, [uploadedFilename, id]);

      console.log("File uploaded successfully");
      res.json({ message: 'File uploaded and filename saved successfully' });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /getproduction:
 *   get:
 *     summary: Get production details for a specific date and operator
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the operator
 *       - in: query
 *         name: roleid
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID of the user
 *     responses:
 *       200:
 *         description: Successful response with production details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   product_name:
 *                     type: string
 *                     example: "126"
 *                   line:
 *                     type: string
 *                     example: "1"
 *                   section:
 *                     type: string
 *                     example: "27"
 *                   worker:
 *                     type: string
 *                     example: "Adelaide Fernando Langa"
 *                   entry_id:
 *                     type: string
 *                     example: "1001"
 *                   shift:
 *                     type: string
 *                     example: "11"
 *                   HOUR1:
 *                     type: integer
 *                     example: 289
 *                   HOUR2:
 *                     type: integer
 *                     example: 100
 *                   HOUR3:
 *                     type: integer
 *                     example: 130
 *                   HOUR4:
 *                     type: integer
 *                     example: 0
 *                   HOUR5:
 *                     type: integer
 *                     example: 0
 *                   HOUR6:
 *                     type: integer
 *                     example: 0
 *                   HOUR7:
 *                     type: integer
 *                     example: 0
 *                   HOUR8:
 *                     type: integer
 *                     example: 0
 *                   HOUR9:
 *                     type: integer
 *                     example: 0
 *                   HOUR10:
 *                     type: integer
 *                     example: 0
 *                   HOUR11:
 *                     type: integer
 *                     example: 0
 *                   target:
 *                     type: string
 *                     example: "962.5000"
 *                   remark:
 *                     type: string
 *                     example: " , , ,,,,,,,,,,,,,"
 *                   waste:
 *                     type: string
 *                     example: "5.23,0.12,,,,,,,,,,,,,,"
 *                   hour_loss:
 *                     type: string
 *                     example: ""
 *                   date_time:
 *                     type: string
 *                     example: "04-06-2024"
 *                   time_stamp:
 *                     type: string
 *                     example: "1717365600"
 *                   mon:
 *                     type: string
 *                     example: "02-2024"
 *                   operator_id:
 *                     type: string
 *                     example: "11"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-02-28T12:36:14.000Z"
 *                   item_description:
 *                     type: string
 *                     example: "SUPER NATURAL LOOK"
 *                   value_sum:
 *                     type: integer
 *                     example: 1038
 *                   tar:
 *                     type: integer
 *                     example: 1925
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getProduction
 * @description Get production details for a specific date and operator
 * @memberof module:routes/production
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




app.get("/getproduction", authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const operatorId = req.query.userid;
      const roleId = req.query.roleid;
      const date = dateUtils.getCurrentDate("DD-MM-YYYY");

      let whereConditions = [`worker_timesheet.date_time = '${date}'`];

      if (roleId != 5) {
          whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
      }

      const whereClause = whereConditions.join(' AND ');

      const query = `
          SELECT 
              worker_timesheet.*, 
              item_masterr.item_description,
              SUM(worker_timesheet.HOUR1 + worker_timesheet.HOUR2 + worker_timesheet.HOUR3 + worker_timesheet.HOUR4 + worker_timesheet.HOUR5 + worker_timesheet.HOUR6 + worker_timesheet.HOUR7 + worker_timesheet.HOUR8 + worker_timesheet.HOUR9 + worker_timesheet.HOUR10 + worker_timesheet.HOUR11) AS value_sum,
              SUM(worker_timesheet.target) AS tar
          FROM 
              worker_timesheet
          LEFT JOIN 
              item_masterr ON worker_timesheet.product_name = item_masterr.id
          WHERE 
              ${whereClause}
          GROUP BY 
              worker_timesheet.product_name
      `;

      const result = await executeQuery(connection, query);

      res.send(result);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /dashbord_total_item:
 *   get:
 *     summary: Get the total count of items.
 *     description: |
 *       This endpoint retrieves the total count of items from the database.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of items.
 *         content:
 *           application/json:
 *             example:
 *               totalItem: 50
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalItemCount
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/dashbord_total_item',authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const totalitemquery = `SELECT COUNT(*) as rowCount FROM item_masterr`;
    const totalitemresult = await executeQuery(connection, totalitemquery);

    const rowCount = totalitemresult[0].rowCount;
    const response = {
      totalItem: rowCount, // Use "totalItem" as the key instead of "rowCount"
    };
    res.send(response);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool
  if (connection) {
    connection.release();
    console.log('Connection released');
  }
}

});


/**
 * @swagger
 * /dashbord_total_section:
 *   get:
 *     summary: Get the total count of sections.
 *     description: |
 *       This endpoint retrieves the total count of sections from the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of sections.
 *         content:
 *           application/json:
 *             example:
 *               totalSection: 20
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalSectionCount
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//section row//
app.get('/dashbord_total_section',authenticateJWT, async (req, res) => {
  let connection;
  try {

    connection = await getPoolConnection();
    const totalsectionquery = `SELECT COUNT(*) as rowCount FROM section`;
    const totalsectionresult = await executeQuery(connection, totalsectionquery);


    const rowCount = totalsectionresult[0].rowCount;
    const response = {
      totalSection: rowCount, // Use "totalSection" as the key instead of "rowCount"
    };
    res.send(response);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /dashbord_total_workers:
 *   get:
 *     summary: Get the total count of active workers.
 *     description: |
 *       This endpoint retrieves the total count of active workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of active workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalActiveWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get('/dashbord_total_workers',authenticateJWT, async (req, res) => {
  let connection;
  try {

    connection = await getPoolConnection();
    const totalworkerQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND Activo=? AND site=? AND date=?';
    const totalworkerResult = await executeQuery(connection, totalworkerQuery, ['1', '1','BELEZA', currentDate]);
    const rowCount = totalworkerResult[0].rowCount;
    const response = {
      totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
    };
    res.send(response);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /total_workers_p:
 *   get:
 *     summary: Get the total count of workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/total_workers_p',authenticateJWT, async (req, res) => {
  let connection;
  try {
 // console.log("cdate", date);

 connection = await getPoolConnection();
    const totalworkerpQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND Activo=? AND site=? AND date=? AND status=?';
    const totalworkerpResult = await executeQuery(connection, totalworkerpQuery, ['1', '1', 'BELEZA', currentDate, 'P']);
 const rowCount = totalworkerpResult[0].rowCount;
        const response = {
          totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
        };
        res.send(response);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }

});


/**
 * @swagger
 * /total_workers_a:
 *   get:
 *     summary: Get the total count of workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/total_workers_a',authenticateJWT, async (req, res) => {
  let connection;
  try {
 // console.log("cdate", date);
 connection = await getPoolConnection();
    const totalworkeraQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND Activo=? AND site=? AND date=? AND status=?';
    const totalworkeraResult = await executeQuery(connection, totalworkeraQuery, ['1', '1', 'BELEZA', currentDate, 'A']);

 const rowCount = totalworkeraResult[0].rowCount;
 const response = {
   totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
 };
 res.send(response);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /dashbord_total_operators:
 *   get:
 *     summary: Get the total count of operators.
 *     description: Retrieves the total count of operators from the database.
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the total count of operators.
 *         content:
 *           application/json:
 *             example:
 *               totalOperators: 42
 *       401:
 *         description: Unauthorized error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized error
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal Server Error
 *
 * @function
 * @async
 * @name getTotalOperators
 * @memberof module:Routes/Operator
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {UnauthorizedError} Will throw an error if the request is unauthorized.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/dashbord_total_operators',authenticateJWT, async  (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
      const totaloperatorQuery = 'SELECT COUNT(*) as rowCount FROM geopos_users WHERE roleid=?';
      const totaloperatorResult = await executeQuery(connection, totaloperatorQuery, [3]);

      const rowCount = totaloperatorResult[0].rowCount;
      const response = {
        totalOperators: rowCount, // Use "totalOperators" as the key instead of "rowCount"
      };
      res.send(response);

 
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});




/**
 * @swagger
 * /dashbord_total_direct_workers:
 *   get:
 *     summary: Get the total count of direct workers.
 *     description: |
 *       This endpoint retrieves the total count of direct workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of direct workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalDirectWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */



app.get('/dashbord_total_direct_workers',authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();
    const totaldirectworkersQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=?';
    const totaldirectworkersResult = await executeQuery(connection, totaldirectworkersQuery, ['1','DIRECT', '1', 'BELEZA', currentDate]);
    const rowCount = totaldirectworkersResult[0].rowCount;
    const response = {
      totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
    };
    res.send(response);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /total_direct_workers_p:
 *   get:
 *     summary: Get the total count of direct workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of direct workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of direct workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalDirectWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/total_direct_workers_p', authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();
 // console.log("cdate", date);
 const totaldirectworkerspQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
 const totaldirectworkerspResult = await executeQuery(connection, totaldirectworkerspQuery, ['1','DIRECT', '1', 'BELEZA', currentDate,'P']);
 const rowCount = totaldirectworkerspResult[0].rowCount;
 const response = {
   totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
 };
 res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /total_direct_workers_a:
 *   get:
 *     summary: Get the total count of direct workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of direct workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of direct workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalDirectWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_direct_workers_a',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  //console.log("cdate", date);
  const totaldirectworkersaQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
  const totaldirectworkersaResult = await executeQuery(connection, totaldirectworkersaQuery, ['1','DIRECT', '1', 'BELEZA', currentDate,'A']);
  const rowCount = totaldirectworkersaResult[0].rowCount;
  const response = {
    totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
  };
  res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /dashbord_total_indirect_workers:
 *   get:
 *     summary: Get the total count of indirect workers.
 *     description: |
 *       This endpoint retrieves the total count of indirect workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of indirect workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalIndirectWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/dashbord_total_indirect_workers',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();

      const totalindirectworkersQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=?';
      const totalindirectworkersResult = await executeQuery(connection, totalindirectworkersQuery, ['1','INDIRECT', '1', 'BELEZA', currentDate]);

      const rowCount = totalindirectworkersResult[0].rowCount;
      const response = {
        totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
      };
      res.send(response);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /total_indirect_workers_p:
 *   get:
 *     summary: Get the total count of indirect workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of indirect workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of indirect workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalIndirectWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_indirect_workers_p',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
//  console.log("cdate", date);
const totalindirectworkerspQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
const totalindirectworkerspResult = await executeQuery(connection, totalindirectworkerspQuery, ['1','INDIRECT', '1', 'BELEZA', currentDate,'P']);
const rowCount = totalindirectworkerspResult[0].rowCount;
        const response = {
          totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
        };
        res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /total_indirect_workers_a:
 *   get:
 *     summary: Get the total count of indirect workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of indirect workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of indirect workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalIndirectWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/total_indirect_workers_a', authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();
  //console.log("cdate", date);
  const totalindirectworkersaQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
const totalindirectworkersaResult = await executeQuery(connection, totalindirectworkersaQuery, ['1','INDIRECT', '1', 'BELEZA', currentDate,'A']);

const rowCount = totalindirectworkersaResult[0].rowCount;
const response = {
  totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
};
res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /dashbord_total_proindirect_workers:
 *   get:
 *     summary: Get the total count of non-production indirect workers.
 *     description: |
 *       This endpoint retrieves the total count of non-production indirect workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of non-production indirect workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalNonproductionIndirectWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/dashbord_total_proindirect_workers',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();

      const totalproindirectworkersQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=?';
      const totalproindirectworkersResult = await executeQuery(connection, totalproindirectworkersQuery, ['1','NON-PRODUCTION INDIRECT', '1', 'BELEZA', currentDate]);

      const rowCount = totalproindirectworkersResult[0].rowCount;
      const response = {
        totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
      };
      res.send(response);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /total_proindirect_workers_p:
 *   get:
 *     summary: Get the total count of non-production indirect workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of non-production indirect workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of non-production indirect workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalNonproductionIndirectWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get('/total_proindirect_workers_p',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  //console.log("cdate", date);
  const totalproindirectworkerspQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
  const totalproindirectworkerspResult = await executeQuery(connection, totalproindirectworkerspQuery, ['1','NON-PRODUCTION INDIRECT', '1', 'BELEZA', currentDate,'P']);

  const rowCount = totalproindirectworkerspResult[0].rowCount;
  const response = {
    totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
  };
  res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /total_proindirect_workers_a:
 *   get:
 *     summary: Get the total count of non-production indirect workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of non-production indirect workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of non-production indirect workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalNonproductionIndirectWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_proindirect_workers_a',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
 // console.log("cdate", date);
 const totalproindirectworkersaQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
  const totalproindirectworkersaResult = await executeQuery(connection, totalproindirectworkersaQuery, ['1','NON-PRODUCTION INDIRECT', '1', 'BELEZA', currentDate,'A']);
  const rowCount = totalproindirectworkersaResult[0].rowCount;
  const response = {
    totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
  };
  res.send(response);


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});




/**
 * @swagger
 * /dashbord_total_staff_workers:
 *   get:
 *     summary: Get the total count of staff workers.
 *     description: |
 *       This endpoint retrieves the total count of staff workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of staff workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalStaffWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/dashbord_total_staff_workers',authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();

    const totalstaffworkersQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=?';
    const totalstaffworkersResult = await executeQuery(connection, totalstaffworkersQuery, ['1','STAFF', '1', 'BELEZA', currentDate]);
    const rowCount = totalstaffworkersResult[0].rowCount;
    const response = {
      totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
    };
    res.send(response);

 
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});




/**
 * @swagger
 * /total_staff_workers_p:
 *   get:
 *     summary: Get the total count of staff workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of staff workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of staff workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalStaffWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_staff_workers_p',authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();
 // console.log("cdate", date);

 const totalstaffworkerspQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
    const totalstaffworkerspResult = await executeQuery(connection, totalstaffworkerspQuery, ['1','STAFF', '1', 'BELEZA', currentDate,'P']);
    const rowCount = totalstaffworkerspResult[0].rowCount;
    const response = {
      totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
    };
    res.send(response);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /total_staff_workers_a:
 *   get:
 *     summary: Get the total count of staff workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of staff workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of staff workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalStaffWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_staff_workers_a',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
 // console.log("cdate", date);
 const totalstaffworkersaQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
 const totalstaffworkersaResult = await executeQuery(connection, totalstaffworkersaQuery, ['1','STAFF', '1', 'BELEZA', currentDate,'A']);
 const rowCount = totalstaffworkersaResult[0].rowCount;
 const response = {
   totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
 };
 res.send(response);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});


/**
 * @swagger
 * /dashbord_total_expats_workers:
 *   get:
 *     summary: Get the total count of expats workers.
 *     description: |
 *       This endpoint retrieves the total count of expats workers based on role, passive_type, and date.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of expats workers.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 25
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalExpatsWorkers
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/dashbord_total_expats_workers',authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();

    const totalexpatsworkersQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=?';
 const totalexpatsworkersResult = await executeQuery(connection, totalexpatsworkersQuery, ['1','EXPATS', '1', 'BELEZA', currentDate]);
 const rowCount = totalexpatsworkersResult[0].rowCount;
      const response = {
        totalWorkers: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
      };
      res.send(response);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /total_expats_workers_p:
 *   get:
 *     summary: Get the total count of expats workers currently present.
 *     description: |
 *       This endpoint retrieves the total count of expats workers currently present from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of expats workers currently present.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersPresent: 15
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalExpatsWorkersPresent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/total_expats_workers_p',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
 // console.log("cdate", date);

 const totalexpatsworkerspQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
 const totalexpatsworkerspResult = await executeQuery(connection, totalexpatsworkerspQuery, ['1','EXPATS', '1', 'BELEZA', currentDate,'P']);
 const rowCount = totalexpatsworkerspResult[0].rowCount;
 const response = {
   totalWorkersp: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
 };
 res.send(response);


  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /total_expats_workers_a:
 *   get:
 *     summary: Get the total count of expats workers currently absent.
 *     description: |
 *       This endpoint retrieves the total count of expats workers currently absent from the database.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       '200':
 *         description: Successful response containing the total count of expats workers currently absent.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkersAbsent: 10
 *       '500':
 *         description: Internal server error during the database query.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getTotalExpatsWorkersAbsent
 * @memberof module:Routes/Worker
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an internal server error during the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/total_expats_workers_a',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();

      const totalexpatsworkersaQuery = 'SELECT COUNT(*) as rowCount FROM employees_moz WHERE roleid=? AND workertype=? AND Activo=? AND site=? AND date=? AND status=?';
 const totalexpatsworkersaResult = await executeQuery(connection, totalexpatsworkersaQuery, ['1','EXPATS', '1', 'BELEZA', currentDate,'A']);
 const rowCount = totalexpatsworkersaResult[0].rowCount;
 const response = {
  totalWorkersa: rowCount, // Use "totalWorkers" as the key instead of "rowCount"
};
res.send(response);


 // console.log("cdate", date);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});

const util = require('util'); // Import the 'util' module
const query = util.promisify(db.query).bind(db); // Convert the query method to a promise

const responsecatdata = []; // Declare responsecatdata before the route
/**
 * @swagger
 * /categoryData:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             example:
 *               - category_name: "Category 1"
 *                 item_count: 3
 *               - category_name: "Category 2"
 *                 item_count: 2
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getItemCategories
 * @memberof module:Routes/Item Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/categoryData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
    const categoriesQuery = 'SELECT * FROM item_category';
    
    // Use the modified query method
    const categoriesResult = await executeQuery(connection,categoriesQuery);

    const categories = categoriesResult && categoriesResult.length > 0 ? categoriesResult : [];

    let item_count_all = 0;
    //console.log("categories", categories);

    const response = categories.map(async (category) => {
      const itemsQuery = `SELECT * FROM item_masterr WHERE category_id = ${category.id}`;
      const itemsResult = await executeQuery(connection,itemsQuery);
      const item_count = itemsResult.length > 0 ? itemsResult.length : 0;

      return {
        category_name: category.category_name,
        item_count: item_count
      };
    });

    const responseData = await Promise.all(response);

    // Calculate item_count_all after the loop
    item_count_all = responseData.reduce((total, category) => total + category.item_count, 0);

    // Add item_count_all to the response
    responsecatdata.push({
      responseData: responseData,
      item_count_all: item_count_all
    });

    // console.log("response", responseData);
    // console.log("item_count_all", item_count_all);
    res.send(responsecatdata);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /timesheet_morning_present:
 *   get:
 *     summary: Get all workers present this morning.
 *     description: Retrieves all workers present this morning from the database.
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of workers present this morning.
 *         content:
 *           application/json:
 *             example:
 *               totalWorkers: 10
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getWorkersPresentthisMorning
 * @memberof module:Routes/Timesheet 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get('/timesheet_morning_present',authenticateJWT, async (req, res) => {

  //console.log("cdate", date);
  let connection;
  try{
  
      connection = await getPoolConnection();
      const timesheetmorningpresentQuery = 'SELECT entry_id, COUNT(*) as rowCount FROM worker_timesheet WHERE date_time=? GROUP BY entry_id';
      const timesheetmorningpresentResult = await executeQuery(connection, timesheetmorningpresentQuery, [currentDate]);

      const rowCount = timesheetmorningpresentResult.length; // Use result.length instead of result[0].rowCount
        const response = {
          totalWorkers: rowCount,
        };
        res.send(response);

  // db.query('SELECT entry_id, COUNT(*) as rowCount FROM worker_timesheet WHERE date_time=? GROUP BY entry_id',
  //   [currentDate], (err, result) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).send('Error fetching total workers present');
  //     } else {
  //       const rowCount = result.length; // Use result.length instead of result[0].rowCount
  //       const response = {
  //         totalWorkers: rowCount,
  //       };
  //       res.send(response);
  //     }
  //   });
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});

/**
 * @swagger
 * /ic:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_name: "Category 1"
 *               - id: 2
 *                 category_name: "Category 2"
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getItemCategories
 * @memberof module:Routes/Item Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


//Get Item categories for datatables
app.get("/ic",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
      const icQuery = 'SELECT * FROM item_category';
      const icResult = await executeQuery(connection, icQuery);
      res.send(icResult);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
}); 


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     item_category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 10
 *         category_name:
 *           type: string
 *           example: "BRAID"
 * 
 * /additemcategory:
 *   post:
 *     summary: Add a new item Category.
 *     description: Adds a new item category to the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the category_name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: The name of the item category to be added.
 *     responses:
 *       200:
 *         description: Successful response indicating the item category has been added.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item category added successfully."
 *       409:
 *         description: Conflict response indicating that the item category name already exists.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: item category name already exists."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to add item category. Please try again."
 *
 * @function
 * @async
 * @name addItemCategory
 * @memberof module:Routes/Item Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query or insertion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */




//Add Item category
app.post("/additemcategory",authenticateJWT, async (req, res) => {

let connection;
try {
  connection = await getPoolConnection();
  var name = req.body.category_name.trim();

  // Check if the color already exists
  const checkSql = `SELECT * FROM item_category WHERE category_name = ?`;
  const existingItemCategory = await executeQuery(connection,checkSql, [name]);

  if (existingItemCategory.length > 0) {
    // Color already exists
    res.status(409).json({ message: "Error: item category name already exists." });
  } else {
    // Color does not exist, add it to the database
    const insertSql = `INSERT INTO item_category (category_name) VALUES (?)`;
    await executeQuery(connection,insertSql, [name]);
    res.status(200).json({ message: "Item Category added successfully" });
  }
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: "An error occurred" });
} finally {
  if (connection) {
    connection.release();
  }
}
});


/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     item_subcategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category_id:
 *           type: integer
 *           example: 2
 *         subcategory_name:
 *           type: string
 * 
 * /isc:
 *   get:
 *     summary: Get all item subcategory.
 *     description: Retrieve item subcategory data from the database.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the item subcategory data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_id: 1
 *                 subcategory_name: "Subcategory 1"
 *                 category_name: "Category 1"
 *               - id: 2
 *                 category_id: 2
 *                 subcategory_name: "Subcategory 2"
 *                 category_name: "Category 2"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during login"
 *
 * @function
 * @name getItemSubcategoryData
 * @memberof module:Routes/ItemSubCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Item subcategories for datatables
app.get("/isc", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const query = `SELECT item_subcategory.*, item_category.category_name AS category_name
                   FROM item_subcategory
                   JOIN item_category ON item_subcategory.category_id = item_category.id`;

    const result = await executeQuery(connection, query);
    res.send(result);

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching item subcategories' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /iscdelete/{id}:
 *   delete:
 *     summary: Delete a specific item subcategory.
 *     description: Deletes a specific item subcategory based on the provided ID.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []  # Security definition, modify as per your authentication mechanism
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the item subcategory to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Item subcategory deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item subcategory deleted successfully."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during Item subcategory deletion"
 *
 * @function
 * @name deleteItemSubcategory
 * @memberof module:Routes/ItemSubCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// delete item subcategory by ID
app.delete("/iscdelete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const id = req.params.id;
    const iscdeleteQuery = "DELETE FROM item_subcategory WHERE id = ?";
    const result = await executeQuery(connection, iscdeleteQuery, [id]);
    console.log(result);
    return res.json({ message: 'Item Subcategory deleted successfully.' });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred during deletion' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /additemsubcategory:
 *   post:
 *     summary: Add a new item subcategory.
 *     description: Add a new item subcategory to the database.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the subcategory_name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: number
 *                 description: The ID of the category.
 *               subcategory_name:
 *                 type: string
 *                 description: The name of the item subcategory.
 *             required:
 *               - category_id
 *               - subcategory_name
 *     responses:
 *       200:
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Item subcategory details added successfully"
 *       409:
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: Item subcategory data already exist!"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during insertion"
 *
 * @function
 * @name addItemWithSections
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.post("/additemsubcategory", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const category_id = req.body.category_id;
    const subcategory_name = req.body.subcategory_name.trim();

    if (subcategory_name === "") {
      return res.status(400).json({ error: "Subcategory name cannot be empty" });
    }

    // Check if the subcategory name already exists for the given category
    const checkDuplicateQuery = `SELECT * FROM item_subcategory WHERE category_id = ? AND subcategory_name = ?`;
    const results = await executeQuery(connection, checkDuplicateQuery, [category_id, subcategory_name]);
    
    if (results.length > 0) {
      // The subcategory name already exists for the given category, send an error response
      return res.status(400).json({ error: 'Subcategory already exists for this category' });
    } else {
      // Insert the new subcategory
      const insertQuery = `INSERT INTO item_subcategory (category_id, subcategory_name) VALUES (?, ?)`;
      const result = await executeQuery(connection, insertQuery, [category_id, subcategory_name]);

      console.log(result);
      return res.json({ message: 'Item Subcategory added successfully' });
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});




/**
 * @swagger
 * /itemsubcategory/{id}:
 *   get:
 *     summary: Get item subcategory details by ID.
 *     description: Fetches details of a specific item subcategory by its ID.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the item subcategory to be retrieved.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with item subcategory details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_id: 1
 *                 subcategory_name: "subcategory A"
 *       '404':
 *         description: Item subcategory not found.
 *         content:
 *           application/json:
 *             example:
 *               error: "Item subcategory not found"
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during item subcategory retrieval"
 *
 * @function
 * @name getItemSubcategoryById
 * @memberof module:Routes/ItemSubCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// GET request to fetch item subcategory by ID
app.get("/itemsubcategory/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  //const id = 11;
  // Construct the SQL query with a placeholder
  const query = 'SELECT * FROM item_subcategory WHERE id = ?';
  const results = await executeQuery(connection, query,[id]);
  // Execute the query with the id as a parameter
  if (results.length > 0) {
    const subcategory = results[0];
    res.status(200).json(subcategory);
  } else {
    res.status(404).json({ message: 'Subcategory not found' });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * /updateitemsubcategory:
 *   put:
 *     summary: Update a item subcategory.
 *     description: Update the details of a specific item subcategory in the database.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the item subcategory details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: integer
 *                 description: The ID for which the item subcategory is being updated.
 *                category_id:
 *                 type: integer
 *                 description: The category id of that item subcategory to be update.
 *                subcategory_name:
 *                 type: string
 *                 description: The subcategory name of that item subcategory to be update.
 *             required:
 *               - id
 *               - category_id
 *               - subcategory_name
 *     responses:
 *       200:
 *         description: Successful response indicating that the item subcategory was updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "item subcategory updated successfully."
 *       400:
 *         description: Bad Request response indicating a validation or client error.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid request body"
 *       409:
 *         description: Conflict response indicating that the new item subcategory is a duplicate.
 *         content:
 *           application/json:
 *             example:
 *               error: "Duplicate item subcategory"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while updating the item subcategory."
 *
 * @function
 * @name updateItemSubcategory
 * @memberof module:Routes/ItemSubCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put("/updateitemsubcategory", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection(); // Ensure `getPoolConnection` is defined and works

    const { id, category_id, subcategory_name } = req.body;

    if (!subcategory_name || subcategory_name.trim() === "") {
      return res.status(400).json({ error: "Subcategory name cannot be empty" });
    }

    const trimmedSubcategoryName = subcategory_name.trim();



    // Check if a record with the same category_id and subcategory_name already exists
    const checkDuplicateQuery = `SELECT * FROM item_subcategory WHERE category_id = ? AND subcategory_name = ? AND id != ?`;
    const results = await executeQuery(connection, checkDuplicateQuery, [category_id, subcategory_name, id]);


    if (results.length > 0) {
      // A record with the same category_id and subcategory_name already exists, send an error response
      return res.status(400).json({ error: 'Category and Subcategory name already exists' });
    } else {
      // Update the item_subcategory record
      const updateQuery = `UPDATE item_subcategory SET category_id = ?, subcategory_name = ? WHERE id = ?`;
      const result = await executeQuery(connection, updateQuery, [category_id, trimmedSubcategoryName, id]); // Ensure `executeQuery` is defined and works
     // console.log(result);
      return res.json({ message: 'Item Subcategory updated successfully.' });
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred during update' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

//Section
/**
 * @swagger
 * /section:
 *   get:
 *     summary: Retrieve active sections.
 *     description: Retrieves a list of active sections from the database.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active sections.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The section ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the section.
 *                     example: Section A
 *                   status:
 *                     type: string
 *                     description: The status of the section.
 *                     example: Active
 *       500:
 *         description: An error occurred while fetching sections.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching sections
 *
 * @function
 * @name getSections
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Fetch Section data from section table to view in datatable
app.get("/section", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = "SELECT * FROM section WHERE status = '1'";
    const result = await executeQuery(connection,query);
    res.send(result);
    console.log(result);
    console.log('Connected!');
  } catch (error) {
    console.error('An error occurred while fetching sections:', error);
    res.status(500).json({ error: 'An error occurred while fetching sections' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /sectiondelete/{id}:
 *   delete:
 *     summary: Soft delete a section by ID.
 *     description: Soft deletes a section by setting its status to '0' in the database.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the section to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Section deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section deleted successfully.
 *       500:
 *         description: An error occurred while deleting the section.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while deleting the section.
 *
 * @function
 * @name deleteSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// delete section by ID
app.delete("/sectiondelete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;
    const result = await executeQuery(connection,"UPDATE section SET status='0' WHERE id = ?", [id]);
    console.log(result);
    res.json({ message: 'Section deleted successfully.' });
  } catch (error) {
    console.error('An error occurred while deleting the section:', error);
    res.status(500).json({ error: 'An error occurred while deleting the section.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

//Section
/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     section:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         section_name:
 *           type: string
 *           example: "Example Section"
 *         target_unit:
 *           type: string
 *           example: "Example Unit"
 *         section_type:
 *           type: string
 *           example: "Example Type"
 * 
 * /addsection:
 *   post:
 *     summary: Add a new section.
 *     description: Adds a new section to the database.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the section_name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section_name:
 *                 type: string
 *                 description: The name of the section to be added.
 *               target_unit:
 *                 type: string
 *                 description: The target unit of the section to be added.
 *     responses:
 *       200:
 *         description: Successful response indicating the section has been added.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Inserted successfully"
 *       409:
 *         description: Conflict response indicating that the section name already exists.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: Section name already exists."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal Server Error - Insertion failed"
 *
 * @function
 * @name addSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query or insertion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/addsection", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { section_name, target_unit } = req.body;

    // Check if the section already exists
    const checkSql = `SELECT * FROM section WHERE section_name = ? AND status = '1' `;
    const existingSections = await executeQuery(connection,checkSql, [section_name]);

    if (existingSections.length > 0) {
      // Section already exists
      res.status(409).send({ message: "Error: Section already exists" });
    } else {
      // Section does not exist, add it to the database
      const insertSql = `INSERT INTO section (section_name, target_unit) VALUES (?, ?)`;
      await executeQuery(connection,insertSql, [section_name, target_unit]);
      res.status(200).send({ message: "Section added successfully" });
    }
  } catch (error) {
    console.error('An error occurred while adding the section:', error);
    res.status(500).send({ message: "An error occurred while adding the section" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getsection/{id}:
 *   get:
 *     summary: Get section by ID.
 *     description: Retrieves a section from the database based on its ID.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the section to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Section retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the section.
 *                   example: 1
 *                 section_name:
 *                   type: string
 *                   description: The name of the section.
 *                   example: Section A
 *                 target_unit:
 *                   type: string
 *                   description: The target unit of the section.
 *                   example: Units
 *                 section_type:
 *                   type: integer
 *                   description: The ID of the section type.
 *                   example: 1
 *                 status:
 *                   type: string
 *                   description: The status of the section.
 *                   example: active
 *       404:
 *         description: Section not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section not found
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *
 * @function
 * @name getSectionById
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

   // GET request to fetch section data by ID
   app.get("/getsection/:id", authenticateJWT, async (req, res) => {
    let connection;
    try {
      connection = await getPoolConnection();
      const id = req.params.id;
      // Construct the SQL query with a placeholder
      const query = 'SELECT * FROM section WHERE id = ?';
  
      // Execute the query with the id as a parameter
      const results = await executeQuery(connection,query, [id]);
  
      if (results.length > 0) {
        const section = results[0];
        res.status(200).json(section);
      } else {
        res.status(404).json({ message: 'Section not found' });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });
  /**
 * @swagger
 * /updatesection:
 *   put:
 *     summary: Update a section.
 *     description: Update a section's details in the database.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the section to update.
 *                 example: 1
 *               section_name:
 *                 type: string
 *                 description: The updated name of the section.
 *                 example: Section A
 *               target_unit:
 *                 type: string
 *                 description: The updated target unit of the section.
 *                 example: Units
 *               section_type:
 *                 type: integer
 *                 description: The updated ID of the section type.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Section updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Section updated successfully.
 *       400:
 *         description: Section name already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Section name already exists.
 *       500:
 *         description: An error occurred while updating the section.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while updating the section.
 *
 * @function
 * @name updateSection
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// update section by ID
app.put("/updatesection", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { id, section_name, target_unit } = req.body;

    // Check if the new section name already exists in the database
    const checkDuplicateSQL = `SELECT * FROM section WHERE section_name = ? AND id != ? AND status = '1' `;
    const duplicateResult = await executeQuery(connection,checkDuplicateSQL, [section_name,id]);
//console.log(duplicateResult.length);
    if (duplicateResult.length > 0) {
      res.status(400).json({ error: 'Section name already exists.' });
    } else {
      const sql = `UPDATE section SET section_name=?, target_unit=? WHERE id=?`;
      const result = await executeQuery(connection,sql, [section_name, target_unit, id]);
      console.log(result);
      res.json({ message: 'Section updated successfully.' });
    }
  } catch (error) {
    console.error('An error occurred while updating the section:', error);
    res.status(500).json({ error: 'An error occurred while updating the section.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /getshift:
 *   get:
 *     summary: Get all shifts.
 *     description: Retrieve all shifts from the database.
 *     tags:
 *       - Shift
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with a list of shifts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Morning Shift"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *
 * @function
 * @name getShifts
 * @memberof module:Routes/Shift
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue retrieving the shifts.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Shifts for datatables
app.get("/getshift", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = "SELECT * FROM geopos_shift";
    const result = await executeQuery(connection,query);
    
    res.send(result);
  //  console.log(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


//Shift
/**
 * @swagger 
 *  
 * components:
 *   schemas:
 *     geopos_shift:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Example Shift"
 *         nhrs:
 *           type: integer
 * 
 * /addshift:
 *   post:
 *     summary: Add a new shift.
 *     description: Add a new shift to the database.
 *     tags:
 *       - Shift
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift_name:
 *                 type: number
 *                 description: The name of the new shift. 
 *     responses:
 *       200:
 *         description: Successful response with insertion status.
 *         content:
 *           application/json:
 *             example:
 *               status: "Success"
 *               message: "Inserted successfully"
 *       409:
 *         description: Duplicate shift name.
 *         content:
 *           text/plain:
 *             example: "Duplicate: Shift already exist."
 *       500:
 *         description: Internal server error.
 *         content:
 *           text/plain:
 *             example: "Internal Server Error - Duplicate check failed"
 *
 * @function
 * @name addShift
 * @memberof module:Routes/Shift
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
///Add Shift
app.post("/addshift", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const shift_name = req.body.shift_name;
    const shift_hours = shift_name + 'HRS';

    if (shift_name === "") {
      return res.status(400).json({ error: "Shift name cannot be empty" });
    }

    const checkDuplicateQuery = `SELECT * FROM geopos_shift WHERE name = ?`;
    const results = await executeQuery(connection, checkDuplicateQuery, [shift_hours]);
    
    if (results.length > 0) {

      res.status(409).json({ message: "Error: Shift already exists" });
    } else {
      const insertQuery = `INSERT INTO geopos_shift (name, nhrs) VALUES (?, ?)`;
      const result = await executeQuery(connection, insertQuery, [shift_hours, shift_name]);
   
      res.status(200).json({ message: "Shift added successfully" });
    }

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /getworkertype:
 *   get:
 *     summary: Retrieve all worker types.
 *     description: Fetches all worker types from the database.
 *     tags:
 *       - Worker Type
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with a list of all worker types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Electrician"
 *             example:
 *               - id: 1
 *                 name: "Electrician"
 *               - id: 2
 *                 name: "Plumber"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *
 * @function
 * @name getWorkerType
 * @memberof module:Routes/WorkerType
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Shifts for datatables
app.get("/getworkertype", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = "SELECT * FROM geopos_workertype";
    const result = await executeQuery(connection,query);
    
    res.send(result);
   // console.log(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
//Worker Type
/**
 * @swagger
 * /addworkertype:
 *   post:
 *     summary: Add a new worker type.
 *     description: Adds a new worker type to the database if it doesn't already exist.
 *     tags:
 *       - Worker Type
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: JSON object containing the worker type name to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workertype_name:
 *                 type: string
 *                 description: The name of the worker type to be added.
 *                 example: "Electrician"
 *     responses:
 *       200:
 *         description: Successful response indicating the worker type has been added.
 *         content:
 *           application/json:
 *             example:
 *               message: "Worker Type added successfully"
 *       409:
 *         description: Conflict response indicating that the worker type already exists.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error: Worker type already exists"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *
 * @function
 * @name addWorkerType
 * @memberof module:Routes/WorkerType
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query or insertion.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Add Worker Type
app.post("/addworkertype", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const wtname = req.body.workertype_name;

    // Check if the worker type already exists
    const checkSql = `SELECT * FROM geopos_workertype WHERE name = ?`;
    const existingWorkerTypes = await executeQuery(connection,checkSql, [wtname]);

    if (existingWorkerTypes.length > 0) {
      // Worker type already exists
      res.status(409).json({ message: "Error: Worker type already exists" });
    } else {
      // Worker type does not exist, add it to the database
      const insertSql = `INSERT INTO geopos_workertype (name) VALUES (?)`;
      await executeQuery(connection,insertSql, [wtname]);
      res.status(200).json({ message: "Worker Type added successfully" });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


//Employee Role
/**
 * @swagger
 * /getemployeerole:
 *   get:
 *     summary: Retrieve all employee roles.
 *     description: Fetches all employee roles from the database.
 *     tags:
 *       - Employee Role
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with a list of all employee roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Manager"
 *             example:
 *               - id: 1
 *                 name: "Manager"
 *               - id: 2
 *                 name: "Technician"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred"
 *
 * @function
 * @name getEmployeeRole
 * @memberof module:Routes/EmployeeRole
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//Get Employee Role for datatables
app.get("/getemployeerole", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = "SELECT * FROM geopos_emptype";
    const result = await executeQuery(connection,query);
    
    res.send(result);
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


//Item Master
/**
 * @swagger
 * /getitemmaster:
 *   get:
 *     summary: Get all items from the item master table.
 *     description: Retrieves all items from the item master table along with their category names.
 *     tags:
 *       - Item Master
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: An array of items from the item master table.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the item.
 *                     example: 1
 *                   item_code:
 *                     type: string
 *                     description: The item code.
 *                     example: ITEM001
 *                   item_description:
 *                     type: string
 *                     description: The description of the item.
 *                     example: Item 1
 *                   category_name:
 *                     type: string
 *                     description: The name of the category to which the item belongs.
 *                     example: Category 1
 *       500:
 *         description: An error occurred while fetching item master data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching item master.
 *
 * @function
 * @name getItemMaster
 * @memberof module:Routes/ItemMaster
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Item Master for datatables
app.get("/getitemmaster", authenticateJWT, async (req, res) => {
  const roleId = 3;
  let query = '';

  if (roleId === 5 || roleId === 3) {
      query = `
          SELECT item_masterr.*, item_category.category_name, item_subcategory.subcategory_name
          FROM item_masterr
          LEFT JOIN item_category ON item_masterr.category_id = item_category.id
          LEFT JOIN item_subcategory ON item_masterr.subcategory_id = item_subcategory.id
      `;
  }
  let connection;
  try {
    connection = await getPoolConnection();

    const result = await executeQuery(connection, query);
    res.send(result);
    console.log("Connected!");
  } catch (error) {
    console.error('An error occurred while fetching item master:', error);
    res.status(500).json({ error: "An error occurred while fetching item master" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /itemmasterdelete/{id}:
 *   delete:
 *     summary: Delete item master and related data.
 *     description: Deletes item master record and its related data (item codes and section targets) based on the provided item ID.
 *     tags:
 *       - Item Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the item to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item master and related data deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item Master and Related Data Deleted Successfully
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while deleting item master and related data.
 * @function
 * @name deleteItemMaster
 * @memberof module:Routes/ItemData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with deleting item master and related data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// delete itemmaster by ID
app.delete("/itemmasterdelete/:id", authenticateJWT, async (req, res) => {
  const id = req.params.id;
  const queries = [
    'DELETE FROM item_masterr WHERE id = ?',
    'DELETE FROM item_code WHERE product_id = ?',
    'DELETE FROM item_section_moz WHERE item_id = ?',
  ];
 let connection;
  try {
    connection = await getPoolConnection()
    // Delete item_masterr
    await executeQuery(connection,queries[0], [id]);

    // Delete item_code
    await executeQuery(connection,queries[1], [id]);

    // Delete item_section_ota
    await executeQuery(connection,queries[2], [id]);

    res.json({ message: 'Item Master and Related Data Deleted Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting item master and related data.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /getcategories:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_name: "Category 1"
 *               - id: 2
 *                 category_name: "Category 2"
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getItemCategories
 * @memberof module:Routes/ItemCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Fetch categories and subcategories in add item master

app.get('/getcategories', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    // Fetch all categories
    const getQuery = `SELECT * FROM item_category`;
    const results = await executeQuery(connection, getQuery);

    const categories = results.map((category) => ({
      id: category.id,
      category_name: category.category_name,
      // Include other properties if necessary
    }));

    res.json({ data: categories });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching categories' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getcatsubcat/{category_id}:
 *   get:
 *     summary: Get item subcategory data based on category.
 *     description: Retrieve item subcategory data based on their category from the `item_subcategory` table.
 *     tags:
 *       - Item Subcategory
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         description: category id of the item subcategory  that needs to be retrieved.
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Successful response with item subcategory details.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 subcategory_name: "subcategory A"
 *       '404':
 *         description: category id not found.
 *         content:
 *           application/json:
 *             example:
 *               message: "No subcategory details found for the category id"
 *       '500':
 *         description: Internal server error during subcategory data retrieval.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during subcategory data retrieval"
 *
 * @function
 * @name getItemSubcategory
 * @memberof module:Routes/ItemSubcategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/getcatsubcat/:category_id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const categoryId = req.params.category_id;
    const query = 'SELECT * FROM item_subcategory WHERE category_id = ?';
    const results = await executeQuery(connection, query, [categoryId]);

    const subcategories = results.map((subcategory) => ({
      id: subcategory.id,
      subcategory_name: subcategory.subcategory_name,
      // Include other properties if necessary
    }));

    res.json({ data: subcategories });

  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, message: 'An error occurred while fetching subcategories' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getsectiontargett:
 *   get:
 *     summary: Get section targets.
 *     description: Retrieves section targets from the section table where the section_type is 'nbraids'.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       section_name:
 *                         type: string
 *                         example: "Section 1"
 *                       target_unit:
 *                         type: string
 *                         example: "KG"
 *                       section_type:
 *                         type: string
 *                         example: "nbraids"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getSectionTargets
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get('/getsectiontargett', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  // Execute the SQL query to fetch section targets from the database
  const query = `SELECT * FROM section WHERE section_type = ?`;
const results = await executeQuery(connection, query, ['nbraids']);
res.json({ data: results });

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     item_section_moz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         item_id:
 *           type: integer
 *           example: "Example Item Id"
 *         section_id:
 *           type: integer
 *           example: "Example Section Id"
 *         target:
 *           type: string
 *           example: "Example Target"
 *         utarget:
 *           type: string
 *           example: "Example Unit Target"
 * 
 * /additemmasterr:
 *   post:
 *     summary: Add a new item with sections and targets.
 *     description: Add a new item to the item master with associated sections and targets.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Item details to be added with sections and targets.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formData:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: number
 *                     description: The ID of the category.
 *                   subcategory_id:
 *                     type: number
 *                     description: The ID of the subcategory.
 *                   item_description:
 *                     type: string
 *                     description: The description of the item.
 *                   line:
 *                     type: string
 *                     description: The lines of the category.
 *                   country:
 *                     type: number
 *                     description: The ID of the country.
 *                   ppp_benchmark:
 *                     type: string
 *                     description: The ppp benchmark of the item.
 *                   kg:
 *                     type: number
 *                     description: The kg of the item.
 *                   string:
 *                     type: number
 *                     description: The string of the item.
 *                   pcs:
 *                     type: number
 *                     description: The pcs of the item.
 *                   item_code:
 *                     type: string
 *                     description: The item code of the item.
 *                 required:
 *                   - category_id
 *                   - subcategory_id
 *                   - item_description
 *                   - line
 *                   - country
 *                   - ppp_benchmark
 *                   - kg
 *                   - string
 *                   - pcs
 *                   - item_code
 *               itemSections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section_id:
 *                       type: number
 *                       description: The ID of the section.
 *                     target:
 *                       type: number
 *                       description: The target for the section.
 *                     utarget:
 *                       type: number
 *                       description: The normalized target for the section.
 *                 description: An array of sections with their targets.
 *             required:
 *               - formData
 *               - itemSections
 *     responses:
 *       200:
 *         description: Successful response with a status and message.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               message: "Item details added successfully"
 *       409:
 *         description: Duplicate record error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Duplicate: Item data already exist!"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during insertion"
 *
 * @function
 * @name addItemWithSections
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.post('/additemmasterr', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const { formData, itemSections } = req.body;

      const {
          category_id,
          subcategory_id,
          item_description,
          line,
          country,
          ppp_benchmark,
          kg,
          string,
          pcs,
          item_code
      } = formData;

      // Check if the item already exists
      const selectQuery = 'SELECT * FROM item_masterr WHERE item_description = ?';
      const existingItems = await executeQuery(connection, selectQuery, [item_description]);

      if (existingItems.length > 0) {
          return res.status(409).json({ status: 'Error', message: 'Item already exists' });
      }

      // Insert new item
      const insertQuery = `
          INSERT INTO item_masterr 
          (category_id, subcategory_id, item_description, line, country, ppp_benchmark, kg, string, pcs, item_group)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertResult = await executeQuery(connection, insertQuery, [
          category_id, subcategory_id, item_description, line, country,
          ppp_benchmark, kg, string, pcs, item_code
      ]);

      const itemId = insertResult.insertId;

      // Insert or update item sections
      for (const section of itemSections) {
          const { section_id, target, utarget } = section;

          const selectQuery2 = 'SELECT * FROM item_section_moz WHERE item_id = ? and section_id = ?';
          const existingSection = await executeQuery(connection, selectQuery2, [itemId, section_id]);

          if (existingSection.length > 0) {
              const updateQuery = `
                  UPDATE item_section_moz 
                  SET target = ?, utarget = ?
                  WHERE id = ?
              `;
              await executeQuery(connection, updateQuery, [target, utarget, existingSection[0].id]);
          } else {
              const insertQuery4 = `
                  INSERT INTO item_section_moz 
                  (item_id, section_id, target, utarget)
                  VALUES (?, ?, ?, ?)
              `;
              await executeQuery(connection, insertQuery4, [itemId, section_id, target, utarget]);
          }
      }

      res.status(200).json({ status: 'Success', message: 'Item details added successfully.' });

  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ status: 'Error', message: 'Failed to add item' });
  } finally {
      if (connection) connection.release();
  }
});

/**
 * @swagger
 * /edititemmaster/{itemId}:
 *   get:
 *     summary: Get item master data by ID.
 *     description: Retrieves data from the item_masterr table based on the provided item ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to retrieve data for.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 2
 *                   category_id:
 *                     type: integer
 *                     example: 1
 *                   subcategory_id:
 *                     type: integer
 *                     example: 1
 *                   item_group:
 *                     type: string
 *                     example: "FGWVDABUN001"
 *                   item_description:
 *                     type: string
 *                     example: "AFRO BUN TOTO"
 *                   country:
 *                     type: string
 *                   ppp_benchmark:
 *                     type: string
 *                   kg:
 *                     type: integer
 *                     example: 45
 *                   string:
 *                     type: integer
 *                     example: 1
 *                   pcs:
 *                     type: integer
 *                     example: 1
 *                   line:
 *                     type: string
 *                   date:
 *                     type: string
 *                     example: "2021-08-22T09:12:06.000Z"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getItemMasterData
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


//edit itemmaster
app.get('/edititemmaster/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.itemId;

    // Use parameterized query to prevent SQL injection
    const query = 'SELECT * FROM item_masterr WHERE id = ?';
    const results = await executeQuery(connection, query, [itemId]);

    res.json(results);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /updateitemmaster/{itemId}:
 *   put:
 *     summary: Update item master data by ID.
 *     description: Updates data in the item_masterr table based on the provided item ID.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to update data for.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               item_group:
 *                 type: string
 *                 example: "FGWVDABUN001"
 *               item_description:
 *                 type: string
 *                 example: "AFRO BUN TOTO"
 *               country:
 *                 type: string
 *               ppp_benchmark:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item master updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ItemMaster updated successfully"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name updateItemMasterData
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with updating data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.put('/updateitemmaster/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.itemId;
    const { category_id, item_group, item_description, country, ppp_benchmark } = req.body;

    // Use parameterized query to prevent SQL injection
    const query = 'UPDATE item_masterr SET category_id = ?, item_group = ?, item_description = ?, country = ?, ppp_benchmark = ?  WHERE id = ?';
    const values = [category_id, item_group, item_description, country, ppp_benchmark, itemId];
    const result = await executeQuery(connection, query, values);
    
    console.log('ItemMaster updated successfully');
    res.json({ message: 'ItemMaster updated successfully' });
  } catch (error) {
    // Handle exceptions
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update ItemMaster' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getsections/{itemId}:
 *   get:
 *     summary: Get sections target data for a specific item.
 *     description: Fetches sections target data for a given item ID from the item_section_moz table.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: The ID of the item for which sections data is requested.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A JSON array of sections data.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 section_name: "Section 1"
 *                 item_description: "Item Description 1"
 *                 target_unit: "Unit 1"
 *                 target: 10
 *                 utarget: 5
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred during sections retrieval"
 *
 * @function
 * @name getsections
 * @memberof module:Routes/Item
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// API endpoint to fetch sections and targets
app.get('/getsections/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const itemId = req.params.itemId;

  // Fetch sections data from the item_section_moz table
  const query = `
    SELECT s.section_name, s.target_unit, ism.target, ism.utarget, ism.id
    FROM item_section_moz ism
    INNER JOIN section s ON ism.section_id = s.id
    WHERE ism.item_id = ?`;

    const results = await executeQuery(connection, query, [itemId]);

      const sections = results.map((row) => ({
        id: row.id,
        section_name: row.section_name,
        target_unit: row.target_unit,
        target: row.target,
        utarget: row.utarget,
      }));
      res.json(sections);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /delete_target/{id}:
 *   delete:
 *     summary: Delete item section target.
 *     description: Deletes an item section target based on the provided target ID.
 *     tags:
 *       - Item Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the item section target to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item section target deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 message:
 *                   type: string
 *                   example: Deleted Successfully
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Invalid Request
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name deleteItemSectionTarget
 * @memberof module:Routes/ItemData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with deleting the item section target.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// delete target
app.delete('/delete_target/:id', authenticateJWT, async (req, res) => {
  const id = req.params.id;
  let connection;
  try {
    connection = await getPoolConnection();
    if (!id) {
      return res.status(400).json({ status: 'Error', message: 'Invalid Request' });
    }

    const query = 'DELETE FROM item_section_moz WHERE id = ?';
    await executeQuery(connection,query, [id]);

    res.json({ status: 'Success', message: 'Deleted Successfully' });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /updatesectiontarget:
 *   post:
 *     summary: Update section target value.
 *     description: Update the target value for a section.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: ID of the section and the updated target value.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the section.
 *               updatedtarget:
 *                 type: string
 *                 description: The updated target value.
 *                 example: 100
 *     responses:
 *       200:
 *         description: Target value updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Target value updated successfully.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while updating the target value.
 * @function
 * @name updateSectionTarget
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with updating the target value.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Update target value API endpoint
app.post('/updatesectiontarget', authenticateJWT, async (req, res) => {
  const itemId = req.body.id;
  const updatedTarget = req.body.updatedtarget;
  const utarget = req.body.utarget;

  const query = 'UPDATE item_section_moz SET target = ?, utarget = ? WHERE id = ?';
  let connection;
  try {
    connection = await getPoolConnection();
    await executeQuery(connection,query, [updatedTarget, utarget, itemId]);
    res.json({ message: 'Target value updated successfully.' });
  } catch (error) {
    console.error('Error updating target value:', error);
    res.status(500).json({ error: 'An error occurred while updating the target value.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /getsectionandtarget/{itemId}:
 *   get:
 *     summary: Get section and target for item.
 *     description: Retrieve the section name, target unit, and target for the specified item.
 *     tags:
 *       - Section
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         description: The ID of the item to retrieve section and target for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Section and target retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sectionName:
 *                   type: string
 *                   description: The name of the section.
 *                   example: Section Name
 *                 targetUnit:
 *                   type: string
 *                   description: The unit of the target.
 *                   example: kg
 *                 target:
 *                   type: string
 *                   description: The target value.
 *                   example: 100
 *       404:
 *         description: Section and target not found for the item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the section and target were not found.
 *                   example: Section and target not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 * @function
 * @name getSectionAndTargetForItem
 * @memberof module:Routes/Section
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw a not found error if the section and target are not found for the item.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching the section and target.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//get section,unit and target to update 
app.get('/getsectionandtarget/:itemId', authenticateJWT, async (req, res) => {
  const itemId = req.params.itemId;
 let connection;
  try {
    connection = await getPoolConnection();
    // Fetch section name, target unit, and target from the Section and item_section_moz tables
    const query = `
      SELECT s.section_name, s.target_unit, ism.target, ism.utarget
      FROM item_section_moz ism
      INNER JOIN section s ON ism.section_id = s.id
      WHERE ism.id = ?
      LIMIT 1
    `;

    const results = await executeQuery(connection,query, [itemId]);

    if (results.length === 0) {
      // Handle the case where no section and target is found for the itemId
      res.status(404).json({ error: 'Section and target not found' });
      return;
    }

    const { section_name: sectionName, target_unit: targetUnit, target, utarget } = results[0];
    res.json({ sectionName, targetUnit, target, utarget });
  } catch (error) {
    console.error('Error fetching section and target:', error);
    res.sendStatus(500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 *  components:
 *   schemas:
 *     item_code:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_id:
 *           type: integer
 *           example: 1
 *         product_code:
 *           type: string
 *           example: "FGPCDAAFB001"
 *         product_des:
 *           type: string
 *           example: "AFRO BULK # 1"
 *         Date:
 *           type: string
 *           example: "01-01-2023"
 *         loc:
 *           type: integer
 *           example: 0
 *
 * /getdata/{itemId}:
 *   get:
 *     summary: Get data by item ID.
 *     description: Retrieves data from the item_code table based on the provided item ID.
 *     tags:
 *       - Item Code
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to retrieve data for.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/item_code'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getDataByItemId
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get("/getdata/:itemId", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.itemId;

    // Use parameterized query to prevent SQL injection
    const sql = `
      SELECT *
      FROM item_code
      WHERE product_id = ?
    `;
    const result = await executeQuery(connection, sql, [itemId]);
    
    res.send(result);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /additemcolor/{itemId}:
 *   post:
 *     summary: Add a new item color.
 *     description: Inserts a new item into the item_code table if it doesn't already exist based on the provided item ID and product code.
 *     tags:
 *       - Item Code
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to add color for.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "FGPCDAAFB002"
 *               desc:
 *                 type: string
 *                 example: "NEW AFRO BULK"
 *     responses:
 *       200:
 *         description: Item added successfully or item already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 product_code:
 *                   type: string
 *                   example: "FGPCDAAFB002"
 *                 product_des:
 *                   type: string
 *                   example: "NEW AFRO BULK"
 *                 item_id:
 *                   type: integer
 *                   example: 1
 *             example:
 *               id: 1
 *               product_code: "FGPCDAAFB002"
 *               product_des: "NEW AFRO BULK"
 *               item_id: 1
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name addItemColor
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with inserting data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


// Endpoint to add an item to the item_code table
app.post('/additemcolor/:itemId',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  // Extract the data from the request body and the itemId from the route parameters
  const { code, desc } = req.body;
  const itemId = req.params.itemId;

  // Get the current date
  const currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");

  const selectSql = 'SELECT * FROM item_code WHERE product_id = ? AND product_code = ?';
  const results = await executeQuery(connection, selectSql, [itemId, code]);


  if (!results.length > 0) {
    // Perform the database insertion
    const query = `INSERT INTO item_code (product_code, product_des, date, product_id) VALUES (?, ?, ?, ?)`;
    const result = await executeQuery(connection, query, [code, desc, currentDate, itemId]);

    const id = result.insertId;

    // Create the new item object
    const newItem = {
      id,
      product_code: code,
      product_des: desc,
      // color,
      item_id: itemId, // Use itemId instead of item_id
    };

    // Return the newly created item in the response
   // res.status(200).json(newItem);
    res.status(200).json({ status: 'Success', message: 'Color code added successfully.' });

  } else {
    res.status(409).json({ message: "Error: Color code already exists" });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /deleteitemcode/{id}:
 *   delete:
 *     summary: Delete item code.
 *     description: Delete the item code entry from the database.
 *     tags:
 *       - Item Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the item code to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item code deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted Successfully
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while deleting the item_code.
 * @function
 * @name deleteItemCode
 * @memberof module:Routes/ItemData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with deleting the item code.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// DELETE route for deleting an item by ID
app.delete('/deleteitemcode/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.id;
    const query = 'DELETE FROM item_code WHERE id = ?';

    // Execute the query to delete the item_code
    await executeQuery(connection,query, [itemId]);

    console.log('Item code deleted successfully');
    res.json({ message: 'Deleted Successfully' });
  } catch (error) {
    console.error('Error deleting item code:', error);
    res.status(500).json({ error: 'An error occurred while deleting the item_code.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /updateitemcolor/{itemId}:
 *   post:
 *     summary: Update color for an item.
 *     description: Update the color details for a specific item in the database.
 *     tags:
 *       - Item Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to update the color for.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: colorData
 *         description: The updated color data.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             product_code:
 *               type: string
 *               description: The code of the color.
 *             product_des:
 *               type: string
 *               description: The description of the color.
 *             color_id:
 *               type: integer
 *               description: The ID of the color.
 *     responses:
 *       200:
 *         description: ItemMaster Color updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ItemMaster Color updated successfully
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to update ItemMaster Color
 * @function
 * @name updateItemColor
 * @memberof module:Routes/ItemData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with updating the color for the item.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Update item color route
app.post('/updateitemcolor/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.itemId;
    const { product_code, product_des } = req.body;

    // Perform the update operation in your MySQL database
    const updateQuery = 'UPDATE item_code SET product_code = ?, product_des = ? WHERE id = ?';
    const updateValues = [product_code, product_des, itemId];

    await executeQuery(connection,updateQuery, updateValues);

    console.log('ItemMaster Color updated');
    res.status(200).json({ message: ' Color code updated successfully' });
  } catch (error) {
    console.error('Error updating item color code:', error);
    res.status(500).json({ error: 'Failed to update Item Color Code' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /additemcolor/{itemId}:
 *   post:
 *     summary: Add color for an item.
 *     description: Add a new color for a specific item in the database.
 *     tags:
 *       - Item Data
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the item to add the color to.
 *         schema:
 *           type: integer
 *       - in: body
 *         name: colorData
 *         description: The color data to be added.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               description: The code of the color.
 *             desc:
 *               type: string
 *               description: The description of the color.
 *             color:
 *               type: integer
 *               description: The ID of the color.
 *     responses:
 *       200:
 *         description: Color added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Color added successfully
 *       400:
 *         description: Bad request. The color already exists for the item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 * @function
 * @name addItemColor
 * @memberof module:Routes/ItemData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with adding the color for the item.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//getitemcode data
app.get('/getitemcodedata/:itemId', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const itemId = req.params.itemId;
    const query = 'SELECT * FROM item_code WHERE id = ?';

    // Execute the parameterized query using executeQuery function
    const results = await executeQuery(connection,query, [itemId]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching item data:', error);
    res.status(500).json({ error: 'Failed to fetch item data' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /getitemsection:
 *   get:
 *     summary: Get item section details
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with item section details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   section_name:
 *                     type: string
 *                     example: "www"
 *                   target_unit:
 *                     type: string
 *                     example: "www"
 *                   section_type:
 *                     type: string
 *                     example: "nbraids"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getItemSectionDetails
 * @description Get item section details
 * @memberof module:routes/item_section
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//Get section for datatables
app.get("/getitemsection", authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const result = await executeQuery(connection, "SELECT * FROM section");
      res.send(result);
      console.log("Connected!");
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /getitemmasternew:
 *   get:
 *     summary: Get item master details
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with item master details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processedResult:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_name:
 *                         type: string
 *                         example: "CROCHET"
 *                       item_group:
 *                         type: string
 *                         example: "FGPCDAAFB001"
 *                       item_description:
 *                         type: string
 *                         example: "AFRO BULK"
 *                       section1:
 *                         type: string
 *                         example: "2000"
 *                       section2:
 *                         type: string
 *                         example: ""
 *                       section3:
 *                         type: string
 *                         example: ""
 *                       section4:
 *                         type: string
 *                         example: "250"
 *                       section5:
 *                         type: string
 *                         example: ""
 *                       section6:
 *                         type: string
 *                         example: ""
 *                       section7:
 *                         type: string
 *                         example: ""
 *                       section8:
 *                         type: string
 *                         example: ""
 *                       section9:
 *                         type: string
 *                         example: ""
 *                       section10:
 *                         type: string
 *                         example: "11"
 *                       section11:
 *                         type: string
 *                         example: "60"
 *                       section12:
 *                         type: string
 *                         example: ""
 *                       section13:
 *                         type: string
 *                         example: ""
 *                       section14:
 *                         type: string
 *                         example: ""
 *                       section15:
 *                         type: string
 *                         example: "600"
 *                       section16:
 *                         type: string
 *                         example: ""
 *                       section17:
 *                         type: string
 *                         example: "65"
 *                       section18:
 *                         type: string
 *                         example: "50"
 *                       section19:
 *                         type: string
 *                         example: ""
 *                       section20:
 *                         type: string
 *                         example: "500"
 *                       section21:
 *                         type: string
 *                         example: "200"
 *                       section22:
 *                         type: string
 *                         example: "200"
 *                       section23:
 *                         type: string
 *                         example: ""
 *                       section24:
 *                         type: string
 *                         example: "1000"
 *                       section25:
 *                         type: string
 *                         example: "1000"
 *                       section26:
 *                         type: string
 *                         example: "1500"
 *                       section27:
 *                         type: string
 *                         example: ""
 *                       section28:
 *                         type: string
 *                         example: ""
 *                       section29:
 *                         type: string
 *                         example: ""
 *                       section30:
 *                         type: string
 *                         example: ""
 *                       section31:
 *                         type: string
 *                         example: ""
 *                       section32:
 *                         type: string
 *                         example: ""
 *                       section33:
 *                         type: string
 *                         example: ""
 *                       section34:
 *                         type: string
 *                         example: ""
 *                       section35:
 *                         type: string
 *                         example: ""
 *                 indexcolumn:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
 * 
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getItemMasterDetails
 * @description Get item master details
 * @memberof module:routes/item_master
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */





app.get("/getitemmasternew", authenticateJWT, async (req, res) => {
  const roleId = 3;
  let query = '';
  let query2 = '';
  const indexcolumn = [];

  if (roleId === 5 || roleId === 3) {
      query = `
          SELECT item_masterr.*, item_category.category_name, item_subcategory.subcategory_name
          FROM item_masterr
          LEFT JOIN item_category ON item_masterr.category_id = item_category.id
          LEFT JOIN item_subcategory ON item_masterr.subcategory_id = item_subcategory.id
      `;
  }

  query2 = `
      SELECT section.*
      FROM section
  `;

  let connection;
  try {
      connection = await getPoolConnection();

      const results = await executeQuery(connection, query);
      const results2 = await executeQuery(connection, query2);

      const processedResult = await Promise.all(results.map(async (result) => {
          let num = 1;
          let processedRow = {
              category_name: result.category_name,
              item_group: result.item_group,
              item_description: result.item_description,
          };

          await Promise.all(results2.map(async (result2) => {
              const whereConditions = [];
              whereConditions.push(`item_section_moz.item_id = '${result['id']}'`);
              whereConditions.push(`item_section_moz.section_id = '${result2['id']}'`);
              const whereClause = whereConditions.join(' AND ');

              const targetQuery = `SELECT item_section_moz.target
                  FROM item_section_moz
                  WHERE ${whereClause}`;

              const targetResults = await executeQuery(connection, targetQuery);

              const targetResult = targetResults.length > 0 ? targetResults[0].target : '';

              processedRow[`section${num}`] = targetResult;

              if (!indexcolumn.includes(num)) {
                  indexcolumn.push(num);
              }

              num++;
          }));

          return { processedRow, indexcolumn };
      }));

      const response = {
          processedResult: processedResult.map((row) => row.processedRow),
          indexcolumn: processedResult.map((row) => row.indexcolumn),
      };

      res.send(response);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});
/**
 * @swagger
 * /operator_data_view:
 *   get:
 *     summary: Get operator data view for Ikeja.
 *     description: Retrieves operator data from the geopos_employees, geopos_users, and geopos_emptype tables.
 *     tags:
 *       - Operator Data
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the operator data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the employee.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the employee.
 *                     example: "John Doe"
 *                   entryid:
 *                     type: integer
 *                     description: The entry ID of the employee.
 *                     example: 1001
 *                   roleid:
 *                     type: integer
 *                     description: The role ID of the employee.
 *                     example: 3
 *                   email:
 *                     type: string
 *                     description: The email of the employee.
 *                     example: "mailto:johndoe@example.com"
 *                   loc:
 *                     type: string
 *                     description: The location of the employee.
 *                     example: "Ikeja"
 *                   empname:
 *                     type: string
 *                     description: The name of the employee type.
 *                     example: "Operator"
 *                   banned:
 *                     type: integer
 *                     description: The banned status of the user.
 *                     example: 0
 *       500:
 *         description: An error occurred while fetching operator data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *
 * @function
 * @name getIkejaOperatorDataView
 * @memberof module:Routes/OperatorData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with executing the MySQL query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get operator data 
app.get('/operator_data_view', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = `
      SELECT employees_moz.*, geopos_users.banned, geopos_users.roleid,geopos_users.id as idd, geopos_users.email, geopos_users.loc,geopos_emptype.name as empname
  FROM employees_moz
  LEFT JOIN geopos_users ON employees_moz.entryid = geopos_users.entryid
  LEFT JOIN geopos_emptype ON geopos_users.roleid = geopos_emptype.id
  WHERE geopos_users.roleid = ?
  ORDER BY geopos_users.roleid DESC
    `;
    
    // Execute the query asynchronously
    const result = await executeQuery(connection, query, ['3', 'ikeja', '0']);

    res.send(result);
  } catch (error) {
    console.error('Error fetching operator data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("Connection released");
    }
  }
});
/**
 * @swagger
 * /operator_delete/{uid}/{eid}:
 *   delete:
 *     summary: Delete operator data by user ID and entry ID
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           example: "1001"
 *         description: The user ID of the operator
 *       - in: path
 *         name: eid
 *         required: true
 *         schema:
 *           type: string
 *           example: "50000"
 *         description: The entry ID of the operator
 *     responses:
 *       200:
 *         description: Successfully deleted operator data
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Data Deleted successfully
 *       404:
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Record not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name deleteOperatorData
 * @description Delete operator data by user ID and entry ID
 * @memberof module:routes/operator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



// //Delete operator
app.delete('/operator_delete/:uid/:eid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const uid = req.params.uid;
    const eid = req.params.eid;

    const result1 = await executeQuery(connection, 'SELECT * FROM employees_moz WHERE entryid = ?', [eid]);

    if (result1.length === 0) {
     // return res.status(404).send('Record not found');
    }

    const deleteEmployeeResult = await executeQuery(connection, 'DELETE FROM employees_moz WHERE entryid = ?', [eid]);

    if (deleteEmployeeResult.affectedRows === 0) {
      console.error("Error deleting employee");
    //  return res.status(500).send('Error deleting record');
    }

    const deleteUserResult = await executeQuery(connection, 'DELETE FROM geopos_users WHERE entryid = ?', [eid]);

    if (deleteUserResult.affectedRows === 0) {
      console.error("Error deleting user");
    //  return res.status(500).send('Error deleting record');
    }

    const deleteAssignResult = await executeQuery(connection, 'DELETE FROM operator_assign WHERE name_id = ?', [36]);

    if (deleteAssignResult.affectedRows === 0) {
      console.error("Error deleting assign");
     // return res.status(500).send('Error deleting record');
    }

    res.status(200).send('Data Deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /operator_data_single/{id}:
 *   get:
 *     summary: Get data of a single operator for Ikeja.
 *     description: Retrieves data of a single operator for Ikeja based on the provided operator ID.
 *     tags:
 *       - Ikeja
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the operator.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved operator data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                
 *       404:
 *         description: Operator not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Operator not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getSingleOperatorData
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue fetching operator data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get operator data single 
app.get('/operator_data_single/:id', authenticateJWT, async (req, res) => {
 
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;
    const query = 'SELECT * FROM employees_moz WHERE id = ?';
    const result = await executeQuery(connection,query, [id]);

    if (result.length > 0) {
      res.send(result[0]); // Send only the name value from the result
    } else {
      res.status(404).send("Operator not found");
    }
  } catch (error) {
    console.error('Error fetching operator data:', error);
    res.status(500).json({ error: 'Failed to fetch operator data' });
  }
  finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /worker_data_single/{id}:
 *   get:
 *     summary: Get data of a single operator for Ikeja.
 *     description: Retrieves data of a single operator for Ikeja based on the provided operator ID.
 *     tags:
 *       - Ikeja
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the operator.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved operator data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                
 *       404:
 *         description: Operator not found.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Operator not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getSingleWorkerData
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue fetching operator data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get worker data single 
app.get('/worker_data_single/:id', authenticateJWT, async (req, res) => {
 
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;

    const query = 'SELECT employees_moz.*, section.section_name, item_masterr.item_description as product_name ' +
    'FROM employees_moz ' +
    'LEFT JOIN section ON employees_moz.section_id = section.id ' +
    'LEFT JOIN item_masterr ON employees_moz.product = item_masterr.id ' +
    'WHERE employees_moz.id = ?';
    const result = await executeQuery(connection,query, [id]);

    if (result.length > 0) {
      res.send(result[0]); // Send only the name value from the result
    } else {
      res.status(404).send("Worker not found");
    }
  } catch (error) {
    console.error('Error fetching worker data:', error);
    res.status(500).json({ error: 'Failed to fetch worker data' });
  }
  finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /getShiftOptions:
 *   get:
 *     summary: Get shift options.
 *     description: Retrieves all records from the geopos_shift table.
 *     tags:
 *       - Shift
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "4.5HRS"
 *                   nhrs:
 *                     type: string
 *                     example: "4.5"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getShiftOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.get('/getShiftOptions', authenticateJWT, async (req, res) => {
 // console.log("hi");
  let connection;
  try {
    connection = await getPoolConnection();
    const query = 'SELECT * FROM geopos_shift';
    const results = await executeQuery(connection, query);
    res.json(results);
   // console.log(results);
  } catch (error) {
   // console.log("bye");
    console.error('Error fetching shift data:', error);
    res.status(500).json({ error: 'Failed to fetch shift data' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /add_operator:
 *   post:
 *     summary: Add a new operator
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               entryid:
 *                 type: string
 *                 example: 1234
 *               password:
 *                 type: string
 *                 example: password123
 *               workertype:
 *                 type: string
 *                 example: DIRECT
 *               shift:
 *                 type: string
 *                 example: 11HRS
 *     responses:
 *       200:
 *         description: Successfully added or updated operator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator inserted successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the process
 */

/**
 * @function
 * @name addOperator
 * @description Add a new operator
 * @memberof module:routes/operator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
// //add operator data submit
app.post('/add_operator',authenticateJWT, async (req, res) => {
  let connection;
  try{
      connection = await getPoolConnection();
  const name = req.body.name
  const username = req.body.username
  const email = req.body.email
  const entryid = req.body.entryid
  const pass = req.body.password !== "" ? req.body.password : '123456';
  const worktyp = req.body.workertype
  const shift = req.body.shift

  const roleid = '3'
  const date = dateUtils.getCurrentDate("DD-MM-YYYY");
  const formattedDate = dateUtils.getCurrentDate('YYYY-MM-DD HH:mm:ss');
  const rowcheck = `SELECT * FROM geopos_users WHERE entryid="${entryid}" OR email="${email}"`
  const rowcheck1 = `SELECT * FROM employees_moz WHERE entryid="${entryid}"`
  const rowcheck2 = `SELECT * FROM geopos_users WHERE email="${email}" OR username="${username}" OR name="${name}"`
  const result = await executeQuery(connection, rowcheck);
    const id = result.id


    if (result.length > 0) {

      res.status(200).json({status: '409', message: 'Operator Already Exist.' });
    } else {
      const resultt = await executeQuery(connection, rowcheck2);

        if(resultt.length > 0){
    
        }else{
     
          const resulttt = await executeQuery(connection, 'INSERT INTO geopos_users (email, username, name, entryid, date_created) VALUES (?,?,?,?,?)', [email, username, name, entryid, formattedDate]);
            // console.log(result);
              if (resulttt) {
            
                const userId = resulttt.insertId;
                const userIdAsString = userId.toString(); // Convert the number to a string
                const hashedPassword = authUtils.hashPassword(pass, userIdAsString);
                const result2 = await executeQuery(connection, "UPDATE geopos_users SET pass=? WHERE entryid=?",[hashedPassword, entryid]);
              }
        }
      const resultt1 = await executeQuery(connection, rowcheck1);
        if (resultt1.length > 0) {
       
              const qwuery = 'UPDATE employees_moz SET roleid=?, workertype=?, shift=?,  section_id=?  WHERE entryid=?';
              const result2 = await executeQuery(connection, qwuery ,[roleid, worktyp, shift,'0', entryid]);

                if (result2) {
           
                  const rrquery = 'UPDATE geopos_users SET roleid=?, name=? WHERE entryid=?';
                  const result3 = await executeQuery(connection, rrquery, [roleid,name,entryid]);
                  if (result3.affectedRows === 0) {
                    res.status(200).json({status: '409',message: 'Operator not updated1' })
                  } else {
                    res.status(200).json({status: '200', message: 'Operator updated successfully' })
                  }

                }
        }else{
         
            const qazquery = `INSERT INTO employees_moz (username,entryid,email,name,roleid,workertype,shift,date) VALUES (?,?,?,?,?,?,?,?)`;
            const result222 = await executeQuery(connection, qazquery, [username, entryid, email, name, roleid, worktyp,shift,date]);

                if (result222) {
            
                  const rfrquery = 'UPDATE geopos_users SET roleid=?, name=? WHERE entryid=?';
                  const result2222 = await executeQuery(connection, rfrquery, [roleid,name,entryid]);
                  if (result2222.affectedRows === 0) {
                   
                    res.status(200).json({status: '409', message: 'Operator not inserted2' })
                  } else {
              
                    res.status(200).json({status: '200', message: 'Operator inserted successfully' })
                  }
                }
        }
    }
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(200).json({status: '409', message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
})


/**
 * @swagger
 * /getMachines/{id}:
 *   get:
 *     summary: Get machines by zone ID
 *     description: Retrieves machines based on the provided zone ID.
 *     tags:
 *       - Machines
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the zone to retrieve machines from.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Machines retrieved successfully.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Machine1, Machine2, Machine3'
 *       404:
 *         description: No machines found for the provided zone ID.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: ''
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getMachinesByZoneID
 * @memberof module:Routes/Machines
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue fetching the machines by zone ID.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//get machines data
app.get('/getMachines/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;
    const query = 'SELECT machine FROM geopos_machine WHERE zone = ?';
    
    // Execute the query asynchronously
    const result = await executeQuery(connection,query, id);

    if (result.length > 0) {
      res.send(result[0].machine); // Send only the name value from the result
    } else {
      res.send('');
    }
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /getLineOptions/{selectedProduct}:
 *   get:
 *     summary: Get line options for a selected product.
 *     description: Retrieves line options for the specified product from the item_masterr table.
 *     tags:
 *       - Line
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: selectedProduct
 *         required: true
 *         description: The ID of the selected product.
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Line options retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   line:
 *                     type: string
 *                     example: "Line 1"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getLineOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Define a route for fetching line options
app.get('/getLineOptions/:selectedProduct',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const { selectedProduct } = req.params;
  //console.log(selectedProduct);
  // Perform a database query to fetch the line options for the specified product
  // Replace 'your_db_connection' with your actual database connection object

  // Example using MySQL as the database
  const query = `SELECT line FROM item_masterr WHERE id = ?`;
  const results = await executeQuery(connection, query, [selectedProduct]);
  const lineString = results[0].line; // Assuming only one row is returned
  const lineOptions = lineString.split(',').map((line) => ({
    line: line.trim(), // Trim any whitespace around the line
  }));

  res.json(lineOptions);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getProductOptions/:
 *   get:
 *     summary: Get product options.
 *     description: Retrieves product options from the database.
 *     tags:
 *       - Item
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 2
 *                   category_id:
 *                     type: integer
 *                     example: 1
 *                   subcategory_id:
 *                     type: integer
 *                     example: 1
 *                   item_group:
 *                     type: string
 *                     example: "FGWVDABUN001"
 *                   item_description:
 *                     type: string
 *                     example: "AFRO BUN TOTO"
 *                   country:
 *                     type: string
 *                     example: ""
 *                   ppp_benchmark:
 *                     type: string
 *                     example: ""
 *                   kg:
 *                     type: number
 *                     format: float
 *                     example: 45
 *                   string:
 *                     type: integer
 *                     example: 1
 *                   pcs:
 *                     type: integer
 *                     example: 1
 *                   line:
 *                     type: string
 *                     example: "1,2,3,4,5,6,7,8,9,10"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2021-08-22T09:12:06.000Z"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getProductOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

app.get('/getProductOptions/',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  //const itemId = req.params.itemId;

  // Assuming you have a database connection and a table named 'item_code'
  // Perform a database query to fetch the data based on the itemId
  // Example query using MySQL:
  const query = `SELECT * FROM item_masterr`;

  const results = await executeQuery(connection, query);
  res.json(results);
  // Execute the query and handle the result
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getSectionOptions:
 *   get:
 *     summary: Get section options.
 *     description: Retrieves all records from the section table.
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   section_name:
 *                     type: string
 *                     example: "Section A"
 *                   target_unit:
 *                     type: string
 *                     example: "Unit 1"
 *                   section_type:
 *                     type: string
 *                     example: "Type 1"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getSectionOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//getsection
app.get('/getSectionOptions', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const itemId = req.params.itemId;

  // Assuming you have a database connection and a table named 'item_code'
  // Perform a database query to fetch the data based on the itemId
  // Example query using MySQL:
  const query = `SELECT * FROM section`;
  const results = await executeQuery(connection, query);
  res.json(results);
  // Execute the query and handle the result

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getWorkerOptions:
 *   get:
 *     summary: Get worker options.
 *     description: Retrieves all unique worker names from the employees_moz table.
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   entryid:
 *                     type: string
 *                     example: "12345"
 *                   shift:
 *                     type: string
 *                     example: "Morning"
 *                   department:
 *                     type: string
 *                     example: "Manufacturing"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getWorkerOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */



//getworker
app.get('/getWorkerOptions',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const itemId = req.params.itemId;

  // Assuming you have a database connection and a table named 'item_code'
  // Perform a database query to fetch the data based on the itemId
  // Example query using MySQL:
  const query = `SELECT * FROM employees_moz GROUP BY name`;
  const results = await executeQuery(connection, query);
  res.json(results);
  // Execute the query and handle the result

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * /getuserid/{id}:
 *   get:
 *     summary: Get a user by entry ID
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The entry ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 9
 *                 email:
 *                   type: string
 *                   example: "admin@gmail.com"
 *                 pass:
 *                   type: string
 *                   example: "a0fee0a9df23623d73a2bd346d068898d5f37db5761347be5251d33abede5a5e"
 *                 entryid:
 *                   type: string
 *                   example: "50000"
 *                 username:
 *                   type: string
 *                   example: "admin"
 *                 name:
 *                   type: string
 *                   example: "ADMIN"
 *                 banned:
 *                   type: integer
 *                   example: 0
 *                 last_login:
 *                   type: string
 *                   example: "2024-02-11T03:48:12.000Z"
 *                 last_activity:
 *                   type: string
 *                   example: "2024-02-11T03:48:12.000Z"
 *                 date_created:
 *                   type: string
 *                   example: "2020-11-25T04:07:55.000Z"
 *                 forgot_exp:
 *                   type: string
 *                 remember_time:
 *                   type: string
 *                 remember_exp:
 *                   type: string
 *                 verification_code:
 *                   type: string
 *                   example: ""
 *                 totp_secret:
 *                   type: string
 *                 ip_address:
 *                   type: string
 *                   example: "197.235.78.232"
 *                 roleid:
 *                   type: integer
 *                   example: 5
 *                 picture:
 *                   type: string
 *                   example: "example.png"
 *                 loc:
 *                   type: integer
 *                   example: 0
 *                 cid:
 *                   type: integer
 *                   example: 0
 *                 lang:
 *                   type: string
 *                   example: "portuguese"
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the process
 */

/**
 * @function
 * @name getUserById
 * @description Get a user by entry ID
 * @memberof module:routes/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




// //get user id
app.get('/getuserid/:id',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id
  const query = `SELECT * FROM geopos_users WHERE entryid=?`;
const result = await executeQuery(connection, query, [id]);

  // db.query('SELECT * FROM geopos_users WHERE entryid=?',[id], (err, result) => {
  //   if (err) {
  //     console.log(err)
  //   }
    res.send(result[0]); // Send only the name value from the result

 // })
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
})

/**
 * @swagger
 * /getuserbyid/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 9
 *                 email:
 *                   type: string
 *                   example: "admin@gmail.com"
 *                 pass:
 *                   type: string
 *                   example: "a0fee0a9df23623d73a2bd346d068898d5f37db5761347be5251d33abede5a5e"
 *                 entryid:
 *                   type: string
 *                   example: "50000"
 *                 username:
 *                   type: string
 *                   example: "admin"
 *                 name:
 *                   type: string
 *                   example: "ADMIN"
 *                 banned:
 *                   type: integer
 *                   example: 0
 *                 last_login:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-02-11T03:48:12.000Z"
 *                 last_activity:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-02-11T03:48:12.000Z"
 *                 date_created:
 *                   type: string
 *                   format: date-time
 *                   example: "2020-11-25T04:07:55.000Z"
 *                 forgot_exp:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *                 remember_time:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *                 remember_exp:
 *                   type: string
 *                   format: date-time
 *                   example: null
 *                 verification_code:
 *                   type: string
 *                   example: ""
 *                 totp_secret:
 *                   type: string
 *                   example: null
 *                 ip_address:
 *                   type: string
 *                   example: "197.235.78.232"
 *                 roleid:
 *                   type: integer
 *                   example: 5
 *                 picture:
 *                   type: string
 *                   example: "example.png"
 *                 loc:
 *                   type: integer
 *                   example: 0
 *                 cid:
 *                   type: integer
 *                   example: 0
 *                 lang:
 *                   type: string
 *                   example: "portuguese"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getUserByID
 * @description Get user by ID
 * @memberof module:routes/user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


app.get('/getuserbyid/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const id = req.params.id;
      const result = await executeQuery(connection, 'SELECT * FROM geopos_users WHERE id=?', [id]);
      res.send(result[0]); // Send only the first row of the result
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});
/**
 * @swagger
 * /admin_data_username/{id}:
 *   get:
 *     summary: Get admin data by username
 *     description: Fetches details of an admin user based on the provided username.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The entry ID of the admin user to retrieve.
 *         schema:
 *           type: integer
 *           example: 101
 *     responses:
 *       200:
 *         description: Admin data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: 'admin@example.com'
 *                       username:
 *                         type: string
 *                         example: 'admin'
 *                       name:
 *                         type: string
 *                         example: 'John Doe'
 *                      
 *       404:
 *         description: Admin not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Admin not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getAdminDataByUsername
 * @memberof module:Routes/Admin
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue fetching the admin user data by username.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get admin username single
app.get('/admin_data_username/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;
    // Execute the query asynchronously
    const result = await executeQuery(connection,'SELECT * FROM geopos_users WHERE entryid=?', id);

    // Check if the result is empty
    if (result.length === 0) {
      return res.status(404).json({ status: 'Error', message: 'Admin not found' });
    }

    // Return the full result as a JSON response
    return res.status(200).json({ status: 'Success', data: result });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /getSectionitem/{id}:
 *   get:
 *     summary: Get section item details by operator ID
 *     tags:
 *       - Section
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Operator ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved section item details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name_id:
 *                     type: string
 *                     example: 40
 *                   product_name:
 *                     type: integer
 *                     example: 97
 *                   line:
 *                     type: integer
 *                     example: 8
 *                   section:
 *                     type: integer
 *                     example: 28
 *                   shift:
 *                     type: string
 *                     example: 8HRS
 *                   date:
 *                     type: string
 *                     example: "26-08-2021 01:05:25"
 *                   loc:
 *                     type: integer
 *                     example: 0
 *                   section_name:
 *                     type: string
 *                     example: S.C.M.S.B.P.C
 *                   item_description:
 *                     type: string
 *                     example: BRANDI JUMBO
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getSectionitem
 * @description Get section item details by operator ID
 * @memberof module:routes/sections
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




// //get operator section data
app.get('/getSectionitem/:id',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const operatorId = req.params.id;

  const query = `
    SELECT operator_assign.*, section.section_name,item_masterr.item_description
    FROM operator_assign
    LEFT JOIN section ON operator_assign.section = section.id
    LEFT JOIN item_masterr ON operator_assign.product_name = item_masterr.id
    WHERE operator_assign.name_id = ?
  `;

  const result = await executeQuery(connection, query, [operatorId]);
  res.json(result);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /addSectionOp:
 *   post:
 *     summary: Assign operator to a section
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Operator ID
 *               shift:
 *                 type: integer
 *                 description: Shift of the operator
 *                 example: 8
 *               product_name:
 *                 type: integer
 *                 description: Product name
 *                 example: 1
 *               line:
 *                 type: integer
 *                 description: Line number
 *                 example: 2
 *               section:
 *                 type: integer
 *                 description: Section ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: Operator Section Inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator Section Inserted successfully
 *       404:
 *         description: Operator Section not Inserted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator Section not Inserted
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name addSectionOp
 * @description Assign operator to a section
 * @memberof module:routes/sections
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



// //submit section op  data
app.post("/addSectionOp", authenticateJWT, async (req, res) => {  
  let connection;
  try {
    connection = await getPoolConnection();
    var id = req.body.id;
    var shift = req.body.shift+'HRS';
    var product_name = req.body.productname;
    var line = req.body.line;
    var section = req.body.section;

    const formattedDate = dateUtils.getCurrentDate('DD-MM-YYYY HH:mm:ss');

    const rowcheck = `SELECT * FROM operator_assign WHERE product_name="${product_name}" AND section="${section}" AND line="${line}" AND shift="${shift}"`;

    const result = await executeQuery(connection, rowcheck);
    //console.log(id);
     
    if (result.length > 0) {
      res.status(200).json({ message: 'Already assigned to the same operator or another' });
    } else {
      const rowcheck2 = `INSERT INTO operator_assign (name_id, product_name, section, line, shift, date) VALUES (?,?,?,?,?,?)`;

      const result2 = await executeQuery(connection, rowcheck2, [id, product_name, section, line, shift, formattedDate]);
      
      if (result2.affectedRows === 0) {
        res.status(404).json({ message: 'Operator Section not Inserted' });
      } else {
        res.status(200).json({ message: 'Operator Section Inserted successfully' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /delete_section_assign/{id}:
 *   delete:
 *     summary: Delete operator section assignment
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the operator section assignment to delete
 *     responses:
 *       200:
 *         description: Operator Section Deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Operator Section Deleted successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name deleteSectionAssign
 * @description Delete operator section assignment
 * @memberof module:routes/sections
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


//   //assign section Delete 
app.delete('/delete_section_assign/:id',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id
  const query = `DELETE FROM operator_assign WHERE id= ?`;
const result = await executeQuery(connection, query, [id]);
res.status(200).send('Operator Section Deleted successfully');

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
})


/**
 * @swagger
 * /get_users:
 *   get:
 *     summary: Get users with specific role
 *     tags:
 *       - User
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 11
 *                 email:
 *                   type: string
 *                   example: "36@godrejeta.com"
 *                 pass:
 *                   type: string
 *                   example: "01b7ad097c43f7a9d91ab4a6f7b65c2e5419f6c84d8deecd7b849206197938e9"
 *                 entryid:
 *                   type: string
 *                   example: "36"
 *                 username:
 *                   type: string
 *                   example: "mz_36@gmail.com"
 *                 name:
 *                   type: string
 *                   example: "Aniceto Carlos Dairamo"
 *                 banned:
 *                   type: integer
 *                   example: 0
 *                 last_login:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-07T06:47:05.000Z"
 *                 last_activity:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-07T06:47:05.000Z"
 *                 date_created:
 *                   type: string
 *                   format: date-time
 *                   example: "2021-08-22T10:30:50.000Z"
 *                 forgot_exp:
 *                   type: string
 *                   nullable: true
 *                   example: "string"
 *                 remember_time:
 *                   type: string
 *                   nullable: true
 *                   example: "string"
 *                 remember_exp:
 *                   type: string
 *                   nullable: true
 *                   example: "string"
 *                 verification_code:
 *                   type: string
 *                   nullable: true
 *                   example: "string"
 *                 totp_secret:
 *                   type: string
 *                   nullable: true
 *                   example: "string"
 *                 ip_address:
 *                   type: string
 *                   example: "::1"
 *                 roleid:
 *                   type: integer
 *                   example: 3
 *                 picture:
 *                   type: string
 *                   example: "example.png"
 *                 loc:
 *                   type: integer
 *                   example: 0
 *                 cid:
 *                   type: integer
 *                   example: 0
 *                 lang:
 *                   type: string
 *                   example: "english"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getUsers
 * @description Get users with specific role
 * @memberof module:routes/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//   //Get all users
  app.get('/get_users',authenticateJWT, async (req, res) => {
    let connection;
    try{
    
        connection = await getPoolConnection();
        const query = `SELECT * FROM geopos_users WHERE roleid=?`;
const result = await executeQuery(connection, query, ['3']);


      res.send(result)
 
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
  })

   /**
 * @swagger
 * /assign_check:
 *   get:
 *     summary: Check assignments based on specified conditions
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: where
 *         schema:
 *           type: string
 *         description: Conditions to filter assignments (e.g., "`id=2`")
 *     responses:
 *       200:
 *         description: Successfully retrieved assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name_id:
 *                     type: string
 *                     example: "40"
 *                   product_name:
 *                     type: integer
 *                     example: 97
 *                   line:
 *                     type: integer
 *                     example: 8
 *                   section:
 *                     type: integer
 *                     example: 28
 *                   shift:
 *                     type: string
 *                     example: "8HRS"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2021-08-22T10:30:50.000Z"
 *                   loc:
 *                     type: integer
 *                     example: 0
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name assignCheck
 * @description Check assignments based on specified conditions
 * @memberof module:routes/assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//   //Operator section exit check
app.get('/assign_check', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { where } = req.query;

    const query = `SELECT * FROM operator_assign WHERE ${where}`;
    const result = await executeQuery(connection, query);
    res.send(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /update_assign_operator/{id}:
 *   put:
 *     summary: Update the operator assignment based on specified conditions
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID to assign
 *       - in: query
 *         name: where
 *         schema:
 *           type: string
 *         required: true
 *         description: Conditions to filter assignments (e.g., "`id=2`")
 *     responses:
 *       200:
 *         description: Successfully updated the assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator Section Updated successfully
 *       404:
 *         description: Operator Section not updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator Section not Updated
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name updateAssignOperator
 * @description Update the operator assignment based on specified conditions
 * @memberof module:routes/assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//   //update assign operator
app.put('/update_assign_operator/:id', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const { where } = req.query
  const userid = req.params.id

  const query = `UPDATE operator_assign SET name_id = ${userid} WHERE ${where}`;
  const result = await executeQuery(connection, query);

  if (result.affectedRows === 0) {
    res.status(404).json({ message: 'Operator Section not Updated' });
  } else {
    res.status(200).json({ message: 'Operator Section Updated successfully' });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
})
/**
 * @swagger
 * /get_role/{id}:
 *   get:
 *     summary: Get role details by ID
 *     tags:
 *       - Employee Role
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the role
 *     responses:
 *       200:
 *         description: Successfully retrieved role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Admin"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getRole
 * @description Get role details by ID
 * @memberof module:routes/role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


//Get user Role
app.get('/get_role/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;

    const result = await executeQuery(connection, 'SELECT * FROM geopos_emptype WHERE id=?', [id]);

    res.send(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /update_operator:
 *   put:
 *     summary: Update operator details in employees_moz and geopos_users tables
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               entryid:
 *                 type: string
 *                 example: "1001"
 *               workertype:
 *                 type: string
 *                 example: "DIRECT"
 *               shift:
 *                 type: string
 *                 example: "8HRS"
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully updated the operator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Operator updated successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name updateOperator
 * @description Update operator details in employees_moz and geopos_users tables
 * @memberof module:routes/operator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


// Update operator
app.put('/update_operator', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const name = req.body.name;
    const entryid = req.body.entryid;
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const id = req.body.id;

    // Update first table
    const query = `UPDATE employees_moz SET entryid=?, name=?, workertype=?, shift=? WHERE id = ?`;
    const result = await executeQuery(connection, query, [entryid, name, worktyp, shift, id]);

    if (result.affectedRows === 0) {
      res.status(200).json({ message: 'Operator not updated in employees_moz' });
    } else {
      // Update second table
      const query2 = `UPDATE geopos_users SET name=? WHERE entryid = ?`;
      const result2 = await executeQuery(connection, query2, [name, entryid]);
      
      if (result2.affectedRows === 0) {
        res.status(200).json({ message: 'Operator not updated in geopos_users' });
      } else {
        res.status(200).json({ message: 'Operator updated successfully' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /get_assign_op_worker_list:
 *   get:
 *     summary: Get assigned operator worker list
 *     tags:
 *       - Operator
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned operator worker list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name_id:
 *                     type: string
 *                     example: "40"
 *                   product_name:
 *                     type: integer
 *                     example: 97
 *                   line:
 *                     type: integer
 *                     example: 8
 *                   section:
 *                     type: integer
 *                     example: 28
 *                   shift:
 *                     type: string
 *                     example: "8HRS"
 *                   date:
 *                     type: string
 *                     example: "26-08-2021 01:05:25"
 *                   loc:
 *                     type: integer
 *                     example: 0
 *                   entryid:
 *                     type: string
 *                     example: "who123"
 *                   roleid:
 *                     type: integer
 *                     example: 3
 *                   name:
 *                     type: string
 *                     example: "who"
 *                   item_description:
 *                     type: string
 *                     example: "BRANDI JUMBO"
 *                   section_name:
 *                     type: string
 *                     example: "S.C.M.S.B.P.C"
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the process
 */

/**
 * @function
 * @name getAssignOperatorWorkerList
 * @description Get assigned operator worker list
 * @memberof module:routes/employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//Get asign operator worker list
app.get('/get_assign_op_worker_list',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const query = `SELECT operator_assign.*,geopos_users.entryid,geopos_users.roleid,geopos_users.name,item_masterr.item_description,section.section_name FROM operator_assign LEFT JOIN item_masterr ON operator_assign.product_name = item_masterr.id LEFT JOIN section ON operator_assign.section = section.id LEFT JOIN geopos_users ON operator_assign.name_id = geopos_users.id`;
  const results = await executeQuery(connection, query);
  //res.json(results);
  // Execute the query and handle the result
  res.send(results);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /getOperatorOptions:
 *   get:
 *     summary: Retrieve operator options
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved operator options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: mz@gmail.com
 *                   entryid:
 *                     type: string
 *                     example: "428"
 *                   name:
 *                     type: string
 *                     example: Angela Jaime Maundze
 *                   passive_type:
 *                     type: string
 *                     example: ACT
 *                   Activo:
 *                     type: integer
 *                     example: 1
 *                   site:
 *                     type: string
 *                     example: BELEZA
 *                   address:
 *                     type: null
 *                   city:
 *                     type: null
 *                   region:
 *                     type: null
 *                   country:
 *                     type: null
 *                   postbox:
 *                     type: null
 *                   phone:
 *                     type: null
 *                   phonealt:
 *                     type: null
 *                   picture:
 *                     type: string
 *                     example: example.png
 *                   sign:
 *                     type: string
 *                     example: sign.png
 *                   joindate:
 *                     type: string
 *                     example: 15/03/2007
 *                   type:
 *                     type: integer
 *                     example: 1
 *                   dept:
 *                     type: null
 *                   degis:
 *                     type: null
 *                   salary:
 *                     type: integer
 *                     example: 0
 *                   clock:
 *                     type: null
 *                   clockin:
 *                     type: null
 *                   clockout:
 *                     type: null
 *                   c_rate:
 *                     type: null
 *                   email:
 *                     type: string
 *                     example: ""
 *                   roleid:
 *                     type: integer
 *                     example: 3
 *                   workertype:
 *                     type: string
 *                     example: DIRECT
 *                   shift:
 *                     type: string
 *                     example: 11HRS
 *                   product:
 *                     type: string
 *                     example: "42"
 *                   line:
 *                     type: string
 *                     example: "4"
 *                   section_id:
 *                     type: integer
 *                     example: 5
 *                   emp_count:
 *                     type: string
 *                     example: ""
 *                   status:
 *                     type: string
 *                     example: P
 *                   date:
 *                     type: string
 *                     example: 14-05-2024
 *                   update_date:
 *                     type: string
 *                     example: "2024-05-14T04:14:27.000Z"
 *                   entry_time:
 *                     type: string
 *                     example: "2024-05-14T01:18:05.000Z"
 *                   role:
 *                     type: string
 *                     example: operator
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the process
 */

/**
 * @function
 * @name getOperatorOptions
 * @description Retrieve operator options
 * @memberof module:routes/employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




app.get('/getOperatorOptions',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const query = `
    SELECT employees_moz.*, geopos_emptype.name AS role
    FROM employees_moz
    LEFT JOIN geopos_users ON employees_moz.entryid = geopos_users.entryid
    LEFT JOIN geopos_emptype ON geopos_users.roleid = geopos_emptype.id
    WHERE geopos_users.roleid = '3'
  `;
  // Execute the query and handle the result

  const results = await executeQuery(connection, query);
 // res.json(results);
 res.send(results);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /changezone_single:
 *   post:
 *     summary: Retrieve employee data based on entry IDs
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: A list of employee data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   entryid:
 *                     type: string
 *                     example: "316"
 *                   name:
 *                     type: string
 *                     example: "Abdul bazilio Antonio"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */

/**
 * @function
 * @name changeZoneSingle
 * @description Retrieve employee data based on entry IDs
 * @memberof module:routes/zone
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//get changezone employee entryid
// Assuming you have already set up your server with the required dependencies and database connection.

app.post('/changezone_single',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const { ids } = req.body;
  const entryIdsArray = Array.isArray(ids) ? ids : [ids];

  // Use the IN operator in the SQL query to check for multiple entryid values
  const query = 'SELECT entryid,name FROM employees_moz WHERE id IN (?)';
  const results = await executeQuery(connection, query, [entryIdsArray]);
  res.json(results);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /update_shift:
 *   put:
 *     summary: Update shift for given entry IDs in the employees_moz table
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *                 example: "11HRS"
 *               ids:
 *                 type: string
 *                 example: "316,317,318"
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                 message:
 *                   type: string
 *                   example: "Shift updated successfully."
 *       400:
 *         description: Bad request - Shift and entryIds are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Error"
 *                 message:
 *                   type: string
 *                   example: "Shift and entryIds are required."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */

/**
 * @function
 * @name updateShift
 * @description Update shift for given entry IDs
 * @memberof module:routes/shift
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



app.put('/update_shift', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const { shift, entryIds } = req.body;

      //console.log('Entry IDs:', entryIds);

      if (!shift || !entryIds) {
          return res.status(400).json({ status: 'Error', message: 'Shift and entryIds are required.' });
      }

      const entryIdsArray = entryIds.split(',');
      const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Maputo' });
      const [formattedDay, formattedMonth, year] = date.split('/').map(part => part.padStart(2, '0'));
      const date1 = `${formattedDay}-${formattedMonth}-${year}`;

      const checkQuery = 'SELECT id FROM employees_moz WHERE id = ? ';
      const updateQuery = 'UPDATE employees_moz SET shift = ? WHERE id = ?';
      let processedCount = 0;

      for (const entryId of entryIdsArray) {
          const checkValues = [entryId];
          const checkResult = await executeQuery(connection, checkQuery, checkValues);

          if (checkResult.length === 1) {
              const updateValues = [shift, entryId];
              await executeQuery(connection, updateQuery, updateValues);
              processedCount++;
              console.log(`${shift} Data updated for entryId: ${entryId}`);
          } else {
              processedCount++;
              console.log(`Employee not found for entryId: ${entryId}`);
          }

          if (processedCount === entryIdsArray.length) {
              res.json({ status: 'Success', message: 'Shift updated successfully.' });
          }
      }
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /get_employeess:
 *   get:
 *     summary: Get all employees excluding a specific role
 *     tags:
 *       - Employees
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 371
 *                   username:
 *                     type: string
 *                     example: "mz_428@gmail.com"
 *                   entryid:
 *                     type: string
 *                     example: "428"
 *                   name:
 *                     type: string
 *                     example: "Angela Jaime Maundze"
 *                   passive_type:
 *                     type: string
 *                     example: "ACT"
 *                   Activo:
 *                     type: integer
 *                     example: 1
 *                   site:
 *                     type: string
 *                     example: "BELEZA"
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "Maputo"
 *                   region:
 *                     type: string
 *                     example: "Maputo"
 *                   country:
 *                     type: string
 *                     example: "Mozambique"
 *                   postbox:
 *                     type: string
 *                     example: "12345"
 *                   phone:
 *                     type: string
 *                     example: "123-456-7890"
 *                   phonealt:
 *                     type: string
 *                     example: "098-765-4321"
 *                   picture:
 *                     type: string
 *                     example: "example.png"
 *                   sign:
 *                     type: string
 *                     example: "sign.png"
 *                   joindate:
 *                     type: string
 *                     example: "15/03/2007"
 *                   type:
 *                     type: integer
 *                     example: 1
 *                   dept:
 *                     type: string
 *                     example: "Engineering"
 *                   degis:
 *                     type: string
 *                     example: "Manager"
 *                   salary:
 *                     type: number
 *                     format: float
 *                     example: 50000
 *                   clock:
 *                     type: string
 *                     example: "8:00 AM"
 *                   clockin:
 *                     type: string
 *                     example: "8:00 AM"
 *                   clockout:
 *                     type: string
 *                     example: "5:00 PM"
 *                   c_rate:
 *                     type: number
 *                     format: float
 *                     example: 100.5
 *                   email:
 *                     type: string
 *                     example: "example@example.com"
 *                   roleid:
 *                     type: integer
 *                     example: 3
 *                   workertype:
 *                     type: string
 *                     example: "DIRECT"
 *                   shift:
 *                     type: string
 *                     example: "11HRS"
 *                   product:
 *                     type: string
 *                     example: "42"
 *                   line:
 *                     type: string
 *                     example: "4"
 *                   section_id:
 *                     type: integer
 *                     example: 5
 *                   emp_count:
 *                     type: string
 *                     example: ""
 *                   status:
 *                     type: string
 *                     example: "P"
 *                   date:
 *                     type: string
 *                     example: "14-05-2024"
 *                   update_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-14T04:14:27.000Z"
 *                   entry_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-14T01:18:05.000Z"
 *                   section_name:
 *                     type: string
 *                     example: "2 BALANCA (2ND SCALING)"
 *                   role:
 *                     type: string
 *                     example: "operator"
 *                   item_description:
 *                     type: string
 *                     example: "MARLEY KINKY"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getEmployees
 * @description Get all employees excluding a specific role
 * @memberof module:routes/employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//-----Employee Defulte data search
app.get('/get_employeess', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();

    const query = `
      SELECT employees_moz.*, section.section_name, geopos_emptype.name AS role, item_masterr.item_description
      FROM employees_moz
      LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
      LEFT JOIN section ON employees_moz.section_id = section.id
      LEFT JOIN item_masterr ON employees_moz.product = item_masterr.id
      WHERE employees_moz.roleid != '3'
    `;

    const result = await executeQuery(connection, query);

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /get_employees:
 *   get:
 *     summary: Get employees based on a specific condition
 *     tags:
 *       - Employees
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: where
 *         schema:
 *           type: string
 *         required: true
 *         description: SQL WHERE clause to filter employees `[(employees_moz.roleid != '3') AND employees_moz.product='1' AND employees_moz.line='1' AND employees_moz.section_id='1']`
 *     responses:
 *       200:
 *         description: Successfully retrieved employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 371
 *                   username:
 *                     type: string
 *                     example: "mz_428@gmail.com"
 *                   entryid:
 *                     type: string
 *                     example: "428"
 *                   name:
 *                     type: string
 *                     example: "Angela Jaime Maundze"
 *                   passive_type:
 *                     type: string
 *                     example: "ACT"
 *                   Activo:
 *                     type: integer
 *                     example: 1
 *                   site:
 *                     type: string
 *                     example: "BELEZA"
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "Maputo"
 *                   region:
 *                     type: string
 *                     example: "Maputo"
 *                   country:
 *                     type: string
 *                     example: "Mozambique"
 *                   postbox:
 *                     type: string
 *                     example: "12345"
 *                   phone:
 *                     type: string
 *                     example: "123-456-7890"
 *                   phonealt:
 *                     type: string
 *                     example: "098-765-4321"
 *                   picture:
 *                     type: string
 *                     example: "example.png"
 *                   sign:
 *                     type: string
 *                     example: "sign.png"
 *                   joindate:
 *                     type: string
 *                     example: "15/03/2007"
 *                   type:
 *                     type: integer
 *                     example: 1
 *                   dept:
 *                     type: string
 *                     example: "Engineering"
 *                   degis:
 *                     type: string
 *                     example: "Manager"
 *                   salary:
 *                     type: number
 *                     format: float
 *                     example: 50000
 *                   clock:
 *                     type: string
 *                     example: "8:00 AM"
 *                   clockin:
 *                     type: string
 *                     example: "8:00 AM"
 *                   clockout:
 *                     type: string
 *                     example: "5:00 PM"
 *                   c_rate:
 *                     type: number
 *                     format: float
 *                     example: 100.5
 *                   email:
 *                     type: string
 *                     example: "example@example.com"
 *                   roleid:
 *                     type: integer
 *                     example: 3
 *                   workertype:
 *                     type: string
 *                     example: "DIRECT"
 *                   shift:
 *                     type: string
 *                     example: "11HRS"
 *                   product:
 *                     type: string
 *                     example: "42"
 *                   line:
 *                     type: string
 *                     example: "4"
 *                   section_id:
 *                     type: integer
 *                     example: 5
 *                   emp_count:
 *                     type: string
 *                     example: ""
 *                   status:
 *                     type: string
 *                     example: "P"
 *                   date:
 *                     type: string
 *                     example: "14-05-2024"
 *                   update_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-14T04:14:27.000Z"
 *                   entry_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-14T01:18:05.000Z"
 *                   section_name:
 *                     type: string
 *                     example: "2 BALANCA (2ND SCALING)"
 *                   role:
 *                     type: string
 *                     example: "operator"
 *                   item_description:
 *                     type: string
 *                     example: "MARLEY KINKY"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getEmployees
 * @description Get employees based on a specific condition
 * @memberof module:routes/employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




// //-----Employee filter data search
app.get('/get_employees', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { where } = req.query;

    const query = `
      SELECT employees_moz.*, section.section_name, geopos_emptype.name AS role, item_masterr.item_description
      FROM employees_moz
      LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
      LEFT JOIN section ON employees_moz.section_id = section.id
      LEFT JOIN item_masterr ON employees_moz.product = item_masterr.id
      WHERE ${where}
    `;

    const result = await executeQuery(connection, query);

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @swagger
 * /delete_user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Employees
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Worker Deleted successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name deleteUser
 * @description Delete a user
 * @memberof module:routes/users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


// //Delete employee 
app.delete('/delete_user/:id', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const id = req.params.id;

    const deleteQuery = 'DELETE FROM employees_moz WHERE id= ?';
    const result = await executeQuery(connection, deleteQuery, [id]);

    if (result.affectedRows === 0) {
      res.status(500).send('Error deleting Worker');
    } else {
      res.status(200).send('Worker Deleted successfully');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @swagger
 * /get_employeess_nbraid_date:
 *   get:
 *     summary: Retrieve the first employee record ordered by ID in ascending order.
 *     description: This endpoint retrieves the first employee record from the `geopos_employees` table, ordered by ID in ascending order.
 *     tags:
 *       - Employees
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the employee record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the employee.
 *                 entryid:
 *                   type: string
 *                   description: The entry ID of the employee.
 *                 name:
 *                   type: string
 *                   description: The name of the employee.
 *                 roleid:
 *                   type: integer
 *                   description: The role ID of the employee.
 *                 workertype:
 *                   type: string
 *                   description: The workertype of the employee.
 *                 shift:
 *                   type: string
 *                   description: The shift of the employee.
 *                 section_id:
 *                   type: integer
 *                   description: The section ID of the employee.
 *                 zone:
 *                   type: string
 *                   description: The zone of the employee.
 *                 machine:
 *                   type: string
 *                   description: The machine assigned to the employee.
 *                 emp_count:
 *                   type: number
 *                   description: The employee count.
 *                 category_type:
 *                   type: string
 *                   description: The category type of the employee.
 *       404:
 *         description: No records found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No records found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getEmployeessNbraidDate
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue retrieving records.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Employee Default date
app.get('/get_employeess_nbraid_date', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const query = 'SELECT * FROM geopos_employees ORDER BY id ASC LIMIT 1';
    const result = await executeQuery(connection,query);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error retrieving records:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /add_new_worker:
 *   post:
 *     summary: Add a new worker
 *     tags:
 *       - Worker
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: integer
 *               product:
 *                 type: integer
 *               entryid:
 *                 type: string
 *               line:
 *                 type: integer
 *               workertype:
 *                 type: string
 *               shift:
 *                 type: string
 *               sectionId:
 *                 type: integer
 *               join_date:
 *                 type: string
 *                 format: date
 *             example:
 *               name: Angela Jaime Maundze
 *               type: 1
 *               product: 42
 *               entryid: "428"
 *               line: 4
 *               workertype: DIRECT
 *               shift: 11HRS
 *               sectionId: 5
 *               join_date: "2007-03-15"
 *     responses:
 *       200:
 *         description: Worker inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 371
 *                 message:
 *                   type: string
 *                   example: Worker inserted successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name addNewWorker
 * @description Add a new worker
 * @memberof module:routes/workers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



// //add new worker data submit
app.post('/add_new_worker', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const name = req.body.name;
    const type = req.body.type;
    const product = req.body.product;
    const entryid = req.body.entryid;
    const line = req.body.line;
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const sectionId = req.body.section;
    const roleid = '1';

    // Format the current date in 'DD/MM/YYYY' format
    const join_date = dateUtils.convertDateFormat(req.body.join_date, 'DD-MM-YYYY', 'DD/MM/YYYY');

    // Get the current date in 'DD-MM-YYYY' format
    const formattedDate = dateUtils.getCurrentDate("DD-MM-YYYY");

    const rowcheck1 = `SELECT * FROM employees_moz WHERE entryid="${entryid}"`;
    const resultt1 = await executeQuery(connection, rowcheck1);
    if (resultt1.length > 0) {
      res.status(409).json({ status: 'Error', message: 'Sorry, Entryid Already Exist!!!' });
    } else {
      const insertQuery = `
        INSERT INTO employees_moz (entryid, name, workertype, shift, joindate, type, roleid, product, line, section_id, date, Activo, site)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(connection, insertQuery, [entryid, name, worktyp, shift, join_date, type, roleid, product, line, sectionId, formattedDate, '1', 'BELEZA']);

      if (result.affectedRows === 0) {

        res.status(409).json({ status: 'Error', message: 'Worker not inserted' });
      } else {
        res.status(200).json({ status: 'Success', message: 'Employee added successfully' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'Error', message: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /update_employee:
 *   put:
 *     summary: Update employee details
 *     tags:
 *       - Employees
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               entryid:
 *                 type: string
 *                 example: "1001"
 *               workertype:
 *                 type: string
 *                 example: "DIRECT"
 *               shift:
 *                 type: string
 *                 example: "11HRS"
 *               section_id:
 *                 type: integer
 *                 example: 1
 *               roleid:
 *                 type: integer
 *                 example: 1
 *               product:
 *                 type: string
 *                 example: "1"
 *               line:
 *                 type: string
 *                 example: "1"
 *               linec:
 *                 type: string
 *                 example: "1"
 *               productc:
 *                 type: string
 *                 example: "1"
 *               section_idc:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully updated employee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Worker Updated successfully
 *       404:
 *         description: Worker not Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Worker not Updated
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name updateEmployee
 * @description Update employee details
 * @memberof module:routes/employees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


app.put('/update_employee', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const name = req.body.name;
    const entryid = req.body.entryid;
    const worktyp = req.body.workertype;
    const shift = req.body.shift;
    const section_id = req.body.section_id;
    const product = req.body.product;
    const id = req.body.id;
    const line = req.body.line;
    const linec = req.body.linec;
    const productc = req.body.productc;
    const section_idc = req.body.section_idc;

    const updateEmployeeQuery = `
      UPDATE employees_moz
      SET entryid=?, name=?, workertype=?, shift=?, section_id=?, product=?, line=?
      WHERE id = ?
    `;
    const result = await executeQuery(connection, updateEmployeeQuery, [entryid, name, worktyp, shift, section_id, product, line, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Worker not Updated' });
    }

    const insertChangeQuery = `
      INSERT INTO change_product (emp_id, product_old, product_new, line_old, line_new, section_old, section_new)
      VALUES (?,?,?,?,?,?,?)
    `;
    const result2 = await executeQuery(connection, insertChangeQuery, [entryid, productc, product, linec, line, section_idc, section_id]);

    if (result2.affectedRows === 0) {
      return res.status(404).json({ message: 'Worker not Updated' });
    }

    res.status(200).json({ message: 'Worker Updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});




/**
 * @swagger
 * /getZonedata:
 *   get:
 *     summary: Get zone data in Ikeja.
 *     description: Retrieves zone data in Ikeja based on specific conditions.
 *     tags:
 *       - Change Zone
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Zone data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   // Define properties based on your database schema
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getZoneData
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue retrieving zone data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// Get zone data default view
app.get('/getZonedata', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    let whereConditions = [];

    whereConditions.push(`employees_moz.roleid = 1`);
    whereConditions.push(`employees_moz.passive_type = 'ACT'`);
  
    const whereClause = whereConditions.join(' AND ');
    
  const query = `
  SELECT employees_moz.*, 
         GROUP_CONCAT(DISTINCT item_masterr.item_description) as item_names,
         GROUP_CONCAT(DISTINCT section.section_name) as section_names, 
         geopos_emptype.name as emptype
  FROM employees_moz
  LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
  LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
  LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
  WHERE ${whereClause}
  GROUP BY employees_moz.id
`;

    const result = await executeQuery(connection,query);
    res.send(result);
  } catch (error) {
    console.error('Error retrieving employee data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});


/**
 * @swagger
 * /get_zonedata_search:
 *   get:
 *     summary: Get zone data in Ikeja based on search criteria.
 *     description: Retrieves zone data in Ikeja based on the provided search criteria.
 *     tags:
 *       - Ikeja
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: where
 *         schema:
 *           type: string
 *         required: true
 *         description: The WHERE clause of the SQL query to filter zone data.
 *     responses:
 *       200:
 *         description: Zone data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   // Define properties based on your database schema
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getZoneDataSearch
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue retrieving zone data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// Get zone data search  view
app.get('/get_zonedata_search', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { where } = req.query;
    const query = `
    SELECT employees_moz.*, 
           GROUP_CONCAT(DISTINCT item_masterr.item_description) as item_names,
           GROUP_CONCAT(DISTINCT section.section_name) as section_names, 
           geopos_emptype.name as emptype
    FROM employees_moz
    LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
    LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
    LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
    WHERE ${where}
    GROUP BY employees_moz.id
  `;

    const result = await executeQuery(connection,query);
    res.send(result);
  } catch (error) {
    console.error('Error retrieving employee data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /changeshift_entryid:
 *   post:
 *     summary: Change shift for multiple employees.
 *     description: Change the shift for multiple employees identified by their entry IDs.
 *     tags:
 *       - Change Zone
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of entry IDs for the employees to update.
 *     responses:
 *       200:
 *         description: Shifts changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   entryid:
 *                     type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name changeshift_entryid
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue changing the shift.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//get changez shift employee entryid
app.post('/changeshift_entryid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { entryIds } = req.body;
    const entryIdsArray = Array.isArray(entryIds) ? entryIds : [entryIds];

    // Use the IN operator in the SQL query to check for multiple entryid values
    const query = 'SELECT entryid FROM employees_moz WHERE id IN (?)';

    const results = await executeQuery(connection,query, [entryIdsArray]);

    res.json(results);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});



/**
 * @swagger
 * /update_multiple_zone:
 *   post:
 *     summary: Update multiple zone information for employees.
 *     description: Updates the zone information for multiple employees in the Ikeja zone.
 *     tags:
 *       - Ikeja
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *               entryIds:
 *                 type: string
 *               section_id:
 *                 type: integer
 *               zone:
 *                 type: string
 *               machines:
 *                 type: string
 *     responses:
 *       200:
 *         description: Details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 message:
 *                   type: string
 *                   example: Details updated successfully.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name updateMultipleZone
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue updating multiple zones.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// Change zone braid multiple entry id wise zone update
app.post('/update_multiple_zone', authenticateJWT, async (req, res) => {

  console.log("hi");
  let connection;
  try {
    connection = await getPoolConnection();
    const {entryIds,product, line, section, } = req.body;

    console.log(entryIds);
    console.log(product);
    console.log(line);
    console.log(section);

    if (!product || !line || !section || !entryIds) {
  
      res.status(500).json({ status: 'Error', message: 'Product, line, section, and entryIds are required.' });
  }

  const entryIdsArray = entryIds.split(',');

  const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Maputo' });
  const [formattedDay, formattedMonth, year] = date.split('/').map(part => part.padStart(2, '0'));
  const date1 = `${formattedDay}-${formattedMonth}-${year}`;

  const checkQuery = 'SELECT * FROM employees_moz WHERE id = ? ';
  const updateQuery = 'UPDATE employees_moz SET product = ?, line = ?, section_id = ? WHERE id = ?';
  const insertQuery = 'INSERT INTO change_product (emp_id, product_old, product_new, line_old, line_new, section_old, section_new) VALUES (?,?,?,?,?,?,?)';

  let processedCount = 0;

  for (const entryId of entryIdsArray) {
      const checkValues = [entryId];
      const checkResult = await executeQuery(connection, checkQuery, checkValues);

      if (checkResult.length === 1) {
          const updateValues = [product, line, section, entryId];
          const updateResult = await executeQuery(connection, updateQuery, updateValues);
          const employeeData = checkResult[0];
          const insertValues = [employeeData.id, employeeData.product, product, employeeData.line, line, employeeData.section_id, section];
          const insertResult = await executeQuery(connection, insertQuery, insertValues);
          processedCount++;
          console.log(`Data updated and inserted for entryId: ${entryId}`);
      } else {
          processedCount++;
          console.log(`Employee not found for entryId: ${entryId}`);
      }

      if (processedCount === entryIdsArray.length) {
          res.json({ status: 'Success', message: 'Zone updated successfully.' });
      }
  }
} catch (error) {
  console.error('Error:', error.message);
  res.status(500).json({ status: 'Error', message: 'An error occurred during login' });
} finally {
  if (connection) {
      connection.release();
  }
}
});


/**
 * @swagger
 * /getShiftdata:
 *   get:
 *     summary: Retrieve active employees' shift data.
 *     description: Fetches shift data for active employees, excluding those with specific role IDs (3 and 5).
 *     tags:
 *       - Change Shift
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved shift data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The employee ID.
 *                     example: 1
 *                   entryid:
 *                     type: string
 *                     description: The employee entry ID.
 *                     example: EMP123
 *                   name:
 *                     type: string
 *                     description: The employee name.
 *                     example: John Doe
 *                   roleid:
 *                     type: integer
 *                     description: The role ID of the employee.
 *                     example: 2
 *                   shift:
 *                     type: string
 *                     description: The employee shift.
 *                     example: Day
 *                   section_id:
 *                     type: integer
 *                     description: The section ID the employee is assigned to.
 *                     example: 1
 *                   passive_type:
 *                     type: string
 *                     description: The passive type of the employee.
 *                     example: ACT
 *                   category_type:
 *                     type: string
 *                     description: The category type of the employee.
 *                     example: BRAID
 *                   section_name:
 *                     type: string
 *                     description: The name of the section.
 *                     example: Production
 *                   role:
 *                     type: string
 *                     description: The role name of the employee.
 *                     example: Operator
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name getShiftData
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue retrieving the shift data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// Get shift data default view
app.get('/getShiftdata', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
      const whereConditions = [];
   whereConditions.push(`employees_moz.roleid = 1`);
      whereConditions.push(`employees_moz.passive_type = 'ACT'`);

      const whereClause = whereConditions.join(' AND ');

      const query = `
          SELECT employees_moz.*, 
                 GROUP_CONCAT(DISTINCT item_masterr.item_description) as item_names,
                 GROUP_CONCAT(DISTINCT section.section_name) as section_names, 
                 geopos_emptype.name as emptype
          FROM employees_moz
          LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
          LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
          LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
          WHERE ${whereClause}
          GROUP BY employees_moz.id
      `;

    const result = await executeQuery(connection,query);

    res.send(result);
   // console.log(result, '---------------');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /get_shiftdata_search:
 *   get:
 *     summary: Retrieve shift data with search criteria.
 *     description: Retrieve employee shift data based on the specified search criteria in the query parameter.
 *     tags:
 *       - Change Shift
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: where
 *         required: true
 *         description: SQL WHERE clause to filter the results.
 *         schema:
 *           type: string
 *           example: roleid=1 AND section_id=2
 *     responses:
 *       200:
 *         description: Successfully retrieved shift data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   roleid:
 *                     type: integer
 *                   section_id:
 *                     type: integer
 *                   section_name:
 *                     type: string
 *                   role:
 *                     type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 * @function
 * @name getShiftDataSearch
 * @memberof module:Routes/ShiftData
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with retrieving the shift data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Get shift data search  view
app.get('/get_shiftdata_search', authenticateJWT, async (req, res) => {
  let connection;
   try {
     connection = await getPoolConnection();
     const { where } = req.query;
     const query = `
     SELECT employees_moz.*, 
            GROUP_CONCAT(DISTINCT item_masterr.item_description) as item_names,
            GROUP_CONCAT(DISTINCT section.section_name) as section_names, 
            geopos_emptype.name as emptype
     FROM employees_moz
     LEFT JOIN item_masterr ON FIND_IN_SET(item_masterr.id, employees_moz.product) > 0
     LEFT JOIN geopos_emptype ON employees_moz.roleid = geopos_emptype.id
     LEFT JOIN section ON FIND_IN_SET(section.id, employees_moz.section_id) > 0
     WHERE ${where}
     GROUP BY employees_moz.id
 `;
       
     const result = await executeQuery(connection,query);
     res.send(result);
   } catch (error) {
     console.error(error);
     res.status(500).send('Internal Server Error');
   } finally {
     if (connection) {
       connection.release();
       //console.log("Connection released");
     }
   }
 });
 /**
 * @swagger
 * /changeshift_entryid:
 *   post:
 *     summary: Change shift for multiple employees.
 *     description: Change the shift for multiple employees identified by their entry IDs.
 *     tags:
 *       - Ikeja
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of entry IDs for the employees to update.
 *     responses:
 *       200:
 *         description: Shifts changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   entryid:
 *                     type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name changeshift_entryid
 * @memberof module:Routes/Ikeja
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue changing the shift.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//get changez shift employee entryid
app.post('/changeshift_entryid', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { entryIds } = req.body;
    const entryIdsArray = Array.isArray(entryIds) ? entryIds : [entryIds];

    // Use the IN operator in the SQL query to check for multiple entryid values
    const query = 'SELECT entryid,name FROM employees_moz WHERE id IN (?)';


    const results = await executeQuery(connection,query, [entryIdsArray]);

    res.json(results);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
      //console.log("Connection released");
    }
  }
});

/**
 * @swagger
 * /update_multiple_shift:
 *   post:
 *     summary: Update multiple employee shifts.
 *     description: Update the shift of multiple employees based on the provided entry IDs and new shift value.
 *     tags:
 *       - Shift Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: string
 *                 description: The new shift value to update for the employees.
 *               entryIds:
 *                 type: string
 *                 description: Comma-separated list of entry IDs of the employees whose shifts need to be updated.
 *     responses:
 *       200:
 *         description: Successfully updated employee shifts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Success
 *                 message:
 *                   type: string
 *                   example: Details updated successfully.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 * @function
 * @name updateMultipleShifts
 * @memberof module:Routes/ShiftManagement
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with updating the employee shifts.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Multiple shift data update
app.post('/update_multiple_shift', authenticateJWT, async (req, res) => {
    let connection;
    try {
      connection = await getPoolConnection();
      const { shift, entryIds } = req.body;

  if (!shift || !entryIds) {
    return res.status(400).json({ status: 'Error', message: 'Shift and entryIds are required.' });
}

const entryIdsArray = entryIds.split(',');
const date = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Maputo' });
const [formattedDay, formattedMonth, year] = date.split('/').map(part => part.padStart(2, '0'));
const date1 = `${formattedDay}-${formattedMonth}-${year}`;

const checkQuery = 'SELECT id FROM employees_moz WHERE id = ? ';
const updateQuery = 'UPDATE employees_moz SET shift = ? WHERE id = ?';
let processedCount = 0;

for (const entryId of entryIdsArray) {
    const checkValues = [entryId];
    const checkResult = await executeQuery(connection, checkQuery, checkValues);

    if (checkResult.length === 1) {
        const updateValues = [shift, entryId];
        await executeQuery(connection, updateQuery, updateValues);
        processedCount++;
        console.log(`${shift} Data updated for entryId: ${entryId}`);
    } else {
        processedCount++;
        console.log(`Employee not found for entryId: ${entryId}`);
    }

    if (processedCount === entryIdsArray.length) {
        res.json({ status: 'Success', message: 'Shift updated successfully.' });
    }
}
} catch (error) {
console.error('Error:', error.message);
res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
if (connection) {
    connection.release();
}
}
});


/**
 * @swagger
 * /getemployeetimesheetdata:
 *   post:
 *     summary: Get employee timesheet data
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: ID of the product.
 *                 example: "123"
 *               section_id:
 *                 type: string
 *                 description: ID of the section.
 *                 example: "456"
 *               shift:
 *                 type: string
 *                 description: Shift of the worker.
 *                 example: "11"
 *               line:
 *                 type: string
 *                 description: Line of the worker.
 *                 example: "1"
 *               fromdate:
 *                 type: string
 *                 description: Start date for the timesheet data (DD-MM-YYYY).
 *                 example: "01-01-2022"
 *               todate:
 *                 type: string
 *                 description: End date for the timesheet data (DD-MM-YYYY).
 *                 example: "31-01-2022"
 *               roleId:
 *                 type: integer
 *                 description: Role ID of the user.
 *                 example: 3
 *               userId:
 *                 type: integer
 *                 description: User ID of the user.
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the timesheet entry.
 *                         example: 1
 *                       product_name:
 *                         type: string
 *                         description: Name of the product.
 *                         example: "126"
 *                       line:
 *                         type: string
 *                         description: Line of the worker.
 *                         example: "1"
 *                       section:
 *                         type: string
 *                         description: Section of the worker.
 *                         example: "27"
 *                       worker:
 *                         type: string
 *                         description: Name of the worker.
 *                         example: "Adelaide Fernando Langa"
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID of the worker.
 *                         example: "1001"
 *                       shift:
 *                         type: string
 *                         description: Shift of the worker.
 *                         example: "11"
 *                       HOUR1:
 *                         type: integer
 *                         description: Hours worked in hour 1.
 *                         example: 289
 *                       HOUR2:
 *                         type: integer
 *                         description: Hours worked in hour 2.
 *                         example: 100
 *                       HOUR3:
 *                         type: integer
 *                         description: Hours worked in hour 3.
 *                         example: 130
 *                       HOUR4:
 *                         type: integer
 *                         description: Hours worked in hour 4.
 *                         example: 0
 *                       HOUR5:
 *                         type: integer
 *                         description: Hours worked in hour 5.
 *                         example: 0
 *                       HOUR6:
 *                         type: integer
 *                         description: Hours worked in hour 6.
 *                         example: 0
 *                       HOUR7:
 *                         type: integer
 *                         description: Hours worked in hour 7.
 *                         example: 0
 *                       HOUR8:
 *                         type: integer
 *                         description: Hours worked in hour 8.
 *                         example: 0
 *                       HOUR9:
 *                         type: integer
 *                         description: Hours worked in hour 9.
 *                         example: 0
 *                       HOUR10:
 *                         type: integer
 *                         description: Hours worked in hour 10.
 *                         example: 0
 *                       HOUR11:
 *                         type: integer
 *                         description: Hours worked in hour 11.
 *                         example: 0
 *                       target:
 *                         type: string
 *                         description: Target for the worker.
 *                         example: "962.5000"
 *                       remark:
 *                         type: string
 *                         description: Remarks.
 *                         example: " , , ,,,,,,,,,,,,,"
 *                       waste:
 *                         type: string
 *                         description: Waste details.
 *                         example: "5.23,0.12,,,,,,,,,,,,,,"
 *                       hour_loss:
 *                         type: string
 *                         description: Hour loss details.
 *                         example: ""
 *                       date_time:
 *                         type: string
 *                         description: Date and time of the entry.
 *                         example: "28-05-2024"
 *                       time_stamp:
 *                         type: string
 *                         description: Timestamp of the entry.
 *                         example: "1709071200"
 *                       mon:
 *                         type: string
 *                         description: Month of the entry.
 *                         example: "02-2024"
 *                       operator_id:
 *                         type: string
 *                         description: Operator ID.
 *                         example: "11"
 *                       date:
 *                         type: string
 *                         description: Date of the entry.
 *                         example: "2024-02-28T12:36:14.000Z"
 *                       item_description:
 *                         type: string
 *                         description: Description of the item.
 *                         example: "SUPER NATURAL LOOK"
 *                       section_name:
 *                         type: string
 *                         description: Name of the section.
 *                         example: "C.C.P"
 *                 product:
 *                   type: string
 *                   description: Product ID.
 *                   example: "126"
 *                 line:
 *                   type: string
 *                   description: Line.
 *                   example: "1"
 *                 fdate:
 *                   type: string
 *                   description: From date.
 *                   example: ""
 *                 tdate:
 *                   type: string
 *                   description: To date.
 *                   example: ""
 *                 date:
 *                   type: string
 *                   description: Current date.
 *                   example: "28-05-2024"
 *                 section:
 *                   type: string
 *                   description: Section ID.
 *                   example: "27"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getEmployeeTimesheetData
 * @description Handles the retrieval of employee timesheet data based on provided filters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws Will throw an error if there is a problem with the database query or connection.
 */



// Define the route for the getemployeetimesheetdata API
app.post('/getemployeetimesheetdata', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var product_name = req.body.product_id;
  var section = req.body.section_id;
  var shift = req.body.shift;
  var line = req.body.line;
  const fromdate = req.body.fromdate;
  const todate = req.body.todate;

// console.log("fromdate:",fromdate);
// console.log("todate:",todate);
// console.log("product_name",product_name);
// console.log("section",section);
// console.log("shift",shift);
// console.log("line",line);
  //var fromdate = new Date(req.body.fromdate); // Convert to Date object
  //var todate = new Date(req.body.todate); // Convert to Date object
  var fd = fromdate;
  var td = todate;
  var newfd;
  var newtd;

  if (fromdate !== '' && todate !== '' && fromdate !== undefined && todate !== undefined && fromdate != null && todate != null) {

     const formattedFirstDay = dateUtils.convertDateFormat(fromdate, 'DD-MM-YYYY', 'YYYY-MM-DD');
     const formattedLastDay = dateUtils.convertDateFormat(todate, 'DD-MM-YYYY', 'YYYY-MM-DD');
     const fd2 = dateUtils.convertToUnixTimestamp(formattedFirstDay);
     const td1 = dateUtils.convertToUnixTimestamp(formattedLastDay);


    newfd = fd2;
    newtd = td1;
  }

  // console.log("newfd:",newfd);
  // console.log("newtd:",newtd);
  var currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");


      let whereConditions = [];
      if (product_name !== '' && product_name !== undefined && product_name != null) {
        whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
      }
      if (section !== '' && section !== undefined && section != null) {
        whereConditions.push(`worker_timesheet.section = '${section}'`);
      }
      if (shift !== '' && shift !== undefined && shift != null) {
        whereConditions.push(`worker_timesheet.shift = '${shift}'`);
      }
      if (line !== '' && line !== undefined && line != null) {
        whereConditions.push(`worker_timesheet.line = '${line}'`);
      }
      if (fromdate !== '' && todate !== '' && fromdate !== undefined && todate !== undefined && fromdate != null && todate != null) {
        whereConditions.push(`((worker_timesheet.time_stamp >= '${newfd}' AND worker_timesheet.time_stamp <= '${newtd}') OR worker_timesheet.time_stamp='${newfd}')`);
      }
      else {

        var groleid = req.body.roleId;
        var guserid = req.body.userId;
        // console.log('ROLE ID',groleid);
        // console.log('USER ID',guserid);
        whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);

        if(groleid == 3){
          whereConditions.push(`worker_timesheet.operator_id = '${guserid}'`);
        }
      }


      const whereClause = whereConditions.join(' AND ');


      const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name
                   FROM worker_timesheet
                   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                   LEFT JOIN section ON section.id = worker_timesheet.section
                   WHERE ${whereClause}
                   GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.shift, worker_timesheet.line`;
    //  console.log(query);
   // let data=[];
   const results = await executeQuery(connection, query);
      // db.query(query, (error, results) => {
      //   if (error) {
      //     console.error('Error executing MySQL query: ', error);
      //     return res.status(500).json({ error: 'Internal Server Error' });
      //   }

        const data = {
          timesheet: results,
          product: product_name,
          line: line,
          fdate: fd,
          tdate: td,
          date: currentDate,
          section: section
        };

        res.json(data);
     // });
     // res.json(data);
  //   }
  // });
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * 
 * components:
 *   schemas:
 *     mz_attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 10
 *         total_employee:
 *           type: integer
 *         present_employee:
 *           type: integer
 *         absent_employee:
 *           type: integer
 *         total_operator:
 *           type: integer
 *         abs_operator:
 *           type: integer
 *         pr_operator:
 *           type: integer
 *         active_beleza_total_employee:
 *           type: integer
 *         active_beleza_present_employee:
 *           type: integer
 *         active_beleza_absent_employee:
 *           type: integer
 *         date:
 *           type: string
 *         mon:
 *           type: string
 *         time_stamp:
 *           type: string
 * 
 * /updatetimesheet:
 *   put:
 *     summary: Update timesheet data
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the timesheet entry to be updated
 *               field:
 *                 type: string
 *                 example: "HOUR1"
 *                 description: The field in the timesheet entry to be updated
 *               value:
 *                 type: string
 *                 example: "10"
 *                 description: The new value to be set for the specified field
 *     responses:
 *       200:
 *         description: Successful response indicating the timesheet data was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Updated successfully."
 *                   description: Success message indicating the update was successful
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 *                   description: Error message indicating an error occurred during the update
 */


//Recieve previous date for attendance 
app.put('/updatetimesheet', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();

      // The JSON data sent from the client will be available in req.body
      const dataReceived = req.body;
      // Access the 'id' from the received data
      const id = dataReceived.id;
      const field = dataReceived.field;
      let value = dataReceived.value;

      // console.log("id",id);
      // console.log("field",field);
      // console.log("value",value);

      if (value === '' || value === null || value === undefined) {
          value = 0;
      }

      const query = `UPDATE worker_timesheet SET ${field} = ? WHERE id = ?`;
      const result = await executeQuery(connection, query, [value, id]);

      res.json({ message: 'Updated successfully.' });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      // Release the connection back to the pool in case of success or error
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /getaddemployeetimesheetfilterdata:
 *   post:
 *     summary: Get filtered employee timesheet data
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: number
 *                 example: 8
 *               hour:
 *                 type: string
 *                 example: 'HOUR1'
 *               product_name:
 *                 type: string
 *                 example: '126'
 *               line_no:
 *                 type: string
 *                 example: '1'
 *               section:
 *                 type: string
 *                 example: '27'
 *               userid:
 *                 type: string
 *                 example: '11'
 *     responses:
 *       '200':
 *         description: Filtered employee timesheet data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   responseData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         entryid:
 *                           type: string
 *                         productid:
 *                           type: string
 *                         sectionid:
 *                           type: string
 *                         y_date:
 *                           type: string
 *                         shift:
 *                           type: string
 *                         section:
 *                           type: string
 *                         product:
 *                           type: string
 *                         line:
 *                           type: string
 *                         hour:
 *                           type: string
 *                         target:
 *                           type: string
 *                         status:
 *                           type: string
 *                         ahid:
 *                           type: string
 *                         wt:
 *                           type: string
 *                         re:
 *                           type: string
 *                         op_id:
 *                           type: string
 *                         row1:
 *                           type: number
 *                   product:
 *                     type: string
 *                   line:
 *                     type: string
 *                   section:
 *                     type: string
 *                   shiftt:
 *                     type: string
 *                   hour:
 *                     type: string
 *                   r:
 *                     type: number
 *                   movedemp:
 *                     type: string
 *                   ent:
 *                     type: string
 *                   op_id:
 *                     type: string
 *                   tar:
 *                     type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getAddEmployeeTimesheetFilterData
 * @description Handles fetching and filtering employee timesheet data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws Will throw an error if there is a problem with the database query or connection.
 */


//Add employee timesheet filter values and click enter
app.post('/getaddemployeetimesheetfilterdata',authenticateJWT, async (req, res) => {
    const responseemployeetimesheetdata = []; // Declare responsecatdata before the route
    let connection;
    try{
    
        connection = await getPoolConnection();
      const shift = req.body.shift;
      const shf = Math.round(shift * 100) / 100;
    const shifto = shift+'HRS';
   
      const hour = req.body.hour;
      const product = req.body.product_name;
      const line = req.body.line_no;
      const section = req.body.section;
      const userid = req.body.userid;
  
      console.log("section:",section);
      console.log("userid:",userid);
      console.log("shift:",shift);
      console.log("hour:",hour);
      console.log("product:",product);
      console.log("line:",line);
      console.log("shifto:",shifto);
  
  
      // Query to get utarget
      const utargetQuery = `SELECT utarget 
        FROM item_section_moz
        WHERE item_id = ? AND section_id = ?`;
  
      const utargetResult = await executeQuery(connection,utargetQuery, [product, section]);
      const utarget = utargetResult.length > 0 ? utargetResult[0].utarget : 0;
  
      // Calculate target based on utarget and shift
      // const target = (utarget / 8) * shift;
  
      const target = parseFloat((utarget / 8) * shift).toFixed(4);
  
      // Other variables
      const op_id = userid;
  
      // Get formatted date
  
      const date1 = dateUtils.getCurrentDate("DD-MM-YYYY");
  
      const sectionQuery = `SELECT * FROM section WHERE id = ?`;
      const sectionResult = await executeQuery(connection,sectionQuery, [section]); 
      const sec = sectionResult.length > 0 ? sectionResult[0].section_name : '';
  
      const proQuery = `SELECT * FROM item_masterr WHERE id = ?`;
      const proResult = await executeQuery(connection,proQuery, [product]); 
      const pro = proResult.length > 0 ? proResult[0].item_description : '';
  
      // Query to get worker_timesheet data
      const workerTimesheetQuery = `
      SELECT * FROM worker_timesheet
      WHERE product_name = ? 
        AND line = ? 
        AND section = ? 
        AND shift = ? 
        AND ${hour} > 0 
        AND date_time = ?
    `;
    const workerTimesheetResult = await executeQuery(connection,workerTimesheetQuery, [product, line, section, shf, date1]); 
    const r = workerTimesheetResult.length > 0 ? workerTimesheetResult.length : 0;
      if(product !== ''){
       // console.log("r1:",r);
        let responseData = [];
        let ent = '';
        let movedemp = '';
         let rdse = {};
        if(r === 0){
  
          const EmployeesQuery = `
          SELECT * FROM employees_moz WHERE product = ? AND workertype = ? AND section_id = ? AND line = ? AND shift = ? AND roleid = ? AND passive_type = ? ORDER BY name ASC`;
        const EmployeesResult = await executeQuery(connection,EmployeesQuery, [product, 'DIRECT', section, line, shifto, '1', 'ACT']);
        const employees = EmployeesResult && EmployeesResult.length > 0 ? EmployeesResult : [];
        console.log("employees:",employees);
          let cnt = 1;
          const response = employees.map(async (employee) => {
            if (employee.status === 'P') {
              console.log("status:",employee.status);
              const workerTimesheetQueryy = `SELECT * FROM worker_timesheet
              WHERE entry_id = ? AND shift = ? AND ${hour} > 0 AND date_time = ?`;
        
          const workerTimesheetResultt = await executeQuery(connection,workerTimesheetQueryy, [employee.entryid, shift, date1]);
          const row1 = workerTimesheetResultt.length;
    
  let k=0;
        if(row1 === 0){
             let ahid='';
               let wt='';
                let re='';
    
          rdse={
            id: employee.id,
          name: employee.name,
          entryid: employee.entryid,
          productid: employee.product,
          sectionid: employee.section_id,
          y_date: employee.date,
          shift:shift,
          section:sec,
          product:pro,
          line:line,
          hour:hour,
          target:target,
          status: employee.status,
          ahid:ahid,
          wt:wt,
          re:re,
          op_id:op_id,
          row1:row1
        };
         }else{
           movedemp += ` ${employee.name} ,`;
         }
            } else {
           
  
              ent += `, ${employee.entryid}`;
              console.log("ent:",ent);
            }
            return {
              rdse: rdse,
              ent: ent,
              movedemp: movedemp,
             
            };
          
          });
  console.log("response:",response);
  const resolvedResponse = await Promise.all(response);
  console.log("resolvedResponse:",resolvedResponse);
   responseData = resolvedResponse.map(item => item.rdse);
  
        }
  
        responseemployeetimesheetdata.push({
               responseData: responseData,
           product:pro,
           line:line,
           section:sec,
           shiftt:shift,
           hour:hour,
           r:r,
           movedemp:movedemp,
           ent:ent,
           op_id:op_id,
           tar:target
       
        });
  
      }
      console.log(responseemployeetimesheetdata);
      res.send(responseemployeetimesheetdata);
    } catch (error) {
      // Handle exceptions
      console.error('Error:', error.message);
      //res.status(500).json({ error: 'Internal Server Error' });
      res.status(500).json({ success: false, message: 'An error occurred during login' });
    } finally {
      // Release the connection back to the pool in case of success or error
      if (connection) {
        connection.release();
        // console.log("connection released");
      }
    }
  
   
  });
  
  
  
  /**
   * @swagger
   * /insertemployeetimesheetfilterdata:
   *   post:
   *     summary: Insert or update employee timesheet data
   *     tags:
   *       - Employee Timesheet
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 worker_names:
   *                   type: string
   *                 emp_ids:
   *                   type: string
   *                 shifts:
   *                   type: number
   *                 user_id:
   *                   type: string
   *                 productid:
   *                   type: string
   *                 sectionid:
   *                   type: string
   *                 product_name:
   *                   type: string
   *                 line:
   *                   type: string
   *                 section:
   *                   type: string
   *                 hour:
   *                   type: string
   *                 target:
   *                   type: string
   *                 completes:
   *                   type: string
   *                 remarks:
   *                   type: string
   *                 wastes:
   *                   type: string
   *                 y_date:
   *                   type: string
   *     responses:
   *       '200':
   *         description: Data updated and inserted successfully
   *       '500':
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: An error occurred during login
   */
  
  /**
   * @function
   * @name insertEmployeeTimesheetFilterData
   * @description Handles inserting or updating employee timesheet data.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {void}
   * @throws Will throw an error if there is a problem with the database query or connection.
   */
  
  //below code is not yet tested
  
  //insert employee timesheet data
  app.post('/insertemployeetimesheetfilterdata', authenticateJWT, async (req, res) => {
    let connection;
    try {
        connection = await getPoolConnection();
        const tableData = req.body;
  
        const worker_names = tableData.map((data) => data.worker_names);
        const emp_ids = tableData.map((data) => data.emp_ids);
        const shifts = tableData.map((data) => data.shifts);
        const user_id = tableData.map((data) => data.user_id);
        const productid = tableData.map((data) => data.productid);
        const sectionid = tableData.map((data) => data.sectionid);
        const product_name = tableData.map((data) => data.product_name);
        const line = tableData.map((data) => data.line);
        const section = tableData.map((data) => data.section);
        const hour = tableData.map((data) => data.hour);
        const target = tableData.map((data) => data.target);
        const completes = tableData.map((data) => data.completes);
        const remarks = tableData.map((data) => data.remarks);
        const wastes = tableData.map((data) => data.wastes);
        const y_dates = tableData.map((data) => data.y_date);
        const currentDate = dateUtils.getCurrentDate("YYYY-MM-DD");
        const y_date = dateUtils.getCurrentDate("DD-MM-YYYY");
        const year = dateUtils.getCurrentYear();
        const zmonth = dateUtils.getCurrentMonth();
        const month1 = dateUtils.getCurrentMonthYear();
        const dayy1 = dateUtils.convertToUnixTimestamp(currentDate);
  
        const query = `SELECT * FROM worker_timesheet WHERE product_name = ? AND section = ? AND line = ? AND shift = ? AND date_time = ? AND entry_id IN (?)`;
        const rows = await executeQuery(connection, query, [productid[0], sectionid[0], line[0], shifts[0], y_date, emp_ids]);
  
        const data = [];
        const datai = [];
        const emp_idss = [...emp_ids];
  
        rows.forEach((row) => {
            if (emp_ids.includes(String(row.entry_id))) {
                const key = emp_ids.indexOf(String(row.entry_id));
                const k = emp_idss.indexOf(String(row.entry_id));
                emp_idss.splice(k, 1);
  
                const hr = hour[key];
                const re = row.remark;
                const rarray = re.split(',');
                rarray.splice(hr - 1, 0, remarks[key]);
                const rmark = rarray.join(',');
  
                const w = row.waste;
                const warray = w.split(',');
                warray.splice(hr - 1, 0, wastes[key]);
                const wst = warray.join(',');
  
                data.push({
                    id: row.id,
                    [hr]: completes[key],
                    remark: rmark,
                    waste: wst
                });
            }
        });
  
        if (emp_idss.length > 0) {
            emp_idss.forEach((val) => {
                if (emp_ids.includes(val)) {
                    const key = emp_ids.indexOf(val);
                    const hr = hour[key];
                    const re = ',,,,,,,,,,,,';
                    const rarray = re.split(',');
                    rarray.splice(hr - 1, 0, remarks[key]);
                    const rmark = rarray.join(',');
                    const w = ',,,,,,,,,,,,';
                    const warray = w.split(',');
                    warray.splice(hr - 1, 0, wastes[key]);
                    const wst = warray.join(',');
  
                    datai.push({
                        product_name: productid[key],
                        line: line[key],
                        section: sectionid[key],
                        shift: shifts[key],
                        worker: worker_names[key],
                        entry_id: emp_ids[key],
                        [hr]: completes[key],
                        target: target[key],
                        date_time: y_date,
                        time_stamp: dayy1,
                        mon: month1,
                        operator_id: user_id[key],
                        remark: rmark,
                        waste: wst
                    });
                }
            });
        }
  
        const updateQuery = 'UPDATE worker_timesheet SET ? WHERE id = ?';
        const insertQuery = 'INSERT INTO worker_timesheet SET ?';
  
        const updatePromises = data.map((row) => {
            const id = row.id;
            delete row.id;
            return new Promise(async (resolve, reject) => {
                await executeQuery(connection, updateQuery, [row, id]);
                resolve();
            });
        });
  
        const insertPromises = datai.map((row) => {
            return new Promise(async (resolve, reject) => {
                await executeQuery(connection, insertQuery, row);
                resolve();
            });
        });
  
        Promise.all([...updatePromises, ...insertPromises])
            .then(() => res.send('Data updated and inserted'))
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'An error occurred' });
            });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
  });
  
  /**
 * @swagger
 * /getLineOptionsoperator/{selectedProduct}/{userId}:
 *   get:
 *     summary: Get line options for a selected product and user.
 *     description: Retrieves line options for the specified product and user from the operator_assign table.
 *     tags:
 *       - Line
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: selectedProduct
 *         required: true
 *         description: The ID of the selected product.
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *           example: "123"
 *     responses:
 *       200:
 *         description: Line options retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   line:
 *                     type: string
 *                     example: "Line 1"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getLineOptionsoperator
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// Define a route for fetching line options
app.get('/getLineOptionsoperator/:selectedProduct/:userId',authenticateJWT, async (req, res) => {
    let connection;
    try{
    
        connection = await getPoolConnection();
    const { selectedProduct, userId } = req.params;
    // console.log(selectedProduct); 
    // console.log(userId);
    // Perform a database query to fetch the line options for the specified product
    // Replace 'your_db_connection' with your actual database connection object
  
    // Example using MySQL as the database
    const query = `
      SELECT operator_assign.line
      FROM operator_assign
      WHERE operator_assign.name_id = ? AND operator_assign.product_name = ?
      GROUP BY operator_assign.line,operator_assign.product_name;
    `;
  
    const results = await executeQuery(connection, query, [userId, selectedProduct]);
    res.json(results);
  
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
  });
  
  /**
   * @swagger
   * /getSectionOptionsoperator/{userId}/{product}/{line}:
   *   get:
   *     summary: Get section options for a specific user, product, and line.
   *     description: Retrieves section options from the database based on the specified user ID, product name, and line.
   *     tags:
   *       - Section
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         description: The ID of the user.
   *         schema:
   *           type: integer
   *           example: 1
   *       - in: path
   *         name: product
   *         required: true
   *         description: The ID of the product.
   *         schema:
   *           type: integer
   *           example: 1
   *       - in: path
   *         name: line
   *         required: true
   *         description: The line identifier.
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Data retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   section_name:
   *                     type: string
   *                     example: "Section A"
   *                   section_type:
   *                     type: string
   *                     example: "Type 1"
   *                   date_added:
   *                     type: string
   *                     format: date
   *                     example: "2023-01-01"
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: 'An error occurred during login'
   * @function
   * @name getSectionOptionsoperator
   * @memberof module:Routes/Data
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
   * @returns {Promise<void>} Promise representing the result of the operation.
   */
  
  //getshiftoperator
  // Define a route for fetching line options
  app.get('/getSectionOptionsoperator/:userId/:product/:line', authenticateJWT, async (req, res) => {
    let connection;
    try{
    
        connection = await getPoolConnection();
    const { userId } = req.params;  const { product } = req.params;  const { line } = req.params;
    //console.log(selectedProduct);
    // Perform a database query to fetch the line options for the specified product
    // Replace 'your_db_connection' with your actual database connection object
  
    // Example using MySQL as the database
   // const query = `SELECT shift FROM operator_assign WHERE name_id = ? GROUP BY shift`;
    const query = `
    SELECT section.* 
    FROM operator_assign
    JOIN section ON operator_assign.section = section.id
    WHERE operator_assign.name_id = ? AND operator_assign.product_name = ? AND operator_assign.line = ?
    GROUP BY operator_assign.section;
  `;
  const results = await executeQuery(connection, query, [userId,product,line]);
  res.json(results);
  
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
  });
  /**
   * @swagger
   * /getShiftOptionsoperator/{userId}:
   *   get:
   *     summary: Get shift options for a specific operator.
   *     description: Retrieves shift options from the geopos_shift table for a specific operator based on the userId.
   *     tags:
   *       - Shift
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         description: The ID of the user to retrieve shift options for.
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Data retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "8HRS"
   *                   nhrs:
   *                     type: string
   *                     example: "8"
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: 'An error occurred during login'
   * @function
   * @name getShiftOptionsoperator
   * @memberof module:Routes/Data
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
   * @returns {Promise<void>} Promise representing the result of the operation.
   */
  
  
  
  //getshiftoperator
  // Define a route for fetching line options
  app.get('/getShiftOptionsoperator/:userId',authenticateJWT, async (req, res) => {
    let connection;
    try{
    
        connection = await getPoolConnection();
    const { userId } = req.params;
    //console.log(selectedProduct);
    // Perform a database query to fetch the line options for the specified product
    // Replace 'your_db_connection' with your actual database connection object
  
    // Example using MySQL as the database
   // const query = `SELECT shift FROM operator_assign WHERE name_id = ? GROUP BY shift`;
    const query = `
    SELECT geopos_shift.id,geopos_shift.name,geopos_shift.nhrs
    FROM operator_assign
    JOIN geopos_shift ON operator_assign.shift = geopos_shift.name
    WHERE operator_assign.name_id = ?
    GROUP BY operator_assign.shift;
  `;
  
    const results = await executeQuery(connection, query, [userId]);
    res.json(results);
  
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
  });
  /**
   * @swagger
   * 
   * components:
   *   schemas:
   *     employees_moz:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           format: int64
   *           example: 10
   *         username:
   *           type: string
   *         entryid:
   *           type: string
   *         name:
   *           type: string
   *         passive_type:
   *           type: string
   *         Activo:
   *           type: integer
   *         site:
   *           type: string
   *         address:
   *           type: string
   *         city:
   *           type: string
   *         region:
   *           type: string
   *         country:
   *           type: string
   *         postbox:
   *           type: string
   *         phone:
   *           type: string
   *         phonealt:
   *           type: string
   *         picture:
   *           type: string
   *         sign:
   *           type: string
   *         joindate:
   *           type: string
   *         type:
   *           type: integer
   *         dept:
   *           type: string
   *         degis:
   *           type: integer
   *         salary:
   *           type: float
   *         clock:
   *           type: integer
   *         clockin:
   *           type: integer
   *         clockout:
   *           type: string
   *         c_rate:
   *           type: float
   *         email:
   *           type: string
   *         roleid:
   *           type: integer
   *         workertype:
   *           type: string
   *         shift:
   *           type: string
   *         product:
   *           type: string
   *         line:
   *           type: string
   *         section_id:
   *           type: integer
   *         emp_count:
   *           type: string
   *         status:
   *           type: string
   *         date:
   *           type: string
   *         update_date:
   *           type: datetime
   *         entry_time:
   *           type: datetime
   * 
   * /getProductOptionsoperator/{userId}:
   *   get:
   *     summary: Get product options for an operator.
   *     description: Retrieves product options assigned to an operator based on their user ID and shift.
   *     tags:
   *       - Item
   *     security:
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: integer
   *         required: true
   *         description: The ID of the user.
   *     responses:
   *       200:
   *         description: Data retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 2
   *                   category_id:
   *                     type: integer
   *                     example: 1
   *                   subcategory_id:
   *                     type: integer
   *                     example: 1
   *                   item_group:
   *                     type: string
   *                     example: "FGWVDABUN001"
   *                   item_description:
   *                     type: string
   *                     example: "AFRO BUN TOTO"
   *                   country:
   *                     type: string
   *                     example: ""
   *                   ppp_benchmark:
   *                     type: string
   *                     example: ""
   *                   kg:
   *                     type: number
   *                     format: float
   *                     example: 45
   *                   string:
   *                     type: integer
   *                     example: 1
   *                   pcs:
   *                     type: integer
   *                     example: 1
   *                   line:
   *                     type: string
   *                     example: "1,2,3,4,5,6,7,8,9,10"
   *                   date:
   *                     type: string
   *                     format: date-time
   *                     example: "2021-08-22T09:12:06.000Z"
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: 'An error occurred during login'
   * @function
   * @name getProductOptionsoperator
   * @memberof module:Routes/Data
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
   * @returns {Promise<void>} Promise representing the result of the operation.
   */
  
  
  app.get('/getProductOptionsoperator/:userId',authenticateJWT, async (req, res) => {
    let connection;
    try{
    
        connection = await getPoolConnection();
    const { userId } = req.params;
   // console.log("userId", userId);
  
    const shiftQuery = `
      SELECT employees_moz.shift 
      FROM employees_moz 
      LEFT JOIN geopos_users ON employees_moz.entryid = geopos_users.entryid 
      WHERE geopos_users.id = ?;
    `;
    const shiftResults = await executeQuery(connection, shiftQuery, [userId]);
    const shift = shiftResults[0].shift;
  
    const productQuery = `
          SELECT item_masterr.* 
          FROM operator_assign
          JOIN item_masterr ON operator_assign.product_name = item_masterr.id
          WHERE operator_assign.name_id = ? AND operator_assign.shift = ?
          GROUP BY operator_assign.product_name;
        `;
  
  const productResults = await executeQuery(connection, productQuery, [userId, shift]);
  
  res.json(productResults);
  
  
  
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
  });
  
  /**
 * @swagger
 * /getaddemployeetimesheetbackfilterdata:
 *   post:
 *     summary: Get employee timesheet data based on filters
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shift:
 *                 type: number
 *                 example: "11"
 *                 description: Shift value
 *               hour:
 *                 type: string
 *                 example: "HOUR1"
 *                 description: Hour value
 *               product_name:
 *                 type: string
 *                 example: "1"
 *                 description: Product name
 *               line_no:
 *                 type: string
 *                 example: "1"
 *                 description: Line number
 *               section:
 *                 type: string
 *                 example: "1"
 *                 description: Section
 *               fromdate:
 *                 type: string
 *                 example: "01-01-2024"
 *                 description: From date
 *     responses:
 *       200:
 *         description: Successful response with employee timesheet data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   responseData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID of the record
 *                         name:
 *                           type: string
 *                           description: Name of the worker
 *                         entryid:
 *                           type: string
 *                           description: Entry ID
 *                         productid:
 *                           type: string
 *                           description: Product ID
 *                         sectionid:
 *                           type: string
 *                           description: Section ID
 *                         y_date:
 *                           type: string
 *                           description: Date
 *                         shift:
 *                           type: string
 *                           description: Shift
 *                         section:
 *                           type: string
 *                           description: Section
 *                         product:
 *                           type: string
 *                           description: Product
 *                         line:
 *                           type: string
 *                           description: Line
 *                         hour:
 *                           type: string
 *                           description: Hour
 *                         target:
 *                           type: number
 *                           description: Target
 *                         ahid:
 *                           type: string
 *                           description: AHID
 *                         wt:
 *                           type: string
 *                           description: WT
 *                         re:
 *                           type: string
 *                           description: RE
 *                         op_id:
 *                           type: number
 *                           description: Operation ID
 *                         row1:
 *                           type: number
 *                           description: Row count
 *                   product:
 *                     type: string
 *                     description: Product name
 *                   line:
 *                     type: string
 *                     description: Line number
 *                   section:
 *                     type: string
 *                     description: Section
 *                   shiftt:
 *                     type: number
 *                     description: Shift value
 *                   hour:
 *                     type: string
 *                     description: Hour value
 *                   r:
 *                     type: number
 *                     description: Result count
 *                   ent:
 *                     type: string
 *                     description: Entry value
 *                   op_id:
 *                     type: number
 *                     description: Operation ID
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */




//Add employee timesheet filter values and click enter
app.post('/getaddemployeetimesheetbackfilterdata', authenticateJWT, async (req, res) => {
    const responseemployeetimesheetdata = [];
    let connection;
    try {
        connection = await getPoolConnection();
        const shift = Math.round(req.body.shift * 100) / 100;
        const hour = req.body.hour;
        const product = req.body.product_name;
        const line = req.body.line_no;
        const section = req.body.section;
        const fdate = req.body.fromdate;
  
        const utargetQuery = `SELECT utarget FROM item_section_moz WHERE item_id = ? AND section_id = ?`;
        const utargetResult = await executeQuery(connection, utargetQuery, [product, section]);
        const utarget = utargetResult.length > 0 ? utargetResult[0].utarget : 0;
  
        const target = parseFloat((utarget / 8) * shift).toFixed(4);
  
        let date1 = fdate;
  
        const sectionQuery = `SELECT * FROM section WHERE id = ?`;
        const sectionResult = await executeQuery(connection, sectionQuery, [section]);
        const sec = sectionResult.length > 0 ? sectionResult[0].section_name : '';
  
        const proQuery = `SELECT * FROM item_masterr WHERE id = ?`;
        const proResult = await executeQuery(connection, proQuery, [product]);
        const pro = proResult.length > 0 ? proResult[0].item_description : '';
  
        const workerTimesheetQuery = `SELECT * FROM worker_timesheet
            WHERE product_name = ? 
            AND section = ? 
            AND shift = ? 
            AND ${hour} > 0 
            AND date_time = ?`;
  
        const workerTimesheetResult = await executeQuery(connection, workerTimesheetQuery, [product, section, shift, date1]);
  
        const r = workerTimesheetResult.length > 0 ? workerTimesheetResult.length : 0;
    
  //console.log("r:",r);
        if (product !== '') {
            let responseData = [];
        let ent = '';
        let movedemp = '';
         let rdse = {};
  
            if (r === 0) {
                const WorkerTimesheetQuery = `SELECT * FROM worker_timesheet WHERE product_name = ? AND section = ? AND line = ? AND shift = ? AND date_time = ?`;
                const WorkerTimesheetResult = await executeQuery(connection, WorkerTimesheetQuery, [product, section, line, "8", date1]);
                const ret = WorkerTimesheetResult && WorkerTimesheetResult.length > 0 ? WorkerTimesheetResult : [];
               // console.log("ret:",ret);
                const response = ret.map(async (row) => {
                //  console.log("row:",row);
                    if (row.entryid !== '') {
                        const workerTimesheetQueryy = `SELECT * FROM worker_timesheet WHERE entry_id = ? AND ? > 0  AND date_time = ?`;
                        const workerTimesheetResultt = await executeQuery(connection, workerTimesheetQueryy, [row.entryid, hour, date1]);
                        const row1 = workerTimesheetResultt.length > 0 ? workerTimesheetResultt.length : 0;
  
                        //console.log("row1:",row1);
  
                        if (row1 === 0) {
                          let ahid='';
               let wt='';
                let re='';
    
                            rdse = {
                                id: row.id,
                                name: row.worker,
                                entryid: row.entry_id,
                                productid: row.product_name,
                                sectionid: row.section,
                                y_date: row.date_time,
                                shift: row.shift,
                                section: sec,
                                product: pro,
                                line: line,
                                hour: hour,
                                target: target,
                                ahid: ahid,
                                wt: wt,
                                re: re,
                                op_id: 9,
                                row1: row1
                            };
                        }
                      else{
                       // console.log("movedemp:",movedemp);
                        movedemp += ` ${row.worker} ,`;
                      }
                    } else {
                   //   console.log("ent:",ent);
                        ent += `, ${employee.entryid}`;
                    }
  
                    return {
                        rdse: rdse,
                        ent: ent,
                        movedemp: movedemp,
                    };
                });
       
                const resolvedResponse = await Promise.all(response);
                responseData = resolvedResponse.map(item => item.rdse);
             //   console.log("responseData:",responseData);
            }
  
            responseemployeetimesheetdata.push({
                responseData: responseData,
                product: pro,
                line: line,
                section: sec,
                shiftt: shift,
                hour: hour,
                r: r,
                movedemp:movedemp,
                ent: ent,
                op_id: 9,
                tar:target
            });
        }
 // console.log("responseemployeetimesheetdata:",responseemployeetimesheetdata);
        res.send(responseemployeetimesheetdata);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
  });
  
  
  /**
 * @swagger
 * /insertemployeetimesheetbackfilterdata:
 *   put:
 *     summary: Insert or update employee timesheet data based on filters
 *     tags:
 *       - Employee Timesheet
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 worker_names:
 *                   type: string
 *                   description: Worker names
 *                 emp_ids:
 *                   type: string
 *                   description: Employee IDs
 *                 shifts:
 *                   type: string
 *                   description: Shifts
 *                 user_id:
 *                   type: string
 *                   description: User ID
 *                 productid:
 *                   type: string
 *                   description: Product ID
 *                 sectionid:
 *                   type: string
 *                   description: Section ID
 *                 product_name:
 *                   type: string
 *                   description: Product name
 *                 line:
 *                   type: string
 *                   description: Line number
 *                 section:
 *                   type: string
 *                   description: Section
 *                 hour:
 *                   type: string
 *                   description: Hour
 *                 target:
 *                   type: number
 *                   description: Target
 *                 completes:
 *                   type: string
 *                   description: Completes
 *                 remarks:
 *                   type: string
 *                   description: Remarks
 *                 wastes:
 *                   type: string
 *                   description: Wastes
 *                 y_date:
 *                   type: string
 *                   description: Date
 *     responses:
 *       200:
 *         description: Successful response after inserting or updating employee timesheet data
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Data Updated Successfully
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An Error Occurred
 */

/**
 * @function
 * @name insertEmployeetimesheetBackfilterdata
 * @description Insert employee timesheet Back data
 * @memberof module:routes/Emplyee timesheet back
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */

//insert employee timesheet data
app.put('/insertemployeetimesheetbackfilterdata', authenticateJWT, async (req, res) => {
  //console.log("hi");
  let connection;
  try {
      connection = await getPoolConnection();
      const tableData = req.body;
      const worker_names = tableData.map((data) => data.worker_names);
      const emp_ids = tableData.map((data) => data.emp_ids);
      const shifts = tableData.map((data) => data.shifts);
      const user_id = tableData.map((data) => data.user_id);
      const productid = tableData.map((data) => data.productid);
      const sectionid = tableData.map((data) => data.sectionid);
      const product_name = tableData.map((data) => data.product_name);
      const line = tableData.map((data) => data.line);
      const section = tableData.map((data) => data.section);
      const hour = tableData.map((data) => data.hour);
      const target = tableData.map((data) => data.target);
      const completes = tableData.map((data) => data.completes);
      const remarks = tableData.map((data) => data.remarks);
      const wastes = tableData.map((data) => data.wastes);
      const y_dates = tableData.map((data) => data.y_date);





      const y_date = y_dates[0];
      const data = [];
      const emp_idss = [...emp_ids];
      let responseData = [];

      const responser = emp_idss.map(async (val) => {
          if (emp_ids.includes(val)) {
              const workerTimesheetQueryy = `SELECT * FROM worker_timesheet WHERE product_name = ? AND section = ?  AND line = ? AND shift = ? AND entry_id = ? AND date_time = ?`;
              const workerTimesheetResultt = await executeQuery(connection, workerTimesheetQueryy, [productid[0], sectionid[0], line[0], shifts[0], val, y_date]);
              const numrows = workerTimesheetResultt.length;
              const row1 = numrows > 0 ? workerTimesheetResultt[0] : null;

              if (row1) {
                  const key = emp_ids.indexOf(String(row1.entry_id));
                  const k = emp_idss.indexOf(String(row1.entry_id));
                  emp_idss.splice(k, 1);

                  const hr = hour[key];
                  const numbers = hr.replace(/[^0-9]/g, '');
                  const re = row1.remark;
                  const rarray = re.split(',');
                  rarray.splice(numbers - 1, 0, remarks[key]);
                  const rmark = rarray.join(',');

                  const w = row1.waste;
                  const warray = w.split(',');
                  warray.splice(numbers - 1, 0, wastes[key]);
                  const wst = warray.join(',');

                  data.push({
                      id: row1.id,
                      [hr]: completes[key],
                      remark: rmark,
                      waste: wst
                  });
              }
          }

          return {
              rdse: data
          };
      });

      const resolvedResponse = await Promise.all(responser);
      responseData = resolvedResponse.map(item => item.rdse);

      const firstArray = responseData[0];
      const updateQuery = 'UPDATE worker_timesheet SET ? WHERE id = ?';
      const updatePromises = firstArray.map((row) => {
          const id = row.id;
          delete row.id;
          return new Promise((resolve, reject) => {
              executeQuery(connection, updateQuery, [row, id])
                  .then(() => resolve())
                  .catch((err) => reject(err));
          });
      });

      Promise.all([...updatePromises])
          .then(() => res.send('Data Updated Successfully'))
          .catch((err) => {
              console.error(err);
              res.status(500).json({ error: 'An Error Occurred' });
          });

  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /fg_output:
 *   post:
 *     summary: Retrieve finished goods output for a specific date
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "01-01-2024"
 *                 description: Date for which to retrieve FG output
 *     responses:
 *       200:
 *         description: A list of finished goods output details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: ID of the finished goods detail
 *                   product_name:
 *                     type: string
 *                     example: "132"
 *                     description: Name of the product
 *                   line:
 *                     type: string
 *                     example: ""
 *                     description: Line of the product
 *                   product_code:
 *                     type: integer
 *                     example: 756
 *                     description: Product code
 *                   shift:
 *                     type: string
 *                     example: "8"
 *                     description: Shift of the FG output
 *                   hour:
 *                     type: string
 *                     example: "HOUR8"
 *                     description: Hour of the FG output
 *                   fg_output:
 *                     type: string
 *                     example: "10,185"
 *                     description: Quantity of FG output
 *                   country:
 *                     type: string
 *                     example: ""
 *                     description: Country
 *                   waste_weight:
 *                     type: integer
 *                     example: 0
 *                     description: Waste weight
 *                   user:
 *                     type: string
 *                     example: ""
 *                     description: Name of the user who recorded the FG output
 *                   date_time:
 *                     type: string
 *                     example: "29-05-2024"
 *                     description: Date when the FG output was recorded
 *                   time_stamp:
 *                     type: string
 *                     example: "1617228000"
 *                     description: Timestamp of the FG output
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-29T05:31:55.000Z"
 *                     description: Date and time of the FG output
 *                   item_description:
 *                     type: string
 *                     example: "YAKI BRAID"
 *                     description: Item description
 *                   product_des:
 *                     type: string
 *                     example: "YAKI BRAID # 2"
 *                     description: Product description
 *                   user_name:
 *                     type: string
 *                     example: null
 *                     description: Name of the user
 *       500:
 *         description: Internal Server Error
 */

/**
 * @function
 * @name fg_output
 * @description Retrieve finished goods output for a specific date
 * @memberof module:routes/fgOutput
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




app.post('/fg_output', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const formattedDate = req.body.date;

  // Execute the MySQL query to fetch fg_details

  const query = `
  SELECT fg_details.*, item_masterr.item_description, item_code.product_des, geopos_users.name AS user_name
  FROM fg_details
  LEFT JOIN item_masterr ON fg_details.product_name = item_masterr.id
  LEFT JOIN item_code ON fg_details.product_code = item_code.id
  LEFT JOIN geopos_users ON fg_details.user = geopos_users.id
  WHERE fg_details.date_time = ?`;

const results = await executeQuery(connection, query, [formattedDate]);

      const response = {
        fgDetails: results,
      };

      // Return the response object
      res.send(response);
      // console.log(response);
  //  });
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * 
 * /todayfg_output:
 *   post:
 *     summary: Retrieve finished goods output for the current date
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: A list of finished goods output details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   product_name:
 *                     type: string
 *                     example: "132"
 *                   line:
 *                     type: string
 *                     example: ""
 *                   product_code:
 *                     type: integer
 *                     example: 756
 *                   shift:
 *                     type: string
 *                     example: "8"
 *                   hour:
 *                     type: string
 *                     example: "HOUR8"
 *                   fg_output:
 *                     type: string
 *                     example: "10,185"
 *                   country:
 *                     type: string
 *                     example: ""
 *                   waste_weight:
 *                     type: integer
 *                     example: 0
 *                   user:
 *                     type: string
 *                     example: ""
 *                   date_time:
 *                     type: string
 *                     example: "29-05-2024"
 *                   time_stamp:
 *                     type: string
 *                     example: "1617228000"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-29T05:31:55.000Z"
 *                   item_description:
 *                     type: string
 *                     example: "YAKI BRAID"
 *                   product_des:
 *                     type: string
 *                     example: "YAKI BRAID # 2"
 *                   user_name:
 *                     type: string
 *                     example: null
 *       500:
 *         description: Internal Server Error
 */

/**
 * @function
 * @name todayfg_output
 * @description Retrieve finished goods output for the current date
 * @memberof module:routes/fgOutput
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


// today fg output 05-10-23
app.post('/todayfg_output',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const formattedDate = dateUtils.getCurrentDate("DD-MM-YYYY");

  // const formattedDate = date.split('-').reverse().join('-');
  // console.log(formattedDate);
  // Execute the MySQL query to fetch fg_details

  const query = `
  SELECT fg_details.*, item_masterr.item_description, item_code.product_des, geopos_users.name AS user_name
  FROM fg_details
  LEFT JOIN item_masterr ON fg_details.product_name = item_masterr.id
  LEFT JOIN item_code ON fg_details.product_code = item_code.id
  LEFT JOIN geopos_users ON fg_details.user = geopos_users.id
  WHERE fg_details.date_time = ?`;

const results = await executeQuery(connection, query, [formattedDate]);


      const response = {
        fgDetails: results,
      };

      // Return the response object
      res.send(response);
      // console.log(response);
  //   }
  // );
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /fgoutputdelete/{id}:
 *   delete:
 *     summary: Delete a finished goods output record by ID
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the finished goods output record to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item deleted successfully.
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item not found.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during the delete operation.
 */

/**
 * @function
 * @name fgoutputdelete
 * @description Delete a finished goods output record by ID
 * @memberof module:routes/fgOutput
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


// delete fg output
app.delete("/fgoutputdelete/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
 // console.log(id);
 const query = `DELETE FROM fg_details WHERE id = ?`;
 const result = await executeQuery(connection, query, [id]);


      console.log(result);
      res.json({ message: 'Item deleted successfully.' });
 
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getcolordescription/{selectedProduct}:
 *   get:
 *     summary: Retrieve color descriptions for a selected product
 *     tags:
 *       - Item Code
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: selectedProduct
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the selected product
 *     responses:
 *       200:
 *         description: A list of color descriptions for the selected product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                     description: ID of the color description
 *                   product_des:
 *                     type: string
 *                     example: "Red"
 *                     description: Color description for the product
 *       500:
 *         description: Internal Server Error
 */

/**
 * @function
 * @name getcolordescription
 * @description Retrieve color descriptions for a selected product
 * @memberof module:routes/Product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */

// Define a route for fetching line options
app.get('/getcolordescription/:selectedProduct', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const { selectedProduct } = req.params;

      const query = `SELECT id, product_des FROM item_code WHERE product_id = ?`;
      const results = await executeQuery(connection, query, [selectedProduct]);

      const colorDescriptions = results.map((row) => ({
          id: row.id,
          product_des: row.product_des,
      }));

      res.json(colorDescriptions);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /addfgoutput:
 *   post:
 *     summary: Add finished goods output
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: "1"
 *                 description: Name of the product
 *               color_description:
 *                 type: integer
 *                 example: 1
 *                 description: Description of the color
 *               shift:
 *                 type: string
 *                 example: "8"
 *                 description: Shift during which the output was recorded
 *               fgoutput:
 *                 type: integer
 *                 example: 100
 *                 description: Quantity of finished goods output
 *               hour:
 *                 type: string
 *                 example: "HOUR1"
 *                 description: Hour during which the output was recorded
 *               date:
 *                 type: string
 *                 example: "01-01-2024"
 *                 description: Date when the output was recorded
 *               country:
 *                 type: string
 *                 example: ""
 *                 description: Country where the output was recorded
 *     responses:
 *       200:
 *         description: Finished goods output added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Success"
 *                   description: Status of the operation
 *                 message:
 *                   type: string
 *                   example: "FG output added successfully."
 *                   description: Message indicating success
 *       409:
 *         description: Conflict - FG output for the specified product, shift, and hour already exists or production for the specified product, shift, and date not started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Error"
 *                   description: Status of the conflict
 *                 message:
 *                   type: string
 *                   description: Message indicating the conflict
 *       500:
 *         description: Internal Server Error
 */

/**
 * @function
 * @name addfgoutput
 * @description Add finished goods output
 * @memberof module:routes/FinishedGoods
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



app.post('/addfgoutput', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();

      const {
          product_name,
          color_description,
          shift,
          fgoutput,
          hour,
          date,
          country
      } = req.body;

      const formattedDate = dateUtils.convertDateFormat(date, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const timestampInSeconds = dateUtils.convertToUnixTimestamp(formattedDate);
      const userid = 9; // Replace with the actual way to get the user ID

      const productCheckQuery = `SELECT * FROM worker_timesheet WHERE product_name = ? AND shift = ? AND date_time = ?`;
      const productResult = await executeQuery(connection, productCheckQuery, [product_name, shift, date]);

      console.log("product_name", product_name);
      console.log("shift", shift);
      console.log("date_time", date);
      console.log("productResult", productResult.length);
      if (productResult.length === 0) {
          return res.status(409).json({ status: 'Error', message: `Production for this product, shift on ${date} not started.` });
      }

      const checkDuplicateQuery = `
          SELECT * FROM fg_details
          WHERE
              product_name = ?
              AND product_code = ?
              AND shift = ?
              AND hour = ?
              AND date_time = ?
              AND country = ?
      `;

      const checkResults = await executeQuery(connection, checkDuplicateQuery, [product_name, color_description, shift, hour, date, country]);
//console.log("checkResults", checkResults.length);
      if (checkResults.length > 0) {
          return res.status(409).json({ status: 'Error', message: 'FG output for this product, shift, and hour on this date already exists.' });
      }

      const insertQuery = 'INSERT INTO fg_details (product_name, product_code, shift, hour, fg_output, country, user, date_time, time_stamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

      await executeQuery(connection, insertQuery, [product_name, color_description, shift, hour, fgoutput, country, userid, date, timestampInSeconds]);

      return res.status(200).json({ status: 'Success', message: 'FG output added successfully.' });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during FG output addition.' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /fg_output_update/:
 *   put:
 *     summary: Update finished goods output details
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the FG output to update
 *               product_name:
 *                 type: string
 *                 example: "1"
 *                 description: Name of the product
 *               color_description:
 *                 type: string
 *                 example: "5"
 *                 description: Description of the color
 *               shift:
 *                 type: string
 *                 example: "11"
 *                 description: Shift during which the FG output was recorded
 *               hour:
 *                 type: string
 *                 example: "HOUR1"
 *                 description: Hour of the FG output
 *               fgoutput:
 *                 type: integer
 *                 example: 100
 *                 description: Quantity of FG output
 *               country:
 *                 type: string
 *                 example: "Mozambique"
 *                 description: Country of production
 *               date:
 *                 type: string
 *                 example: "29-05-2024"
 *                 description: Date of the FG output
 *     responses:
 *       200:
 *         description: FG output updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fg Output updated successfully."
 *       409:
 *         description: FG output already exists for the given parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sorry, For This hour of Today You have Already added the FG OUTPUT for this Product Name and Line and section!!! "
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */

/**
 * @function
 * @name fg_output_update
 * @description Update finished goods output details
 * @memberof module:routes/fgOutput
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */




// PUT endpoint to edit FG output
app.put('/fg_output_update/', authenticateJWT, async (req, res) => {
  console.log("hi"); 
  let connection;
  try {
      connection = await getPoolConnection();
      const {
          id,
          product_name,
          color_description,
          shift,
          code,
          hour,
          fgoutput,
          country,
          date
      } = req.body;

      // Check if FG output already exists for the given parameters
      const query = `
          SELECT * 
          FROM fg_details 
          WHERE product_name = ? 
              AND product_code = ? 
              AND shift = ? 
              AND hour = ? 
              AND date_time = ?
              AND country = ?
              
      `;
      const values = [product_name, color_description, shift, hour, date, country];
      const rows = await executeQuery(connection, query, values);

      if (rows.length > 0) {
        console.log("hi1");
          // If FG output already exists for the given parameters
          return res.status(400).json({status: 'Error', message: 'FG data already exists for this hour' });
      } else {
          // Update FG output
          const updateQuery = `
              UPDATE fg_details 
              SET product_name = ?, shift = ?, product_code = ?, hour = ?, fg_output = ?, country = ? 
              WHERE id = ?
          `;
          const updateValues = [product_name, shift, color_description, hour, fgoutput, country, id];
          const result = await executeQuery(connection, updateQuery, updateValues);
          console.log("hi2");
          // Handle success response
          res.status(200).json({ status: 'Success', message: 'FG output updated successfully' });
      }
  } catch (error) {
    console.log("hi3");
      // Handle exceptions
      console.error('Error:', error.message);
      res.status(500).json({ status: 'Error', message: 'Internal server error' });
  } finally {
    console.log("hi4");
      // Release the connection back to the pool in case of success or error
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getfgoutputData/{id}:
 *   get:
 *     summary: Retrieve finished goods output data by ID
 *     tags:
 *       - FG Output
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the finished goods output data
 *     responses:
 *       200:
 *         description: Finished goods output data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 product_name:
 *                   type: string
 *                   example: "123"
 *                 line:
 *                   type: string
 *                   example: "1"
 *                 product_code:
 *                   type: integer
 *                   example: 1
 *                 shift:
 *                   type: string
 *                   example: "8"
 *                 hour:
 *                   type: string
 *                   example: "HOUR1"
 *                 fg_output:
 *                   type: string
 *                   example: "100"
 *                 country:
 *                   type: string
 *                   example: "Mozambique"
 *                 waste_weight:
 *                   type: integer
 *                   example: "10"
 *                 user:
 *                   type: string
 *                   example: ""
 *                 date_time:
 *                   type: string
 *                   example: "01-01-2024"
 *                 time_stamp:
 *                   type: string
 *                   example: "1617228000"
 *                 date:
 *                   type: timestamp
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 pcode:
 *                   type: string
 *                   example: "1234"
 *                 pdes:
 *                   type: string
 *                   example: "Product Description"
 *       404:
 *         description: Finished goods output data not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @function
 * @name getfgoutputData
 * @description Retrieve finished goods output data by ID
 * @memberof module:routes/FinishedGoods
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



// API endpoint to fetch data from fg_details table
app.get('/getfgoutputData/:id',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
 // console.log(id);



  const query = `
  SELECT fg_details.*, item_code.product_code as pcode, item_code.product_des as pdes
  FROM fg_details
  JOIN item_code ON fg_details.product_code = item_code.id
  WHERE fg_details.id = ?
`; 

const rows = await executeQuery(connection, query, [id]);

if (rows.length === 0) {
    return res.status(404).json({ error: 'FG data not found' });
} else {
    return res.json(rows[0]);
}
  // Execute the query

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getColorOptions/{product_name}:
 *   get:
 *     summary: Retrieve color options for a given product name
 *     tags:
 *       - Item Code
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: product_name
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The name of the product to fetch color options for
 *     responses:
 *       200:
 *         description: A list of color options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   product_id:
 *                     type: integer
 *                     example: 1
 *                   product_code:
 *                     type: string
 *                     example: "CODE123"
 *                   product_des:
 *                     type: string
 *                     example: "Color Description"
 *                   date:
 *                     type: string
 *                     example: "01-01-2024"
 *                   loc:
 *                     type: integer
 *                     example: 0

 *       404:
 *         description: No color options found for the given product name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 */

/**
 * @function
 * @name getColorOptions
 * @description Retrieve color options for a given product name
 * @memberof module:routes/itemCodes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



app.get('/getColorOptions/:product_name',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const product_name = req.params.product_name;
  //console.log(product_name);
  const query = `SELECT * FROM item_code WHERE product_id = ?`;
  const results = await executeQuery(connection, query, [product_name]);
  // db.query(query, [product_name], (error, results) => {
  //   if (error) {
  //     console.error('Error fetching item data:', error);
  //     res.status(500).json({ error: 'Failed to fetch item data' });
  //   } else {
      res.json(results);
  //   }
  // });
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /gettodayempreportData:
 *   post:
 *     summary: Get today's employee report data.
 *     description: Retrieves today's employee report data based on the provided user ID and role ID.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: The ID of the user (operator).
 *                 example: "12345"
 *               roleid:
 *                 type: integer
 *                 description: The role ID of the user.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Today's employee report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Id of the timesheet entry.
 *                       product_name:
 *                         type: string
 *                         description: Product id of the timesheet.
 *                       line:
 *                         type: string
 *                         description: line of the timesheet.
 *                       section:
 *                         type: string
 *                         description: Section id of the timesheet.
 *                       worker:
 *                         type: string
 *                         description: Worker name of the timesheet.
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID of the timesheet.
 *                       shift:
 *                         type: string
 *                         description: Shift of the timesheet.
 *                       HOUR1:
 *                         type: integer
 *                         description: The HOUR1.
 *                       HOUR2:
 *                         type: integer
 *                         description: The HOUR2.
 *                       HOUR3:
 *                         type: integer
 *                         description: The HOUR3.
 *                       HOUR4:
 *                         type: integer
 *                         description: The HOUR4.
 *                       HOUR5:
 *                         type: integer
 *                         description: The HOUR5.
 *                       HOUR6:
 *                         type: integer
 *                         description: The HOUR6.
 *                       HOUR7:
 *                         type: integer
 *                         description: The HOUR7.
 *                       HOUR8:
 *                         type: integer
 *                         description: The HOUR8.
 *                       HOUR9:
 *                         type: integer
 *                         description: The HOUR9.
 *                       HOUR10:
 *                         type: integer
 *                         description: The HOUR10.
 *                       HOUR11:
 *                         type: integer
 *                         description: The HOUR11.
 *                       target:
 *                         type: string
 *                         description: The target.
 *                       remark:
 *                         type: string
 *                         description: The remark.
 *                       waste:
 *                         type: string
 *                         description: The waste.
 *                       hour_loss:
 *                         type: string
 *                         description: The hour loss.
 *                       date_time:
 *                         type: string
 *                         description: The date and time.
 *                       time_stamp:
 *                         type: integer
 *                         description: The timestamp.
 *                       mon:
 *                         type: string
 *                         description: The month.
 *                       operator_id:
 *                         type: string
 *                         description: The ID of the operator.
 *                       date:
 *                         type: string
 *                         description: The date.
 *                       item_description:
 *                         type: string
 *                         description: The item description.
 *                       section_name:
 *                         type: string
 *                         description: The section name.
 *                       operator_name:
 *                         type: string
 *                         description: The name of the operator.
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Current date.
 *                 operatorname:
 *                   type: string
 *                   description: Name of the operator if available.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name gettodayempreportData
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */




// Define the route for the gettodayempreportData API
app.post('/gettodayempreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();

  const operatorId = req.body.userid;
  const roleId = req.body.roleid;

  //  console.log("roleId:",roleId);
  //  console.log("operatorId:",operatorId);

  let whereConditions = [];
  var currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
  //console.log("MJ" + currentDate);
  //currentDate = "22-06-2023";
  whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);

  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }
  const whereClause = whereConditions.join(' AND ');

  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift,
   worker_timesheet.line
   `;

  
  const results = await executeQuery(connection, query);
  //console.log("results:",results);
    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };
//console.log("data:",data);
    res.json(data);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 *  components:
 *   schemas:
 *     worker_timesheet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_name:
 *           type: string
 *           example: 1
 *         line:
 *           type: string
 *           example: "1"
 *         section:
 *           type: string
 *           example: "1"
 *         worker:
 *           type: string
 *           example: "worker 1"
 *         entry_id:
 *           type: string
 *           example: "1001"
 *         shift:
 *           type: string
 *           example: "8"
 *         HOUR1:
 *           type: float
 *           example: "10.0000"
 *         HOUR2:
 *           type: float
 *           example: "10.0000"
 *         HOUR3:
 *           type: float
 *           example: "10.0000"
 *         HOUR4:
 *           type: float
 *           example: "10.0000"
 *         HOUR5:
 *           type: float
 *           example: "10.0000"
 *         HOUR6:
 *           type: float
 *           example: "10.0000"
 *         HOUR7:
 *           type: float
 *           example: "10.0000"
 *         HOUR8:
 *           type: float
 *           example: "10.0000"
 *         HOUR9:
 *           type: float
 *           example: "10.0000"
 *         HOUR10:
 *           type: float
 *           example: "10.0000"
 *         HOUR11:
 *           type: float
 *           example: "10.0000"
 *         target:
 *           type: string
 *           example: "10.0000"
 *         remark:
 *           type: string
 *           example: " ,ok,,,,,,,,,,,,,,"
 *         waste:
 *           type: string
 *           example: "5.23,0.12,,,,,,,,,,,,,,"
 *         hour_loss:
 *           type: string
 *           example: " "
 *         date_time:
 *           type: string
 *           example: "01-01-2024"
 *         time_stamp:
 *           type: string
 *           example: "1709071200"
 *         mon:
 *           type: string
 *           example: "01-2024"
 *         operator_id:
 *           type: string
 *           example: "11" 
 *         date:
 *           type: string
 *           example: "2024-01-01 12:00:00"
 * 
 * /getempreportData:
 *   post:
 *     summary: Get employee report data.
 *     description: Retrieves employee report data based on various filters such as product name, line number, section ID, worker ID, shift, and search criteria.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: The ID of the product.
 *               line_no:
 *                 type: integer
 *                 description: The line number.
 *               section_id:
 *                 type: integer
 *                 description: The ID of the section.
 *               worker_id:
 *                 type: string
 *                 example: "Entryid"
 *                 description: The ID of the worker.
 *               shift:
 *                 type: integer
 *                 description: The shift.
 *               search:
 *                 type: integer
 *                 description: The search criteria.
 *               userid:
 *                 type: integer
 *                 description: The ID of the user.
 *               roleid:
 *                 type: integer
 *                 description: The ID of the role.
 *               fromdate:
 *                 type: string
 *                 example: "01-01-2023"
 *                 description: "The start date for filtering (format: DD-MM-YYYY)."
 *               todate:
 *                 type: string
 *                 example: "01-01-2023"
 *                 description: "The end date for filtering (format: DD-MM-YYYY)."
 *     responses:
 *       200:
 *         description: Employee report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The name of the product.
 *                         example: 1
 *                       product_name:
 *                         type: string
 *                         description: The name of the product.
 *                       line:
 *                         type: string
 *                         description: The line number.
 *                       section:
 *                         type: string
 *                         description: The section name.
 *                       worker:
 *                         type: string
 *                         description: The section name.
 *                       entry_id:
 *                         type: string
 *                         description: The section name. 
 *                       shift:
 *                         type: string
 *                         description: The shift.
 *                       HOUR1:
 *                         type: integer
 *                         description: The HOUR1.
 *                       HOUR2:
 *                         type: integer
 *                         description: The HOUR2.
 *                       HOUR3:
 *                         type: integer
 *                         description: The HOUR3.
 *                       HOUR4:
 *                         type: integer
 *                         description: The HOUR4.
 *                       HOUR5:
 *                         type: integer
 *                         description: The HOUR5.
 *                       HOUR6:
 *                         type: integer
 *                         description: The HOUR6.
 *                       HOUR7:
 *                         type: integer
 *                         description: The HOUR7.
 *                       HOUR8:
 *                         type: integer
 *                         description: The HOUR8.
 *                       HOUR9:
 *                         type: integer
 *                         description: The HOUR9.
 *                       HOUR10:
 *                         type: integer
 *                         description: The HOUR10.
 *                       HOUR11:
 *                         type: integer
 *                         description: The HOUR11.
 *                       target:
 *                         type: string
 *                         description: The target.
 *                       remark:
 *                         type: string
 *                         description: The remark.
 *                       waste:
 *                         type: string
 *                         description: The waste.
 *                       hour_loss:
 *                         type: string
 *                         description: The hour loss.
 *                       date_time:
 *                         type: string
 *                         description: The date and time.
 *                       time_stamp:
 *                         type: integer
 *                         description: The timestamp.
 *                       mon:
 *                         type: string
 *                         description: The month.
 *                       operator_id:
 *                         type: string
 *                         description: The ID of the operator.
 *                       date:
 *                         type: string
 *                         description: The date.
 *                       item_description:
 *                         type: string
 *                         description: The item description.
 *                       section_name:
 *                         type: string
 *                         description: The section name.
 *                       operator_name:
 *                         type: string
 *                         description: The name of the operator.
 *                 product:
 *                   type: integer
 *                   description: The ID of the product.
 *                 line:
 *                   type: integer
 *                   description: The line number.
 *                 worker:
 *                   type: string
 *                   description: The ID of the worker.
 *                 section:
 *                   type: integer
 *                   description: The ID of the section.
 *                 operatorname:
 *                   type: string
 *                   description: The name of the operator.
 *                 title:
 *                   type: string
 *                   description: The title of the report.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getempreportData
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// Define the route for the getempreportData API
app.post('/getempreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var product_name = req.body.product_id;
 var line_no = req.body.line_no;
  var section = req.body.section_id;
  var worker = req.body.worker_id;
  var shift = req.body.shift;
  const search = req.body.search;
  var title = '';

//console.log("search",search);


  var fd;
  var td;
  let whereConditions = [];
  const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
  const currentMonth = dateUtils.getCurrentMonth();
  const currentYear = dateUtils.getCurrentYear();
  const currentMonthYear = dateUtils.getCurrentMonthYear();
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  
  // console.log("roleId:",roleId);
  // console.log("operatorId:",operatorId);
  
      if (roleId == 3) {
          whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
        }
  

  
  if (product_name !== '') {
    whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
  }
  if (line_no !== '') {
    whereConditions.push(`worker_timesheet.line = '${line_no}'`);
  }
  if (section !== '') {
    whereConditions.push(`worker_timesheet.section = '${section}'`);
  }
  if (worker !== '') {
    whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
  }
  if (shift !== '') {
    whereConditions.push(`worker_timesheet.shift = '${shift}'`);
  }


  if (search === '5') {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  } else if (search === '1') {

    const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
    const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
     const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
     const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
     whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);
    

  } else if (search === '2') {
    title = `MONTH ${currentMonthYear}`;
    whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
  } else if (search === '3') {
    title = `YEAR ${currentYear}`;
     whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);

  } else if (search === '4') {
    const formattedFrom = req.body.fromdate;
    const formattedTo = req.body.todate;
    
    const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
    const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);


 console.log("formattedFrom:",formattedFrom);
 console.log("formattedTo:",formattedTo);
 console.log("timestampfromdate:",timestampfromdate);
 console.log("timestamptodate:",timestamptodate);

    

//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
  whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
  title = `DATE ${formattedFrom}`;
} else {
  title = `FROM ${formattedFrom} TO ${formattedTo} `;
  whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
}
     

    fd=formattedFrom;
    td=formattedTo;
  }

  const whereClause = whereConditions.join(' AND ');
  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift,
   worker_timesheet.line
   `;


   const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      product: product_name,
      line: line_no,
      worker: worker,
      fdate: fd,
      tdate: td,
      section: section,
      operatorname: results.length > 0 ? results[0].operator_name : null,
      title: title
    };

    res.json(data);

    

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /gettodaypppreportData:
 *   post:
 *     summary: Get PPP report data for today
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *               roleid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with PPP report data for today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       sum:
 *                         type: integer
 *                         description: Sum of fg_output
 *                       mandays:
 *                         type: number
 *                         description: Total mandays
 *                       reww:
 *                         type: string
 *                         description: Reww value
 *                       count:
 *                         type: integer
 *                         description: Count value
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                   description: PPP report data for today
 *                 date:
 *                   type: string
 *                   description: Current date
 *                 total_fg_output:
 *                   type: integer
 *                   description: Total fg_output for today
 *                 total_mandays:
 *                   type: number
 *                   description: Total mandays for today
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getTodayPPPReportData
 * @description Get PPP report data for today
 * @memberof module:routes/ppp
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


app.post('/gettodaypppreportData', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const operatorId = req.body.userid;
      const roleId = req.body.roleid;
      const currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");

      let whereConditions = [`worker_timesheet.date_time = '${currentDate}'`];

      if (roleId == 3) {
          whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
      }

      const whereClause = whereConditions.join(' AND ');

      const PPPQuery = `
          SELECT *, item_masterr.item_description
          FROM worker_timesheet
          LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
          WHERE ${whereClause}
          GROUP BY worker_timesheet.product_name, worker_timesheet.shift, worker_timesheet.date_time
      `;

      const PPPResult = await executeQuery(connection, PPPQuery);
      const responseData = [];

      let total_fg_output = 0;
      let total_mandays = 0;

      for (const allppp of PPPResult) {
          const sumfgDetailsquery = `
              SELECT *, SUM(fg_output) as tar
              FROM fg_details
              WHERE date_time = ? AND product_name = ? AND shift = ?
              GROUP BY product_name, date_time, shift
          `;

          const sumfgDetailsResultt = await executeQuery(connection, sumfgDetailsquery, [currentDate, allppp.product_name, allppp.shift]);
          const sumfgDetailsResponse = sumfgDetailsResultt.length > 0 ? sumfgDetailsResultt[0].tar : 0;

          const workercountQuery = `
              SELECT *
              FROM worker_timesheet
              LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
              WHERE worker_timesheet.date_time = ? AND product_name = ? AND shift = ?
              GROUP BY worker_timesheet.product_name, worker_timesheet.shift, worker_timesheet.date_time
          `;

          const workercountResult = await executeQuery(connection, workercountQuery, [currentDate, allppp.product_name, allppp.shift]);
          let count = 0;

          for (const workercount of workercountResult) {
              for (let h = 1; h <= 11; h++) {
                  const hourField = 'HOUR' + h;
                  if (workercount[hourField] > 0) {
                      count++;
                  }
              }
          }

          const mandays = count / 8;
          total_mandays += mandays;

          let reww;
          const rew = sumfgDetailsResponse / mandays;

          if (Number.isFinite(rew)) {
              reww = rew.toFixed(2);
          } else {
              reww = '0';
          }

          total_fg_output += sumfgDetailsResponse;

          const respo = {
              item_description: allppp.item_description,
              shift: allppp.shift,
              sum: sumfgDetailsResponse,
              mandays: mandays,
              reww: reww,
              count: count,
              date_time: allppp.date_time
          };

          responseData.push(respo);
      }

      const data = {
          timesheet: responseData,
          date: currentDate,
          total_fg_output: total_fg_output,
          total_mandays: total_mandays
      };

      res.json(data);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getpppreportData:
 *   post:
 *     summary: Get PPP report data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: "126"
 *               shift:
 *                 type: string
 *                 example: "11"
 *               search:
 *                 type: string
 *                 example: "5"
 *               userid:
 *                 type: string
 *                 example: "11"
 *               roleid:
 *                 type: string
 *                 example: "6"
 *               fromdate:
 *                 type: string
 *                 example: "01-01-2024"
 *               todate:
 *                 type: string
 *                 example: "01-01-2024"
 *     responses:
 *       200:
 *         description: Successful response with PPP report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       sum:
 *                         type: integer
 *                         description: Sum of fg_output
 *                       mandays:
 *                         type: number
 *                         description: Total mandays
 *                       reww:
 *                         type: string
 *                         description: Reww value
 *                       count:
 *                         type: integer
 *                         description: Count value
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                   description: PPP report data
 *                 product:
 *                   type: string
 *                   description: Product name
 *                 total_fg_output:
 *                   type: integer
 *                   description: Total fg_output
 *                 total_mandays:
 *                   type: number
 *                   description: Total mandays
 *                 title:
 *                   type: string
 *                   description: Title
 *                 date:
 *                   type: string
 *                   description: Current date
 *                 mon:
 *                   type: string
 *                   description: Current month
 *                 year:
 *                   type: string
 *                   description: Current year
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */


/**
 * @function
 * @name getPPPReportData
 * @description Get PPP report data
 * @memberof module:routes/ppp
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



// Define the route for the getpppreportData API
app.post('/getpppreportData', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const product_name = req.body.product_name;
      const shift = req.body.shift;
      const search = req.body.search;

      const operatorId = req.body.userid;
      const roleId = req.body.roleid;

      const currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
      const mon = dateUtils.getCurrentMonthYear();
      const year = dateUtils.getCurrentYear();

      let whereConditions = [];

      if (roleId == 3) {
          whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
      }

      let title = '';

      switch (search) {
          case '5':
              title = `Date ${currentDate}`;
              whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
              break;
          case '2':
              title = `MONTH ${mon}`;
              whereConditions.push(`worker_timesheet.mon = '${mon}'`);
              break;
          case '4':
              const formattedFrom = dateUtils.convertDateFormat(req.body.fromdate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const formattedTo = dateUtils.convertDateFormat(req.body.todate, 'DD-MM-YYYY', 'YYYY-MM-DD');
              const timestampFrom = dateUtils.convertToUnixTimestamp(formattedFrom);
              const timestampTo = dateUtils.convertToUnixTimestamp(formattedTo);

              if (timestampFrom === timestampTo || !timestampTo) {
                  whereConditions.push(`worker_timesheet.time_stamp = '${timestampFrom}'`);
                  title = `DATE ${formattedFrom}`;
              } else {
                  whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampFrom}' AND worker_timesheet.time_stamp <= '${timestampTo}')`);
                  title = `FROM ${formattedFrom} TO ${formattedTo}`;
              }
              break;
          default:
              break;
      }

      if (product_name) {
          whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
      }

      if (shift) {
          whereConditions.push(`worker_timesheet.shift = '${shift}'`);
      }

      const whereClause = whereConditions.join(' AND ');

      let responseData = [];
      let total_fg_output = 0;
      let total_mandays = 0;

      const PPPQuery = `
          SELECT
              worker_timesheet.*,
              item_masterr.item_description
          FROM
              worker_timesheet
              LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
          WHERE
              ${whereClause}
          GROUP BY
              worker_timesheet.product_name,
              worker_timesheet.shift,
              worker_timesheet.date_time`;

      const PPPResult = await executeQuery(connection, PPPQuery);

      const response = PPPResult.map(async (allppp) => {
          let sumfgDetailsResponse = 0;

          if (search === '4') {
              const sumfgDetailsQuery = `
                  SELECT SUM(a.tar) as res
                  FROM (
                      SELECT SUM(fg_output) as tar
                      FROM fg_details
                      WHERE date_time = ? AND product_name = ? AND shift = ?
                      GROUP BY product_name, time_stamp, shift
                  ) a`;
              
              const sumfgDetailsResult = await executeQuery(connection, sumfgDetailsQuery, [allppp.date_time, allppp.product_name, allppp.shift]);
              sumfgDetailsResponse = sumfgDetailsResult.length > 0 ? sumfgDetailsResult[0].res : 0;
          } else {
              const sumfgDetailsQuery = `SELECT *,SUM(fg_output) as tar FROM fg_details WHERE date_time = ? AND product_name = ? AND shift = ?  GROUP BY product_name, date_time, shift`;
              const sumfgDetailsResult = await executeQuery(connection, sumfgDetailsQuery, [currentDate, allppp.product_name, allppp.shift]);
              sumfgDetailsResponse = sumfgDetailsResult.length > 0 ? sumfgDetailsResult[0].tar : 0;
          }

          let count = 0;

          if (search === '4') {
              const workerQuery = `SELECT * FROM worker_timesheet WHERE date_time = ? AND product_name = ? AND shift = ? GROUP BY date_time, entry_id, product_name, shift`;
              const workerCountResult = await executeQuery(connection, workerQuery, [allppp.date_time, allppp.product_name, allppp.shift]);
              const workerResults = workerCountResult && workerCountResult.length > 0 ? workerCountResult : [];
              
              workerResults.forEach((workerCount) => {
                  for (let h = 1; h <= 11; h++) {
                      const hourField = 'HOUR' + h;
                      if (workerCount[hourField] > 0) {
                          count++;
                      }
                  }
              });
          } else {
              const workerCountQuery = `
                  SELECT *
                  FROM worker_timesheet
                  LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
                  WHERE worker_timesheet.date_time = ? AND product_name = ? AND shift = ?
                  GROUP BY worker_timesheet.product_name, worker_timesheet.shift, worker_timesheet.date_time`;
              
              const workerCountResult = await executeQuery(connection, workerCountQuery, [currentDate, allppp.product_name, allppp.shift]);
              const workerResults = workerCountResult && workerCountResult.length > 0 ? workerCountResult : [];
              
              workerResults.forEach((workerCount) => {
                  for (let h = 1; h <= 11; h++) {
                      const hourField = 'HOUR' + h;
                      if (workerCount[hourField] > 0) {
                          count++;
                      }
                  }
              });
          }

          const mandays = count / 8;
          total_mandays += mandays;

          const rew = sumfgDetailsResponse / mandays;
          const reww = Number.isFinite(rew) ? rew.toFixed(2) : '0';

          total_fg_output += sumfgDetailsResponse;

          const respo = {
              item_description: allppp.item_description,
              shift: allppp.shift,
              sum: sumfgDetailsResponse,
              mandays: mandays,
              reww: reww,
              count: count,
              date_time: allppp.date_time
          };

          return {
              respo: respo,
              total_fg_output: total_fg_output,
              total_mandays: total_mandays
          };
      });

      const resolvedResponse = await Promise.all(response);
      responseData = resolvedResponse.map(item => item.respo);

      const data = {
          timesheet: responseData,
          product: product_name,
          total_fg_output: total_fg_output,
          total_mandays: total_mandays,
          title: title,
          date: currentDate,
          mon: mon,
          year: year
      };

      res.json(data);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /gethourlossreportdirectly:
 *   post:
 *     summary: Get hourly loss report directly.
 *     description: Retrieves hourly loss report data directly based on various filters such as product, line, section, worker, shift, and date range.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: ID of the user.
 *               roleid:
 *                 type: integer
 *                 description: ID of the role.
 *     responses:
 *       200:
 *         description: Hourly loss report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pro:
 *                         type: string
 *                         description: Description of the product.
 *                       sec:
 *                         type: string
 *                         description: Name of the section.
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID of the worker.
 *                       worker:
 *                         type: string
 *                         description: Worker information.
 *                       shift:
 *                         type: string
 *                         description: Shift information.
 *                       reg:
 *                         type: string
 *                         description: Join date of the worker.
 *                       numberDays:
 *                         type: integer
 *                         description: Number of days.
 *                       target:
 *                         type: string
 *                         description: Target value.
 *                       cntt:
 *                         type: integer
 *                         description: Count of hours worked.
 *                       ht:
 *                         type: string
 *                         description: Hourly target.
 *                       act_tar:
 *                         type: integer
 *                         description: Actual target.
 *                       com:
 *                         type: integer
 *                         description: Total hours worked.
 *                       balance:
 *                         type: integer
 *                         description: Balance value.
 *                       ha:
 *                         type: string
 *                         description: Hourly average.
 *                       hl:
 *                         type: string
 *                         description: Hourly loss.
 *                       date_time:
 *                         type: string
 *                         description: Date and time.
 *                       single:
 *                         type: string
 *                         description: Single value.
 *                 date:
 *                   type: string
 *                   description: Current date in DD-MM-YYYY format.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getHourLossReportDirectly
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.post('/gethourlossreportdirectly', authenticateJWT, async (req, res) => {

  const operatorId = req.body.userid;
  const roleId = req.body.roleid;

  const responsehourlossdirectdata = [];
  let connection;
  try {

    connection = await getPoolConnection();

    let whereConditions = [];
    const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
    const currentMonth = dateUtils.getCurrentMonth();
    const currentYear = dateUtils.getCurrentYear();
    const currentMonthYear = dateUtils.getCurrentMonthYear();

    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);

    if (roleId == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
    }
    const whereClause = whereConditions.join(' AND ');

    const selectQuery = `
      SELECT worker_timesheet.*, count(*) as cnt, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm, employees_moz.joindate
      FROM worker_timesheet
      LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
      LEFT JOIN section ON worker_timesheet.section = section.id
      LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
      WHERE ${whereClause}
      GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.shift
      HAVING cnt = 1
    `;

    const categoriesResult = await executeQuery(connection, selectQuery);

    const categories = categoriesResult && categoriesResult.length > 0 ? categoriesResult : [];

    const response = categories.map(async (item) => {

      let count = 0;
      for (let i = 1; i <= 11; i++) {
        let str = `HOUR${i}`;
        if (item[str] > 0) {
          count++;
        }
      }

      const cntt = count;

      var pro = item.item_description;
      var sec = item.section_name;
      let com = item.HOUR1 + item.HOUR2 + item.HOUR3 + item.HOUR4 + item.HOUR5 + item.HOUR6 + item.HOUR7 + item.HOUR8 + item.HOUR9 + item.HOUR10 + item.HOUR11;

      const reg = item.joindate;
      const date_time_str = item.date_time;
      const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
      const date_time = dateUtils.convertDateFormat(date_time_str, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');

      const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee, date_time) : '';

      let ht = (item.target / 8).toFixed(2);
      let act_tar = Math.round(parseFloat(ht)) * cntt;

      let balance = act_tar - com;

      let haa = (com / cntt);
      let ha = haa.toFixed(2);

      let hll = (balance * act_tar) / item.target;

      let hl = hll.toFixed(2);

      return {
        pro: pro,
        sec: sec,
        entry_id: item.entry_id,
        worker: item.worker,
        shift: item.shift,
        reg: reg,
        numberDays: numberDaysInt,
        target: item.target,
        cntt: cntt,
        ht: ht,
        act_tar: act_tar,
        com: com,
        balance: balance,
        ha: ha,
        hl: hl,
        date_time: item.date_time,
        single: "0"
      };
    });

    let responseData = await Promise.all(response);

    const queryy = `
      SELECT *, entry_id
      FROM worker_timesheet
      WHERE date_time = ?
      GROUP BY entry_id, date_time, shift
      HAVING count(entry_id) > 1
    `;
    const checkmulti = await executeQuery(connection, queryy, [newcurrentDate1]);
    const multi = checkmulti && checkmulti.length > 0 ? checkmulti : [];
    const responset = multi.map(async (employee) => {

      const queryy1 = `SELECT worker_timesheet.*,employees_moz.name,employees_moz.entryid,employees_moz.workertype,employees_moz.shift,employees_moz.joindate,item_masterr.item_description,section.section_name,geopos_users.name
        FROM worker_timesheet
        LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
        LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
        LEFT JOIN section ON worker_timesheet.section = section.id
        LEFT JOIN geopos_users ON worker_timesheet.operator_id = geopos_users.id
        WHERE worker_timesheet.date_time = ? AND worker_timesheet.entry_id = ?
        GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.shift,worker_timesheet.product_name,worker_timesheet.section`;
      let section = '';
      let product = '';
      let line = '';
      let value_sum = 0;
      let totalTarget = 0;
      let totalTarget1 = 0;
      let cnt = 0;

      const currentDateg = dateUtils.getCurrentDate("YYYY-MM-DD");
      let joinDateg = '';
      let regg = '';
      let numberDaysIntg = '';
      const checkmultiple = await executeQuery(connection, queryy1, [newcurrentDate1, employee.entry_id]);
      const multiple = checkmultiple && checkmultiple.length > 0 ? checkmultiple : [];
      const responsemulti = multiple.map(async (row) => {
        section += row.section_name + ',';
        product += row.item_description + ',';
        line += row.line.join + ',';

        value_sum += row.HOUR1 + row.HOUR2 + row.HOUR3 + row.HOUR4 + row.HOUR5 + row.HOUR6 + row.HOUR7 + row.HOUR8 + row.HOUR9 + row.HOUR10 + row.HOUR11;

        let count = 0;
        for (let i = 1; i <= 11; i++) {
          let str = `HOUR${i}`;
          if (row[str] > 0) {
            count++;
          }
        }

        totalTarget += parseFloat((row.target / 8) * count);
        totalTarget1 += parseFloat(row.target);
        cnt += count;

        regg = row.joindate;
        joinDateg = dateUtils.convertDateFormat(regg, 'DD/MM/YYYY', 'YYYY-MM-DD');
        numberDaysIntg = joinDateg ? dateUtils.getDifferenceInDays(joinDateg, currentDateg) : '';
      })
      let ht = (totalTarget1 / 8).toFixed(2);
      let act_tar = Math.round(parseFloat(ht)) * cnt;

      let balance = act_tar - value_sum;

      let haa = (value_sum / cnt);
      let ha = haa.toFixed(2);

      let hll = ((((totalTarget1 / 8) * cnt) - value_sum) * cnt) / totalTarget1;

      let hl = hll + '' + hll.toFixed(2);

      return {
        pro: product,
        sec: section,
        entry_id: employee.entry_id,
        worker: employee.worker,
        shift: employee.shift,
        reg: regg,
        numberDays: numberDaysIntg,
        target: totalTarget1,
        cntt: cnt,
        ht: ht,
        act_tar: act_tar,
        com: value_sum,
        balance: balance,
        ha: ha,
        hl: hl,
        date_time: employee.date_time,
        single: "1"
      };
    })

    responseData = [...responseData, ...await Promise.all(responset)];

    responsehourlossdirectdata.push({
      timesheet: responseData,
      date: newcurrentDate1,
    });

    res.send(responsehourlossdirectdata);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /gethourlossreport:
 *   post:
 *     summary: Get hourly loss report data.
 *     description: Retrieves hourly loss report data based on various filters such as product, line, section, worker, shift, and date range.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: ID of the product to filter.
 *               line_no:
 *                 type: string
 *                 description: Line number to filter.
 *               section_id:
 *                 type: string
 *                 description: ID of the section to filter.
 *               worker_id:
 *                 type: string
 *                 description: ENRY ID of the worker to filter.
 *               shift:
 *                 type: string
 *                 description: Shift information to filter.
 *               search:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: Search type (1 for weekly, 2 for monthly, 3 for yearly, 4 for custom date range, 5 for current date).
 *               roleid:
 *                 type: integer
 *                 enum: 1
 *                 description: role id of the user.
 *               userid:
 *                 type: integer
 *                 enum: 1
 *                 description: id of the user.
 *               fromdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *                 description: Start date for the custom date range filter.
 *               todate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *                 description: End date for the custom date range filter.
 *     responses:
 *       200:
 *         description: Hourly loss report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: Title of the report.
 *                 timesheett:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pro:
 *                         type: string
 *                         description: Description of the product.
 *                       sec:
 *                         type: string
 *                         description: Name of the section.
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID of the worker.
 *                       worker:
 *                         type: string
 *                         description: Worker information.
 *                       shift:
 *                         type: string
 *                         description: Shift information.
 *                       reg:
 *                         type: string
 *                         description: Join date of the worker.
 *                       numberDays:
 *                         type: integer
 *                         description: Number of days.
 *                       target:
 *                         type: integer
 *                         description: Target value.
 *                       cntt:
 *                         type: integer
 *                         description: Count of hours worked.
 *                       ht:
 *                         type: string
 *                         description: Hourly target.
 *                       act_tar:
 *                         type: integer
 *                         description: Actual target.
 *                       com:
 *                         type: integer
 *                         description: Total hours worked.
 *                       balance:
 *                         type: integer
 *                         description: Balance value.
 *                       ha:
 *                         type: string
 *                         description: Hourly average.
 *                       hl:
 *                         type: string
 *                         description: Hourly loss.
 *                       date_time:
 *                         type: string
 *                         format: date
 *                         description: Date and time.
 *                       single:
 *                         type: string
 *                         description: Single value.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getHourLossReport
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */



app.post('/gethourlossreport', authenticateJWT, async (req, res) => {
  const responsehourlosssearcheddata = [];
  let connection;
  try {
    connection = await getPoolConnection();
    var product_name = req.body.product_id;
    var line_no = req.body.line_no;
    var section = req.body.section_id;
    var worker = req.body.worker_id;
    var shift = req.body.shift;
    const search = req.body.search;
    var title = '';
    let whereConditions = [];
    const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
    const currentMonth = dateUtils.getCurrentMonth();
    const currentYear = dateUtils.getCurrentYear();
    const currentMonthYear = dateUtils.getCurrentMonthYear();
    const operatorId = req.body.userid;
    const roleId = req.body.roleid;

    if (roleId == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
    }
    if (product_name !== '') {
      whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
    }
    if (line_no !== '') {
      whereConditions.push(`worker_timesheet.line = '${line_no}'`);
    }
    if (section !== '') {
      whereConditions.push(`worker_timesheet.section = '${section}'`);
    }
    if (worker !== '') {
      whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
    }
    if (shift !== '') {
      whereConditions.push(`worker_timesheet.shift = '${shift}'`);
    }
    if (search === '5') {
      title = `Date ${newcurrentDate1}`;
      whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
    } else if (search === '1') {
      const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
      const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
      const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
      const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
      const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
      const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

      title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
      whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);
      // console.log(whereConditions);
    } else if (search === '2') {
      title = `MONTH ${currentMonthYear}`;
      whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
    } else if (search === '3') {
      title = `YEAR ${currentYear}`;
      whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);
    } else if (search === '4') {
      const formattedFrom = req.body.fromdate;
      const formattedTo = req.body.todate;

      const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
      const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);

      if (timestampfromdate === timestamptodate || timestamptodate === '') {
        whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
        title = `DATE ${formattedFrom}`;
      } else {
        whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
        title = `FROM ${formattedFrom} TO ${formattedTo} `;
      }
    }
    const whereClause = whereConditions.join(' AND ');

    const queryt = `
      SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm, employees_moz.joindate
      FROM worker_timesheet
      LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
      LEFT JOIN section ON worker_timesheet.section = section.id
      LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
      WHERE ${whereClause}
      GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.shift, worker_timesheet.line
    `;

    const categoriesResult = await executeQuery(connection, queryt);
    const categories = categoriesResult && categoriesResult.length > 0 ? categoriesResult : [];

    const response = categories.map(async (item) => {
      let count = 0;
      for (let i = 1; i <= 11; i++) {
        let str = `HOUR${i}`;
        if (item[str] > 0) {
          count++;
        }
      }
      const cntt = count;

      const pro = item.item_description;
      const sec = item.section_name;
      let com = item.HOUR1 + item.HOUR2 + item.HOUR3 + item.HOUR4 + item.HOUR5 + item.HOUR6 + item.HOUR7 + item.HOUR8 + item.HOUR9 + item.HOUR10 + item.HOUR11;

      const reg = item.joindate;
      const date_time_str = item.date_time;
      const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
      const date_time = dateUtils.convertDateFormat(date_time_str, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');
      const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee, date_time) : '';

      let ht = (item.target / 8).toFixed(2);
      let act_tar = Math.round(parseFloat(ht)) * cntt;
      let balance = act_tar - com;
      let haa = (com / cntt);
      let ha = haa.toFixed(2);
      let hll = (balance * act_tar) / item.target;
      let hl = hll.toFixed(2);

      return {
        pro: pro,
        sec: sec,
        entry_id: item.entry_id,
        worker: item.worker,
        shift: item.shift,
        reg: reg,
        numberDays: numberDaysInt,
        target: item.target,
        cntt: cntt,
        ht: ht,
        act_tar: act_tar,
        com: com,
        balance: balance,
        ha: ha,
        hl: hl,
        date_time: item.date_time,
        single: "0"
      };
    });

    let responseData = await Promise.all(response);

    responsehourlosssearcheddata.push({
      title: title,
      timesheett: responseData,
    });

    res.send(responsehourlosssearcheddata);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

  

/**
 * @swagger
 * /gettodayworkerefficiencyreportData:
 *   post:
 *     summary: Get today's worker efficiency report data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: User ID
 *               roleid:
 *                 type: string
 *                 description: Role ID
 *     responses:
 *       200:
 *         description: Successful response with today's worker efficiency report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID
 *                       product_name:
 *                         type: string
 *                         description: Product name
 *                       line:
 *                         type: string
 *                         description: Line number
 *                       section:
 *                         type: string
 *                         description: Section ID
 *                       worker:
 *                         type: string
 *                         description: Worker ID
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       HOUR1:
 *                         type: integer
 *                         description: Hour 1
 *                       HOUR2:
 *                         type: integer
 *                         description: Hour 2
 *                       HOUR3:
 *                         type: integer
 *                         description: Hour 3
 *                       HOUR4:
 *                         type: integer
 *                         description: Hour 4
 *                       HOUR5:
 *                         type: integer
 *                         description: Hour 5
 *                       HOUR6:
 *                         type: integer
 *                         description: Hour 6
 *                       HOUR7:
 *                         type: integer
 *                         description: Hour 7
 *                       HOUR8:
 *                         type: integer
 *                         description: Hour 8
 *                       HOUR9:
 *                         type: integer
 *                         description: Hour 9
 *                       HOUR10:
 *                         type: integer
 *                         description: Hour 10
 *                       HOUR11:
 *                         type: integer
 *                         description: Hour 11
 *                       target:
 *                         type: string
 *                         description: Target
 *                       remark:
 *                         type: string
 *                         description: Remark
 *                       waste:
 *                         type: string
 *                         description: Waste
 *                       hour_loss:
 *                         type: string
 *                         description: Hour loss
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                       time_stamp:
 *                         type: string
 *                         description: Timestamp
 *                       mon:
 *                         type: string
 *                         description: Month
 *                       operator_id:
 *                         type: string
 *                         description: Operator ID
 *                       date:
 *                         type: string
 *                         description: Date
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       section_name:
 *                         type: string
 *                         description: Section name
 *                       operator_name:
 *                         type: string
 *                         description: Operator name
 *                 date:
 *                   type: string
 *                   description: Current date
 *                 operatorname:
 *                   type: string
 *                   description: Operator name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */




// Define the route for the gettodayworkerefficiencyreportData API
app.post('/gettodayworkerefficiencyreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  let whereConditions = [];
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  var currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
 // console.log("MJ" + currentDate);
  //currentDate = "22-06-2023";
  whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);

  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }
  const whereClause = whereConditions.join(' AND ');

  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift,
   worker_timesheet.line
   `;

   const results = await executeQuery(connection, query);

   const data = {
       timesheet: results,
       date: currentDate,
       operatorname: results.length > 0 ? results[0].operator_name : null
   };

   res.json(data);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});



/**
 * @swagger
 * /getworkerefficiencyreportData:
 *   post:
 *     summary: Get worker efficiency report data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "126"
 *                 description: Product ID
 *               line_no:
 *                 type: string
 *                 example: "1"
 *                 description: Line number
 *               section_id:
 *                 type: string
 *                 example: "1"
 *                 description: Section ID
 *               worker_id:
 *                 type: string
 *                 example: "Entry Id"
 *                 description: Worker ID
 *               shift:
 *                 type: string
 *                 example: "8"
 *                 description: Shift
 *               search:
 *                 type: string
 *                 example: "5"
 *                 description: Search criteria
 *               userid:
 *                 type: string
 *                 example: "11"
 *                 description: User ID
 *               roleid:
 *                 type: string
 *                 example: "6"
 *                 description: Role ID
 *               fromdate:
 *                 type: string
 *                 example: "2022-01-01"
 *                 description: From date
 *               todate:
 *                 type: string
 *                 example: "2022-01-31"
 *                 description: To date
 *     responses:
 *       200:
 *         description: Successful response with worker efficiency report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID
 *                       product_name:
 *                         type: string
 *                         description: Product name
 *                       line:
 *                         type: string
 *                         description: Line number
 *                       section:
 *                         type: string
 *                         description: Section ID
 *                       worker:
 *                         type: string
 *                         description: Worker ID
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       HOUR1:
 *                         type: integer
 *                         description: Hour 1
 *                       HOUR2:
 *                         type: integer
 *                         description: Hour 2
 *                       HOUR3:
 *                         type: integer
 *                         description: Hour 3
 *                       HOUR4:
 *                         type: integer
 *                         description: Hour 4
 *                       HOUR5:
 *                         type: integer
 *                         description: Hour 5
 *                       HOUR6:
 *                         type: integer
 *                         description: Hour 6
 *                       HOUR7:
 *                         type: integer
 *                         description: Hour 7
 *                       HOUR8:
 *                         type: integer
 *                         description: Hour 8
 *                       HOUR9:
 *                         type: integer
 *                         description: Hour 9
 *                       HOUR10:
 *                         type: integer
 *                         description: Hour 10
 *                       HOUR11:
 *                         type: integer
 *                         description: Hour 11
 *                       target:
 *                         type: string
 *                         description: Target
 *                       remark:
 *                         type: string
 *                         description: Remark
 *                       waste:
 *                         type: string
 *                         description: Waste
 *                       hour_loss:
 *                         type: string
 *                         description: Hour loss
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                       time_stamp:
 *                         type: string
 *                         description: Timestamp
 *                       mon:
 *                         type: string
 *                         description: Month
 *                       operator_id:
 *                         type: string
 *                         description: Operator ID
 *                       date:
 *                         type: string
 *                         description: Date
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       section_name:
 *                         type: string
 *                         description: Section name
 *                       operator_name:
 *                         type: string
 *                         description: Operator name
 *                 title:
 *                   type: string
 *                   description: Title
 *                 product:
 *                   type: string
 *                   description: Product name
 *                 line:
 *                   type: string
 *                   description: Line number
 *                 worker:
 *                   type: string
 *                   description: Worker ID
 *                 section:
 *                   type: string
 *                   description: Section ID
 *                 operatorname:
 *                   type: string
 *                   description: Operator name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */






// Define the route for the getworkerefficiencyreportData API
app.post('/getworkerefficiencyreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var product_name = req.body.product_id;
 var line_no = req.body.line_no;
  var section = req.body.section_id;
  var worker = req.body.worker_id;
  var shift = req.body.shift;
  const search = req.body.search;
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  var title = '';

  // console.log("search :",search);
  // console.log("product_name :",product_name);
  // console.log("line_no :",line_no);
  // console.log("section :",section);
  // console.log("worker :",worker);
  // console.log("shift :",shift);


  var fd;
  var td;
  let whereConditions = [];
  const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
  const currentMonth = dateUtils.getCurrentMonth();
  const currentYear = dateUtils.getCurrentYear();
  const currentMonthYear = dateUtils.getCurrentMonthYear();

  //console.log("current date",newcurrentDate1);

  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }
  
  if (product_name !== '') {
    whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
  }
  if (line_no !== '') {
    whereConditions.push(`worker_timesheet.line = '${line_no}'`);
  }
  if (section !== '') {
    whereConditions.push(`worker_timesheet.section = '${section}'`);
  }
  if (worker !== '') {
    whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
  }
  if (shift !== '') {
    whereConditions.push(`worker_timesheet.shift = '${shift}'`);
  }


  if (search === '5') {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  } else if (search === '1') {
    const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
    const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
     const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
     const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
    whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);

  } else if (search === '2') {
    title = `MONTH ${currentMonthYear}`;
    whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
  } else if (search === '3') {
    title = `YEAR ${currentYear}`;
     whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);

  } else if (search === '4') {


const fromdate = req.body.fromdate;
const todate = req.body.todate;
const newfromdate1 = fromdate;
const newtodate1 = todate;
const formattedFromm = dateUtils.convertDateFormat(fromdate, 'DD-MM-YYYY', 'YYYY-MM-DD');
const formattedToo = dateUtils.convertDateFormat(todate, 'DD-MM-YYYY', 'YYYY-MM-DD');
const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);


//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
title = `DATE ${newfromdate1}`;
} else {
whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
title = `FROM ${newfromdate1} TO ${newtodate1} `;
}


    fd=newfromdate1;
    td=newtodate1;
  }else{
    
  }







  const whereClause = whereConditions.join(' AND ');

//console.log(whereClause);
  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift,
   worker_timesheet.line
   `;



         const results = await executeQuery(connection, query);

        const data = {
            timesheet: results,
            title: title,
            product: product_name,
            line: line_no,
            worker: worker,
            fdate: fd,
            tdate: td,
            section: section,
            operatorname: results.length > 0 ? results[0].operator_name : null
        };

        res.json(data);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getsupervisorefficiencyreportData:
 *   post:
 *     summary: Get supervisor efficiency report data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Product ID
 *               section_id:
 *                 type: string
 *                 description: Section ID
 *               shift:
 *                 type: string
 *                 description: Shift
 *               worker_id:
 *                 type: string
 *                 description: Worker ID
 *               line_no:
 *                 type: string
 *                 description: Line number
 *               search:
 *                 type: string
 *                 description: Search criteria
 *               fromdate:
 *                 type: string
 *                 format: date
 *                 description: Start date
 *               todate:
 *                 type: string
 *                 format: date
 *                 description: End date
 *               userid:
 *                 type: string
 *                 description: User ID
 *               roleid:
 *                 type: string
 *                 description: Role ID
 *     responses:
 *       200:
 *         description: Successful response with supervisor efficiency report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID
 *                       product_name:
 *                         type: string
 *                         description: Product name
 *                       line:
 *                         type: string
 *                         description: Line number
 *                       section:
 *                         type: string
 *                         description: Section ID
 *                       worker:
 *                         type: string
 *                         description: Worker ID
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       HOUR1:
 *                         type: integer
 *                         description: Hour 1
 *                       HOUR2:
 *                         type: integer
 *                         description: Hour 2
 *                       HOUR3:
 *                         type: integer
 *                         description: Hour 3
 *                       HOUR4:
 *                         type: integer
 *                         description: Hour 4
 *                       HOUR5:
 *                         type: integer
 *                         description: Hour 5
 *                       HOUR6:
 *                         type: integer
 *                         description: Hour 6
 *                       HOUR7:
 *                         type: integer
 *                         description: Hour 7
 *                       HOUR8:
 *                         type: integer
 *                         description: Hour 8
 *                       HOUR9:
 *                         type: integer
 *                         description: Hour 9
 *                       HOUR10:
 *                         type: integer
 *                         description: Hour 10
 *                       HOUR11:
 *                         type: integer
 *                         description: Hour 11
 *                       target:
 *                         type: string
 *                         description: Target
 *                       remark:
 *                         type: string
 *                         description: Remark
 *                       waste:
 *                         type: string
 *                         description: Waste
 *                       hour_loss:
 *                         type: string
 *                         description: Hour loss
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                       time_stamp:
 *                         type: string
 *                         description: Timestamp
 *                       mon:
 *                         type: string
 *                         description: Month
 *                       operator_id:
 *                         type: string
 *                         description: Operator ID
 *                       date:
 *                         type: string
 *                         description: Date
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       section_name:
 *                         type: string
 *                         description: Section name
 *                       operator_name:
 *                         type: string
 *                         description: Operator name
 *                       entryid:
 *                         type: string
 *                         description: Entry ID
 *                       comp:
 *                         type: integer
 *                         description: Comp
 *                       tt:
 *                         type: integer
 *                         description: Total
 *                 title:
 *                   type: string
 *                   description: Title of the report
 *                 date:
 *                   type: string
 *                   description: Current date
 *                 fdate:
 *                   type: string
 *                   description: Start date
 *                 tdate:
 *                   type: string
 *                   description: End date
 *                 section:
 *                   type: string
 *                   description: Section ID
 *                 operatorname:
 *                   type: string
 *                   description: Operator name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */




// Define the route for the getsupervisorefficiencyreportData API
app.post('/getsupervisorefficiencyreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const product = req.body.product_id;
  const section = req.body.section_id;
  const shift = req.body.shift;
  const worker = req.body.worker_id;
  const line = req.body.line_no;
  const search = req.body.search;
  const fromdate = req.body.fromdate;
  const todate = req.body.todate;

  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
   var title = '';
  //console.log("search",search);

  var fd;
  var td;
  var newfd;
  var newtd;

  if (fromdate && todate !== undefined) {

    fd = dateUtils.convertDateFormat(fromdate, 'DD-MM-YYYY', 'YYYY-MM-DD');
    td = dateUtils.convertDateFormat(todate, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const fd2 = dateUtils.convertToUnixTimestamp(fd);
    const td1 = dateUtils.convertToUnixTimestamp(td);
    newfd = fd2;
    newtd = td1;
  }
  let whereConditions = [];

  const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
  //newcurrentDate1 = "22-06-2023";
  const mon = dateUtils.getCurrentMonthYear();
  //const mon = "06-2023";
  const year = dateUtils.getCurrentYear();




  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }


  if (search === '5') {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  }
  else if (search === '1') {


   const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
   const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
    const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
    const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
    const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
    const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
    whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}'`);
  }
  else if (search === '2') {
    title = `MONTH ${mon}`;
    whereConditions.push(`worker_timesheet.mon = '${mon}'`);
  }
  else if (search === '4') {
    const formattedFrom = req.body.fromdate;
    const formattedTo = req.body.todate;
    
    const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
    const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);


//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
title = `DATE ${formattedFrom}`;
} else {
whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
title = `FROM ${formattedFrom} TO ${formattedTo} `;
}
  }
  // else if (fromdate && todate !== undefined) {
  //   whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${newfd}' AND '${newtd}'`);
  // }
  else {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  }



  if (product !== undefined && product !== '') {
    whereConditions.push(`worker_timesheet.product_name = '${product}'`);
  }
  if (line !== undefined && line !== '') {
    whereConditions.push(`worker_timesheet.line = '${line}'`);
  }
  if (section !== undefined && section !== '') {
    whereConditions.push(`worker_timesheet.section = '${section}'`);
  }
  if (shift !== undefined && shift !== '') {
    whereConditions.push(`worker_timesheet.shift = '${shift}'`);
  }
  if (worker !== undefined && worker !== '') {
    whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
  }




  const whereClause = whereConditions.join(' AND ');
 // console.log(whereClause);

  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   geopos_users.name AS operator_name,
   geopos_users.entryid,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.line,
   worker_timesheet.product_name,
   worker_timesheet.section,
   worker_timesheet.shift
   `;


  const results = await executeQuery(connection, query);

  const data = {
    timesheet: results,
    title: title,
    date: newcurrentDate1,
    fdate: fd,
    tdate: td,
    section: section,
    operatorname: results.length > 0 ? results[0].operator_name : null
  };

  res.json(data);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getsectionwiseefficiencyreportData:
 *   post:
 *     summary: Get section-wise efficiency report data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Product ID
 *               section_id:
 *                 type: string
 *                 description: Section ID
 *               category:
 *                 type: string
 *                 description: Category
 *               worker_id:
 *                 type: string
 *                 description: Worker ID
 *               search:
 *                 type: string
 *                 description: Search criteria
 *               fromdate:
 *                 type: string
 *                 format: date
 *                 description: Start date
 *               todate:
 *                 type: string
 *                 format: date
 *                 description: End date
 *               userid:
 *                 type: string
 *                 description: User ID
 *               roleid:
 *                 type: string
 *                 description: Role ID
 *     responses:
 *       200:
 *         description: Successful response with section-wise efficiency report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID
 *                       product_name:
 *                         type: string
 *                         description: Product name
 *                       line:
 *                         type: string
 *                         description: Line number
 *                       section:
 *                         type: string
 *                         description: Section ID
 *                       worker:
 *                         type: string
 *                         description: Worker ID
 *                       entry_id:
 *                         type: string
 *                         description: Entry ID
 *                       shift:
 *                         type: string
 *                         description: Shift
 *                       HOUR1:
 *                         type: integer
 *                         description: Hour 1
 *                       HOUR2:
 *                         type: integer
 *                         description: Hour 2
 *                       HOUR3:
 *                         type: integer
 *                         description: Hour 3
 *                       HOUR4:
 *                         type: integer
 *                         description: Hour 4
 *                       HOUR5:
 *                         type: integer
 *                         description: Hour 5
 *                       HOUR6:
 *                         type: integer
 *                         description: Hour 6
 *                       HOUR7:
 *                         type: integer
 *                         description: Hour 7
 *                       HOUR8:
 *                         type: integer
 *                         description: Hour 8
 *                       HOUR9:
 *                         type: integer
 *                         description: Hour 9
 *                       HOUR10:
 *                         type: integer
 *                         description: Hour 10
 *                       HOUR11:
 *                         type: integer
 *                         description: Hour 11
 *                       target:
 *                         type: string
 *                         description: Target
 *                       remark:
 *                         type: string
 *                         description: Remark
 *                       waste:
 *                         type: string
 *                         description: Waste
 *                       hour_loss:
 *                         type: string
 *                         description: Hour loss
 *                       date_time:
 *                         type: string
 *                         description: Date and time
 *                       time_stamp:
 *                         type: string
 *                         description: Timestamp
 *                       mon:
 *                         type: string
 *                         description: Month
 *                       operator_id:
 *                         type: string
 *                         description: Operator ID
 *                       date:
 *                         type: string
 *                         description: Date
 *                       item_description:
 *                         type: string
 *                         description: Description of the item
 *                       section_name:
 *                         type: string
 *                         description: Section name
 *                       category_name:
 *                         type: string
 *                         description: Category name
 *                       comp:
 *                         type: integer
 *                         description: Comp
 *                       tt:
 *                         type: integer
 *                         description: Total
 *                 date:
 *                   type: string
 *                   description: Current date
 *                 title:
 *                   type: string
 *                   description: Title of the report
 *                 section:
 *                   type: string
 *                   description: Section ID
 *                 operatorname:
 *                   type: string
 *                   description: Operator name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */
                 

// Define the route for the getsectionwiseefficiencyreportData API
app.post('/getsectionwiseefficiencyreportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const product = req.body.product_id;
  const section = req.body.section_id;
  const category = req.body.category;
  const worker = req.body.worker_id;
  const search = req.body.search;
  const fromdate = req.body.fromdate;
  const todate = req.body.todate;
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  var title = '';
  var fd;
  var td;
  var newfd;
  var newtd;

  if (fromdate && todate !== undefined) {
    fd = dateUtils.convertDateFormat(fromdate, 'DD-MM-YYYY', 'YYYY-MM-DD');
    td = dateUtils.convertDateFormat(todate, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const fd2 = dateUtils.convertToUnixTimestamp(fd);
    const td1 = dateUtils.convertToUnixTimestamp(td);
    newfd = fd2;
    newtd = td1;
  }
  let whereConditions = [];
  const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
  //newcurrentDate1 = "22-06-2023";
  const mon = dateUtils.getCurrentMonthYear();
  //const mon = "06-2023";
  const year = dateUtils.getCurrentYear();


  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }


  if (search === '5') {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  }
  else if (search === '1') {
    const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
    const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
     const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
     const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
    whereConditions.push(`worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}'`);
  }
  else if (search === '2') {
        title = `MONTH ${mon}`;
    whereConditions.push(`worker_timesheet.mon = '${mon}'`);
  }
  else if (search === '4') {
    const formattedFrom = req.body.fromdate;
    const formattedTo = req.body.todate;
    
    const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
    const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);
//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
  title = `DATE ${formattedFrom}`;
whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
} else {
whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
title = `FROM ${formattedFrom} TO ${formattedTo} `;
}
  }
  else {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  }



  if (product !== undefined && product !== '') {
    whereConditions.push(`worker_timesheet.product_name = '${product}'`);
  }
  if (section !== undefined && section !== '') {
    whereConditions.push(`worker_timesheet.section = '${section}'`);
  }
  if (category !== undefined && category !== '') {
    whereConditions.push(`item_masterr.category_id = '${category}'`);
  }
  if (worker !== undefined && worker !== '') {
    whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
  }


  const whereClause = whereConditions.join(' AND ');

  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,
   item_category.category_name,
   SUM(worker_timesheet.HOUR1+worker_timesheet.HOUR2+worker_timesheet.HOUR3+worker_timesheet.HOUR4+worker_timesheet.HOUR5+worker_timesheet.HOUR6+worker_timesheet.HOUR7+worker_timesheet.HOUR8+worker_timesheet.HOUR9+worker_timesheet.HOUR10+worker_timesheet.HOUR11) as comp,
   count(*) as tt
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN item_category ON item_category.id = item_masterr.category_id
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.product_name,
   worker_timesheet.section
   `;
 // console.log(query);



  const results = await executeQuery(connection, query);

  const data = {
    timesheet: results,
    date: newcurrentDate1,
    title:title,
    fdate: fd,
    tdate: td,
    section: section,
    operatorname: results.length > 0 ? results[0].operator_name : null
  };

  res.json(data);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /getproductivityreportdirectly:
 *   post:
 *     summary: Get productivity report data based on filters
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: integer
 *                 description: User ID of the operator
 *                 example: 123
 *               roleid:
 *                 type: integer
 *                 description: Role ID of the user
 *                 example: 3
 *     responses:
 *       200:
 *         description: Successful response with productivity report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pro:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       sec:
 *                         type: string
 *                         example: "C.C.P"
 *                       iku:
 *                         type: string
 *                         example: "remark1,remark2,"
 *                       worker:
 *                         type: string
 *                         example: "Adelaide Fernando Langa"
 *                       entry_id:
 *                         type: string
 *                         example: "759"
 *                       shift:
 *                         type: string
 *                         example: "11"
 *                       reg:
 *                         type: string
 *                         example: "11/01/2016"
 *                       numberDays:
 *                         type: integer
 *                         example: 1234
 *                       target:
 *                         type: number
 *                         example: 962.50
 *                       sum:
 *                         type: number
 *                         example: 519
 *                       eff:
 *                         type: number
 *                         example: 53.89
 *                       date_time:
 *                         type: string
 *                         example: "03-06-2024"
 *                       name:
 *                         type: string
 *                         example: "Aniceto Carlos Dairamo"
 *                       single:
 *                         type: string
 *                         example: "0"
 *                 date:
 *                   type: string
 *                   example: "03-06-2024"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getProductivityReportDirectly
 * @description Get productivity report data based on filters
 * @memberof module:routes/reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



app.post('/getproductivityreportdirectly',authenticateJWT, async (req, res) => {
  const responseproductivitydirectdata = []; 
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  let connection;
try{

    connection = await getPoolConnection();
    const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
    const currentMonth = dateUtils.getCurrentMonth();
    const currentYear = dateUtils.getCurrentYear();
    const currentMonthYear = dateUtils.getCurrentMonthYear();


    let whereConditions = [];
   // console.log("MJ" + currentDate);
    //currentDate = "22-06-2023";
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  
    if (roleId == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
    }
    const whereClause = whereConditions.join(' AND ');

  const selectQuery = `
  SELECT worker_timesheet.*, count(*) as cnt, item_masterr.item_description, section.section_name, employees_moz.joindate,geopos_users.name
  FROM worker_timesheet
  LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
  LEFT JOIN section ON worker_timesheet.section = section.id
  LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
  LEFT JOIN geopos_users ON worker_timesheet.operator_id = geopos_users.id
  WHERE ${whereClause}
  GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.shift
  HAVING cnt = 1
`;

// Use the modified query method
const categoriesResult = await executeQuery(connection,selectQuery);


    const categories = categoriesResult && categoriesResult.length > 0 ? categoriesResult : [];

    const response = categories.map(async (item) => {

      let count = 0;
      for (let i = 1; i <= 11; i++) {
        let str = `HOUR${i}`;
        if (item[str] > 0) {
          count++;
        }
      }
      
      const cntt = count;


      var pro = item.item_description;
      var sec = item.section_name;
      let value_sum=item.HOUR1+item.HOUR2+item.HOUR3+item.HOUR4+item.HOUR5+item.HOUR6+item.HOUR7+item.HOUR8+item.HOUR9+item.HOUR10+item.HOUR11;
      const remark = item.remark;
      const ik = remark.split(",");
      let iku ='';
      ik.forEach(q => {
      //  console.log(q);
      if (q.trim() !== '' && q.trim() !== ' ') {
        iku += q + ',';
      }
      
      });

// Assuming $item is an object with a "joindate" property


const reg = item.joindate;
const date_time_str = item.date_time;
 const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
 const date_time = dateUtils.convertDateFormat(date_time_str, 'DD-MM-YYYY', 'YYYY-MM-DD');
  const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');


const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee,date_time) : '';



let effi=(value_sum/item.target)*100;
let eff=effi.toFixed(2);


      return {
        pro:pro,
        sec:sec,
        iku:iku,
        worker:item.worker,
        entry_id:item.entry_id,
        shift:item.shift,
        reg:reg,
        numberDays:numberDaysInt,
        target:item.target,
        sum:value_sum,
        eff:eff,
        date_time:item.date_time,
        name:item.name,
        single:"0"
      };
    });

    let responseData = await Promise.all(response);


    const queryy = `
    SELECT *, entry_id
    FROM worker_timesheet
    WHERE date_time = ?
    GROUP BY entry_id, date_time, shift
    HAVING count(entry_id) > 1
  `;
  const checkmulti = await executeQuery(connection,queryy, [newcurrentDate1]);
  const multi = checkmulti && checkmulti.length > 0 ? checkmulti : [];
      const responset = multi.map(async (employee) => {
   
        const queryy1 = `SELECT worker_timesheet.*,employees_moz.name,employees_moz.entryid,employees_moz.workertype,employees_moz.shift,employees_moz.joindate,item_masterr.item_description,section.section_name,geopos_users.name
        FROM worker_timesheet
        LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
        LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
        LEFT JOIN section ON worker_timesheet.section = section.id
        LEFT JOIN geopos_users ON worker_timesheet.operator_id = geopos_users.id
        WHERE worker_timesheet.date_time = ? AND worker_timesheet.entry_id = ?
        GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.shift,worker_timesheet.product_name,worker_timesheet.section`;
        let section='';
        let product='';
        let line='';
        let value_sum=0;
        let totalTarget=0;
        const currentDateg = dateUtils.getCurrentDate("YYYY-MM-DD"); // Current date
        let joinDateg = '';
        let regg='';
        let numberDaysIntg = '';
        let name='';
        const checkmultiple = await executeQuery(connection,queryy1, [newcurrentDate1,employee.entry_id]);
        const multiple = checkmultiple && checkmultiple.length > 0 ? checkmultiple : [];
            const responsemulti = multiple.map(async (row) => {
              section += row.section_name + ',';
              product += row.item_description+ ',';
              line += row.line.join + ',';
            
              value_sum += row.HOUR1+row.HOUR2+row.HOUR3+row.HOUR4+row.HOUR5+row.HOUR6+row.HOUR7+row.HOUR8+row.HOUR9+row.HOUR10+row.HOUR11;
            
              let count = 0;
              for (let i = 1; i <= 11; i++) {
                let str = `HOUR${i}`;
                if (row[str] > 0) {
                  count++;
                }
              }

           
      
            
              totalTarget += parseFloat((row.target/ 8) * count);
           
        
               regg = row.joindate;
               joinDateg = dateUtils.convertDateFormat(regg, 'DD/MM/YYYY', 'YYYY-MM-DD');
               numberDaysIntg = joinDateg ? dateUtils.getDifferenceInDays(joinDateg,currentDateg) : '';
              name= row.name;

            })

            let effi=(value_sum/totalTarget)*100;
let eff=effi.toFixed(2);
          
            const remark = employee.remark;
            const ik = remark.split(",");
            let iku ='';
            ik.forEach(q => {
            //  console.log(q);
            if (q.trim() !== '' && q.trim() !== ' ') {
              iku += q + ',';
            }
            
            });
            return {
              pro:product,
        sec:section,
        iku:iku,
        worker:employee.worker,
        entry_id:employee.entry_id,
        shift:employee.shift,
        reg:regg,
        numberDays:numberDaysIntg,
        target:totalTarget,
        sum:value_sum,
        eff:eff,
        date_time:employee.date_time,
        name:name,
              single:"1"
            };
          })


          // responseData = await Promise.all(responset);

          responseData = [...responseData, ...await Promise.all(responset)];


  
          responseproductivitydirectdata.push({
      timesheet: responseData,
      date: newcurrentDate1,
    });

  //   console.log("response", responseData.length);
    // console.log("item_count_all", item_count_all);
    res.send(responseproductivitydirectdata);
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    //res.status(500).json({ error: 'Internal Server Error' });
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
      // console.log("connection released");
    }
  }
});



/**
 * @swagger
 * /getproductivityreport:
 *   post:
 *     summary: Get productivity report data based on filters
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: Product ID
 *                 example: "126"
 *               line_no:
 *                 type: string
 *                 description: Line number
 *                 example: "1"
 *               section_id:
 *                 type: string
 *                 description: Section ID
 *                 example: "27"
 *               worker_id:
 *                 type: string
 *                 description: Worker ID
 *                 example: "759"
 *               shift:
 *                 type: string
 *                 description: Shift
 *                 example: "11"
 *               search:
 *                 type: string
 *                 description: Search type
 *                 example: "5"
 *               fromdate:
 *                 type: string
 *                 description: Start date for custom search
 *                 example: "03-06-2024"
 *               todate:
 *                 type: string
 *                 description: End date for custom search
 *                 example: "03-06-2024"
 *               userid:
 *                 type: integer
 *                 description: User ID of the operator
 *                 example: 123
 *               roleid:
 *                 type: integer
 *                 description: Role ID of the user
 *                 example: 3
 *     responses:
 *       200:
 *         description: Successful response with productivity report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheett:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pro:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       sec:
 *                         type: string
 *                         example: "C.C.P"
 *                       iku:
 *                         type: string
 *                         example: "remark1,remark2,"
 *                       worker:
 *                         type: string
 *                         example: "Adelaide Fernando Langa"
 *                       entry_id:
 *                         type: string
 *                         example: "759"
 *                       shift:
 *                         type: string
 *                         example: "11"
 *                       reg:
 *                         type: string
 *                         example: "11/01/2016"
 *                       numberDays:
 *                         type: integer
 *                         example: 1234
 *                       target:
 *                         type: number
 *                         example: 962.50
 *                       sum:
 *                         type: number
 *                         example: 519
 *                       eff:
 *                         type: number
 *                         example: 53.89
 *                       date_time:
 *                         type: string
 *                         example: "03-06-2024"
 *                       name:
 *                         type: string
 *                         example: "Aniceto Carlos Dairamo"
 *                       single:
 *                         type: string
 *                         example: "0"
 *                 title:
 *                   type: string
 *                   example: "Date 03-06-2024"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getProductivityReport
 * @description Get productivity report data based on filters
 * @memberof module:routes/reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//done

  app.post('/getproductivityreport',authenticateJWT, async (req, res) => {
    const responseproductivitysearcheddata = []; 
    let connection;
    try{
    
        connection = await getPoolConnection();
 
  var product_name = req.body.product_id;
  var line_no = req.body.line_no;
   var section = req.body.section_id;
   var worker = req.body.worker_id;
   var shift = req.body.shift;
   const search = req.body.search;
   const operatorId = req.body.userid;
   const roleId = req.body.roleid;
  //  console.log("product_name:",product_name);
  //  console.log("line_no:",line_no);
  //  console.log("section:",section);
  //  console.log("worker:",worker);
  //  console.log("shift:",shift);
  //  console.log("search:",search);

   var title = '';
   let whereConditions = [];
   const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
   const currentMonth = dateUtils.getCurrentMonth();
   const currentYear = dateUtils.getCurrentYear();
   const currentMonthYear = dateUtils.getCurrentMonthYear();
 
   console.log("current date",newcurrentDate1);

   if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }

   if (product_name !== '') {
     whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
   }
   if (line_no !== '') {
     whereConditions.push(`worker_timesheet.line = '${line_no}'`);
   }
   if (section !== '') {
     whereConditions.push(`worker_timesheet.section = '${section}'`);
   }
   if (worker !== '') {
     whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
   }
   if (shift !== '') {
     whereConditions.push(`worker_timesheet.shift = '${shift}'`);
   }
   if (search === '5') {
    title = `Date ${newcurrentDate1}`;
     whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
   } else if (search === '1') {

    const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
    const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
     const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
     const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
     whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);
 
   } else if (search === '2') {
    title = `MONTH ${currentMonthYear}`;
     whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
   } else if (search === '3') {
    title = `YEAR ${currentYear}`;
      whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);
 
   } else if (search === '4') {

    const formattedFrom = req.body.fromdate;
    const formattedTo = req.body.todate;
    
    const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
    const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);
//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
  title = `DATE ${formattedFrom}`;
whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
} else {
  title = `FROM ${formattedFrom} TO ${formattedTo} `;
whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
}
     
   }
   const whereClause = whereConditions.join(' AND ');

  //console.log("Where :",whereClause);

 const queryt = `SELECT worker_timesheet.*,item_masterr.item_description,section.section_name,worker_timesheet.date_time as dttm,employees_moz.joindate,working_days.days,geopos_users.name
FROM worker_timesheet
LEFT JOIN item_masterr  ON worker_timesheet.product_name = item_masterr.id
LEFT JOIN section ON worker_timesheet.section = section.id
LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
LEFT JOIN geopos_users ON worker_timesheet.operator_id = geopos_users.id
LEFT JOIN working_days ON working_days.month_year = worker_timesheet.mon
WHERE ${whereClause}
GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section,worker_timesheet.shift,worker_timesheet.mon`;


// Use the modified query method
const categoriesResult = await executeQuery(connection, queryt);


    const categories = categoriesResult && categoriesResult.length > 0 ? categoriesResult : [];
//console.log(categories);

    const response = categories.map(async (item) => {


      let count = 0;
      for (let i = 1; i <= 11; i++) {
        let str = `HOUR${i}`;
        if (item[str] > 0) {
          count++;
        }
      }
      
      const cntt = count;


      var pro = item.item_description;
      var sec = item.section_name;
      let value_sum=item.HOUR1+item.HOUR2+item.HOUR3+item.HOUR4+item.HOUR5+item.HOUR6+item.HOUR7+item.HOUR8+item.HOUR9+item.HOUR10+item.HOUR11;
      const remark = item.remark;
      const ik = remark.split(",");
      let iku ='';
      ik.forEach(q => {
      //  console.log(q);
      if (q.trim() !== '' && q.trim() !== ' ') {
        iku += q + ',';
      }
      
      });

// Assuming $item is an object with a "joindate" property

const reg = item.joindate;
const date_time_str = item.date_time;
 const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
 const date_time = dateUtils.convertDateFormat(date_time_str, 'DD-MM-YYYY', 'YYYY-MM-DD');
  const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');


const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee,date_time) : '';

let effi=(value_sum/item.target)*100;
let eff=effi.toFixed(2);



      return {
        pro:pro,
        sec:sec,
        iku:iku,
        worker:item.worker,
        entry_id:item.entry_id,
        shift:item.shift,
        reg:reg,
        numberDays:numberDaysInt,
        target:item.target,
        sum:value_sum,
        eff:eff,
        date_time:item.date_time,
        name:item.name,
        single:"0"
      };
    });

    let responseData = await Promise.all(response);

    //console.log(responseData);

    responseproductivitysearcheddata.push({
      timesheett: responseData,
      title: title,
    });

res.send(responseproductivitysearcheddata);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getfgoutputreport:
 *   post:
 *     summary: Get FG output report data.
 *     description: Retrieves finished goods (FG) output report data based on various filters such as user ID, role ID, and date.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: integer
 *                 description: The ID of the user.
 *               roleid:
 *                 type: integer
 *                 description: The ID of the role.
 *               fromdate:
 *                 type: string
 *                 format: date
 *                 example: "2022-05-30"
 *                 description: The start date for filtering.
 *     responses:
 *       200:
 *         description: FG output report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the FG detail.
 *                       product_name:
 *                         type: string
 *                         description: Name of the product.
 *                       product_code:
 *                         type: string
 *                         description: Code of the product.
 *                       fg_output:
 *                         type: integer
 *                         description: FG output.
 *                       date_time:
 *                         type: string
 *                         format: date
 *                         description: Date of the FG output.
 *                       item_product_name:
 *                         type: string
 *                         description: Description of the product from item master.
 *                       item_groups:
 *                         type: string
 *                         description: Product code from item code.
 *                       item_group_product_des:
 *                         type: string
 *                         description: Product description from item code.
 *                       rowCount:
 *                         type: integer
 *                         description: Number of entries in worker timesheet.
 *                       rew:
 *                         type: string
 *                         description: Reward calculated based on FG output.
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Current date (if no date provided in request).
 *                 fdate:
 *                   type: string
 *                   format: date
 *                   description: Date from the request body (if provided).
 *                 title:
 *                   type: string
 *                   description: Title of the report.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getFgOutputReport
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */




//FG Output Report
app.post('/getfgoutputreport', authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    if (req.body) {
      const operatorId = req.body.userid;
      const roleId = req.body.roleid;
      const fromdateParam = req.body.fromdate;
      console.log(fromdateParam);
      var title = '';
      var newcd;
      var newfd;
      const whereConditions = [];
      const groupby = [];
      var datecompare;

      if (roleId == 3) {
        whereConditions.push(`fg.user = '${operatorId}'`);
      }

      if (fromdateParam !== undefined) {
        const newfromdate1 = fromdateParam;
        newfd = newfromdate1;
        datecompare = newfromdate1;
        title = `Date ${newfromdate1}`;
        whereConditions.push(`fg.date_time = '${newfromdate1}'`);
        groupby.push(`fg.product_code`);
      } else {
        const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
        newcd = newcurrentDate1;
        datecompare = newcurrentDate1;
        title = `Date ${newcurrentDate1}`;
        whereConditions.push(`fg.date_time = '${newcurrentDate1}'`);
        groupby.push(`fg.product_name`);
      }

      const whereClause = whereConditions.join(' AND ');
//console.log("whereClause:",whereClause);

      const query = `
        SELECT fg.*, SUM(fg.fg_output) AS tar
        FROM 
        fg_details AS fg
        WHERE 
        ${whereClause}
        GROUP BY 
        ${groupby}
      `;

      const results = await executeQuery(connection, query);

      //console.log("results:",results);

      const modifiedResults = [];
   

      if (results.length > 0) {
        for (const result of results) {
          const queryItemMasterr = `
            SELECT *
            FROM item_masterr
            WHERE 
            id = '${result.product_name}'
          `;
          const resultItemMasterr = await executeQuery(connection, queryItemMasterr);
          result.item_product_name = resultItemMasterr[0] ? resultItemMasterr[0].item_description : '';

          const queryItemCode = `
            SELECT *
            FROM item_code
            WHERE 
            id = '${result.product_code}'
          `;
          const resultItemCode = await executeQuery(connection, queryItemCode);
          result.item_groups = resultItemCode[0] ? resultItemCode[0].product_code : '';
          result.item_group_product_des = resultItemCode[0] ? resultItemCode[0].product_des : '';

          const query2 = `
            SELECT *
            FROM worker_timesheet
            WHERE 
            date_time = '${datecompare}'
            AND product_name = '${result.product_name}'
            GROUP BY 
            entry_id,
            product_name, 
            time_stamp
          `;
          const result2 = await executeQuery(connection, query2);

          const rowCount = result2.length;
          const tar = result.tar || 0;
          const rew = rowCount !== 0 ? tar / rowCount : 0;
          let formattedRew;
          if (rowCount !== 0) {
            formattedRew = rew.toFixed(2);
          } else {
            formattedRew = '0';
          }
          const rewardToSend = formattedRew === "Infinity" ? '0' : formattedRew;
          result.rowCount = rowCount;
          result.rew = rewardToSend;
        }
      }
      const response = {
        timesheet: results,
        date: newcd,
        fdate: newfd,
        title: title
      };
//console.log("response:",response);
      res.json(response);
    } else {
      res.send('No data received');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getdefaultperformanceefficiency:
 *   post:
 *     summary: Get default performance efficiency data
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: integer
 *                 description: User ID of the operator
 *                 example: 123
 *               roleid:
 *                 type: integer
 *                 description: Role ID of the user
 *                 example: 3
 *     responses:
 *       200:
 *         description: Successful response with default performance efficiency data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 33
 *                       product_name:
 *                         type: string
 *                         example: "126"
 *                       line:
 *                         type: string
 *                         example: "1"
 *                       section:
 *                         type: string
 *                         example: "27"
 *                       worker:
 *                         type: string
 *                         example: "Zena Joao Velinho"
 *                       entry_id:
 *                         type: string
 *                         example: "759"
 *                       shift:
 *                         type: string
 *                         example: "11"
 *                       HOUR1:
 *                         type: integer
 *                         example: 289
 *                       HOUR2:
 *                         type: integer
 *                         example: 100
 *                       HOUR3:
 *                         type: integer
 *                         example: 130
 *                       HOUR4:
 *                         type: integer
 *                         example: 0
 *                       HOUR5:
 *                         type: integer
 *                         example: 0
 *                       HOUR6:
 *                         type: integer
 *                         example: 0
 *                       HOUR7:
 *                         type: integer
 *                         example: 0
 *                       HOUR8:
 *                         type: integer
 *                         example: 0
 *                       HOUR9:
 *                         type: integer
 *                         example: 0
 *                       HOUR10:
 *                         type: integer
 *                         example: 0
 *                       HOUR11:
 *                         type: integer
 *                         example: 0
 *                       target:
 *                         type: string
 *                         example: "962.5000"
 *                       remark:
 *                         type: string
 *                         example: " , , ,,,,,,,,,,,,,"
 *                       waste:
 *                         type: string
 *                         example: "5.23,0.12,,,,,,,,,,,,,,"
 *                       hour_loss:
 *                         type: string
 *                         example: ""
 *                       date_time:
 *                         type: string
 *                         example: "03-06-2024"
 *                       time_stamp:
 *                         type: string
 *                         example: "1709071200"
 *                       mon:
 *                         type: string
 *                         example: "02-2024"
 *                       operator_id:
 *                         type: string
 *                         example: "11"
 *                       date:
 *                         type: string
 *                         example: "2024-02-28T12:36:15.000Z"
 *                       item_description:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       section_name:
 *                         type: string
 *                         example: "C.C.P"
 *                       joindate:
 *                         type: string
 *                         example: "01/02/2006"
 *                       dttm:
 *                         type: string
 *                         example: "03-06-2024"
 *                 date:
 *                   type: string
 *                   example: "03-06-2024"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getDefaultPerformanceEfficiency
 * @description Get default performance efficiency data
 * @memberof module:routes/performance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */



//getdefaultperformanceefficiency
app.post('/getdefaultperformanceefficiency',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
    const operatorId = req.body.userid;
    const roleId = req.body.roleid;
  const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
  const currentMonth = dateUtils.getCurrentMonth();
  const currentYear = dateUtils.getCurrentYear();
  const currentMonthYear = dateUtils.getCurrentMonthYear();
     const whereConditions = [];

     if (roleId == 3) {
      whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
    }
  whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
  const whereClause = whereConditions.join(' AND ');
  const query = `SELECT worker_timesheet.*, item_masterr.item_description , section.section_name,employees_moz.joindate,worker_timesheet.date_time as dttm
             FROM worker_timesheet
             LEFT JOIN item_masterr  ON worker_timesheet.product_name = item_masterr.id
             LEFT JOIN section ON worker_timesheet.section = section.id
             LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
             WHERE ${whereClause}
             GROUP BY worker_timesheet.line,worker_timesheet.entry_id,worker_timesheet.product_name,worker_timesheet.section`;
      

  // db.query(query, (error, results) => {
    

  //   if (error) {
  //     console.error('Error executing query:', error);
  //     res.status(500).json({ error: 'An error occurred' });
  //     return;
  //   }
  const results = await executeQuery(connection, query);

// Append the tar value to the results object
const response = {
  timesheet: results,
  date: newcurrentDate1,
};

// Return the response object
res.send(response);
    //console.log(response);
 
//});
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getperformanceefficiencyreport:
 *   post:
 *     summary: Get Performance Efficiency Report
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromdate:
 *                 type: string
 *                 example: "01-01-2024"
 *               todate:
 *                 type: string
 *                 example: "01-01-2024"
 *               userid:
 *                 type: integer
 *                 description: User ID of the operator
 *               roleid:
 *                 type: integer
 *                 description: Role ID of the user
 *     responses:
 *       200:
 *         description: Successful response with performance efficiency report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processedResult:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       worker:
 *                         type: string
 *                         example: "Adelaide Fernando Langa"
 *                       entry_id:
 *                         type: string
 *                         example: "1001"
 *                       joindate:
 *                         type: string
 *                         example: "11/01/2016"
 *                       item_description:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       section_name:
 *                         type: string
 *                         example: "C.C.P"
 *                       target:
 *                         type: string
 *                         example: "962.5000"
 *                       day1:
 *                         type: string
 *                         example: "53.92%"
 *                 indexcolumn:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: integer
 *                 newfromdate1:
 *                   type: string
 *                   example: "01-01-2024"
 *                   description: Formatted start date for the report
 *                 newtodate1:
 *                   type: string
 *                   example: "01-01-2024"
 *                   description: Formatted end date for the report
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getPerformanceEfficiencyReport
 * @description Get performance efficiency report
 * @memberof module:routes/performance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */






app.post('/getperformanceefficiencyreport',authenticateJWT, async (req, res) => {
// Get timestamps for manual dates
let connection;
try{

    connection = await getPoolConnection();
const { fromdate, todate,userid,roleid } = req.body;

if (!fromdate || !todate) {
  res.status(400).json({ error: 'Invalid date range provided' });
  return;
}
const fromdatee = fromdate;
const todatee = todate;
console.log("fromdatee:",fromdatee);
console.log("todatee:",todatee);
const fromdateFormatted = dateUtils.convertDateFormat(fromdatee, 'DD-MM-YYYY', 'YYYY-MM-DD');
const todateFormatted = dateUtils.convertDateFormat(todatee, 'DD-MM-YYYY', 'YYYY-MM-DD');
const newfromdate1 = fromdate;
const newtodate1 = todate;


const timestampfromdate = dateUtils.convertToUnixTimestamp(fromdateFormatted);
const timestamptodate = dateUtils.convertToUnixTimestamp(todateFormatted);

console.log("timestamptodate:",timestamptodate);
   const whereConditions = [];



  whereConditions.push(
    `(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}')`
  );
  if (roleid == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${userid}'`);
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm, employees_moz.joindate
                 FROM worker_timesheet
                 LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
                 LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
                 LEFT JOIN section ON worker_timesheet.section = section.id
                 WHERE ${whereClause}
                 GROUP BY worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section,worker_timesheet.line`;

  const query2 = `SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm
                 FROM worker_timesheet
                 LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
                 LEFT JOIN section ON worker_timesheet.section = section.id
                 WHERE ${whereClause}
                 GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section,worker_timesheet.line`;

  // Declare indexcolumn here

  const results = await executeQuery(connection, query);
  const results2 = await executeQuery(connection, query2);

  const processedResult = results.map((result) => {
      const ard = [];
      const arr = [];

      results2.forEach((itemk) => {
          const valueSum1 = itemk['HOUR1'] + itemk['HOUR2'] + itemk['HOUR3'] + itemk['HOUR4'] + itemk['HOUR5'] + itemk['HOUR6'] + itemk['HOUR7'] + itemk['HOUR8'] + itemk['HOUR9'] + itemk['HOUR10'] + itemk['HOUR11'];
          const efficiency = (valueSum1 / itemk['target']) * 100;
          const formattedEfficiency = efficiency.toFixed(2) + '%';
          const dent = `${itemk['date_time']}-${itemk['entry_id']}-${itemk['product_name']}-${itemk['section']}`;
          ard.push(dent);
          arr.push(formattedEfficiency);
      });

      const processedRow = {
          worker: result.worker,
          entry_id: result.entry_id,
          joindate: result.joindate,
          item_description: result.item_description,
          section_name: result.section_name,
          target: result.target,
      };

      const begin = fromdateFormatted;
      const end = todateFormatted;

      const datesBetween = dateUtils.getDatesBetween(begin, end, 'YYYY-MM-DD', 'DD-MM-YYYY');

      let index = 0;
      const indexcolumn = [];
      datesBetween.forEach(date => {
          const ky = ard.indexOf(`${date}-${result.entry_id}-${result.product_name}-${result.section}`);
          processedRow[`day${index + 1}`] = ky !== -1 ? arr[ky] : '-';
          index++;
          indexcolumn.push(index);
      });

      return { processedRow, indexcolumn };
  });

  const response = {
      processedResult: processedResult.map((row) => row.processedRow),
      indexcolumn: processedResult.map((row) => row.indexcolumn),
      newfromdate1: fromdate,
      newtodate1: todate,
  };

  res.json(response);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getperformanceoverviewreport:
 *   post:
 *     summary: Get performance overview report.
 *     description: Retrieves performance overview report data based on the specified criteria.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: The ID of the product.
 *               section_id:
 *                 type: string
 *                 description: The ID of the section.
 *               worker_id:
 *                 type: string
 *                 description: The ID of the worker.
 *               shift:
 *                 type: string
 *                 description: The shift information.
 *               search:
 *                 type: string
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: The search criteria.
 *               userid:
 *                 type: string
 *                 description: The user ID.
 *               roleid:
 *                 type: string
 *                 description: The role ID.
 *               fromdate:
 *                 type: string
 *                 format: date
 *                 description: The start date for the search.
 *               todate:
 *                 type: string
 *                 format: date
 *                 description: The end date for the search.
 *     responses:
 *       200:
 *         description: Performance overview report data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       remark:
 *                         type: string
 *                         description: Remarks.
 *                       worker:
 *                         type: string
 *                         description: The worker's name.
 *                       entry_id:
 *                         type: string
 *                         description: The entry ID.
 *                       shift:
 *                         type: string
 *                         description: The shift information.
 *                       reg:
 *                         type: string
 *                         description: The join date of the worker.
 *                       numberDaysInt:
 *                         type: integer
 *                         description: Number of days.
 *                       target:
 *                         type: string
 *                         description: The target value.
 *                       hr:
 *                         type: integer
 *                         description: Hour count.
 *                       tar:
 *                         type: number
 *                         description: Target value based on shift and hour count.
 *                       sum:
 *                         type: number
 *                         description: Sum of hours worked.
 *                       eff:
 *                         type: string
 *                         description: Efficiency percentage.
 *                       days:
 *                         type: integer
 *                         description: Number of working days.
 *                       present:
 *                         type: integer
 *                         description: Number of days present.
 *                       abs:
 *                         type: integer
 *                         description: Number of days absent.
 *                       per:
 *                         type: string
 *                         description: Percentage of presence.
 *                       bcolor:
 *                         type: string
 *                         description: Background color code.
 *                       color:
 *                         type: string
 *                         description: Text color code.
 *                       performance:
 *                         type: string
 *                         description: Performance percentage.
 *                       date_time:
 *                         type: string
 *                         description: The date and time.
 *                       single:
 *                         type: string
 *                         description: Indicator for single entry.
 *                 title:
 *                   type: string
 *                   description: Title for the report.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getPerformanceOverviewReport
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */




app.post('/getperformanceoverviewreport', authenticateJWT, async (req, res) => {
  const responseperoversearcheddata = [];
  let connection;
  try {
      connection = await getPoolConnection();

      var product_name = req.body.product_id;
      var section = req.body.section_id;
      var worker = req.body.worker_id;
      var shift = req.body.shift;
      const search = req.body.search;
      const operatorId = req.body.userid;
      const roleId = req.body.roleid;
      var title = '';

      let whereConditions = [];
      const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
      const currentMonth = dateUtils.getCurrentMonth();
      const currentYear = dateUtils.getCurrentYear();
      const currentMonthYear = dateUtils.getCurrentMonthYear();
      if (roleId == 3) {
          whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
      }

      if (product_name !== '') {
          whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
      }
      if (section !== '') {
          whereConditions.push(`worker_timesheet.section = '${section}'`);
      }
      if (worker !== '') {
          whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
      }
      if (shift !== '') {
          whereConditions.push(`worker_timesheet.shift = '${shift}'`);
      }
      if (search === '5') {
          title = `Date ${newcurrentDate1}`;
          whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
      } else if (search === '1') {
          const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
          const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
          const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
          const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
          const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
          const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

          title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
          whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);
      } else if (search === '2') {
          title = `MONTH ${currentMonthYear}`;
          whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
      } else if (search === '3') {
          title = `YEAR ${currentYear}`;
          whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);
      } else if (search === '4') {
          const formattedFrom = req.body.fromdate;
          const formattedTo = req.body.todate;
          const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
          const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
          const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
          const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);
          if (timestampfromdate === timestamptodate || timestamptodate === '') {
              title = `DATE ${formattedFrom}`;
              whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
          } else {
              title = `FROM ${formattedFrom} TO ${formattedTo} `;
              whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
          }
      }

      const whereClause = whereConditions.join(' AND ');

      const queryt = `
          SELECT worker_timesheet.*, item_masterr.item_description, section.section_name, worker_timesheet.date_time as dttm, employees_moz.joindate, working_days.days
          FROM worker_timesheet
          LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
          LEFT JOIN section ON worker_timesheet.section = section.id
          LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
          LEFT JOIN working_days ON worker_timesheet.mon = working_days.month_year
          WHERE ${whereClause}
          GROUP BY worker_timesheet.entry_id, worker_timesheet.product_name, worker_timesheet.section, worker_timesheet.line
      `;
      const checkmulti = await executeQuery(connection, queryt);
      const multi = checkmulti && checkmulti.length > 0 ? checkmulti : [];
      const responset = multi.map(async (item) => {
          let count = 0;
          for (let i = 1; i <= 11; i++) {
              let str = `HOUR${i}`;
              if (item[str] > 0) {
                  count++;
              }
          }
          const cntt = count;
          const queryy = `
              SELECT COUNT(id)
              FROM worker_timesheet
              WHERE worker_timesheet.entry_id = '${item.entry_id}' 
              AND worker_timesheet.mon = '${currentMonthYear}'
              GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id
          `;
          const checkmultiple = await executeQuery(connection, queryy);
          const present = checkmultiple && checkmultiple.length > 0 ? checkmultiple.length : 0;
          const remark = item.remark;
          const ik = remark.split(",");
          let iku = '';
          ik.forEach(q => {
              if (q.trim() !== '' && q.trim() !== ' ') {
                  iku += q + ',';
              }
          });
          var pro = item.item_description;
          var sec = item.section_name;
          let value_sum = item.HOUR1 + item.HOUR2 + item.HOUR3 + item.HOUR4 + item.HOUR5 + item.HOUR6 + item.HOUR7 + item.HOUR8 + item.HOUR9 + item.HOUR10 + item.HOUR11;

          const reg = item.joindate;
          const date_time_str = item.date_time;
          const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
          const date_time = dateUtils.convertDateFormat(date_time_str, 'DD-MM-YYYY', 'YYYY-MM-DD');
          const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');
          const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee, date_time) : '';
          const tar = (item.target / item.shift) * cntt;
          let effi = (value_sum / item.target) * 100;
          let eff = effi.toFixed(2);
          const days = item.days;
          const abs = days - present;
          let perr = (present / days) * 100;
          let per = perr.toFixed(2);
          let performancee = (per * eff) / 100;
          let bcolor = '';
          let color = '';
          if (performancee > 100) {
              bcolor = "#7b1fa2";
              color = "white";
          } else if (performancee >= 90 && performancee <= 100) {
              bcolor = "#00796b";
              color = "white";
          } else if (performancee >= 75 && performancee < 90) {
              bcolor = "gray";
              color = "white";
          } else if (performancee >= 60 && performancee <= 75) {
              bcolor = "yellow";
              color = "black";
          } else {
              bcolor = "red";
              color = "white";
          }
          let performance = performancee.toFixed(2);
          return {
              remark: iku,
              worker: item.worker,
              entry_id: item.entry_id,
              shift: item.shift,
              reg: reg,
              numberDaysInt: numberDaysInt,
              target: item.target,
              hr: cntt,
              tar: tar,
              sum: value_sum,
              eff: eff,
              days: days,
              present: present,
              abs: abs,
              per: per,
              bcolor: bcolor,
              color: color,
              performance: performance,
              date_time: item.date_time,
              single: "0"
          };
      });

      let responseData = await Promise.all(responset);
      responseperoversearcheddata.push({
          timesheet: responseData,
          title: title,
      });
      res.send(responseperoversearcheddata);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getdefaultperformanceoverview:
 *   post:
 *     summary: Get default performance overview.
 *     description: Retrieves default performance overview data based on the specified criteria.
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: The ID of the user.
 *               roleid:
 *                 type: string
 *                 description: The ID of the role.
 *     responses:
 *       200:
 *         description: Default performance overview data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       remark:
 *                         type: string
 *                         description: Remarks.
 *                       worker:
 *                         type: string
 *                         description: The worker's name.
 *                       entry_id:
 *                         type: string
 *                         description: The entry ID.
 *                       shift:
 *                         type: string
 *                         description: The shift information.
 *                       reg:
 *                         type: string
 *                         description: The join date of the worker.
 *                       numberDaysInt:
 *                         type: integer
 *                         description: Number of days since join date.
 *                       target:
 *                         type: string
 *                         description: The total target value.
 *                       hr:
 *                         type: integer
 *                         description: Hour count.
 *                       tar:
 *                         type: number
 *                         description: Target value based on shift and hour count.
 *                       sum:
 *                         type: number
 *                         description: Sum of hours worked.
 *                       eff:
 *                         type: string
 *                         description: Efficiency percentage.
 *                       days:
 *                         type: integer
 *                         description: Number of working days in the current month.
 *                       present:
 *                         type: integer
 *                         description: Number of days present in the current month.
 *                       abs:
 *                         type: integer
 *                         description: Number of days absent in the current month.
 *                       per:
 *                         type: string
 *                         description: Percentage of presence in the current month.
 *                       bcolor:
 *                         type: string
 *                         description: Background color code based on performance.
 *                       color:
 *                         type: string
 *                         description: Text color code.
 *                       performance:
 *                         type: string
 *                         description: Performance percentage.
 *                       date_time:
 *                         type: string
 *                         description: The date and time.
 *                       single:
 *                         type: string
 *                         description: Indicator for single entry.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getDefaultPerformanceOverview
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


 
app.post('/getdefaultperformanceoverview',authenticateJWT, async (req, res) => {

  const responseperoverdefaultdata = [];
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  let connection;
  try{
  
      connection = await getPoolConnection();

const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
const currentMonth = dateUtils.getCurrentMonth();
const currentYear = dateUtils.getCurrentYear();
const currentMonthYear = dateUtils.getCurrentMonthYear();
   const whereConditions = [];
whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}'`);
if (roleId == 3) {
  whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
}
const whereClause = whereConditions.join(' AND ');

const queryt = `
  SELECT 
    worker_timesheet.*, 
    COUNT(*) as cnt, 
    item_masterr.item_description, 
    section.section_name, 
    worker_timesheet.date_time as dttm, 
    employees_moz.joindate, 
    working_days.days
  FROM worker_timesheet
  LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
  LEFT JOIN section ON worker_timesheet.section = section.id
  LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
  LEFT JOIN working_days ON worker_timesheet.mon = working_days.month_year
  WHERE ${whereClause}
  GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id, worker_timesheet.shift
  HAVING cnt = 1`;


  const checkmulti = await executeQuery(connection,queryt);
  const multi = checkmulti && checkmulti.length > 0 ? checkmulti : [];

      const responset = multi.map(async (item) => {



    let count = 0;
    for (let i = 1; i <= 11; i++) {
      let str = `HOUR${i}`;
      if (item[str] > 0) {
        count++;
      }
    }
    
    const cntt = count;

    const queryy = `
      SELECT COUNT(id)
      FROM worker_timesheet
      WHERE worker_timesheet.entry_id = '${item.entry_id}' 
      AND worker_timesheet.mon = '${currentMonthYear}'
      GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id
    `;

    const checkmultiple = await executeQuery(connection,queryy);
    const prt = checkmultiple && checkmultiple.length > 0 ? checkmultiple : [];
    const present = checkmultiple.length;
    const remark = item.remark;
    const ik = remark.split(",");
    let iku ='';
    ik.forEach(q => {
    //  console.log(q);
    if (q.trim() !== '' && q.trim() !== ' ') {
      iku += q + ',';
    }
    
    });

    var pro = item.item_description;
    var sec = item.section_name;
    let value_sum=item.HOUR1+item.HOUR2+item.HOUR3+item.HOUR4+item.HOUR5+item.HOUR6+item.HOUR7+item.HOUR8+item.HOUR9+item.HOUR10+item.HOUR11;


    const reg = item.joindate;
    const currentDate = item.date_time;
     const joinDate = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'DD/MM/YYYY');
     const date_time = dateUtils.convertDateFormat(currentDate, 'DD-MM-YYYY', 'YYYY-MM-DD');
      const joinDatee = dateUtils.convertDateFormat(reg, 'DD/MM/YYYY', 'YYYY-MM-DD');
    
    
    const numberDaysInt = joinDatee ? dateUtils.getDifferenceInDays(joinDatee,date_time) : '';
    

const tar =(item.target/item.shift)*cntt;


// Assuming $item is an object with a "joindate" property

let effi=(value_sum/item.target)*100;
let eff=effi.toFixed(2);
const days =item.days;
const abs =days-present;
let perr=(present/days)*100;
let per=perr.toFixed(2);

let performancee=(per*eff)/100;
let bcolor='';
let color='';
if(performancee > '100'){
bcolor="#7b1fa2";
color="white";
}else if(performancee >= '90' && performancee <= '100'){
bcolor="#00796b";
color="white";
}
else if(performancee >= '75' && performancee < '90'){
 bcolor="gray";
  color="white";
}
else if(performancee >= '60' && performancee <= '75'){
 bcolor="yellow";
  color="black";
}else{
 bcolor="red";
  color="white";
}
let performance=performancee.toFixed(2);



    return {
      remark: iku,
      worker: item.worker,
      entry_id: item.entry_id,
      shift: item.shift,
      reg:reg,
      numberDaysInt:numberDaysInt,
      target: item.target,
       hr:cntt,
       tar:tar,
       sum:value_sum,
       eff:eff,
       days:days,
       present: present,
       abs:abs,
       per:per,
       bcolor:bcolor,
       color:color,
       performance:performance,
       date_time: item.date_time,
        single:"0"
      };

});


let responseData = await Promise.all(responset);


const queryyl = `
SELECT *, entry_id
FROM worker_timesheet
WHERE date_time = ?
GROUP BY entry_id, date_time, shift
HAVING count(entry_id) > 1
`;
const checkmultil = await executeQuery(connection,queryyl, [newcurrentDate1]);
const multil = checkmultil && checkmultil.length > 0 ? checkmultil : [];
  const responseto = multil.map(async (employee) => {

    

    const queryy1 = `SELECT worker_timesheet.*,employees_moz.name,employees_moz.entryid,employees_moz.workertype,employees_moz.shift,employees_moz.joindate,item_masterr.item_description,section.section_name,geopos_users.name,working_days.days
    FROM worker_timesheet
    LEFT JOIN employees_moz ON worker_timesheet.entry_id = employees_moz.entryid
    LEFT JOIN item_masterr ON worker_timesheet.product_name = item_masterr.id
    LEFT JOIN section ON worker_timesheet.section = section.id
    LEFT JOIN geopos_users ON worker_timesheet.operator_id = geopos_users.id
    LEFT JOIN working_days ON worker_timesheet.mon = working_days.month_year
    WHERE worker_timesheet.date_time = ? AND worker_timesheet.entry_id = ?
    GROUP BY worker_timesheet.date_time,worker_timesheet.entry_id,worker_timesheet.shift,worker_timesheet.product_name,worker_timesheet.section`;
    let section='';
    let product='';
    let line='';
    let value_sum=0;
    let totalTarget=0;
    let totalTarget1=0;
    let cnt=0;
    const currentDateg = dateUtils.getCurrentDate("YYYY-MM-DD"); // Current date
    let joinDateg = '';
    let regg='';
    let numberDaysIntg = '';
    var days;
    const checkmultiple = await executeQuery(connection,queryy1, [newcurrentDate1,employee.entry_id]);
    const multiple = checkmultiple && checkmultiple.length > 0 ? checkmultiple : [];
        const responsemulti = multiple.map(async (row) => {
          section += row.section_name + ',';
          product += row.item_description+ ',';
          line += row.line.join + ',';
        
           value_sum += row.HOUR1+row.HOUR2+row.HOUR3+row.HOUR4+row.HOUR5+row.HOUR6+row.HOUR7+row.HOUR8+row.HOUR9+row.HOUR10+row.HOUR11;
        
          let count = 0;
          for (let i = 1; i <= 11; i++) {
            let str = `HOUR${i}`;
            if (row[str] > 0) {
              count++;
            }
          }

       
  
        
          totalTarget += parseFloat((row.target/ 8) * count);
          totalTarget1 += parseFloat(row.target);
          cnt += count;

           regg = row.joindate;
           joinDateg = dateUtils.convertDateFormat(regg, 'DD/MM/YYYY', 'YYYY-MM-DD');
           numberDaysIntg = joinDateg ? dateUtils.getDifferenceInDays(joinDateg,currentDateg) : '';

            days =row.days;


        })
        const queryo = `
        SELECT COUNT(id)
        FROM worker_timesheet
        WHERE worker_timesheet.entry_id = '${employee.entry_id}' 
        AND worker_timesheet.mon = '${currentMonthYear}'
        GROUP BY worker_timesheet.date_time, worker_timesheet.entry_id
      `;

      const checkmultipleo = await executeQuery(connection,queryo);
      const prt = checkmultipleo && checkmultipleo.length > 0 ? checkmultipleo : [];
      const present = checkmultipleo.length;
      let effi=(value_sum/totalTarget)*100;
      let eff=effi.toFixed(2);
 

      const abs =days-present;
      let perr=(present/days)*100;

       let per=perr.toFixed(2);
  
      
      let performancee=(per*eff)/100;
    
        let performance=performancee.toFixed(2);;
      
      let bcolor='';
      let color='';
      if(performancee > '100'){
       bcolor="#7b1fa2";
        color="white";
      }else if(performancee >= '90' && performancee <= '100'){
       bcolor="#00796b";
        color="white";
      }
      else if(performancee >= '75' && performancee < '90'){
         bcolor="gray";
          color="white";
      }
      else if(performancee >= '60' && performancee <= '75'){
         bcolor="yellow";
          color="black";
      }else{
         bcolor="red";
          color="white";
      }
      
  

return {
remark:'',
worker: employee.worker,
entry_id: employee.entry_id,
shift: employee.shift,
reg:regg,
numberDaysInt:numberDaysIntg,
target: totalTarget1,
 hr:cnt,
 tar:totalTarget,
 sum:value_sum,
 eff:eff,
 days:days,
 present: present,
 abs:abs,
 per:per,
 bcolor:bcolor,
 color:color,
 performance:performance,
 date_time: employee.date_time,
  single:"1"
};
      })


      // responseData = await Promise.all(responset);

      responseData = [...responseData, ...await Promise.all(responseto)];


//console.log(responseData);
responseperoverdefaultdata.push({
timesheet: responseData,

});

//  console.log("response", responseData);
// console.log("item_count_all", item_count_all);
res.send(responseperoverdefaultdata);
} catch (error) {
// Handle exceptions
console.error('Error:', error.message);
//res.status(500).json({ error: 'Internal Server Error' });
res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
// Release the connection back to the pool in case of success or error
if (connection) {
  connection.release();
  // console.log("connection released");
}
}
});
/**
 * @swagger
 * /gettodaywastereportData:
 *   post:
 *     summary: Get today's waste report data based on filters
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: integer
 *                 description: User ID of the operator
 *                 example: 123
 *               roleid:
 *                 type: integer
 *                 description: Role ID of the user
 *                 example: 3
 *     responses:
 *       200:
 *         description: Successful response with today's waste report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 33
 *                       product_name:
 *                         type: string
 *                         example: "126"
 *                       line:
 *                         type: string
 *                         example: "1"
 *                       section:
 *                         type: string
 *                         example: "27"
 *                       worker:
 *                         type: string
 *                         example: "Zena Joao Velinho"
 *                       entry_id:
 *                         type: string
 *                         example: "759"
 *                       shift:
 *                         type: string
 *                         example: "11"
 *                       HOUR1:
 *                         type: integer
 *                         example: 289
 *                       HOUR2:
 *                         type: integer
 *                         example: 100
 *                       HOUR3:
 *                         type: integer
 *                         example: 130
 *                       HOUR4:
 *                         type: integer
 *                         example: 0
 *                       HOUR5:
 *                         type: integer
 *                         example: 0
 *                       HOUR6:
 *                         type: integer
 *                         example: 0
 *                       HOUR7:
 *                         type: integer
 *                         example: 0
 *                       HOUR8:
 *                         type: integer
 *                         example: 0
 *                       HOUR9:
 *                         type: integer
 *                         example: 0
 *                       HOUR10:
 *                         type: integer
 *                         example: 0
 *                       HOUR11:
 *                         type: integer
 *                         example: 0
 *                       target:
 *                         type: string
 *                         example: "962.5000"
 *                       remark:
 *                         type: string
 *                         example: " , , ,,,,,,,,,,,,,"
 *                       waste:
 *                         type: string
 *                         example: "5.23,0.12,,,,,,,,,,,,,,"
 *                       hour_loss:
 *                         type: string
 *                         example: ""
 *                       date_time:
 *                         type: string
 *                         example: "03-06-2024"
 *                       time_stamp:
 *                         type: string
 *                         example: "1709071200"
 *                       mon:
 *                         type: string
 *                         example: "02-2024"
 *                       operator_id:
 *                         type: string
 *                         example: "11"
 *                       date:
 *                         type: string
 *                         example: "2024-02-28T12:36:15.000Z"
 *                       item_description:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       section_name:
 *                         type: string
 *                         example: "C.C.P"
 *                       category_name:
 *                         type: string
 *                         example: "BRAIDS"
 *                       name:
 *                         type: string
 *                         example: "Aniceto Carlos Dairamo"
 *                       joindate:
 *                         type: string
 *                         example: "01/02/2006"
 *                       expected_waste_percentage:
 *                         type: string
 *                         example: "10"
 *                       fiber:
 *                         type: string
 *                         example: "20"
 *                       expected_waste:
 *                         type: string
 *                         example: "11"
 *                 date:
 *                   type: string
 *                   example: "03-06-2024"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getTodayWasteReportData
 * @description Get today's waste report data based on filters
 * @memberof module:routes/waste
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */


// Define the route for the gettodayempreportData API
app.post('/gettodaywastereportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  let whereConditions = [];
  const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  var currentDate = dateUtils.getCurrentDate("DD-MM-YYYY");
 // console.log("MJ" + currentDate);
  //currentDate = "22-06-2023";
    //  worker_timesheet.*,
  //  item_masterr.item_description,
  //  section.section_name,
  //  geopos_users.name AS operator_name

  whereConditions.push(`worker_timesheet.date_time = '${currentDate}'`);
  whereConditions.push(`waste_master.date = '${currentDate}'`);
  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }
  const whereClause = whereConditions.join(' AND ');
//console.log(whereClause);
  const query = `
   SELECT worker_timesheet.*,item_masterr.item_description,section.section_name,item_category.category_name,geopos_users.name,employees_moz.joindate,waste_master.expected_waste_percentage,waste_master.fiber,waste_master.expected_waste
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
   LEFT JOIN item_category ON item_masterr.category_id = item_category.id
   LEFT JOIN employees_moz ON employees_moz.entryid = worker_timesheet.entry_id
   LEFT JOIN waste_master ON waste_master.product_id = worker_timesheet.product_name
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.date_time,
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section
   `;

   const results = await executeQuery(connection, query);
  // db.query(query, (error, results) => {
  //   if (error) {
  //     console.error('Error executing MySQL query: ', error);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   }


    //console.log(results);
    const data = {
      timesheet: results,
      date: currentDate,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);
//  });
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /getCategoryOptions:
 *   get:
 *     summary: Get category options.
 *     description: Retrieves all category options from the item_category table.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   category_name:
 *                     type: string
 *                     example: "Electronics"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getCategoryOptions
 * @memberof module:Routes/Data
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


//getsection
app.get('/getCategoryOptions',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  // Assuming you have a database connection and a table named 'item_code'
  // Perform a database query to fetch the data based on the itemId
  // Example query using MySQL:
  const query = `SELECT * FROM item_category`;
  const results = await executeQuery(connection, query);
  res.json(results);
  // Execute the query and handle the result

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getwastagereportData:
 *   post:
 *     summary: Get waste report data based on filters
 *     tags:
 *       - Report
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               worker_id:
 *                 type: string
 *               shift:
 *                 type: string
 *               category_id:
 *                 type: string
 *               search:
 *                 type: string
 *               fromdate:
 *                 type: string
 *               todate:
 *                 type: string
 *               userid:
 *                 type: integer
 *               roleid:
 *                 type: integer
 *             example:
 *               product_id: "42"
 *               worker_id: "Entryid"
 *               shift: "11"
 *               category_id: "1"
 *               search: "5"
 *               fromdate: "01-01-2024"
 *               todate: "01-01-2024"
 *               userid: 123
 *               roleid: 3
 *     responses:
 *       200:
 *         description: Successful response with waste report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       product_name:
 *                         type: string
 *                         example: "126"
 *                       line:
 *                         type: string
 *                         example: "1"
 *                       section:
 *                         type: string
 *                         example: "27"
 *                       worker:
 *                         type: string
 *                         example: "Adelaide Fernando Langa"
 *                       entry_id:
 *                         type: string
 *                         example: "1001"
 *                       shift:
 *                         type: string
 *                         example: "11"
 *                       HOUR1:
 *                         type: integer
 *                         example: 289
 *                       HOUR2:
 *                         type: integer
 *                         example: 100
 *                       HOUR3:
 *                         type: integer
 *                         example: 130
 *                       HOUR4:
 *                         type: integer
 *                         example: 0
 *                       HOUR5:
 *                         type: integer
 *                         example: 0
 *                       HOUR6:
 *                         type: integer
 *                         example: 0
 *                       HOUR7:
 *                         type: integer
 *                         example: 0
 *                       HOUR8:
 *                         type: integer
 *                         example: 0
 *                       HOUR9:
 *                         type: integer
 *                         example: 0
 *                       HOUR10:
 *                         type: integer
 *                         example: 0
 *                       HOUR11:
 *                         type: integer
 *                         example: 0
 *                       target:
 *                         type: string
 *                         example: "962.5000"
 *                       remark:
 *                         type: string
 *                         example: " , , ,,,,,,,,,,,,,"
 *                       waste:
 *                         type: string
 *                         example: "5.23,0.12,,,,,,,,,,,,,,"
 *                       hour_loss:
 *                         type: string
 *                         example: ""
 *                       date_time:
 *                         type: string
 *                         example: "03-06-2024"
 *                       time_stamp:
 *                         type: string
 *                         example: "1709071200"
 *                       mon:
 *                         type: string
 *                         example: "02-2024"
 *                       operator_id:
 *                         type: string
 *                         example: "11"
 *                       date:
 *                         type: string
 *                         example: "2024-02-28T12:36:14.000Z"
 *                       item_description:
 *                         type: string
 *                         example: "SUPER NATURAL LOOK"
 *                       section_name:
 *                         type: string
 *                         example: "C.C.P"
 *                       category_name:
 *                         type: string
 *                         example: "BRAIDS"
 *                       joindate:
 *                         type: string
 *                         example: "11/01/2016"
 *                       fiber:
 *                         type: string
 *                         example: "20"
 *                       expected_waste_percentage:
 *                         type: string
 *                         example: "10"
 *                       expected_waste:
 *                         type: string
 *                         example: "11"
 *                       name:
 *                         type: string
 *                         example: "Aniceto Carlos Dairamo"
 *                 product:
 *                   type: string
 *                   example: "126"
 *                 category:
 *                   type: string
 *                   example: "6"
 *                 title:
 *                   type: string
 *                   example: "Date 03-06-2024"
 *                 worker:
 *                   type: string
 *                   example: "1001"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred during login
 */

/**
 * @function
 * @name getWasteReportData
 * @description Get waste report data based on filters
 * @memberof module:routes/waste
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */

// Define the route for the getempreportData API
app.post('/getwastagereportData',authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var product_name = req.body.product_id;
//  var line_no = req.body.line_no;
//   var section = req.body.section_id;
  var worker = req.body.worker_id;
  var shift = req.body.shift;
  var category = req.body.category_id;
  const search = req.body.search;
   const operatorId = req.body.userid;
  const roleId = req.body.roleid;
  var title = '';
  // console.log("search :",search);
  // console.log("product_name :",product_name);
  // console.log("category_name :",category);
  // // console.log("line_no :",line_no);
  // // console.log("section :",section);
  // console.log("worker :",worker);
  // console.log("shift :",shift);


  var fd;
  var td;
  let whereConditions = [];
  const newcurrentDate1 =  dateUtils.getCurrentDate("DD-MM-YYYY");
  const currentMonth = dateUtils.getCurrentMonth();
  const currentYear = dateUtils.getCurrentYear();
  const currentMonthYear = dateUtils.getCurrentMonthYear();

  console.log("current date",newcurrentDate1);


  if (roleId == 3) {
    whereConditions.push(`worker_timesheet.operator_id = '${operatorId}'`);
  }

  
  if (product_name !== '') {
    whereConditions.push(`worker_timesheet.product_name = '${product_name}'`);
  }
  // if (line_no !== '') {
  //   whereConditions.push(`worker_timesheet.line = '${line_no}'`);
  // }
  // if (section !== '') {
  //   whereConditions.push(`worker_timesheet.section = '${section}'`);
  // }
   if (category !== '') {
     whereConditions.push(`item_masterr.category_id = '${category}'`);
    }
  if (worker !== '') {
    whereConditions.push(`worker_timesheet.entry_id = '${worker}'`);
  }
  if (shift !== '') {
    whereConditions.push(`worker_timesheet.shift = '${shift}'`);
  }


  if (search === '5') {
    title = `Date ${newcurrentDate1}`;
    whereConditions.push(`worker_timesheet.date_time = '${newcurrentDate1}' AND waste_master.date = '${newcurrentDate1}'`);
  } else if (search === '1') {
    const firstDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().startDate;
    const lastDayOfWeekk = dateUtils.getThisWeekStartDateAndEndDate().endDate;
     const formattedFirstDay = dateUtils.convertDateFormat(firstDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const formattedLastDay = dateUtils.convertDateFormat(lastDayOfWeekk, 'YYYY-MM-DD', 'DD-MM-YYYY');
     const timestampFromDate = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
     const timestampToDate = dateUtils.convertToUnixTimestamp(lastDayOfWeekk);

    title = `FROM ${formattedFirstDay} TO ${formattedLastDay} `;
    whereConditions.push(`((worker_timesheet.time_stamp BETWEEN '${timestampFromDate}' AND '${timestampToDate}') OR (worker_timesheet.time_stamp='${timestampFromDate}'))`);

  } else if (search === '2') {
    title = `MONTH ${currentMonthYear}`;
    whereConditions.push(`worker_timesheet.mon = '${currentMonthYear}'`);
  } else if (search === '3') {
    title = `YEAR ${currentYear}`;
     whereConditions.push(`substr(worker_timesheet.mon, 3)='${currentYear}'`);

  } else if (search === '4') {
    const formattedFrom = req.body.fromdate;
    const formattedTo = req.body.todate;
    
    const formattedFromm = dateUtils.convertDateFormat(formattedFrom, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const formattedToo = dateUtils.convertDateFormat(formattedTo, 'DD-MM-YYYY', 'YYYY-MM-DD');
    const timestampfromdate = dateUtils.convertToUnixTimestamp(formattedFromm);
    const timestamptodate = dateUtils.convertToUnixTimestamp(formattedToo);
//whereConditions.push(`(worker_timesheet.time_stamp BETWEEN '${timestampfromdate}' AND '${timestamptodate}') OR (worker_timesheet.time_stamp='${timestampfromdate}')`);
if (timestampfromdate === timestamptodate || timestamptodate === '') {
whereConditions.push(`worker_timesheet.time_stamp = '${timestampfromdate}'`);
title = `DATE ${formattedFrom}`;
} else {
whereConditions.push(`(worker_timesheet.time_stamp >= '${timestampfromdate}' AND worker_timesheet.time_stamp <= '${timestamptodate}')`);
title = `FROM ${formattedFrom} TO ${formattedTo} `;
}



    fd=formattedFrom;
    td=formattedTo;
  }

  const whereClause = whereConditions.join(' AND ');
//console.log(whereClause);
  const query = `
   SELECT
   worker_timesheet.*,
   item_masterr.item_description,
   section.section_name,item_category.category_name,employees_moz.joindate,waste_master.fiber,waste_master.expected_waste_percentage,waste_master.expected_waste,geopos_users.name
 FROM
   worker_timesheet
   LEFT JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
   LEFT JOIN section ON section.id = worker_timesheet.section
   LEFT JOIN geopos_users ON geopos_users.id = worker_timesheet.operator_id
   LEFT JOIN item_category ON item_masterr.category_id = item_category.id
   LEFT JOIN employees_moz ON employees_moz.entryid = worker_timesheet.entry_id
   LEFT JOIN waste_master ON waste_master.product_id = worker_timesheet.product_name
 WHERE
   ${whereClause}
 GROUP BY
   worker_timesheet.entry_id,
   worker_timesheet.product_name,
   worker_timesheet.section
   `;



  // db.query(query, (error, results) => {
  //   if (error) {
  //     console.error('Error executing MySQL query: ', error);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   }

  const results = await executeQuery(connection, query);

    const data = {
      timesheet: results,
      product: product_name,
      category: category,
     title: title,
      worker: worker,
      fdate: fd,
      tdate: td,
    //  section: section,
      operatorname: results.length > 0 ? results[0].operator_name : null
    };

    res.json(data);
 // });
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /uploadtimesheet:
 *   post:
 *     summary: Upload a timesheet file
 *     tags:
 *       - Import
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userfile:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file to upload
 *     responses:
 *       200:
 *         description: Successful response indicating data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The status of the operation
 *                   example: "Success"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Data processed successfully"
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Error message indicating no file was uploaded
 *                   example: "Error"
 *                 message:
 *                   type: string
 *                   description: No file uploaded
 *                   example: "No file uploaded"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Error"
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the upload process
 *                   example: "Internal Server Error"
 */


app.post('/uploadtimesheet', authenticateJWT, upload.single('userfile'), async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }
      const file = req.file;
      const filePath = file.path;
      const parser = csv({ delimiter: ',' });

      parser.on('data', async (record) => {
          try {
              // Your data processing logic goes here
              const { Entryid, Shift, Product, Line, Section, Target, HOUR1, HOUR2, HOUR3, HOUR4, HOUR5, HOUR6, HOUR7, HOUR8, HOUR9, HOUR10, HOUR11, Operator_entryid, 'Date(dd-mm-YYYY)': Date } = record;

              let parts = ['00', '00', '00']; // Default value for parts
              let monthYear = '00-00'; // Default value for monthYear
              let monthDayYear = '00-00-00';
              let timestampInSeconds = 0; // Default value for timestampInSeconds

              if (Date) {
                  const newcurrentDate1 = dateUtils.getCurrentDate("DD-MM-YYYY");
                  monthYear = dateUtils.getCurrentMonthYear();
                  monthDayYear = dateUtils.convertDateFormat(newcurrentDate1, 'DD-MM-YYYY', 'MM-DD-YYYY');
                  const firstDayOfWeekk = dateUtils.convertDateFormat(newcurrentDate1, 'DD-MM-YYYY', 'YYYY-MM-DD');
                  timestampInSeconds = dateUtils.convertToUnixTimestamp(firstDayOfWeekk);
              }

              const [itemResults, sectionResults, operatorResults, workerResults] = await Promise.all([
                  executeQuery(connection, `SELECT * FROM item_masterr WHERE item_description='${Product}'`),
                  executeQuery(connection, `SELECT * FROM section WHERE section_name='${Section}'`),
                  executeQuery(connection, `SELECT * FROM geopos_users WHERE entryid='${Operator_entryid}'`),
                  executeQuery(connection, `SELECT * FROM employees_moz WHERE entryid='${Entryid}'`)
              ]);

              const item = itemResults.length > 0 ? itemResults[0].id : '';
              const sectioncode = sectionResults.length > 0 ? sectionResults[0].id : '';
              const operatorcode = operatorResults.length > 0 ? operatorResults[0].id : '';
              const workercode = workerResults.length > 0 ? workerResults[0].name : '';

              const recordObject = {
                  entry_id: Entryid,
                  product_name: item,
                  section: sectioncode,
                  shift: Shift,
                  line: Line,
                  date_time: Date,
                  target: Target,
                  hour1: HOUR1,
                  hour2: HOUR2,
                  hour3: HOUR3,
                  hour4: HOUR4,
                  hour5: HOUR5,
                  hour6: HOUR6,
                  hour7: HOUR7,
                  hour8: HOUR8,
                  hour9: HOUR9,
                  hour10: HOUR10,
                  hour11: HOUR11,
                  time_stamp: timestampInSeconds,
                  mon: monthYear,
                  operator_id: operatorcode,
                  worker: workercode
              };

              // Database insert logic
              const workertimesheetquery = `SELECT * FROM worker_timesheet WHERE entry_id = '${Entryid}' AND product_name = '${item}' AND section = '${sectioncode}' AND shift = '${Shift}' AND line = '${Line}' AND date_time = '${Date}'`;

              const results = await executeQuery(connection, workertimesheetquery);
              if (results.length === 0) {
                  await executeQuery(connection, `INSERT INTO worker_timesheet (entry_id, product_name, section, shift, line, date_time, target, HOUR1, HOUR2, HOUR3, HOUR4, HOUR5, HOUR6, HOUR7, HOUR8, HOUR9, HOUR10, HOUR11, time_stamp, mon, operator_id ,worker) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, Object.values(recordObject));
              }
          } catch (error) {
              console.error('Error processing record:', error);
          }
      });

      parser.on('end', async () => {
          res.json({ status: 'Success', message: 'Data processed successfully' });
      });

      fs.createReadStream(filePath).pipe(parser);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /getvideo:
 *   get:
 *     summary: Get the latest video data
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the latest video data
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The filename of the latest video
 *       404:
 *         description: No video data found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No video data found"
 *                   description: Error message indicating no video data was found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 *                   description: Error message indicating an error occurred during the retrieval of video data
 */


app.get('/getvideo', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();

      // Execute the SQL query to fetch the latest video data
      const query = 'SELECT v_name FROM video_data ORDER BY id DESC LIMIT 1';
      const results = await executeQuery(connection, query);

      if (results.length > 0) {
          const videoname = results[0].v_name;
          res.json(videoname);
      } else {
          res.status(404).json({ error: 'No video data found' });
      }
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      // Release the connection back to the pool in case of success or error
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /gettvdisplaysection:
 *   get:
 *     summary: Get TV display section data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve section data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with TV display section data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sectionName:
 *                     type: string
 *                     description: The name of the section
 *                   sectionData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the entry
 *                         product_name:
 *                           type: string
 *                           description: The name of the product
 *                         line:
 *                           type: string
 *                           description: The line number
 *                         section:
 *                           type: string
 *                           description: The section ID
 *                         worker:
 *                           type: string
 *                           description: The name of the worker
 *                         entry_id:
 *                           type: string
 *                           description: The entry ID
 *                         shift:
 *                           type: string
 *                           description: The shift
 *                         HOUR1:
 *                           type: integer
 *                           description: The value for HOUR1
 *                         HOUR2:
 *                           type: integer
 *                           description: The value for HOUR2
 *                         HOUR3:
 *                           type: integer
 *                           description: The value for HOUR3
 *                         HOUR4:
 *                           type: integer
 *                           description: The value for HOUR4
 *                         HOUR5:
 *                           type: integer
 *                           description: The value for HOUR5
 *                         HOUR6:
 *                           type: integer
 *                           description: The value for HOUR6
 *                         HOUR7:
 *                           type: integer
 *                           description: The value for HOUR7
 *                         HOUR8:
 *                           type: integer
 *                           description: The value for HOUR8
 *                         HOUR9:
 *                           type: integer
 *                           description: The value for HOUR9
 *                         HOUR10:
 *                           type: integer
 *                           description: The value for HOUR10
 *                         HOUR11:
 *                           type: integer
 *                           description: The value for HOUR11
 *                         target:
 *                           type: string
 *                           description: The target value
 *                         remark:
 *                           type: string
 *                           description: Remarks
 *                         waste:
 *                           type: string
 *                           description: Waste data
 *                         hour_loss:
 *                           type: string
 *                           description: Hour loss data
 *                         date_time:
 *                           type: string
 *                           description: The date and time
 *                         time_stamp:
 *                           type: integer
 *                           description: The timestamp
 *                         mon:
 *                           type: string
 *                           description: The month and year
 *                         operator_id:
 *                           type: integer
 *                           description: The operator ID
 *                         date:
 *                           type: string
 *                           description: The date
 *                         value_sum:
 *                           type: string
 *                           description: The sum of all hours as a percentage
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of TV display section data
 */





//tv display
// get tv display top achievers
app.get('/gettvdisplaysection', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `
          SELECT worker_timesheet.section, worker_timesheet.operator_id, section.section_name
          FROM worker_timesheet
          INNER JOIN section ON worker_timesheet.section = section.id
          WHERE worker_timesheet.date_time = ? AND worker_timesheet.operator_id = ?
          GROUP BY worker_timesheet.section
      `;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      const modifiedResults = [];

      for (const result of results) {
          const query2 = `
              SELECT *, (HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11)/target AS value_sum
              FROM worker_timesheet
              WHERE date_time = ? AND section = ? AND operator_id = ?
              GROUP BY entry_id, product_name, line, section, date_time
              ORDER BY value_sum DESC LIMIT 5
          `;

          const result2 = await executeQuery(connection, query2, [dt, result.section, operatorId]);

          const modifiedResult2 = result2.map(workerData => ({
              ...workerData,
              value_sum: (workerData.value_sum * 100).toFixed(2),
          }));

          const sectionData = {
              sectionName: result.section_name,
              sectionData: modifiedResult2,
          };

          modifiedResults.push(sectionData);
      }

      res.json(modifiedResults);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /gettvdisplaybottomsection:
 *   get:
 *     summary: Get TV display bottom section data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve section data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with TV display bottom section data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sectionName:
 *                     type: string
 *                     description: The name of the section
 *                   sectionData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the entry
 *                         product_name:
 *                           type: string
 *                           description: The name of the product
 *                         line:
 *                           type: string
 *                           description: The line number
 *                         section:
 *                           type: string
 *                           description: The section ID
 *                         worker:
 *                           type: string
 *                           description: The name of the worker
 *                         entry_id:
 *                           type: string
 *                           description: The entry ID
 *                         shift:
 *                           type: string
 *                           description: The shift
 *                         HOUR1:
 *                           type: integer
 *                           description: The value for HOUR1
 *                         HOUR2:
 *                           type: integer
 *                           description: The value for HOUR2
 *                         HOUR3:
 *                           type: integer
 *                           description: The value for HOUR3
 *                         HOUR4:
 *                           type: integer
 *                           description: The value for HOUR4
 *                         HOUR5:
 *                           type: integer
 *                           description: The value for HOUR5
 *                         HOUR6:
 *                           type: integer
 *                           description: The value for HOUR6
 *                         HOUR7:
 *                           type: integer
 *                           description: The value for HOUR7
 *                         HOUR8:
 *                           type: integer
 *                           description: The value for HOUR8
 *                         HOUR9:
 *                           type: integer
 *                           description: The value for HOUR9
 *                         HOUR10:
 *                           type: integer
 *                           description: The value for HOUR10
 *                         HOUR11:
 *                           type: integer
 *                           description: The value for HOUR11
 *                         target:
 *                           type: string
 *                           description: The target value
 *                         remark:
 *                           type: string
 *                           description: Remarks
 *                         waste:
 *                           type: string
 *                           description: Waste data
 *                         hour_loss:
 *                           type: string
 *                           description: Hour loss data
 *                         date_time:
 *                           type: string
 *                           description: The date and time
 *                         time_stamp:
 *                           type: integer
 *                           description: The timestamp
 *                         mon:
 *                           type: string
 *                           description: The month and year
 *                         operator_id:
 *                           type: integer
 *                           description: The operator ID
 *                         date:
 *                           type: string
 *                           description: The date
 *                         value_sum:
 *                           type: string
 *                           description: The sum of all hours as a percentage
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of TV display bottom section data
 */



// get tv display bottom achievers
app.get('/gettvdisplaybottomsection', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `
          SELECT worker_timesheet.section, worker_timesheet.operator_id, section.section_name
          FROM worker_timesheet
          INNER JOIN section ON worker_timesheet.section = section.id
          WHERE worker_timesheet.date_time = ? AND worker_timesheet.operator_id = ?
          GROUP BY worker_timesheet.section
      `;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      const modifiedResults = [];

      for (const result of results) {
          const query2 = `
              SELECT *, (HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11)/target AS value_sum
              FROM worker_timesheet
              WHERE date_time = ? AND section = ? AND operator_id = ?
              GROUP BY entry_id, product_name, line, section, date_time
              ORDER BY value_sum ASC LIMIT 5
          `;

          const result2 = await executeQuery(connection, query2, [dt, result.section, operatorId]);

          const modifiedResult2 = result2.map(workerData => ({
              ...workerData,
              value_sum: (workerData.value_sum * 100).toFixed(2),
          }));

          const sectionData = {
              sectionName: result.section_name,
              sectionData: modifiedResult2,
          };

          modifiedResults.push(sectionData);
      }

      res.json(modifiedResults);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /getid:
 *   get:
 *     summary: Get worker timesheet information
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date and time for which the timesheet is requested
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with worker timesheet information
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "box"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of worker timesheet information
 */



app.get('/getid', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = 'SELECT * FROM worker_timesheet WHERE date_time = ? and operator_id = ? GROUP BY entry_id, product_name, line, section, date_time';
      const results = await executeQuery(connection, query, [dt, operatorId]);

      if (results.length > 16) {
          res.json('box');
      } else {
          res.json('');
      }
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getallachieversection:
 *   get:
 *     summary: Get all achiever sections data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve achiever section data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with achiever section data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the entry
 *                   product_name:
 *                     type: string
 *                     description: The name of the product
 *                   line:
 *                     type: string
 *                     description: The line number
 *                   section:
 *                     type: string
 *                     description: The section ID
 *                   worker:
 *                     type: string
 *                     description: The name of the worker
 *                   entry_id:
 *                     type: string
 *                     description: The entry ID
 *                   shift:
 *                     type: string
 *                     description: The shift
 *                   HOUR1:
 *                     type: integer
 *                     description: The value for HOUR1
 *                   HOUR2:
 *                     type: integer
 *                     description: The value for HOUR2
 *                   HOUR3:
 *                     type: integer
 *                     description: The value for HOUR3
 *                   HOUR4:
 *                     type: integer
 *                     description: The value for HOUR4
 *                   HOUR5:
 *                     type: integer
 *                     description: The value for HOUR5
 *                   HOUR6:
 *                     type: integer
 *                     description: The value for HOUR6
 *                   HOUR7:
 *                     type: integer
 *                     description: The value for HOUR7
 *                   HOUR8:
 *                     type: integer
 *                     description: The value for HOUR8
 *                   HOUR9:
 *                     type: integer
 *                     description: The value for HOUR9
 *                   HOUR10:
 *                     type: integer
 *                     description: The value for HOUR10
 *                   HOUR11:
 *                     type: integer
 *                     description: The value for HOUR11
 *                   target:
 *                     type: string
 *                     description: The target value
 *                   remark:
 *                     type: string
 *                     description: Remarks
 *                   waste:
 *                     type: string
 *                     description: Waste data
 *                   hour_loss:
 *                     type: string
 *                     description: Hour loss data
 *                   date_time:
 *                     type: string
 *                     description: The date and time
 *                   time_stamp:
 *                     type: string
 *                     description: The timestamp
 *                   mon:
 *                     type: string
 *                     description: The month and year
 *                   operator_id:
 *                     type: integer
 *                     description: The operator ID
 *                   date:
 *                     type: string
 *                     description: The date
 *                   value_sum:
 *                     type: string
 *                     description: The sum of all hours as a percentage
 *                   section_name:
 *                     type: string
 *                     description: The name of the section
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of achiever section data
 */


// get tv display all achievers
app.get('/getallachieversection', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `SELECT w.*, 
      (w.HOUR1 + w.HOUR2 + w.HOUR3 + w.HOUR4 + w.HOUR5 + w.HOUR6 + w.HOUR7 + w.HOUR8 + w.HOUR9 + w.HOUR10 + w.HOUR11) / w.target AS value_sum, s.section_name 
      FROM worker_timesheet w
      JOIN section s ON w.section = s.id
      WHERE w.date_time = ? AND w.operator_id = ?
      GROUP BY w.entry_id, w.product_name, w.line, w.section, w.date_time
      ORDER BY w.section;`;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      // Calculate the modified value_sum for each worker
      const modifiedResult = results.map(workerData => ({
          ...workerData,
          value_sum: (workerData.value_sum * 100).toFixed(2),
      }));

      res.json(modifiedResult);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getpresentemployees:
 *   get:
 *     summary: Get all present employees 
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve present employee data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with present employee data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                     description: The distinct entry id count
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of present employee data
 */

// get tv display present employees
app.get('/getpresentemployees', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `SELECT COUNT(DISTINCT entry_id) AS count
      FROM worker_timesheet
      WHERE date_time = ? AND operator_id = ?`;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      res.json(results);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getabsentemployees:
 *   get:
 *     summary: Get all absent employees 
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve absent employee data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with absent employee data
 *         content:
 *           application/json:
 *             schema:
 *                     type: integer
 *                     description: The ID of the entry
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of absent employee data
 */



// get tv display absent employees
app.get('/getabsentemployees', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `SELECT * FROM worker_timesheet
      WHERE date_time = ? AND operator_id = ?
      GROUP BY product_name, line, section`;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      let total_fg_outputP = 0;

      if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
              const result = results[i];
              const query2 = `
                  SELECT COUNT(id) AS cc
                  FROM employees_moz
                  WHERE product = ? AND line = ? AND section_id = ? AND status = 'A'
              `;

              const result2 = await executeQuery(connection, query2, [result.product_name, result.line, result.section]);

              const pT_emp = result2[0].cc;
              total_fg_outputP += pT_emp;
          }
      }

      res.json(total_fg_outputP);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getproducts:
 *   get:
 *     summary: Get product details and associated data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve product data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with product data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemDescriptionname:
 *                     type: string
 *                     description: The description of the item
 *                   sectionData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the worker timesheet entry
 *                         product_name:
 *                           type: string
 *                           description: The name of the product
 *                         line:
 *                           type: string
 *                           description: The production line
 *                         section:
 *                           type: string
 *                           description: The section
 *                         worker:
 *                           type: string
 *                           description: The name of the worker
 *                         entry_id:
 *                           type: string
 *                           description: The entry ID
 *                         shift:
 *                           type: string
 *                           description: The shift
 *                         HOUR1:
 *                           type: number
 *                           description: Hour 1 production count
 *                         HOUR2:
 *                           type: number
 *                           description: Hour 2 production count
 *                         HOUR3:
 *                           type: number
 *                           description: Hour 3 production count
 *                         HOUR4:
 *                           type: number
 *                           description: Hour 4 production count
 *                         HOUR5:
 *                           type: number
 *                           description: Hour 5 production count
 *                         HOUR6:
 *                           type: number
 *                           description: Hour 6 production count
 *                         HOUR7:
 *                           type: number
 *                           description: Hour 7 production count
 *                         HOUR8:
 *                           type: number
 *                           description: Hour 8 production count
 *                         HOUR9:
 *                           type: number
 *                           description: Hour 9 production count
 *                         HOUR10:
 *                           type: number
 *                           description: Hour 10 production count
 *                         HOUR11:
 *                           type: number
 *                           description: Hour 11 production count
 *                         target:
 *                           type: string
 *                           description: The target value, formatted to four decimal places
 *                         remark:
 *                           type: string
 *                           description: Remarks
 *                         waste:
 *                           type: string
 *                           description: Waste details
 *                         hour_loss:
 *                           type: string
 *                           description: Hour loss
 *                         date_time:
 *                           type: string
 *                           format: date
 *                           description: The date of the entry
 *                         time_stamp:
 *                           type: string
 *                           description: The timestamp
 *                         mon:
 *                           type: string
 *                           description: The month
 *                         operator_id:
 *                           type: string
 *                           description: The ID of the operator
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           description: The datetime of the entry
 *                         summ:
 *                           type: string
 *                           description: The sum of hours worked, formatted to two decimal places
 *                         tar:
 *                           type: string
 *                           description: The target value, formatted to two decimal places
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of product data
 */


app.get('/getproducts', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `
          SELECT worker_timesheet.*, item_masterr.item_description
          FROM worker_timesheet
          INNER JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
          WHERE date_time = ? AND operator_id = ?
          GROUP BY worker_timesheet.product_name
      `;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      const modifiedResults = [];

      if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
              const result = results[i];
              const query2 = `
                  SELECT *, SUM(HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11) AS summ, SUM(target) AS tar
                  FROM worker_timesheet
                  WHERE date_time = ? AND operator_id = ? AND product_name = ?
              `;

              const result2 = await executeQuery(connection, query2, [dt, operatorId, result.product_name]);

              const modifiedResult2 = result2.map(workerData => ({
                  ...workerData,
                  tar: workerData.tar.toFixed(2),
                  summ: workerData.summ.toFixed(2),
              }));

              const sectionData = {
                  itemDescriptionname: result.item_description,
                  sectionData: modifiedResult2,
              };

              modifiedResults.push(sectionData);
          }
      }

      res.json(modifiedResults);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getppp:
 *   get:
 *     summary: Get PPP details and associated data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve PPP data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with PPP data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timesheet:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_description:
 *                         type: string
 *                         description: The description of the item
 *                       shift:
 *                         type: string
 *                         description: The shift
 *                       sum:
 *                         type: number
 *                         description: The sum of fg_output
 *                       mandays:
 *                         type: number
 *                         description: The number of mandays
 *                       reww:
 *                         type: string
 *                         description: The reww value, formatted to two decimal places
 *                       count:
 *                         type: integer
 *                         description: The count of positive hour fields
 *                 total_fg_output:
 *                   type: number
 *                   description: The total fg_output
 *                 total_mandays:
 *                   type: number
 *                   description: The total number of mandays
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of PPP data
 */



app.get('/getppp', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const responseData = [];
      let total_fg_output = 0;
      let total_mandays = 0;

      const PPPQuery = `
          SELECT worker_timesheet.*, item_masterr.item_description
          FROM worker_timesheet
          INNER JOIN item_masterr ON item_masterr.id = worker_timesheet.product_name
          WHERE date_time = ? AND operator_id = ?
          GROUP BY worker_timesheet.product_name, worker_timesheet.shift, worker_timesheet.date_time
      `;

      const PPPResult = await executeQuery(connection, PPPQuery, [dt, operatorId]);
      const results = PPPResult && PPPResult.length > 0 ? PPPResult : [];

      for (const allppp of results) {
          const sumfgDetailsquery = `
              SELECT *, SUM(fg_output) as tar
              FROM fg_details
              WHERE date_time = ? AND product_name = ? AND shift = ?
              GROUP BY product_name, date_time, shift
          `;

          const sumfgDetailsResultt = await executeQuery(connection, sumfgDetailsquery, [dt, allppp.product_name, allppp.shift]);
          const sumfgDetailsResponse = sumfgDetailsResultt.length > 0 ? sumfgDetailsResultt[0].tar : 0;

          const workercountQuery = `
              SELECT *
              FROM worker_timesheet    
              WHERE date_time = ? AND product_name = ? AND shift = ? AND operator_id = ?
              GROUP BY date_time, entry_id, product_name, shift
          `;

          let count = 0;
          const workercountResult = await executeQuery(connection, workercountQuery, [dt, allppp.product_name, allppp.shift, operatorId]);
          const workerresults = workercountResult && workercountResult.length > 0 ? workercountResult : [];

          for (const workercount of workerresults) {
              for (let h = 1; h <= 11; h++) {
                  const hourField = 'HOUR' + h;
                  if (workercount[hourField] > 0) {
                      count++;
                  }
              }
          }

          const mandays = count / 8;
          total_mandays += mandays;

          let reww;
          const rew = sumfgDetailsResponse / mandays;

          if (Number.isFinite(rew)) {
              reww = rew.toFixed(2);
          } else {
              reww = '0';
          }

          total_fg_output += sumfgDetailsResponse;

          responseData.push({
              item_description: allppp.item_description,
              shift: allppp.shift,
              sum: sumfgDetailsResponse,
              mandays: mandays,
              reww: reww,
              count: count,
          });
      }

      const data = {
          timesheet: responseData,
          total_fg_output: total_fg_output,
          total_mandays: total_mandays,
      };

      res.json(data);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});


/**
 * @swagger
 * /gettopachievers:
 *   get:
 *     summary: Get top achievers details and associated data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve top achievers data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with top achievers data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sectionName:
 *                     type: string
 *                     description: The name of the section
 *                   sectionData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the worker timesheet entry
 *                         product_name:
 *                           type: string
 *                           description: The name of the product
 *                         line:
 *                           type: string
 *                           description: The production line
 *                         section:
 *                           type: string
 *                           description: The section ID
 *                         worker:
 *                           type: string
 *                           description: The name of the worker
 *                         entry_id:
 *                           type: string
 *                           description: The entry ID
 *                         shift:
 *                           type: string
 *                           description: The shift
 *                         HOUR1:
 *                           type: number
 *                           description: Hour 1 production count
 *                         HOUR2:
 *                           type: number
 *                           description: Hour 2 production count
 *                         HOUR3:
 *                           type: number
 *                           description: Hour 3 production count
 *                         HOUR4:
 *                           type: number
 *                           description: Hour 4 production count
 *                         HOUR5:
 *                           type: number
 *                           description: Hour 5 production count
 *                         HOUR6:
 *                           type: number
 *                           description: Hour 6 production count
 *                         HOUR7:
 *                           type: number
 *                           description: Hour 7 production count
 *                         HOUR8:
 *                           type: number
 *                           description: Hour 8 production count
 *                         HOUR9:
 *                           type: number
 *                           description: Hour 9 production count
 *                         HOUR10:
 *                           type: number
 *                           description: Hour 10 production count
 *                         HOUR11:
 *                           type: number
 *                           description: Hour 11 production count
 *                         target:
 *                           type: string
 *                           description: The target value, formatted to four decimal places
 *                         remark:
 *                           type: string
 *                           description: Remarks
 *                         waste:
 *                           type: string
 *                           description: Waste details
 *                         hour_loss:
 *                           type: string
 *                           description: Hour loss
 *                         date_time:
 *                           type: string
 *                           format: date
 *                           description: The date of the entry
 *                         time_stamp:
 *                           type: string
 *                           description: The timestamp
 *                         mon:
 *                           type: string
 *                           description: The month
 *                         operator_id:
 *                           type: integer
 *                           description: The ID of the operator
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           description: The datetime of the entry
 *                         value_sum:
 *                           type: string
 *                           description: The value sum, multiplied by 100 and formatted to two decimal places
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of top achievers data
 */




app.get('/gettopachievers', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `
          SELECT worker_timesheet.section, worker_timesheet.operator_id, section.section_name
          FROM worker_timesheet
          INNER JOIN section ON worker_timesheet.section = section.id
          WHERE worker_timesheet.date_time = ? AND worker_timesheet.operator_id = ?
          GROUP BY worker_timesheet.section
      `;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      const modifiedResults = [];
      for (const result of results) {
          const query2 = `
              SELECT *, (HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11)/target AS value_sum
              FROM worker_timesheet
              WHERE date_time = ? AND section = ? AND operator_id = ?
              GROUP BY entry_id, product_name, line, section, date_time
              ORDER BY value_sum DESC
              LIMIT 1
          `;

          const result2 = await executeQuery(connection, query2, [dt, result.section, operatorId]);

          // Calculate the modified value_sum for each worker
          const modifiedResult2 = result2.map(workerData => ({
              ...workerData,
              value_sum: (workerData.value_sum * 100).toFixed(2),
          }));

          // Create an object with section name and modified data
          const sectionData = {
              sectionName: result.section_name,
              sectionData: modifiedResult2,
          };

          modifiedResults.push(sectionData);
      }

      res.json(modifiedResults);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * /getbottomachievers:
 *   get:
 *     summary: Get bottom achievers details and associated data
 *     tags:
 *       - TV Display
 *     parameters:
 *       - in: query
 *         name: dt
 *         schema:
 *           type: string
 *         required: true
 *         description: The date for which to retrieve bottom achievers data
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the operator
 *     responses:
 *       200:
 *         description: Successful response with bottom achievers data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sectionName:
 *                     type: string
 *                     description: The name of the section
 *                   sectionData:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the worker timesheet entry
 *                         product_name:
 *                           type: string
 *                           description: The name of the product
 *                         line:
 *                           type: string
 *                           description: The production line
 *                         section:
 *                           type: string
 *                           description: The section ID
 *                         worker:
 *                           type: string
 *                           description: The name of the worker
 *                         entry_id:
 *                           type: string
 *                           description: The entry ID
 *                         shift:
 *                           type: string
 *                           description: The shift
 *                         HOUR1:
 *                           type: number
 *                           description: Hour 1 production count
 *                         HOUR2:
 *                           type: number
 *                           description: Hour 2 production count
 *                         HOUR3:
 *                           type: number
 *                           description: Hour 3 production count
 *                         HOUR4:
 *                           type: number
 *                           description: Hour 4 production count
 *                         HOUR5:
 *                           type: number
 *                           description: Hour 5 production count
 *                         HOUR6:
 *                           type: number
 *                           description: Hour 6 production count
 *                         HOUR7:
 *                           type: number
 *                           description: Hour 7 production count
 *                         HOUR8:
 *                           type: number
 *                           description: Hour 8 production count
 *                         HOUR9:
 *                           type: number
 *                           description: Hour 9 production count
 *                         HOUR10:
 *                           type: number
 *                           description: Hour 10 production count
 *                         HOUR11:
 *                           type: number
 *                           description: Hour 11 production count
 *                         target:
 *                           type: string
 *                           description: The target value, formatted to four decimal places
 *                         remark:
 *                           type: string
 *                           description: Remarks
 *                         waste:
 *                           type: string
 *                           description: Waste details
 *                         hour_loss:
 *                           type: string
 *                           description: Hour loss
 *                         date_time:
 *                           type: string
 *                           format: date
 *                           description: The date of the entry
 *                         time_stamp:
 *                           type: string
 *                           description: The timestamp
 *                         mon:
 *                           type: string
 *                           description: The month
 *                         operator_id:
 *                           type: integer
 *                           description: The ID of the operator
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           description: The datetime of the entry
 *                         value_sum:
 *                           type: string
 *                           description: The value sum, multiplied by 100 and formatted to two decimal places
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Error message indicating an error occurred during the retrieval of bottom achievers data
 */



// get tv display bottom achievers
app.get('/getbottomachievers', authenticateJWT, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();
      const dt = req.query.dt;
      const operatorId = req.query.operatorId;

      const query = `
          SELECT worker_timesheet.section, worker_timesheet.operator_id, section.section_name
          FROM worker_timesheet
          INNER JOIN section ON worker_timesheet.section = section.id
          WHERE worker_timesheet.date_time = ? AND worker_timesheet.operator_id = ?
          GROUP BY worker_timesheet.section
      `;

      const results = await executeQuery(connection, query, [dt, operatorId]);

      const modifiedResults = [];
      for (const result of results) {
          const query2 = `
              SELECT *, (HOUR1+HOUR2+HOUR3+HOUR4+HOUR5+HOUR6+HOUR7+HOUR8+HOUR9+HOUR10+HOUR11)/target AS value_sum
              FROM worker_timesheet
              WHERE date_time = ? AND section = ? AND operator_id = ?
              GROUP BY entry_id, product_name, line, section, date_time
              ORDER BY value_sum ASC
              LIMIT 1
          `;

          const result2 = await executeQuery(connection, query2, [dt, result.section, operatorId]);

          // Calculate the modified value_sum for each worker
          const modifiedResult2 = result2.map(workerData => ({
              ...workerData,
              value_sum: (workerData.value_sum * 100).toFixed(2),
          }));

          // Create an object with section name and modified data
          const sectionData = {
              sectionName: result.section_name,
              sectionData: modifiedResult2,
          };

          modifiedResults.push(sectionData);
      }

      res.json(modifiedResults);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      if (connection) {
          connection.release();
      }
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../public/video/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 512 * 1024 * 1024 } // Limit set to 100MB
}).single('video'); // Change 'image' to 'video'

/**
 * @swagger
 * /upload_video:
 *   post:
 *     summary: Upload a video
 *     tags:
 *       - TV Display
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successful response after uploading the video
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Video/Image uploaded and data saved successfully"
 *                   description: Confirmation message indicating successful upload and data insertion
 *       400:
 *         description: Bad request if no file is selected for upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No file selected"
 *                   description: Error message indicating no file selected
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during login"
 *                   description: Error message indicating an error occurred while moving the file or inserting video data
 */

app.post('/upload_video', videoUpload, async (req, res) => {
  let connection;
  try {
      connection = await getPoolConnection();

      // Check if req.file exists
      if (!req.file) {
          console.error('No file selected');
          return res.status(400).json({ message: 'No file selected' });
      }

      const uploadedFilename = req.file.filename;

      try {
          // Insert data into the database using executeQuery
          const insertQuery = `INSERT INTO video_data (v_name) VALUES (?)`;
          await executeQuery(connection, insertQuery, [uploadedFilename]);
          console.log('Video data inserted successfully');

          // Move the uploaded file to the destination folder
          fs.rename(req.file.path, path.join('../public/video/', uploadedFilename), (err) => {
              if (err) {
                  console.error('Error moving file:', err);
                  return res.status(500).json({ message: 'An error occurred while moving file.' });
              }
              console.log('File moved successfully');
              return res.json({ message: 'Video/Image uploaded and data saved successfully' });
          });
      } catch (error) {
          console.error("Error inserting video data:", error);
          return res.status(500).json({ message: 'An error occurred while inserting video data.' });
      }
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
      // Release the connection back to the pool in case of success or error
      if (connection) {
          connection.release();
      }
  }
});

/**
 * @swagger
 * 
 * /laborratedelete/{id}:
 *   delete:
 *     summary: Delete a labor rate by ID.
 *     description: Deletes a labor rate from the database based on the provided ID.
 *     tags:
 *       - Labor Rate
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the labor rate to delete.
 *     responses:
 *       200:
 *         description: Successful response indicating the labor rate was deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Labor Rate deleted successfully."
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the labor rate."
 */

/**
 * @function
 * @name deleteLaborRate
 * @memberof module:Routes/LaborRate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// delete Monthly Labor Report by ID
app.delete("/laborratedelete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Establish a database connection
    connection = await getPoolConnection();
    
    // Extract the id parameter from the request
    const id = req.params.id;

    // SQL query to delete the labor rate with the specified id
    const query = 'DELETE FROM labor_rate WHERE id = ?';
    
    // Execute the query
    const result = await executeQuery(connection, query, [id]);

    // Log the result
    console.log(result);

    // Send a success message as response
    res.json({ message: 'Labor Rate deleted successfully.' });
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the labor rate' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     labor_rate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         year:
 *           type: integer
 *           example: 2023
 *         month:
 *           type: string
 *           example: "01"
 *         labor_rate:
 *           type: string
 *           example: "123"
 *         dollar_rate:
 *           type: string
 *           example: "111"
 *         month_year:
 *           type: string
 *           example: "01-2023"
 *         Date:
 *           type: string
 *           example: "01-01-2023"
 * 
 * /mlr:
 *   get:
 *     summary: Get all labor rates.
 *     description: Retrieves all labor rates from the database.
 *     tags:
 *       - Labor Rate
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of labor rates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/labor_rate'
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve labor rates. Please try again."
 */

/**
 * @function
 * @name getLaborrate
 * @memberof module:Routes/Laborrate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Fetch categories and subcategories in add item master

//Get Monthly Labor Report for datatables
app.get("/mlr", authenticateJWT, async (req, res) => {
  let connection;
  try {
    // Establish a database connection
    connection = await getPoolConnection();
    
    // SQL query to fetch labor rates
    const query = 'SELECT * FROM labor_rate';
    
    // Execute the query
    const result = await executeQuery(connection, query);
    
    // Send the query result as response
    res.json(result);
    
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred while fetching labor rates' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /addlaborrate:
 *   post:
 *     summary: Add a new labor rate.
 *     description: Adds a new labor rate to the database if the month and year combination does not already exist.
 *     tags:
 *       - Labor Rate
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2023
 *               month:
 *                 type: string
 *                 example: "01"
 *               labor_rate:
 *                 type: integer
 *                 example: 123
 *               dollar_rate:
 *                 type: integer
 *                 example: 111
 *     responses:
 *       200:
 *         description: Successful response indicating the labor rate was added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Labor Rate added successfully"
 *       400:
 *         description: Bad request error indicating that the month and year combination already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Month and Year already exists"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during the operation"
 */

/**
 * @function
 * @name addLaborrate
 * @memberof module:Routes/Laborrate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//Add Monthly Labor Report
app.post("/addlaborrate",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var year = req.body.year;
  var month = req.body.month;
  var labor_rate = req.body.labor_rate;
  var dollar_rate = req.body.dollar_rate;
  var month_year = `${month}-${year}`;

  // Check if a record with the same month and year already exists
  var checkDuplicateQuery = `SELECT * FROM labor_rate WHERE month = ? AND year = ?`;
  const results = await executeQuery(connection, checkDuplicateQuery, [month, year]);

    if (results.length > 0) {
      res.json({ message: 'Month and Year already exists' });
    } else {
      // Insert the new labor rate
      var insertQuery = `INSERT INTO labor_rate (year, month, labor_rate, dollar_rate, month_year, date) VALUES (?, ?, ?, ?, ?, ?)`;
      const result = await executeQuery(connection, insertQuery, [year, month, labor_rate, dollar_rate, month_year, currentDate]);

          res.json({ message: 'Labor Rate added successfully' });
 
    }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /getLaborRateById/{id}:
 *   get:
 *     summary: Get labor rate by ID.
 *     description: Retrieves a specific labor rate by its ID from the database.
 *     tags:
 *       - Labor Rate
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the labor rate to retrieve.
 *     responses:
 *       200:
 *         description: Successful response with the labor rate object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/labor_rate'
 *       404:
 *         description: Labor rate not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Labor rate not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 */

/**
 * @function
 * @name getLaborRateById
 * @memberof module:Routes/Laborrate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// GET request to fetch Monthly Labor Report by ID
app.get("/getLaborRateById/:id", authenticateJWT, async (req, res) => {
 // console.log("hi");
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  //const id = 11;
  // Construct the SQL query with a placeholder
  const query = 'SELECT * FROM labor_rate WHERE id = ?';
  const results = await executeQuery(connection, query, [id]);
 //console.log(results);
      if (results.length > 0) {
        const subcategory = results[0];
        res.status(200).json(subcategory);
      } else {
        res.status(404).json({ message: 'Subcategory not found' });
      }
 
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /updatelaborrate:
 *   put:
 *     summary: Update an existing labor rate.
 *     description: Updates the details of an existing labor rate in the database.
 *     tags:
 *       - Labor Rate
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               year:
 *                 type: integer
 *                 example: 2023
 *               month:
 *                 type: string
 *                 example: "01"
 *               labor_rate:
 *                 type: string
 *                 example: "123"
 *               dollar_rate:
 *                 type: string
 *                 example: "111"
 *     responses:
 *       200:
 *         description: Labor rate updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Labor rate updated successfully.'
 *       409:
 *         description: Conflict error indicating a labor rate for the specified month and year already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Labor rate for this month and year already exists.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during update'
 */

/**
 * @function
 * @name updateLaborRate
 * @memberof module:Routes/Laborrate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// update Monthly Labor Report by ID
app.put("/updatelaborrate",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var id = req.body.id;
  var year = req.body.year;
  var month = req.body.month;
  var labor_rate = req.body.labor_rate;
  var dollar_rate = req.body.dollar_rate;
  var month_year = `${month}-${year}`;
  // Check if a record with the same month and year already exists, excluding the current record by ID
  var checkDuplicateQuery = `SELECT * FROM labor_rate WHERE month = ? AND year = ? AND id != ?`;
  const results = await executeQuery(connection, checkDuplicateQuery, [month, year, id]);

    if (results.length > 0) {
      res.json({ message: 'Labor rate for this month and year already exists.' });
    } else {
      // Update the labor rate
      var sql = `UPDATE labor_rate SET year=?, month=?, labor_rate=?, dollar_rate=?, month_year=? WHERE id=?`;
      const result = await executeQuery(connection, sql, [year, month, labor_rate, dollar_rate, month_year, id]);
          console.log(result);
          res.json({ message: 'Labor rate updated successfully.' });
 
    }
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 *  components:
 *   schemas:
 *     ppp_baseline:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         year:
 *           type: integer
 *           example: 2023
 *         month:
 *           type: string
 *           example: "01"
 *         product_id:
 *           type: integer
 *           example: 1
 *         cat_id:
 *           type: integer
 *           example: 2
 *         ppp:
 *           type: integer
 *           example: 11
 *         month_year:
 *           type: string
 *           example: "01-2023"
 *         Date:
 *           type: string
 *           example: "01-01-2023"
 * 
 * /baselinepppdelete/{id}:
 *   delete:
 *     summary: Delete a baseline PPP by ID.
 *     description: Deletes a specific baseline PPP by its ID from the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the baseline PPP to delete.
 *     responses:
 *       200:
 *         description: Baseline PPP deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Baseline PPP deleted successfully.'
 *       404:
 *         description: Baseline PPP not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Baseline PPP not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while deleting the baseline PPP'
 */

/**
 * @function
 * @name deleteBaselinePPP
 * @memberof module:Routes/BaselinePPP
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
// delete Baseline PPP by ID
app.delete("/baselinepppdelete/:id", authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  const query = `DELETE FROM ppp_baseline WHERE id = ?`;
  const result = await executeQuery(connection, query, [id]);
  console.log(result);
  res.json({ message: 'Baseline PPP deleted successfully.' });

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /bppp:
 *   get:
 *     summary: Get Baseline PPP.
 *     description: Retrieves Baseline PPP data from the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Baseline PPP data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   year:
 *                     type: integer
 *                     example: 2023
 *                   month:
 *                     type: string
 *                     example: "01"
 *                   product_id:
 *                     type: string
 *                     example: "product 1"
 *                   cat_id:
 *                     type: string
 *                     example: "category 1"
 *                   ppp:
 *                     type: integer
 *                     example: 11
 *                   month_year:
 *                     type: string
 *                     example: "01-2023"
 *                   Date:
 *                     type: string
 *                     example: "01-01-2023"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getBaselinePPP
 * @memberof module:Routes/BaselinePPP
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching Baseline PPP data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Baseline PPP for datatables
app.get("/bppp",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const query = `SELECT ppp_baseline.*, item_category.category_name as cat_id, item_masterr.item_description as product_id
      FROM ppp_baseline
      LEFT JOIN item_category ON ppp_baseline.cat_id = item_category.id
      LEFT JOIN item_masterr ON ppp_baseline.product_id = item_masterr.id`;

    const result = await executeQuery(connection, query);
    res.send(result);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /categorybaselineppp:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   category_name:
 *                     type: string
 *                     example: "Category 1"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 */

/**
 * @function
 * @name getCategoryBaselinePPP
 * @memberof module:Routes/Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Baseline PPP for category dropdown in Baseline PPP add new page
app.get("/categorybaselineppp",authenticateJWT, async (req, res) => {
  let connection;
try{

    connection = await getPoolConnection();
    const query = `SELECT id, category_name FROM item_category`;
    const result = await executeQuery(connection, query);
    res.send(result);


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /productbaselineppp:
 *   get:
 *     summary: Get product baseline data.
 *     description: Retrieves product baseline data from the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of product baseline data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   item_description:
 *                     type: string
 *                     example: "Sample item description"
 *                   category_id:
 *                     type: integer
 *                     example: 101
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while fetching product baseline data'
 */

/**
 * @function
 * @name getProductBaseline
 * @memberof module:Routes/ProductBaseline
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
//Get Baseline PPP for product dropdown in Baseline PPP add new page
app.get("/productbaselineppp",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
      var sql = `SELECT id, item_description, category_id FROM item_masterr`;
      const result = await executeQuery(connection, sql);
      res.send(result);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /addbaselineppp:
 *   post:
 *     summary: Add a new PPP baseline.
 *     description: Adds a new PPP baseline to the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 description: The year of the PPP baseline.
 *               month:
 *                 type: string
 *                 description: The month of the PPP baseline.
 *               product_id:
 *                 type: integer
 *                 description: The product ID associated with the PPP baseline.
 *               cat_id:
 *                 type: integer
 *                 description: The category ID associated with the PPP baseline.
 *               ppp:
 *                 type: integer
 *                 description: The PPP value.
 *     responses:
 *       200:
 *         description: PPP baseline added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Baseline PPP added successfully'
 *       400:
 *         description: Bad request - PPP baseline for the specified month and year already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Month and Year already exists'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 *
 * @function
 * @name addBaselinePPP
 * @memberof module:Routes/PPPBaseline
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if a PPP baseline for the specified month and year already exists.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.post("/addbaselineppp",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var year = req.body.year;
  var month = req.body.month;
  var product_id = req.body.product_id;
  var cat_id = req.body.cat_id;
  var ppp = req.body.ppp;
  var date = dateUtils.getCurrentDate("DD-MM-YYYY");
  var month_year = `${month}-${year}`;

  // Check if a record with the same month and year already exists
  var checkDuplicateQuery = `SELECT * FROM ppp_baseline WHERE month = ? AND year = ?`;
  const results = await executeQuery(connection, checkDuplicateQuery, [month, year]);

  if (results.length > 0) {
    // A record with the same month and year already exists, send an error response
    // return res.status(400).send("PPP baseline for this month and year already exists");
    // res.send(results);
    res.json({ message: 'Month and Year already exists' });
  } else {
    // Insert the new PPP baseline
    var sql = `INSERT INTO ppp_baseline (year, month, product_id, cat_id, ppp, month_year, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await executeQuery(connection, sql, [year, month, product_id, cat_id, ppp, month_year, date]);
    // res.send(result);
        // console.log(result);
        res.json({ message: 'Baseline PPP added successfully' });

  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /getcategoryname/{category_id}:
 *   get:
 *     summary: Get category name by ID.
 *     description: Retrieves the category name from the database based on the provided category ID.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         description: The ID of the category to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category name retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       404:
 *         description: Category not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Category not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while fetching category data'
 * @function
 * @name getCategoryName
 * @memberof module:Routes/Category
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the category with the specified ID is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching category data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


app.get('/getcategoryname/:category_id', authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const category_id = req.params.category_id;
  
  const query = `SELECT * FROM item_category WHERE id = ?`;
const results = await executeQuery(connection, query, [category_id]);
res.json({ data: results });
      // console.log(results);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /updatebaselineppp:
 *   put:
 *     summary: Update PPP baseline.
 *     description: Updates the PPP baseline in the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               year:
 *                 type: integer
 *               month:
 *                 type: string
 *               product_id:
 *                 type: integer
 *               cat_id:
 *                 type: integer
 *               ppp:
 *                 type: integer
 *     responses:
 *       200:
 *         description: PPP baseline updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'PPP baseline updated successfully.'
 *       400:
 *         description: Bad request - PPP baseline for the specified month and year already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'PPP Baseline for this month and year already exists'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during PPP baseline update'
 *
 * @function
 * @name updateBaselinePPP
 * @memberof module:Routes/PPPBaseline
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if a PPP baseline for the specified month and year already exists.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.put("/updatebaselineppp", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { id, year, month, product_id, cat_id, ppp } = req.body;
    const month_year = `${month}-${year}`;

    // Check if a record with the same month and year already exists
    const checkDuplicateQuery = `SELECT * FROM ppp_baseline WHERE month = ? AND year = ? AND id <> ?`;
    const duplicateResults = await executeQuery(connection, checkDuplicateQuery, [month, year, id]);

    if (duplicateResults.length > 0) {
      res.json({ message: 'PPP Baseline for this month and year already exists' });
    } else {
      // Update the PPP baseline using parameterized query
      const updateQuery = `
        UPDATE ppp_baseline
        SET year = ?, month = ?, product_id = ?, cat_id = ?, ppp = ?, month_year = ?
        WHERE id = ?
      `;
      const updateResult = await executeQuery(connection, updateQuery, [year, month, product_id, cat_id, ppp, month_year, id]);
      console.log(updateResult);
      res.json({ message: 'PPP baseline updated successfully.' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /getBaselinepppById/{id}:
 *   get:
 *     summary: Get PPP baseline by ID.
 *     description: Retrieves a specific PPP baseline by its ID from the database.
 *     tags:
 *       - Baseline PPP
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the PPP baseline to retrieve.
 *     responses:
 *       200:
 *         description: Successful response with the PPP baseline object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ppp_baseline'
 *       404:
 *         description: PPP baseline not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'PPP baseline not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 */

/**
 * @function
 * @name getLaborRateById
 * @memberof module:Routes/LaborRate
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// GET request to fetch Baseline PPP by ID
app.get("/getBaselinepppById/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  //const id = 11;
  // Construct the SQL query with a placeholder
  const query = 'SELECT * FROM ppp_baseline WHERE id = ?';
  const results = await executeQuery(connection, query, [id]);

  if (results.length > 0) {
    const subcategory = results[0];
    res.status(200).json(subcategory);
  } else {
    res.status(404).json({ message: 'Subcategory not found' });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /itemcategories:
 *   get:
 *     summary: Get all item categories.
 *     description: Retrieves all item categories from the database.
 *     tags:
 *       - Item Category
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successful response with an array of item categories.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category_name: "Category 1"
 *               - id: 2
 *                 category_name: "Category 2"
 *       403:
 *         description: Forbidden error indicating the user is not authorized to perform this action.
 *         content:
 *           application/json:
 *             example:
 *               message: "You are not authorized to perform this action."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to retrieve item categories. Please try again."
 *
 * @function
 * @name getItemCategories
 * @memberof module:Routes/ItemCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */



//Get Item categories for category dropdown in itemsubcategory add new page
app.get("/itemcategories", authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
      const result = await executeQuery(connection, "SELECT id, category_name FROM item_category");
      res.send(result);
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 *  components:
 *   schemas:
 *     working_days:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         year:
 *           type: integer
 *           example: 2023
 *         month:
 *           type: string
 *           example: "01"
 *         days:
 *           type: interger
 *           example: "10"
 *         month_year:
 *           type: string
 *           example: "01-2023"
 *         Date:
 *           type: string
 *           example: "01-01-2023"
 *
 * /workingdays:
 *   get:
 *     summary: Get working days.
 *     description: Retrieves information about working days from the database.
 *     tags:
 *       - Working Days
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Working days retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/working_days'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred while fetching working days data'
 * @function
 * @name getWorkingDays
 * @memberof module:Routes/WorkingDays
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching working days data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//Get Working Days for datatables
app.get("/workingdays",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
      const query = `SELECT * FROM working_days`;
      const result = await executeQuery(connection, query);
      res.send(result);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /workingdaysdelete/{id}:
 *   delete:
 *     summary: Delete Working Days by ID.
 *     description: Deletes a Working Days record from the database based on the provided ID.
 *     tags:
 *       - Working Days
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Working Days record to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Working Days deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Working Days deleted successfully.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name deleteWorkingDaysById
 * @memberof module:Routes/WorkingDays
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with deleting the Working Days record.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


// delete Working Days by ID
app.delete("/workingdaysdelete/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  const query = `DELETE FROM working_days WHERE id = ?`;
  const result = await executeQuery(connection, query, [id]);

  console.log(result);
  res.json({ message: 'Working Days deleted successfully.' });


} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /addworkingdays:
 *   post:
 *     summary: Add working days.
 *     description: Adds information about working days to the database.
 *     tags:
 *       - Working Days
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: string
 *               days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Working days added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Working Days added successfully'
 *       400:
 *         description: Bad request - Month and year already exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Month and Year already exists'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name addWorkingDays
 * @memberof module:Routes/WorkingDays
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if the month and year already exist.
 * @throws {InternalServerError} Will throw an error if there's an issue with adding working days.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

//Add Working Days
app.post("/addworkingdays",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  var year = req.body.year;
  var month = req.body.month;
  var days = req.body.days;
  var date = dateUtils.getCurrentDate("DD-MM-YYYY");
  var month_year = `${month}-${year}`;

  // Check if a record with the same month and year already exists
  var checkDuplicateQuery = `SELECT * FROM working_days WHERE month = ? AND year = ?`;
  const results = await executeQuery(connection, checkDuplicateQuery, [month, year]);
  if (results.length > 0) {
  
    res.json({ message: 'Month and Year already exists' });
  } else {      
    var sql = `INSERT INTO working_days (year, month, days, month_year, date) VALUES (?, ?, ?, ?, ?)`;
    const result = await executeQuery(connection, sql, [year, month, days, month_year, date]);
       // res.send(result);
        // console.log(result);
    res.json({ message: 'Working Days added successfully' });

  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 * /updateworkingdays:
 *   put:
 *     summary: Update working days.
 *     description: Updates information about working days in the database.
 *     tags:
 *       - Working Days
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               year:
 *                 type: integer
 *               month:
 *                 type: string
 *               days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Working days updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Working days updated successfully.'
 *       400:
 *         description: Bad request - Working days for the specified month and year already exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Working days for this month and year already exist.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name updateWorkingDays
 * @memberof module:Routes/WorkingDays
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {BadRequestError} Will throw an error if working days for the specified month and year already exist.
 * @throws {InternalServerError} Will throw an error if there's an issue with updating working days.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */



app.put("/updateworkingdays", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    const { id, year, month, days } = req.body;
    const month_year = `${month}-${year}`;

    // Check if a record with the same month and year already exists, excluding the current record being updated
    const checkDuplicateQuery = `SELECT * FROM working_days WHERE month = ? AND year = ? AND id != ?`;
    const duplicateResults = await executeQuery(connection, checkDuplicateQuery, [month, year, id]);

    if (duplicateResults.length > 0) {
      res.json({ message: 'Working days for this month and year already exist.' });
    } else {
      // Update the existing working days using parameterized query
      const updateQuery = `
        UPDATE working_days
        SET year = ?, month = ?, days = ?, month_year = ?
        WHERE id = ?
      `;
      const updateResult = await executeQuery(connection, updateQuery, [year, month, days, month_year, id]);

      console.log(updateResult);
      res.json({ message: 'Working days updated successfully.' });
    }
  } catch (error) {
    // Handle exceptions
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  } finally {
    // Release the connection back to the pool in case of success or error
    if (connection) {
      connection.release();
    }
  }
});
/**
 * @swagger
 * /getWorkingDaysById/{id}:
 *   get:
 *     summary: Get working days by ID.
 *     description: Retrieves information about working days from the database based on the provided ID.
 *     tags:
 *       - Working Days
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the working days to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Working days retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/working_days'
 *       404:
 *         description: Working days not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Working days not found'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getWorkingDaysById
 * @memberof module:Routes/WorkingDays
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {NotFoundError} Will throw an error if the working days with the specified ID is not found.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching working days data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


// GET request to fetch Working Days by ID
app.get("/getWorkingDaysById/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  //const id = 11;
  // Construct the SQL query with a placeholder
  const query = 'SELECT * FROM working_days WHERE id = ?';
  const results = await executeQuery(connection, query, [id]);
  if (results.length > 0) {
    const subcategory = results[0];
    res.status(200).json(subcategory);
  } else {
    res.status(404).json({ message: 'Subcategory not found' });
  }
  // Execute the query with the id as a parameter
} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});

/**
 * @swagger
 * /wastemaster:
 *   get:
 *     summary: Get Waste Master for datatables.
 *     description: Retrieves Waste Master data for use in datatables.
 *     tags:
 *       - Waste Master
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Waste Master data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/waste_master'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name getWasteMasterForDataTables
 * @memberof module:Routes/WasteMaster
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with fetching Waste Master data.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


//Get Waste Master for datatables
app.get("/wastemaster", authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const query = `
      SELECT waste_master.*, item_category.category_name as cat_id, item_masterr.item_description as product_id
      FROM waste_master
      LEFT JOIN item_category ON waste_master.cat_id = item_category.id
      LEFT JOIN item_masterr ON waste_master.product_id = item_masterr.id
    `;

    const result = await executeQuery(connection, query);
    res.send(result);

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /wastemasterdelete/{id}:
 *   delete:
 *     summary: Delete Waste Master by ID.
 *     description: Deletes a Waste Master record from the database based on the provided ID.
 *     tags:
 *       - Waste Master
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the Waste Master record to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Waste Master deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Waste Master deleted successfully.'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 * @function
 * @name deleteWasteMasterById
 * @memberof module:Routes/WasteMaster
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with deleting the Waste Master record.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */


// delete Waste Master by ID
app.delete("/wastemasterdelete/:id",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
  const query = `DELETE FROM waste_master WHERE id = ?`;
  const result = await executeQuery(connection, query, [id]);
  console.log(result);
  res.json({ message: 'Waste Master deleted successfully.' });

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});


/**
 * @swagger
 *  components:
 *   schemas:
 *     waste_master:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_id:
 *           type: integer
 *           example: 1
 *         cat_id:
 *           type: integer
 *           example: 2
 *         expected_waste_percentage:
 *           type: string
 *           example: "10"
 *         qty:
 *           type: integer
 *           example: 8
 *         fiber:
 *           type: string
 *           example: "11"
 *         expected_waste:
 *           type: string
 *           example: "10"
 *         Date:
 *           type: string
 *           example: "01-01-2023"
 *         mon:
 *           type: string
 *           example: "01"
 *         time_stamp:
 *           type: string
 *           example: "1708635600"
 * 
 * /addwastemaster:
 *   post:
 *     summary: Add a new waste master record.
 *     description: Creates a new entry in the waste master table with the provided data.
 *     tags:
 *       - Waste Master
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               cat_id:
 *                 type: integer
 *                 example: 2
 *               expected_waste_percentage:
 *                 type: string
 *                 example: "10"
 *               qty:
 *                 type: integer
 *                 example: 100
 *               fiber:
 *                 type: string
 *                 example: "20"
 *               expected_waste:
 *                 type: string
 *                 example: "11"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "01-01-2023"
 *     responses:
 *       200:
 *         description: Successful response indicating the waste master record was added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Waste Master added successfully.'
 *       400:
 *         description: Duplicate entry error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Wastage already exists for this product and category on this date!'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'An error occurred during login'
 */

/**
 * @function
 * @name addWasteMaster
 * @memberof module:Routes/WasteMaster
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {ForbiddenError} Will throw an error if the user is not authorized to perform this action.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */
app.post("/addwastemaster",authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const product_id = req.body.product_id;
  const cat_id = req.body.cat_id;
  const expected_waste_percentage = req.body.expected_waste_percentage;
  const qty = req.body.qty;
  const fiber = req.body.fiber;
  const expected_waste = req.body.expected_waste;
   const date = new Date(req.body.date);
//  const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;

    const formattedDate = req.body.date;
  const currentMonth = dateUtils.convertDateFormat(formattedDate, 'DD-MM-YYYY', 'MM')
  const timestampdatee = dateUtils.convertDateFormat(formattedDate, 'DD-MM-YYYY', 'YYYY-MM-DD')
    const timestampdate = dateUtils.convertToUnixTimestamp(timestampdatee);
  // Check if a record with the same product_id, cat_id, and date already exists
  var checkDuplicateQuery = `SELECT * FROM waste_master WHERE product_id = ? AND cat_id = ? AND date = ?`;
  const results = await executeQuery(connection, checkDuplicateQuery, [product_id, cat_id, formattedDate]);

    if (results.length > 0) {
      // A record with the same product_id, cat_id, and date already exists, send an error response
      // return res.status(400).json({ error: 'Duplicate entry for product, category, and date' });
      // res.send(results);
      res.json({ message: 'Wastage already exists for this product and category on this date!' });
    } else {
      // Insert the new waste_master record
      const insertData = {
        product_id: product_id,
        cat_id: cat_id,
        expected_waste_percentage: expected_waste_percentage,
        qty: qty,
        fiber: fiber,
        expected_waste: expected_waste,
        date: formattedDate,
        mon: currentMonth,
        time_stamp: timestampdate
        // time_stamp: date.getTime()
      };

      var sql = `INSERT INTO waste_master SET ?`;
      const result = await executeQuery(connection, sql, insertData);
      res.json({ message: 'Waste Master added successfully.' });


    }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
/**
 * @swagger
 * /updatewastemaster:
 *   put:
 *     summary: Update a waste master.
 *     description: Update the details of a specific waste master in the database.
 *     tags:
 *       - Waste Master
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: JSON object containing the waste master details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                id:
 *                 type: integer
 *                 description: The ID for which the waste master is being updated.
 *                product_id:
 *                 type: integer
 *                 description: The product id of that waste master to be update.
 *                cat_id:
 *                 type: integer
 *                 description: The category id of that waste master to be update.
 *                expected_waste_percentage:
 *                 type: integer
 *                 description: The expected waste percentage of that waste master to be update.
 *                qty:
 *                 type: integer
 *                 description: The quantity of that waste master to be update.
 *                fiber:
 *                 type: integer
 *                 description: The fiber of that waste master to be update.
 *                expected_waste:
 *                 type: integer
 *                 description: The expected_waste of that waste master to be update.
 *             required:
 *               - id
 *               - product_id
 *               - cat_id
 *               - expected_waste_percentage
 *               - fiber
 *               - expected_waste
 *     responses:
 *       200:
 *         description: Successful response indicating that the waste master was updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Waste Master updated successfully."
 *       400:
 *         description: Bad Request response indicating a validation or client error.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid request body"
 *       409:
 *         description: Conflict response indicating that the new waste master is a duplicate.
 *         content:
 *           application/json:
 *             example:
 *               error: "Duplicate waste master"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while updating the waste master."
 *
 * @function
 * @name updateWastemaster
 * @memberof module:Routes/Wastemaster
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {InternalServerError} Will throw an error if there's an issue with the database query.
 * @returns {Promise<void>} Promise representing the result of the operation.
 */

// update Waste Master by ID
app.put("/updatewastemaster", authenticateJWT, async (req, res) => {
  let connection;
  try {
    connection = await getPoolConnection();
    
    const id = req.body.id;
    const product_id = req.body.product_id;
    const cat_id = req.body.cat_id;
    const expected_waste_percentage = req.body.expected_waste_percentage;
    const qty = req.body.qty;
    const fiber = req.body.fiber;
    const expected_waste = req.body.expected_waste;

    // Check if a record with the same product_id, cat_id, and date already exists
    const checkDuplicateQuery = `SELECT * FROM waste_master WHERE product_id = ? AND cat_id = ? AND date = ? AND id != ?`;
    const results = await executeQuery(connection, checkDuplicateQuery, [product_id, cat_id, currentDate, id]);

    if (results.length > 0) {
      res.status(400).json({ success: false, message: 'Wastage already exists for this product and category on this date!' });
    } else {
      const updateQuery = `UPDATE waste_master SET product_id = ?, cat_id = ?, expected_waste_percentage = ?, qty = ?, fiber = ?, expected_waste = ?, date = ? WHERE id = ?`;
      const result = await executeQuery(connection, updateQuery, [product_id, cat_id, expected_waste_percentage, qty, fiber, expected_waste, currentDate, id]);

      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Waste Master updated successfully.' });
      } else {
        res.status(400).json({ success: false, message: 'No records updated. Please check the provided ID.' });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during update' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get("/getWasteMasterById/:id", authenticateJWT, async (req, res) => {
  let connection;
  try{
  
      connection = await getPoolConnection();
  const id = req.params.id;
   const query = 'SELECT * FROM waste_master WHERE id = ?';
   const result = await executeQuery(connection,query, [id]);

   if (result.length > 0) {
    const subcategory = result[0];
    res.status(200).json(subcategory);
  } else {
    res.status(404).json({ message: 'Subcategory not found' });
  }

} catch (error) {
  // Handle exceptions
  console.error('Error:', error.message);
  //res.status(500).json({ error: 'Internal Server Error' });
  res.status(500).json({ success: false, message: 'An error occurred during login' });
} finally {
  // Release the connection back to the pool in case of success or error
  if (connection) {
    connection.release();
    // console.log("connection released");
  }
}
});
app.listen(4000);
console.log("Server Started : http://192.168.29.243:4000"); 