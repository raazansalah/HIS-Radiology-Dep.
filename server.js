//Here we deal with database configs,env variables,error handling stuff, etc..
const mongoose = require('mongoose');
const dotenv = require('dotenv'); //For environment variables

//Error handler: deals with error like printing undefined variables
//should be on top
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log(err);
  console.log('UNCAUGHT EXCEPTION');
  process.exit(1);
});

dotenv.config({ path: './configure.env' });
const app = require('./app.js');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    //returns a promise
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connected');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

//Errors like wrong password, system down, etc
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION');
  server.close(() => {
    //We used .close to handle remaining requests before closing
    process.exit(1);
  });
});
