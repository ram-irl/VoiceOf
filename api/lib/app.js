
module.exports.create = function (server, database, models) {
  var app = {'server': server, 'database': database, 'models': models};
  
  return new Promise( (resolve, reject) => {
    database.then(() => resolve(app), reject);
  });
}