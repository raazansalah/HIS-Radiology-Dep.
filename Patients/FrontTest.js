const express = require('express');
const path = require('path');
const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
const server = app.listen(3000);
app.use('/',(req,res)=>{
    res.status(200).render('index',{
         Patients: [
             {p_name:'mohamed',p_ssn:123,p_id:1,p_sex:'m',p_bdate:'12/1/1989',p_:'8hrs',p_phone:'010245488',p_phone:1234,p_email:'sjhbdhedue@djd',p_scans:'CT'},
         ]
        //ADD data to test
    });
});
