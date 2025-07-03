const mongoose = require('mongoose');

const sportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    leagues: [{
      name: String,
      description: String,
      imageUrl: String,
    }],
    gameModes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameMode',
    }],
  },
  {
    timestamps: true,
  }
);

const Sport = mongoose.model('Sport', sportSchema);

module.exports = Sport;
