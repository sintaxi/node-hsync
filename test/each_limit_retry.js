var hsync   = require('../')
var should  = require("should")

describe('eachLimitRetry', function() {
  
  /**
   *
   * This iterator will base its retry attempts based on
   * the item string that is passed in.
   *
   *  "fail:never"  will pass every time.
   *  "fail:always" will fail every time and stop retrying after 3 attempts.
   *  "fail:<n>"    will fail <n> number of times before passing.
   *
   */
  var iterator = function(item, attempt, next){
    process.stdout.write(".")
    
    var pass = function(){ 
      process.stdout.write("p")
      next(null)
    }
    
    var retry = function(){ 
      process.stdout.write("r")
      next(false)
    }
    
    var fail = function(){ 
      process.stdout.write("f")
      next("item failed")
    }
    
    setTimeout(function(){
      if(item == "fail:never"){
        pass() 
      }else{ 
        if(item == "fail:always"){
          attempt < 3 ? retry() : fail()
        }else{          
          var timesToFail = parseInt(item.split(":")[1])
          attempt <= timesToFail ? retry() : pass()
        }
      }
    }, 10)
  }

  it('should process in series with limit 1', function(done) {
    var arr = ["fail:never", "fail:never", "fail:never"]
    hsync.eachLimitRetry(arr, 1, iterator, function(errors, retries){
      should.not.exist(errors)
      done()
    })
  })
  
  it('should process in paralell with limit 3', function(done) {
    var arr = ["fail:never", "fail:never", "fail:never"]
    hsync.eachLimitRetry(arr, 3, iterator, function(errors, retries){
      should.not.exist(errors)
      done()
    })
  })
  
  it('should process in paralell with limit 2', function(done) {
    var arr = ["fail:never", "fail:never", "fail:never"]
    hsync.eachLimitRetry(arr, 2, iterator, function(errors, retries){
      should.not.exist(errors)
      done()
    })
  })
  
  it('should eventually pass', function(done) {
    var arr = ["fail:2", "fail:50", "fail:1"]
    hsync.eachLimitRetry(arr, 2, iterator, function(errors, retries){
      should.not.exist(errors)
      done()
    })
  })
  
  it('should not pass ', function(done) {
    var arr = ["fail:2", "fail:always", "fail:5"]
    hsync.eachLimitRetry(arr, 2, iterator, function(errors, retries){
      should.exist(errors)
      done()
    })
  })
  
})
