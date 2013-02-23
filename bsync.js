var async;
module.exports = hsync = require('async');
module.exports.eachLimitRetry = eachLimitRetry;

/**
 * eachLimitRetry functions in the same way Async's eachLimit does with
 * the exception that it will retry failed tasks if true is passed into
 * the worker callback.
 *
 * eachLimitRetry(array items, number limit, function worker, function complete)
 *  worker(* item, number attempts, function done)
 *    done([error|boolean err])
 *  complete([error err])
 *
 * eachLimitRetry()
 * items     array         Array of data items you wish to process.
 * limit     number        Maximum number of parallel processes that can run simultaneously.
 * worker    function      Function that will preform a task on each item of data.
 * complete  function      Function that will be called once all data has been processed.
 * 
 *   worker()
 *   item      *             Current data item.
 *   attempt   *             The current attempt count.
 *   done      function      Optional. Callback that must be executed by the worker when done.
 *
 *     done()
 *     err       error|boolean An error if the worker wishes to report a failure, false if it wishes to retry.
 *   
 *   complete()
 *   err       error An error if the worker reported an error on any of the data within the items array.
 */
function eachLimitRetry(data, limit, worker, done) {
  var reData = [], dI;

  //wrap the data so we can count the executions
  for(dI = 0; dI < data.length; dI += 1) {
    data[dI] = { "attempt": 0, "value": data[dI] };
  }

  //start processing the data
  exec();

  /**
   * Processes the data
   */
  function exec() {
    hsync.eachLimit(data, limit, hsyncWorker, hsyncDone);
  }

  /**
   * Iterates the number of attempt, and wraps the worker
   */
  function hsyncWorker(item, asyncCallback) {
    var index;

    //iterate attempts and execute the worker
    item.attempt += 1;
    return worker(item.value, item.attempt, hsyncCallback);

    /**
     * Wraps async's worker callback so retries can be queued
     */
    function hsyncCallback(err) {
      if(err === false) { reData.push(item); err = null; }
      asyncCallback(err);
    }
  }

  /**
   * Wraps done. Processes retries, if any. Calls done when all data has been processed.
   */
  function hsyncDone(err) {
    if(reData.length > 0) {
      data = reData;
      reData = [];
      return exec();
    } else {
      return done(err);
    }
  }
}
