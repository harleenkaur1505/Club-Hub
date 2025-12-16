// models/Committee.js
const mongoose = require('mongoose')

const CommitteeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Committee', CommitteeSchema)
