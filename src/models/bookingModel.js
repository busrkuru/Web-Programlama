const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Rezervasyon bir tura ait olmalıdır']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rezervasyon bir kullanıcıya ait olmalıdır']
    },
    price: {
      type: Number,
      required: [true, 'Rezervasyon bir fiyata sahip olmalıdır']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    paid: {
      type: Boolean,
      default: true
    },
    participants: {
      type: Number,
      required: [true, 'Katılımcı sayısı belirtilmelidir'],
      min: [1, 'Katılımcı sayısı en az 1 olmalıdır']
    },
    startDate: {
      type: Date,
      required: [true, 'Rezervasyon başlangıç tarihi belirtilmelidir']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Populate tour and user whenever a query is executed
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name imageCover duration'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
