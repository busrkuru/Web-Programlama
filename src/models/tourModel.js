const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bir tur ismi olmalıdır'],
      unique: true,
      trim: true,
      maxlength: [40, 'Bir tur ismi en fazla 40 karakter olabilir'],
      minlength: [10, 'Bir tur ismi en az 10 karakter olmalıdır']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Bir tur süresi olmalıdır']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Bir tur için grup büyüklüğü olmalıdır']
    },
    difficulty: {
      type: String,
      required: [true, 'Bir tur için zorluk seviyesi olmalıdır'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Zorluk seviyesi: easy, medium veya difficult olabilir'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Değerlendirme 1.0\'dan az olamaz'],
      max: [5, 'Değerlendirme 5.0\'dan fazla olamaz'],
      set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Bir tur için fiyat olmalıdır']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'İndirim fiyatı ({VALUE}) normal fiyattan büyük olamaz'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Bir tur için açıklama olmalıdır']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Bir tur için kapak resmi olmalıdır']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
