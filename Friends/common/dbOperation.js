
//include all db operations in one file as a module
var sqlite3 = require('sqlite3').verbose();

module.exports = {
  
  //prepare db and table;
  EnsureDBPrepared: function(){
     
     let db = new sqlite3.Database('./db/friends.db');
     //let sql =" drop table friends";
     db.serialize(function(){
          //db.run(sql);
          sql ="CREATE TABLE if not exists friends ";
          sql = sql +   "(ID INTEGER PRIMARY KEY   AUTOINCREMENT,";
          sql = sql +  "  ReqEmail Text not null,";
          sql = sql +  "  TargetEmail Text not null,";
          sql = sql +  "  Type integer not null)";
          console.log(sql);
          db.run(sql, function(err){
              if(err)
                  console.log(err);
                 
              db.close();
          });
    });
 }
}

