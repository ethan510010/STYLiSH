const validateEmail = (req, res, next) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const validEmail = re.test(String(req.body.email).toLowerCase());
  if (validEmail) {
    next();
  } else {
    res.send('請確認email的格式');
  }
};

module.exports = {
  validateEmail,
};
