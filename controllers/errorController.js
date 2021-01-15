module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //err.message = `Cant find ${req.originalUrl} on the server`;
  console.log(err);
  if (err.statusCode === 401 || err.statusCode === 403)
    res.status(err.statusCode).render('noView');
  else res.status(err.statusCode).render('Error');
};
