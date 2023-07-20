import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  host: {
    type: String,
    required: true,
    //* not unique in case the host crashes and wants to reopen a game
    // unique: true,
    trim: true,
  },
  players: {
    type: [String],
    required: true,
    unique: true,
    trim: true,
  },
  started: {
    type: Boolean,
    required: true,
  },
  finished: {
    type: Boolean,
    required: true,
  },
  highscore: Number,
});

export const Game = mongoose.model('Game', gameSchema);
