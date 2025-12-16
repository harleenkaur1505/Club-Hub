// models/Event.js
const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    venue: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Event', EventSchema)
