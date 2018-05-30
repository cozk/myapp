var pool = require('../db_pool').pool;
var fileSql = require('../sql/filesql').sql;

exports.fileDao = {
    getFileTotal:function (callback) {
        pool.getConnection(function (error, client) {
                if (error) {
                    return;
                }
            client.query(fileSql.getFileTotal,function (error, result) {
                if (error) {
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    getFile:function (data,callback) {
        pool.getConnection(function (error, client) {
            if (error) {
                return;
            }
            client.query(fileSql.getFile,[data[0],data[1]],function (error, result) {
                if (error) {
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    upFile: function (id,filename,filesize,newPath,filetime,callback) {
        pool.getConnection(function (error, client) {
            if (error) {
                return;
            }
            client.query(fileSql.upFile,[id,filename,filesize,newPath,filetime],function (error, result) {
                if (error) {
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    },
    showupload(id,callback){
        pool.getConnection(function (error, client) {
            if (error) {
                return;
            }
            client.query(fileSql.showupload, [id], function (error, result) {
                if (error) {
                    callback('e004');
                    return;
                }
                callback(result);
                client.release();
            })
        })
    }
}