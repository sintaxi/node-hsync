var config, hsync;

config = require('./config.json');
hsync = require('../hsync.js');

describe('eachLimitRetry', function() {

  it('should process in parallel with limit', function(ok) {
    var test = config.ok10, i = 0;

    hsync.eachLimitRetry(test.data, test.limit, worker, complete);

    if(i === 0) { ok(new Error('eachLimitRetry must run.')); }

    function worker(item, attempts, done) {
      i += 1;
      setTimeout(function() {
        if(i === 1 && i !== test.limit) { ok(new Error('eachLimitRetry must process ' + test.limit + 'at a time.')); }
        done();
      }, 0);
    }

    function complete(err) {
      var l;
      l = test.data.length;
      if(i !== l) { ok(new Error('Worker should execute ' + l + ' times.')); }
      else { ok(); }
    }
  });

  it('should be able to reprocess failed data.', function(ok) {
    var test = config.retry5, i = 0;

    hsync.eachLimitRetry(test.data, test.limit, worker, done);

    function worker(item, attempt, done) {
      setTimeout(function() {
        if(attempt > 1) { i += 1; done(); }
        else if(item === false) { done(false); }
        else { done(); }
      }, 0);
    }

    function done(err) {
      if(i !== 5) { console.log(i); ok(new Error('Worker should retry 5 times.')); }
      else { ok(); }
    }
  });
});
