// middlewares/validateRequest.js
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
