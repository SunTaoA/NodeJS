
//tools.js  for common functions

module.exports ={

 // extract emails from string: {friends:['andy@example.com','jason@example.com']}
 getEmailPair: function (body)
                {
                  var str = new String();
                  console.log(body);
                  str = JSON.stringify(body);   
                  console.log(str); 
                  str = str.replace(/'/g,"").replace(/"/g,"");
                  console.log(str);
                  var startIndex = str.indexOf("[");
                  var endIndex =str.indexOf("]");
                  console.log(startIndex + ":" + endIndex);
                  var emails =str.substring(startIndex+1,endIndex).split(',');
                  emails.forEach(x => console.log(x));
                  return emails;
                },

//extract email from string: {email:andy@example.com}
getEmailSingle:function(body)
                {
                    var str = new String();
                    console.log(body);
                    str = JSON.stringify(body);   
                    console.log(str); 
                    str = str.replace(/'/g,"").replace(/"/g,"").replace(/{/g,"").replace(/}/g,"");
                    console.log(str);
                    var email =str.split(':');
                    //emails.forEach(x => console.log(x));
                    console.log(email);
                    return email[1].trim();
                },

//extract emails from string: {requestor:andy@example.com,target:jason@example.com}
getEmailSubBlockUpdates: function (body)
                {
                  var str = new String();
                  console.log(body);
                  str = JSON.stringify(body);   
                  console.log(str); 
                  str = str.replace(/'/g,"").replace(/"/g,"").replace(/{/g,"").replace(/}/g,"");
                  console.log(str);
                   //var emails =JSON.parse(str);
                   var emails =str.split(',');
                   var ret =[];
                   ret[0] =emails[0].split(':')[1];
                   ret[1] =emails[1].split(':')[1];
                   ret.forEach(x => console.log(x));
                   return ret;  
                },

//extract emails from string: {"sender":  "john@example.com", "text": "Hello World! kate@example.com"}
getEmailReceiveUpdates:function (body)
                {
                   var str = new String();
                   console.log(body);
                   str = JSON.stringify(body);   
                   console.log(str); 
                   str = str.replace(/'/g,"").replace(/"/g,"").replace(/{/g,"").replace(/}/g,"");
                   console.log(str);
                   //var emails =JSON.parse(str);
                   var emails =str.split(',');
                   var ret =[];
                   ret[0] =emails[0].split(':')[1];
                   ret[1] =emails[1].split(':')[1];
                   ret[1] =getEmailFromStr(ret[1]);
                   ret.forEach(x => console.log(x));
                   return ret;  
                }
}

//extract email address from string: Hello World! kate@example.com
function getEmailFromStr(str)
{
   var ary = str.split(' ').filter(x => (x.trim().indexOf('@')> 0) && (x.trim().indexOf('.') > 0));
   var ret="";
   for(var i=0; i <= ary.length-1; i++)
     if( i == ary.length-1)   
         ret= ret + ary[i];
     else
         ret = ret + ary[i] + ",";
    
    console.log(ret);
    return ret;
}



