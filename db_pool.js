var mysql = require('mysql');
var options = {
    host:'localhost',
    port:'3306',
    user:'root',
    password:'root',
    database:'node',
}
var pool = mysql.createPool(options);
pool.connectionLimit = 20;
pool.queueLimit = 30;
exports.pool = pool;
