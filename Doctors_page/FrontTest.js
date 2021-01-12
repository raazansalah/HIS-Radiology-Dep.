const express = require('express');
const path = require('path');
const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
const server = app.listen(3000);
app.use('/',(req,res)=>{
    res.status(200).render('index',{
         doctors: [{D_name:'mohamed',D_ssn:123,D_id:1,D_sex:'m',D_bdate:'12/1/1989',D_add:'cairo',D_hours:'8hrs',
        D_phone:'010245488',D_email:'sjhbdhedue@djd',D_device:"jashj"}
         ]
        //ADD data to test
    });
});
