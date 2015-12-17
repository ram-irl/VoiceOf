
module.exports.create = function (server, database) {
  var app = {'server': server, 'database': database};
  
  return new Promise( (resolve, reject) => {
    database.then(() => resolve(app), reject);
  });
}