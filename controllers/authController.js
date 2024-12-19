const bcryptjs = require('bcryptjs');

const dbConnection = require("../config/db");
const { createToken } = require('../middlewares/jwt');


const loginController = async (req, res) => {
  const {email, password} = req.body

  // Check if the user exists by email or phone
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  dbConnection.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res.status(404).send('Something went wrong!')
    }
    
    
    if (results.length == 0) {
      res.status(404).send('No user found!')
    } else {
      const user = results[0]
      const verified = await bcryptjs.compare(password, user.password)
      if(!verified){
        return res.status(409).send('Wrong Password!')
      }

      const userCredentials = {id:user.id, name:user.name, email:user.email, phone:user.phone}
      const ACCESS_TOKEN = await createToken(userCredentials);
      res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, {
        expires: new Date(Date.now() + (3600 * 1000 * 24 * 180 * 1)),
        httpOnly: true,
        sameSite: "none",
        secure: 'false',
      });
      res.json(userCredentials)
    }
    dbConnection.end();
  });
}


// REGISTER NEW USER
const registerController = async (req, res) => {
  const {name, email, phone, password} = req.body
  const hashPass = await bcryptjs.hash(password, 4);

  // Check if the user exists by email or phone
  const checkQuery = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  dbConnection.query(checkQuery, [email, phone], (err, results) => {
    if (err) {
      return res.status(404).send('Something went wrong!')
    }
  
    if (results.length > 0) {
      res.status(404).send('User already registered!')
    } else {
      const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
      dbConnection.query(
        insertQuery,
        [name, email, phone, hashPass],
        async (err, results) => {
          if (err) {
            res.status(404).send('Error inserting data:');
            return;
          }
          const userCredentials = {id:results.insertId, name, email, phone}
          const ACCESS_TOKEN = await createToken(userCredentials);
          res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, {
            expires: new Date(Date.now() + (3600 * 1000 * 24 * 180 * 1)),
            httpOnly: true,
            sameSite: "none",
            secure: 'false',
          });
          res.json(userCredentials)
        }
      );
    }
    // dbConnection.end();
  });
}

module.exports = { loginController, registerController }