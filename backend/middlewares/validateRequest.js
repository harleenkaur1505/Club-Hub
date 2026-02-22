// middlewares/validateRequest.js
//This middleware ensures that required request body fields are 
//present before processing the request, preventing invalid or incomplete API calls.
exports.requireBody = (fields = []) => {
  return (req, res, next) => {
    for (const f of fields) {
      if (typeof req.body[f] === 'undefined') {
        return res.status(400).json({ message: `${f} is required` })
      }
    }
    next()
  }
}
