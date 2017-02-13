'use strict';

const mongoose = require('mongoose');
const errors = require('storj-service-error-types');
const SchemaOptions = require('../options');
const {
  PROMO_AMOUNT,
  REFERRAL_TYPES
} = require('../constants');
const { isValidEmail } = require('../utils');

const Referral = new mongoose.Schema({
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Marketing',
      required: true,
      index: true
    },
    amount_to_credit: {
      type: Number,
      default: PROMO_AMOUNT.REFERRAL_SENDER,
      min: 0
    },
    credit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credit'
    },
    referralLink: {
      type: String,
      required: true,
      index: true
    }
  },
  recipient: {
    email: {
      type: String,
      required: true,
      index: true
    },
    amount_to_credit: {
      type: Number,
      default: PROMO_AMOUNT.REFERRAL_RECIPIENT,
      min: 0
    },
    credit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credit'
    },
    min_billed_requirement: {
      type: Number,
      default: PROMO_AMOUNT.MIN_BILLED_REQUIREMENT_DEFAULT,
      min: 0
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  converted: {
    recipient_signup: {
      type: Date
    },
    recipient_billed: {
      type: Date
    }
  },
  type: {
    type: String,
    enum: Object.keys(REFERRAL_TYPES).map((key) => REFERRAL_TYPES[key]),
  }
});

Referral.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
  }
});

// NB: Methods promisified to match use of Promises in bridge-gui

/**
 * Creates new referral doc
 * @param {object} marketing - marketing id
 * @param {string} recipientEmail - recipient email
 * @param {string} type - type of referral ('link' or 'email')
 */
Referral.statics.create = function(marketing, recipientEmail, type) {
  var Referral = this;

  return new Promise((resolve, reject) => {

    if (!isValidEmail(recipientEmail)) {
      return reject(new errors.BadRequestError('Invalid email'));
    }

    var referral = new Referral({
      sender: {
        id: marketing._id,
        referralLink: marketing.referralLink
      },
      recipient: {
        email: recipientEmail
      },
      type
    });

    referral.save()
      .then((referral) => resolve(referral))
      .catch((err) => reject(err));
  });
};

/**
 * Records when a recipient of the referral has signed up to be a user
 * (conversion step 1 of 2)
 */
Referral.methods.convert_recipient_signup = function(credit) {
  const referral = this;

  return new Promise((resolve, reject) => {
    referral.converted.recipient_signup = credit.created;
    referral.recipient.credit = credit._id;

    referral.save()
      .then((referral) => resolve(referral))
      .catch((err) => reject(err));
  });
};

Referral.plugin(SchemaOptions, {
  read: 'secondaryPreferred'
});

module.exports = function(connection) {
  return connection.model('Referral', Referral);
};