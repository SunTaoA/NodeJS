var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var tools =require('../common/tools');

var sqlite3 = require('sqlite3').verbose();
var dbo = require("../common/dbOperation");

dbo.EnsureDBPrepared();

router.route('/makeFriends')
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

router.route('/getFriends')
      .get(function(req, res){
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
    
router.route('/getCommonFriends')
      .get(function(req, res){
                 var emails =tools.getEmailPair(req.body);
                 var first = emails[0];
                 var second = emails[1];
                 var db = new sqlite3.Database('./db/friends.db');
                 var ret ="";
    
                 db.serialize(function() {
                    var sql = " select a.email from "
                        sql = sql + " (select distinct ReqEmail as email from friends where TargetEmail ='" + first + "' and Type=1";
                        sql = sql + "  union select distinct TargetEmail from friends where ReqEmail='" + first + "' and Type=1) a";
                        sql = sql + " where a.email in ";
                        sql = sql +  "( select distinct ReqEmail from friends where TargetEmail ='" + second + "' and Type = 1";
                        sql = sql + " union select distinct TargetEmail from friends where ReqEmail='" + second + "' and Type =1)";
                        
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
        
router.route('/subUpdates')
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

router.route('/blockUpdates')
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

router.route('/getEmailsForUpdates')
      .get(function(req, res) {
          
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

                                var extraEmailNum = 0;
                                if(appendEmails.length > 0)
                                  {
                                     if (ret.length> 0) 
                                          ret = ret + "," + appendEmails;
                                     else 
                                          ret = appendEmails;
                                  
                                     extraEmailNum = appendEmails.split(',').length;
                                  }
                            
                                var num =  rows.length + extraEmailNum;
                                ret ="[" + ret + "]";
                                ret = '"sucess":true,"friends":' + ret + ',"Count":' + num;
                                res.status(200).send(ret);
                              }
                        });
              });
         })


module.exports = router;