var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var tools =require('../common/tools');

var sqlite3 = require('sqlite3').verbose();

//prepare db and table;
var db = new sqlite3.Database('./db/friends.db');
var sql =" drop table friends";
db.serialize(function(){
      //db.run(sql);
      sql ="CREATE TABLE if not exists friends ";
      sql = sql +   "(ID INTEGER PRIMARY KEY   AUTOINCREMENT,";
      sql = sql +  "  ReqEmail Text not null,";
      sql = sql +  "  TargetEmail Text not null,";
      sql = sql +  "  Type integer not null)";
      console.log(sql);
      db.run(sql);
});
db.close();

router.route('/MakeFriends')
      .post(function(req, res) {
          var ary = tools.getEmailPair(req.body); 
          var reqEmail=ary[0];
          var targetEmail = ary[1];
          var sql ="insert into friends(ID,ReqEmail, TargetEmail,Type) values(NULL,'" + reqEmail + "','" + targetEmail + "', 1)";
          var db = new sqlite3.Database('./db/friends.db');
          
          db.serialize(function() {
                  db.run(sql,function(err){
                     
                     db.close();  //sql has executed, can close db now. 
                     if(err)
                       {
                           console.log("err:" + err);
                           res.status(500).send({"err:":err});
                       }
                       else
                          res.status(200).send({"sucess":true});
                  });
            });
       })

router.route('/GetFriends')
      .post(function(req, res){
             var email = tools.getEmailSingle(req.body);
             console.log(email);
             var db = new sqlite3.Database('./db/friends.db');
             var ret ="";

             db.serialize(function() {
                    var sql =" select distinct ReqEmail as email from friends where TargetEmail ='" + email + "' and Type=1";
                    sql = sql + " union select TargetEmail from friends where ReqEmail='" + email + "' and Type=1";
                    
                    db.all(sql, (err, rows) =>{ 
                      
                      db.close();  //sql has executed, result stored in rows, can close db now.
                      if(err)
                         {
                             console.log(err);
                             res.status(500).send({"err:":err});
                         }
                       else
                       {  
                           for(var i = 0; i < rows.length; i++ )
                            {
                                if(i == rows.length-1)
                                  ret = ret + rows[i].email;
                                else
                                  ret = ret + rows[i].email + ",";
                            }
                            ret ="[" + ret + "]";
                            ret = '"sucess":true,"friends":' + ret + '","Count":' + rows.length;
                            res.status(200).send(ret);
                       }
                    });
          });
        })
    
router.route('/GetCommonFriends')
      .post(function(req, res){
                 var emails =tools.getEmailPair(req.body);
                 var first = emails[0];
                 var second = emails[1];
                 var db = new sqlite3.Database('./db/friends.db');
                 var ret ="";
    
                 db.serialize(function() {
                    var sql = " select a.email from "
                        sql = sql + " (select distinct ReqEmail as email from friends where TargetEmail ='" + first + "'";
                        sql = sql + "  union select distinct TargetEmail from friends where ReqEmail='" + first + "') a";
                        sql = sql + " where a.email in ";
                        sql = sql +  "( select distinct ReqEmail from friends where TargetEmail ='" + second + "'";
                        sql = sql + " union select distinct TargetEmail from friends where ReqEmail='" + second + "')";
                        
                        console.log(sql);
                        db.all(sql, function(err, rows){
                                if(err)
                                  {
                                    console.log(err);
                                    res.status(500).send({"err:":err});
                                  }
                                 else
                                  {
                                    for(var i = 0; i < rows.length; i++ )
                                    {
                                        if(i == rows.length-1)
                                          ret = ret + rows[i].email;
                                        else
                                          ret = ret + rows[i].email + ",";
                                    }
                                    ret ="[" + ret + "]";
                                    ret = '"sucess":true,"friends":' + ret + ',"Count":' + rows.length;
                                    res.status(200).send(ret);
                                  }
                        });
                   });
              })
        
router.route('/SubUpdates')
      .post(function(req, res) {
                  var emails = tools.getEmailSubBlockUpdates(req.body);
                  var reqEmail = emails[0];
                  var targetEmail = emails[1];
                  console.log(reqEmail + ":" + targetEmail);
                  var sql ="insert into friends(ID,ReqEmail, TargetEmail,Type) values(NULL,'" + reqEmail + "','" + targetEmail + "', 2)";
                  var db = new sqlite3.Database('./db/friends.db');

                  db.serialize(function() {

                     db.run(sql, function(err){
                               if(err)
                                  {
                                      console.log("err:" + err);
                                      res.status(500).send({"err":err});
                                  }
                                else
                                  {
                                      res.status(200).send({"success":true});
                                  }
                         });
               });
            })

router.route('/BlockUpdates')
      .post(function(req, res) {
                var emails = tools.getEmailSubBlockUpdates(req.body);
                var reqEmail = emails[0];
                var targetEmail = emails[1];
                console.log(reqEmail + ":" + targetEmail);
                var sql ="insert into friends(ID,ReqEmail, TargetEmail,Type) values(NULL,'" + reqEmail + "','" + targetEmail + "', 3)";
                var db = new sqlite3.Database('./db/friends.db');
                           
                db.serialize(function() {
                        db.run(sql, function(err){
                          if(err)
                            {
                                console.log("err:" + err);
                                res.status(500).send({"err":err});
                            }
                          else
                            {
                                res.status(200).send({"success":true});
                            }
                        });
                    });
        })

router.route('/GetEmailsForUpdates')
      .post(function(req, res) {
          
          var emails = tools.getEmailReceiveUpdates(req.body);
          var email = emails[0];
          var appendEmails = emails[1];
          var sql =" select fri.email from "
          sql =sql + " (select distinct ReqEmail as email from friends where TargetEmail ='" + email + "' and Type = 1";
          sql = sql + " union select distinct TargetEmail from friends where ReqEmail ='" + email + "' and (Type = 1 or Type =2))";
          sql = sql + "  fri "
          sql = sql + " where fri.email not in (select ReqEmail from friends where TargetEmail =' " + email + "' and Type =3)"
          
          var db = new sqlite3.Database('./db/friends.db');
          
          var ret = "";
          db.serialize(function() {
                 
                        db.all(sql, function(err, rows){
                            if(err)
                               {
                                   console.log("err:" + err);
                                   res.status(500).send({"err":err});
                               }
                            else
                              {
                                for(var i = 0; i < rows.length; i++ )
                                {
                                    if(i == rows.length-1)
                                      ret = ret + rows[i].email;
                                    else
                                      ret = ret + rows[i].email + ",";
                                }
                                if(appendEmails.length > 0)
                                    ret = ret + "," + appendEmails;
                                
                                ret ="[" + ret + "]";
                                ret = '"sucess":true,"friends":' + ret + ',"Count":' + rows.length;
                                res.status(200).send(ret);
                              }
                        });
              });
         })


module.exports = router;