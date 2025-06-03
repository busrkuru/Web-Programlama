const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Checkout sayfasını oluştur
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) İlgili turu bul
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Bu ID ile bir tur bulunamadı.', 404));
  }

  // 2) Kişi sayısını ve fiyatı kontrol et
  const participants = req.body.participants || 1;
  const totalPrice = tour.price * participants;

  // 3) Stripe checkout session oluştur
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Turu`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
            ],
          },
          unit_amount: tour.price * 100, // Cent cinsinden
        },
        quantity: participants
      }
    ]
  });

  // 4) Session ID'sini cevap olarak gönder
  res.status(200).json({
    status: 'success',
    session
  });
});

// Stripe webhook'unu işle
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Ödeme tamamlandığında rezervasyonu oluştur
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

// Ödeme sonrası rezervasyon oluştur
const createBookingCheckout = async session => {
  const tourId = session.client_reference_id;
  const userId = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  
  await Booking.create({ tour: tourId, user: userId, price });
};

// Tüm ödemeleri listele (Admin için)
exports.getAllPayments = catchAsync(async (req, res, next) => {
  const payments = await stripe.paymentIntents.list();
  
  res.status(200).json({
    status: 'success',
    results: payments.data.length,
    data: {
      payments: payments.data
    }
  });
});
