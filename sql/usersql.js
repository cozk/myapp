exports.sql = {
    getPass:'select id,pass from user  where name = ? and remove = 1 ',
    getAlltable:'SELECT a.id,a.name,a.address,a.datetime from user a where a.remove = 1 LIMIT ?,? ',
    getNoRemove:'update user set remove = 2 where id = ?',
    getAlltableTotal:'select count(id) AS totalSize from user a where remove = 1',
    altericon:'update user set icon = ? where id = ? and remove = 1',
    getNameIcon:'select name,icon from user where id = ? and remove = 1',
}