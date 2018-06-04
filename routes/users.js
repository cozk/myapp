var express = require('express');
var router = express.Router();
var userDao = require('../dao/userDao').userDao;
var formidable=require('formidable');
var AVATAR_UPLOAD_FOLDER='/uploads/usericon/';
var util = require('../utils/util');
var fs = require('fs');
var path = require('path');
/* GET users listing. */

//登录接口
router.post('/user', function(req, res, next) {
    var user = req.body;
    console.log(user);
    if(user){
        userDao.getPass(user.name,function (result) {
            if(result == 'e004'){
                res.json({
                    data: null,
                    success:false,
                    message:'服务器错误!'
                })
            }else{
                if(result.length == 0){
                    res.json({
                        data:null,
                        success:false,
                        message:'没有找到密码!'
                    })
                }else{
                    if(user.pass == result[0].pass){
                        res.json({
                            data:result[0].id,
                            success:true,
                            message:'成功找到密码!'
                        })
                    }else{
                        res.json({
                            data:null,
                            success:false,
                            message:'密码错误!'
                        })
                    }
                }
            }
        })
    }
});
//删除用户接口（将1变成2）
router.get('/userdel', function(req, res, next) {
    var user = req.query;
    if(user){
        userDao.getNoRemove(user.id,function (result){
            if(result == 'e004'){
                res.json({
                    data: null,
                    success:false,
                    message:'服务器错误!'
                })
            }else{
                if(result.affectedRows){
                    res.json({
                        data: null,
                        success:true,
                        message:'删除成功!'
                    })
                }else{
                    res.json({
                        data: null,
                        success:false,
                        message:'删除失败!'
                    })
                }
            }
        })
    }
});
//用户列表接口
router.get('/usertable', function(req, res, next) {
    var user = req.query;
    if(user){
        userDao.getAlltableTotal(function (resu) {
            if(resu == 'e004'){
                resu.json({
                    data: null,
                    totalSize:0,
                    success:false,
                    message:'服务器错误!'
                })
            }else{
                var sta = (user.currentpage - 1) * user.pagesize;
                var size =  parseInt(user.pagesize);
                var data = [sta, size];
                userDao.getAlltable(data,function (result) {
                    if(result == 'e004'){
                        res.json({
                            data: null,
                            totalSize:0,
                            success:false,
                            message:'服务器错误!'
                        })
                    }else{
                        if(result.length == 0){
                            res.json({
                                data:null,
                                totalSize:0,
                                success:false,
                                message:'没有数据!'
                            })
                        }else{
                            res.json({
                                data:result,
                                totalSize:resu[0].totalSize,
                                success:true,
                                message:'返回成功!'
                            })
                        }
                    }
                })
            }
        })
    }
});
//上传图片接口
router.post('/userupload', function(req, res, next) {
    var id = req.query.id;
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.locals.error = err;
            res.json({
                data: null,
                success:false,
                message:'服务器错误!',
            });
            return;
        }
        var extName = '';  //后缀名
        if(files.file.type == 'image/png'){
            extName = 'png';
        }
        if(files.file.type == 'image/x-png'){
            extName = 'png';
        }
        if(files.file.type == 'image/jpg'){
            extName = 'jpg';
        }
        if(files.file.type == 'image/jpeg'){
            extName = 'jpg';
        }
        if(extName.length == 0){
            res.json(
                {
                    data: null,
                    success:false,
                    message:'上传的不是jpg或者png!',
                }
            );
            return;
        }
        else {
            var filesize = files.file.size;
            var repath = path.resolve(__dirname, '..','public').replace(/\\/g,'/');
            form.uploadDir = repath + AVATAR_UPLOAD_FOLDER;     //设置上传目录
            form.keepExtensions = true;     //保留后缀
            form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
            if(filesize > 20 * 1024 * 1024){
                return;
            }
            var avatarName = util.createUnique() + '.' + extName;   //随机生成图片名字
            var newPath = form.uploadDir + avatarName;   //新的图片路径
            var readStream = fs.createReadStream(files.file.path); //先读取原路径
            var writeStream = fs.createWriteStream(newPath);//后写入新路径
            readStream.pipe(writeStream);   //把当前的可读流和另外一个可写流连接起来,可读流中的数据会被自动写入到可写流中
            readStream.on('end', function () {
                fs.unlinkSync(files.file.path);  //读写完之后删除文件
            });
            userDao.altericon(avatarName,id,function (result) {
               if(result=='e004'){
                    fs.unlinkSync(newPath);
                    res.json( {
                        data: null,
                        success:false,
                        message:'服务器出现故障!',
                    });
                }else{
                   if(result.affectedRows){
                       userDao.getNameIcon(id,function (resu) {
                           if(resu){
                               res.json({
                                   data: {
                                       data:avatarName,
                                   },
                                   success:true,
                                   message:'返回成功!',
                               });
                           }else{
                               fs.unlinkSync(newPath);
                               res.json( {
                                   data: null,
                                   success:false,
                                   message:'服务器出现故障!',
                               });
                           }
                       })
                   }else{
                       fs.unlinkSync(newPath);
                       res.json({
                           data: null,
                           success:false,
                           message:'上传失败!',
                       });
                   }
               }

            })
        }
    });
});


module.exports = router;
