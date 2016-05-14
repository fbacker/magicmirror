/* =========================================================================
 * Bragi (Javascript Logger - Browser)
 *
 * ----------------------------------
 *
 * Distributed under MIT license
 * Author : Erik Hazzard ( http://vasir.net )
 *
 * Provides a LOGGER object which can be used to perform logging
 *      LOGGER.log('group1', 'hello world');
 *
 *      // Also, parasm can be passed in
 *      LOGGER.log('group1', 'message', param1, param2, etc...);
 *      
 *      // And subgroups can be logged
 *      LOGGER.log('group1:subgroup', 'message %j', param1); 
 *      
 * To change logger options:
 *      // Shows ALL messages (false to show none)
 *      LOGGER.options.groupsEnabled = true; 
 *
 *      // Shows only specific groups
 *      LOGGER.options.groupsEnabled = ['error', 'debug']; // only shows passed in groups 
 *
 *      // Can also filter on subgroups
 *      LOGGER.options.groupsEnabled = ['group1:subgroup1']; 
 *
 *      // Or regular expressions
 *      LOGGER.options.groupsEnabled = [/^start:to:end$/]
 *
 * To change storing stack traces (gives more info, but adds a nontrivial amount 
 *      of time), change the `storeStackTrace` property. It is `false` by default
 *
 *      LOGGER.options.storeStackTrace = true;
 *
 * TRANSPORTS
 *      Logs are output / written to a file / pipped to a server by means
 *      of transports
 *
 * ========================================================================= */
var util = require('util');

var canLog = require('./bragi/canLog');

// Transports is an object which we can add / remove transport objects to
var Transports = require('./bragi/transports/Transports');

// transports is an object containing all available transports
var transports = require('./bragi/transports');

// TODO: This should probably be in the transports
var SYMBOLS = require('./bragi/symbols');

