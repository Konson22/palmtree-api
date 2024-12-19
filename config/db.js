const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'palm_tree_db'
});

dbConnection.connect(err => {
    if(err){
        console.log(err)
        return
    }else{
        console.log('Connected successfully!')
    }
});


module.exports = dbConnection