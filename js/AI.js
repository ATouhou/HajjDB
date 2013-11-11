function getPathFrom(id){
  var res = [];
  db.transaction(function (tx) {
   tx.executeSql('SELECT [to], [lat], [lon] FROM Path INNER JOIN Nodes ON Path.to = Nodes.id WHERE [from] = ?', [id], function(tx, results){
     for(i = 0; i < results.rows.length; i++){
      res[i] = {};
      res[i].id = results.rows.item(i)['to'];
      res[i].lat = results.rows.item(i)['lat'];
      res[i].lon = results.rows.item(i)['lon'];
     }
   });
   return res;
  });
}

var fringe;
var visited;
var initial;
var goal;

function successor(state){
  return getPathFrom(state);
}

function f(state){
  var h = h.lat - state.lat + h.lon - state.lon;
  var g = state.g;
  return(g + h);
}

function search(insitial_state, goal_state){
  fringe = [];
  visited = {};
  parent = {};
  initial = insitial_state;
  goal = goal_state;
  
  fringe.push(initial);
  while(fringe.length > 0){
    fringe.sort(function(a, b){
      return(f(a) - f(b));
    });
    var top = finge.pop();
    if(visited[top.id]) continue;
    if(goal.id == top.id){
      print_goal(top);
      return;
    }
    var suc = successor(top);
    visited[top.id] = true;
    
    for(i = 0; i < suc.length; i++){
      if(parent[suc[i].id] == null){
        parent[suc[i].id] = top;
        suc[i].g = Math.sqrt((suc[i].lat-top.lat)*(suc[i].lat-top.lat) + (suc[i].lat-top.lon)*(suc[i].lat-top.lon));
        fringe.push(suc[i]);
      }
    }
  }
}