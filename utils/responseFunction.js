const responseProvider = (res, success, statusCode, message, data = {}) => {
  try {
    // console.log( success, statusCode, message, data)
    return res.status(statusCode).json({
      message,
      success,
      data,
    });
  } catch (err) {
    console.error("error occured in response Provider :; ", err);
  }
};

export default responseProvider;
