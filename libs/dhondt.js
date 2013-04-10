dhondt = function(polling, totalSeats, minPercentage, parties) {

  var _max = function(obj){
    var maxVal = -1;
    var maxProp = null;
    for (var i in obj){
      if (obj.hasOwnProperty(i)) {
        var val = obj[i];
        if (val > maxVal) {
          maxProp = i;
          maxVal = val;
        }
      }
    }
    var result = {};
    result.key = maxProp;
    result.val = maxVal;

    return result;
  };

  var _sum = function(obj) {
    var sum = 0;
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        sum += obj[i];
      }
    }
    return sum;
  };

  var _filter = function(obj, f) {
    var newObj = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (f.call(obj, obj[i])) {
          newObj[i] = obj[i];
        }
      }
    } 
    return newObj;
  };

  var _zclone = function(obj) {
    var newObj = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        newObj[i] = 0;
      }
    }
    return newObj;
  };

  var _extend = function (){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
  };

  var seq = [];

  var _process = function(dvotes, dvotesCur, pendingSeats, results) {
    if (!pendingSeats)
      return results;
    var party = _max(dvotesCur),
      seats = results[party.key] + 1,
      partyDivided = {},
      newResultsExtension = {};
    seq.push(party.key);

    partyDivided[party.key] = dvotes[party.key]/(seats+1);
    newResultsExtension[party.key] = seats;

    var new_dvotesCur = _extend({}, dvotesCur, partyDivided);
    var newResults = _extend({}, results, newResultsExtension);

    return _process(dvotes, new_dvotesCur, pendingSeats-1, newResults);
  };

  var total_votes = _sum(polling), 
    dvotes = _filter(polling, function(votes) {
      if (100 * votes / total_votes >= minPercentage)
        return true;
      return false;
    }),
    results = _zclone(dvotes);

  var finalResults =  _process(dvotes, dvotes, totalSeats, results);
  //console.log(seq)
  return finalResults;  
};