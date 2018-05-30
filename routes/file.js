var express = require('express');
var router = express.Router();
var fileDao = require('../dao/fileDao').fileDao;
var formidable=require('formidable');
var AVATAR_UPLOAD_FILE='/uploads/userfile/';
var util = require('../utils/util');
var fs = require('fs');
var nodeExcel = require('excel-export');
const disableLayout ={layout: false};
//文件列表
router.get('/getfile', function(req, res, next) {
    var user = req.query;
    if(user) {
        fileDao.getFileTotal(function (resu) {
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
                fileDao.getFile(data,function (result) {
                    if (result == 'e004') {
                        res.json({
                            data: null,
                            success: false,
                            message: '服务器错误!'
                        })
                    } else {
                        if (result.length) {
                            res.json({
                                data: result,
                                totalSize:resu[0].totalSize,
                                success: true,
                                message: '查询成功!'
                            })
                        } else if (result.length == 0) {
                            res.json({
                                data: null,
                                success: true,
                                message: '没有数据!'
                            })
                        } else {
                            res.json({
                                data: null,
                                success: false,
                                message: '查询失败!'
                            })
                        }
                    }
                })
            }
        })

    }
});
//上传文件
router.post('/uploadfile',function(req,res,next){
    var id = req.query.id;
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.locals.error = err;
            res.json({
                data: null,
                success: false,
                message: '服务器错误!',
            });
            return;
        }
        var extName = '';  //后缀名
        if(files.file.name.lastIndexOf('.')){
            extName = files.file.name.substr(files.file.name.lastIndexOf('.'));
        }
        if (extName.length == 0) {
            res.json(
                {
                    data: null,
                    success: false,
                    message: '上传的文件不合法!',
                }
            );
            return;
        }
        else {
            var filename = files.file.name;
            var filesize = files.file.size;
            var filetime = util.dateFormat(files.file.lastModifiedDate,"yyyy-MM-dd hh:mm:ss")
            if(filesize > 20 * 1024 * 1024){
                return;
            }
            form.uploadDir = "C:/myapp/public" + AVATAR_UPLOAD_FILE;     //设置上传目录
            // form.uploadDir = "E:/node/myapp/public" + AVATAR_UPLOAD_FILE;     //设置上传目录
            form.keepExtensions = true;     //保留后缀
            form.maxFieldsSize = 20 * 1024 * 1024;
            var avatarName = util.createUnique() + extName;   //随机生成文件名字
            var newPath = form.uploadDir + avatarName;   //新的文件路径
            var readStream = fs.createReadStream(files.file.path); //先读取原路径
            var writeStream = fs.createWriteStream(newPath);//后写入新路径
            readStream.pipe(writeStream);   //把当前的可读流和另外一个可写流连接起来,可读流中的数据会被自动写入到可写流中
            readStream.on('end', function () {
                fs.unlinkSync(files.file.path);  //读写完之后删除文件
            });
            fileDao.upFile(id,filename,filesize,newPath,filetime,function (result) {
                if(result=='e004'){
                    fs.unlinkSync(newPath);
                    res.json( {
                        data: null,
                        success:false,
                        message:'服务器出现故障!',
                    });
                }else{
                    if(result.affectedRows){
                        res.json({
                            data: {
                                data:avatarName,
                            },
                            success:true,
                            message:'返回成功!',
                        });
                    }
                    else{
                        fs.unlinkSync(newPath);
                        res.json( {
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
//下载文件
router.get('/downfile',function(req,res,next) {
    var user = req.query;
    if(user){
        res.download(user.path);
    }else{
        res.send('错误的请求');
    }
});
//下载自己排版的excel
router.get('/databasedown',function(req,res,next) {
    var conf ={};
    conf.stylesXmlFile = "styles.xml";
    conf.name = "mysheet";
    //列属性
    conf.cols = [{
            caption:'string',
            type:'string',
            beforeCellWrite:function(row, cellData){
                return cellData.toUpperCase();
            },
            width:28.7109375
        },
        {
            caption:'date',
            type:'date',
            beforeCellWrite:function(){
                var originDate = new Date(Date.UTC(1899,11,30));
                return function(row, cellData, eOpt){
                    if (eOpt.rowNum%2){
                        eOpt.styleIndex = 1;
                    }
                    else{
                        eOpt.styleIndex = 2;
                    }
                    if (cellData === null){
                        eOpt.cellType = 'string';
                        return 'N/A';
                    } else{
                        return (cellData - originDate) / (24 * 60 * 60 * 1000);
                    }
                }
            }()
        },
        {
            caption:'bool',
            type:'bool',
        },
        {
            caption:'number',
            type:'number'
        }];
    //行配置
    conf.rows = [
        ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
        ["e", new Date(Date.UTC(2012, 4, 1)), false, 2.7182],
        ["M&M", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
        ["null date", null, true, 1.414]
];
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
});

router.get('/showupload',function(req,res,next) {
    var user = req.query;
    if(user){
       fileDao.showupload(user.id,function (result) {
           if (result == 'e004') {
               res.json({
                   data: null,
                   success: false,
                   message: '服务器错误!'
               })
           } else {
               if(result[0].icon == null){
                   let icon = '0.png'
                   res.json({
                       data: icon,
                       success: true,
                       message: '使用初始头像!'
                   })
               }else{
                   res.json({
                       data: result[0].icon,
                       success: true,
                       message: '使用上传头像!'
                   })
               }
           }
       })
    }else{
        res.send('错误的请求');
    }
});


module.exports = router;