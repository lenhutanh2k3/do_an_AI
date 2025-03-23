const response = (res, status, message = null, data = null) => {
    return res.status(status).json({
        message: message || (status >= 400 ? 'An error occurred' : 'Success'),
        data:data
    });
};

export default response;
