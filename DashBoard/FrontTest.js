const express = require('express');
const path = require('path');
const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(`${__dirname}/public`));
const server = app.listen(8000);
app.use('/',(req,res)=>{
    res.status(200).render('index',{
    title: 'Dashboard',    
    doctorsNum: [
        {name:'dave'},
        {name:'jerry'}
    ],
    
    medicalNum: [
        {name:'dave'},
        {name:'jerry'}
    ],
    techNum: [
        {name:'dave'},
        {name:'jerry'},
        {name:'sss'},
    ],
    patientsNum:[
       'g','g','g','g','g'
    ]

    
        //ADD data to test
    });
});
