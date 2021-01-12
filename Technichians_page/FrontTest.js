const express = require('express');
const path = require('path');
const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
const server = app.listen(3000);
app.use('/',(req,res)=>{
    res.status(200).render('index',{
         Technichians: [{T_name:'mohamed',T_ssn:123,T_id:1,T_sex:'m',T_bdate:'12/1/1989',T_add:'cairo',T_hours:'8hrs',
        T_phone:'010245488',T_email:'sjhbdhedue@djd',T_device:"dijhd"}
         ],
         devices:[{name:"djff",model:"guuh",service:"1/52/5",sec:"dhddh",arrival:"58/858/4"}]
        //ADD data to test
    });
});
