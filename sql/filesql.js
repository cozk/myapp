exports.sql = {
    getFileTotal:'select count(id) AS totalSize from file',
    getFile:'select * from file',
    upFile:'insert into file (userid,filename,filesize,path,filetime) values (?,?,?,?,?)',
    showupload:'select icon from user where id = ?'
}