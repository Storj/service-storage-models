'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');

require('mongoose-types').loadTypes(mongoose);

const StorageEventSchema = require('../lib/models/storage-event');

var StorageEvent;
var connection;

before(function(done) {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    function() {
      StorageEvent = StorageEventSchema(connection);
      StorageEvent.remove({}, function() {
        done();
      });
    }
  );
});

after(function(done) {
  connection.close(done);
});

describe('Storage/models/Storage-Event', function() {

  it('should create storage event with default props', function(done) {
    var newStorageEvent = new StorageEvent({
      user: 'user@gmail.com',
      downloadBandwidth: 0,
      storage: 1000000,
      farmer: 'c5857d99d3ff951701093b75fba94e1c82877f9b',
      client: 'user@gmail.com'
    });

    newStorageEvent.save(function(err, storeEvent) {
      if (err) {
        return done(err);
      }
      let ObjectIdType = mongoose.Types.ObjectId;
      expect(err).to.not.be.an.instanceOf(Error);
      expect(storeEvent._id).to.be.instanceOf(ObjectIdType);
      expect(storeEvent.user).to.be.a('string');
      expect(storeEvent.timestamp).to.be.an.instanceOf(Date);
      expect(storeEvent.downloadBandwidth).to.be.a('number');
      expect(storeEvent.storage).to.be.a('number');
      expect(storeEvent.farmer)
        .to.equal('c5857d99d3ff951701093b75fba94e1c82877f9b');
      expect(storeEvent.client).to.equal('user@gmail.com');
      expect(storeEvent.processed).to.equal(false);
      done();
    });
  });

  it('should save storage event with processed true', function(done) {
    var event = new StorageEvent({
      token: 'e09958405f0484f6ae54618f48c42ca365a922e9',
      user: 'user@gmail.com',
      downloadBandwidth: 0,
      storage: 1000001,
      farmer: '90310d438d3fa6e98082b9431eaf7a82be8a34c2',
      client: 'user@gmail.com',
      processed: true
    });

    event.save(function(err, storeEvent) {
      if (err) {
        return done(err);
      }
      expect(storeEvent.processed).to.equal(true);
      done();
    });
  });

  it('should not save without a bucket', function(done) {
    var newStorageEvent = new StorageEvent({
      bucketEntry: mongoose.Types.ObjectId(),
      user: 'user@gmail.com',
      downloadBandwidth: 0,
      storage: 1000000,
    });

    newStorageEvent.save(function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
  });

  it('should not save without a bucketEntry', function(done) {
    var newStorageEvent = new StorageEvent({
      bucket: mongoose.Types.ObjectId(),
      user: 'user@gmail.com',
      downloadBandwidth: 0,
      storage: 1000000,
    });

    newStorageEvent.save(function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
  });


  it('should not save without a user', function(done) {
    var newStorageEvent = new StorageEvent({
      bucket: mongoose.Types.ObjectId(),
      bucketEntry: mongoose.Types.ObjectId(),
      downloadBandwidth: 0,
      storage: 1000000,
    });

    newStorageEvent.save(function(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
  });
});
