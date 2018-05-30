var pool = require('../db_pool').pool;
var userSql = require('../sql/usersql').sql


exports.userDao = {
    getPass:function (name,callback) {
        pool.getConnection(function (error,client) {
            if(error){
                return;
            }
            client.query(userSql.getPass,[name],function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    getAlltable:function (data,callback) {
        pool.getConnection(function (error,client) {
            if(error){
                return;
            }
            client.query(userSql.getAlltable,[data[0],data[1]],function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    getNoRemove:function (id,callback) {
        pool.getConnection(function (error,client) {
            if (error) {
                return;
            }
            client.query(userSql.getNoRemove,[id],function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    getAlltableTotal:function (callback) {
        pool.getConnection(function (error,client) {
            if(error){
                return;
            }
            client.query(userSql.getAlltableTotal,function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    altericon:function (path,id,callback) {
        pool.getConnection(function (error, client) {
            if (error) {
                return;
            }
            client.query(userSql.altericon,[path,id],function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    getNameIcon:function (id,callback) {
        pool.getConnection(function (error, client) {
            if (error) {
                return;
            }
            client.query(userSql.getNameIcon,[id],function (error,result) {
                if(error){
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    }
}