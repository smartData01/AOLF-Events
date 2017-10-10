/**
 * Created by samcom84 on 09-Dec-16.
 */
var fs = require('fs');

module.exports = function (app,mongoose) {
    fs.readdirSync(__dirname).forEach(function (file) {
        if (file == "index.js")
            return;
        var name = file.substr(0, file.lastIndexOf('.'));
        require('./' + name)(app,mongoose);
    });
}