(function(root, factory) {
    // Setup logger for the environment
    if(typeof define === 'function' && define.amd) {
        // RequireJS / AMD
        define(['exports'], function(exports) {
            root = factory(root, exports);
            return root;
        });
    } else if (typeof exports !== 'undefined') {
        // CommonJS
        factory(root, exports); 
        module.exports = factory();
    } else {
        // browser global if neither are supported
        root.logger = factory(root, {});
    }
}(this, function(root, logger) {

    // --------------------------------------
    //
    // Setup logger object
    //
    // --------------------------------------
    // Here, we use only a single LOGGER object which is shared among all files
    // which import Bragi. 
    // NOTE: Why use a single object? What are benefits? Could expose a "new"
    //  logger object

    // NOTE: It might be useful to have multiple loggers?
    var LOGGER = {
        util: {},

        // reference to canLog function
        canLog: canLog
    };

    // Setup line number / function name logging 
    // --------------------------------------
    LOGGER.util.__stack = function() {
        // Utility to get stack information
        var stack = null;
        try{
            var orig = Error.prepareStackTrace;
            Error.prepareStackTrace = function(_, stack) { return stack; };
            var err = new Error();
            Error.captureStackTrace(err, arguments.callee);
            stack = err.stack;
            Error.prepareStackTrace = orig;
        } catch(e){ }

        return stack;
    };

    // --------------------------------------
    // Expose styles to users
    // --------------------------------------
    // some symbols for the user
    LOGGER.util.symbols = SYMBOLS; 

    // --------------------------------------
    //
    // Setup options
    //
    // --------------------------------------
    LOGGER.options = {
        // default options
        // Primary configuration options
        // ----------------------------------
        // groupsEnabled: specifies what logs to display. Can be either:
        //      1. an {array} of log levels 
        //          e.g,. ['error', 'myLog1', 'myLog2']
        //    or 
        //
        //      2. a {Boolean} : true to see *all* log messages, false to 
        //          see *no* messages
        //
        // groupsEnabled acts as a "whitelist" for what messages to log
        groupsEnabled: true,

        // blackList is an array of log level groups which will always be excluded.
        // Levels specified here take priority over log groups specified in groupsEnabled
        groupsDisabled: [],

        // Store stack trace? Provides more info, but adds overhead. Very useful 
        // when in development, tradeoffs should be considered when in production
        storeStackTrace: false
    };


    // Setup default transports
    // --------------------------------------
    // transports is the transports array the logger users. 
    LOGGER.transports = new Transports();

    // Default transports
    // ----------------------------------
    // NOTE:  see the Console transport for info on the configuration options.
    // NOTE: Do not 
    var _defaultTransports = [
        new transports.Console({
            showMeta: true, 
            showStackTrace: false
        })
    ];

    // Other transports include:
    //      new transports.ConsoleJSON({}) 
    //      
    //      new transports.History({
    //          storeEverything: false
    //      }) 
    //
    //      new transports.File({
    //          filename: '/tmp/test.json'
    //         })

    for(var i=0; i < _defaultTransports.length; i++){
        LOGGER.transports.add( _defaultTransports[i] );
    }

    // Expose a reference to all available transports
    // NOTE: This isn't the cleanest way to do this, could use improvement
    LOGGER.transportClasses = transports;

    // ----------------------------------
    //
    // Group Addition / Removal Functions
    //
    // ----------------------------------
    LOGGER.addGroup = function addGroup ( group ){
        // Add a passed in group (either a {String} or {RegExp}) to the 
        // groupsEnabled array
        
        // If groupsEnabled is true or false, turn it into an array
        var groupsEnabled = LOGGER.options.groupsEnabled;

        if(groupsEnabled === true || groupsEnabled === false){
            LOGGER.options.groupsEnabled = groupsEnabled = [];
        }

        // Ensure it does not exist
        var i=0, len=groupsEnabled.length;
        for(i=0;i<len;i++){
            if(groupsEnabled[i].toString() === group.toString()){
                return LOGGER;
            }
        }

        // Group wasn't found yet, add it
        groupsEnabled.push( group );

        return LOGGER;
    };

    LOGGER.removeGroup = function removeGroup ( group ){
        // Takes in a group and removes all occurences of it from 
        // groupsEnabled
        
        // If groupsEnabled is true or false, turn it into an array
        var groupsEnabled = LOGGER.options.groupsEnabled;

        if(groupsEnabled === true || groupsEnabled === false){
            LOGGER.options.groupsEnabled = groupsEnabled = [];
        }

        // Ensure it does not exist
        var i=0, len=groupsEnabled.length;
        var groupsEnabledWithoutGroup = [];

        for(i=0;i<len;i++){
            if(groupsEnabled[i].toString() !== group.toString()){
                groupsEnabledWithoutGroup.push( groupsEnabled[i] );
            }
        }

        // update the groupsEnabled
        LOGGER.options.groupsEnabled = groupsEnabledWithoutGroup;

        return LOGGER;
    };

    // ----------------------------------
    //
    // UTIL functions
    //
    // ----------------------------------
    LOGGER.util.print = function print(message, color){
        // NOTE: This is a stub function which exists in Bragi, but not in
        // the browser version. We could print individual colors, but it 
        // requires adding an additional CSS string to console.log(). This is
        // a TODO
        return message; 
    };

    // ----------------------------------
    //
    // LOG function
    //
    // ----------------------------------
    LOGGER.log = function loggerLog(group, message){
        // Main logging function. Takes in two (plus n) parameters:
        //   group: {String} specifies the log level, or log group
        //
        //   message: {String} the message to log. The message must be a single
        //      string, but can have multiple objects inside using `%O`. e.g.,
        //          logger.log('test', 'some object: %O', {answer: 42});
        //
        //   all other parameters are objects or strings that will be formatted
        //   into the message
        //
        var groupsEnabled, groupsDisabled, currentTransport;
        var transportFuncsToCall = [];

        // Check if this can be logged or not. All transports must be checked as
        // well, as they can override LOGGER.options.groupsEnabled 
        // ----------------------------------
        // For each transport, if it can be logged, log it
        for(var transport in LOGGER.transports._transports){
            currentTransport = LOGGER.transports._transports[transport];

            // by default, use the groupsEnabled and groupsDisabled specified in 
            // options
            groupsEnabled = LOGGER.options.groupsEnabled;
            groupsDisabled = LOGGER.options.groupsDisabled;

            // If transport overrides exist, use them
            if(currentTransport.groupsEnabled !== undefined){
                groupsEnabled = currentTransport.groupsEnabled;
            }
            if(currentTransport.groupsDisabled !== undefined){
                groupsDisabled = currentTransport.groupsDisabled;
            }

            // check if message can be logged
            if(canLog(group, groupsEnabled, groupsDisabled)){
                transportFuncsToCall.push( currentTransport );
            }
        }

        // can this message be logged? If not, do nothing
        if(transportFuncsToCall.length < 1){ 
            // Can NOT be logged if there are no transportFuncs to call 
            //
            // If storeAllHistory is not true, return immediately (if it is
            // true, the message will get stored just not passed to any
            // transports)
            if(!LOGGER.options.storeAllHistory){
                return false;
            }
        }

        // get all arguments
        // ----------------------------------
        // remove the group and message from the args array, so the new args array will
        // just be an array of the passed in arguments
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        
        // ----------------------------------
        // Build up a `loggedObject`, a structured object containing log 
        // information. It can be output to the console, to another file, to
        // a remote host, etc.
        // ------------------------------
        var loggedObject = {};
        
        // Caller info
        var caller = null;

        // Only capture caller if storeStackTrace is true.
        // NOTE: This will not work in strict mode, as we cannot access
        // the caller's name
        if(LOGGER.options.storeStackTrace){
            caller = 'global scope';
            if(loggerLog.caller && loggerLog.caller.name){
                caller = loggerLog.caller.name;
            } else if((loggerLog.caller+'').indexOf('function ()') === 0){
                caller = 'anonymous function'; 
            } 
        }

        // Setup properties on the loggedObject based on passed in properties
        // ----------------------------------
        // These are set before any of our library setters to ensure clients do not
        // override properties set by Bragi
        // NOTE: All properties set by Bragi are prefixed with an underscore
        loggedObject.properties = {};
        loggedObject.originalArgs = [];
        
        for(var i=0; i< extraArgs.length; i++){
            // For each argument, we need to check its type. If it's an object, then
            // we'll extend the loggedObject `properties` object 
            // (if there are multiple keys, the last
            // key found takes priority). If it's an array or any other data type,
            // we'll set a new property called `argumentX` and set the value

            if(!(extraArgs[i] instanceof Array) && typeof extraArgs[i] === 'object'){
                for(var key in extraArgs[i]){
                    loggedObject.properties[key] = extraArgs[i][key];
                }
            } else {
                loggedObject.properties['_argument' + i] = extraArgs[i];
            }

            // add to originalArgs array, so we can know by index what args were
            // passed in
            loggedObject.originalArgs.push(extraArgs[i]);
        }

        // setup meta
        // ----------------------------------
        loggedObject.meta = {
            caller: caller,
            date: new Date().toJSON()
        };
        loggedObject.unixTimestamp = new Date().getTime() / 1000;

        var stack = false;
        if(LOGGER.options.storeStackTrace){
            // Store and use stack trace if set. Aides in developing, but adds
            // some overhead
            stack = LOGGER.util.__stack();
            // Currently, getting stack info via this method
            // is unsupported in many browsers
            if(stack){
                var stackLength = stack.length;
                var trace = [];

                for(i=1; i < stack.length; i++){
                    trace.push(stack[i] + '');
                }
                
                loggedObject.meta.file = stack[1].getFileName();
                loggedObject.meta.line = stack[1].getLineNumber();
                loggedObject.meta.column = stack[1].getColumnNumber();
                loggedObject.meta.trace = trace;
            }
        }

        // Setup group, message, other params
        // ----------------------------------
        loggedObject.group = group;

        // Setup the message
        // ----------------------------------
        loggedObject.message = message;

        // Send loggedObject to each transport
        // ----------------------------------
        // The loggedObject is setup now, call each of the transport log calls that
        // can be called
        for(i=0, len=transportFuncsToCall.length; i<len; i++){
            transportFuncsToCall[i].log.call( transportFuncsToCall[i], loggedObject );
        }
    };

    // Expose this to the window
    if(!(typeof define === 'function' && define.amd)) {
        window.BRAGI = LOGGER;
    }
    return LOGGER;
}));
