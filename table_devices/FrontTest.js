const express = require('express');
const path = require('path');
const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
const server = app.listen(3000);
app.use('/',(req,res)=>{
    res.status(200).render('index',{
        devices: [{model:'mohamed',sdate:123,adate:1,techId:'m',subSec:'12/1/1989'}
        ]
        //ADD data to test
    });
});
