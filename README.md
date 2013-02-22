# hsync
----------------

A drop in replacement for `async` that adds a `eachLimitRetry` function. Useful for network calls which are intrinsically unreliable. Used on the Harp Platform.

### Install

I always recommend you bundle your dependencies with your application. To do
this, create a `package.json` file in the root of your project with the
minimum information...

    {
      "name": "yourapplication",
      "version": "0.1.0",
      "dependencies": {
        "hsync": "0.1.0"
      }
    }
    
Then run the following command using npm...

    npm install

OR, if you just want to start playing with the library run...

    npm install hsync
    
### Docs

    var async = require("hsync")
    
    var iterator = function(item, attempt, done){
      someuploader(item, function(err, reply){
        if(err & attempt < 3){
          done(false)
        }else{
          done(null)
        }
      })
    }
    
    async.eachLimitRetry(["itemOne", "itemTwo", "itemThree"], 2, iterator, function(err, replies){
      // finished all the tasks
    })
    
    
    