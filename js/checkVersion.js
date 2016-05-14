/**
 *  Checks if git hash has been updated. Then reload the page
 * @param settings
 * @constructor
 */
var CheckVersion = function (settings) {

    this.name = "CheckVersion";
    this.settings = settings;

    BRAGI.log(this.name, "Constructor Settings: %o", settings);

    setInterval(function () {
        this.check();
    }.bind(this), this.settings.interval);
    this.check();
};

CheckVersion.prototype.check = function() {
    var self = this;
    $.getJSON('controllers/gitHash.php')
        .success(function(data) {
            if (data !=null) {
                // Compare with the hash variable in index.php
                BRAGI.log(self.name, "current: '%s', server: '%s'",gitHash,data.gitHash);
                if (data.gitHash !== gitHash) {
                    // do we want to force reload http page
                    if( self.settings.forceReload ){
                        window.location.reload();
                        window.location.href = window.location.href;
                    }else{
                        BRAGI.log(self.name, "Code is updated");
                    }
                }
            }
            else{
                BRAGI.error(self.name, "No Return Data");
                new Notification('Version Checker, something is wrong with return data.');
            }
        }).fail(function(){
            new Notification('Version Checker, Can\'t access server.');
        });
};
