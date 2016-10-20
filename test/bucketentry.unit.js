'use strict';

const storj = require('storj-lib');
const expect = require('chai').expect;
const mongoose = require('mongoose');

require('mongoose-types').loadTypes(mongoose);

const FrameSchema = require('../lib/models/frame');
const BucketSchema = require('../lib/models/bucket');
const BucketEntrySchema = require('../lib/models/bucketentry');

var Frame;
var Bucket;
var BucketEntry;
var connection;

before(function(done) {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    function() {
      Frame = FrameSchema(connection);
      Bucket = BucketSchema(connection);
      BucketEntry = BucketEntrySchema(connection);
      done();
    }
  );
});

after(function(done) {
  Frame.remove({}, function() {
    Bucket.remove({}, function() {
      BucketEntry.remove({}, function(){
        connection.close(done);
      });
    });
  });
});

describe('Storage/models/BucketEntry', function() {

  it('should create the bucket entry metadata', function(done) {
    Bucket.create({ _id: 'user@domain.tld' }, { name: 'New Bucket2' }, function(err, bucket) {
      var frame = new Frame({});
      frame.save(function(err) {
        expect(err).to.not.be.instanceOf(Error);
        var entry = BucketEntry.create({
          frame: frame._id,
          bucket: bucket._id,
          name: 'test.txt'
        }, function(err, entry) {
          done();
        });
      });
    });
  });

  it('should fail with invalid mimetype', function(done) {
    Bucket.create({ _id: 'user@domain.tld' }, {}, function(err, bucket) {
      var frame = new Frame({

      });
      frame.save(function(err) {
        expect(err).to.not.be.instanceOf(Error);
        var entry = BucketEntry.create({
          frame: frame._id,
          mimetype: 'invalid/mimetype',
          bucket: bucket._id,
          name: 'test.txt'
        }, function(err) {
          expect(err).to.be.instanceOf(Error);
          done();
        });
      });
    });
  });

});
