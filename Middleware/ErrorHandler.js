const ErrorHandler = (err, req, res, next) => {
  const status = err.code || 500;

  //handling duplicate key error

  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern).join(",");
    err.message = `Duplicate fields : ${keys}. These Fields value must be unique`;
  }

  let errObject = {};
  if (process.env.APPLICATION_ENVIRONMENT === "developement") {
    errObject = {
      message: err.message,
      err,
    };
  } else {
    errObject = {
      message: err.message || "Internal Server Error",
    };
  }

  return res.status(status).json({
    success: false,
    message: { ...errObject },
  });
};

export default ErrorHandler;
