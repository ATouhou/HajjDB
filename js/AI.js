var fringe;
var visited;
var initial;
var goal;
var parent;

function successor(state){
  return getPathFrom(state);
}

function f(state){
  var h = Math.sqrt((goal.lat - state.lat)*(goal.lat - state.lat) + (goal.lon - state.lon)*(goal.lon - state.lon));
  var g = state.g;
  return(g + h);
}

function do_search(initial_state, goal_state){
  fringe = [];
  visited = {};
  parent = {};
  initial = initial_state;
  goal = goal_state;
  
  fringe.push(initial);
	
  step();
}

function step(){
	if(fringe.length == 0) return 0;
    fringe.sort(function(a, b){
      return(f(a) - f(b));
    });
	var top = fringe.pop();
	//console.log("[" + top.lat + ", " + top.lon + "]");	
    if(visited[top.id]){
		return step();
	}
    if(goal.id == top.id){
      print_goal(top);
      return 1;
    }

    visited[top.id] = true;
	generate_successor(top);
}

function generate_successor(top){
  db.transaction(function (tx) {
   tx.executeSql("SELECT [to], [lat], [lon] FROM Path INNER JOIN Nodes ON Path.[to] = Nodes.[id] WHERE [from] = ?", [top.id.toString()], function(tx, results){
     var res = [];
     for(i = 0; i < results.rows.length; i++){
      res[i] = {};
      res[i].id = results.rows.item(i)['to'];
      res[i].lat = results.rows.item(i)['lat'];
      res[i].lon = results.rows.item(i)['lon'];
	  res[i].parent = top;
     }
	 create_node_callback(res);
   },
   function(tx, error){
	console.log(error);
   });
  });
}

function create_node_callback(succ){
    for(i = 0; i < succ.length; i++){
      if(parent[succ[i].id] == null){
        parent[succ[i].id] = succ[i].parent;
        succ[i].g = Math.sqrt((succ[i].lat-succ[i].parent.lat)*(succ[i].lat-succ[i].parent.lat) + (succ[i].lat-succ[i].parent.lon)*(succ[i].lat-succ[i].parent.lon));
        fringe.push(succ[i]);
      }
    }
	step();
}

function print_goal(top){
	var t_id = top.id;
	var str = "[" + top.lat + ", " + top.lon + "], ";
	while(parent[t_id].id != initial.id){
		str += "[" + parent[t_id].lat + ", " + parent[t_id].lon + "], ";
		t_id = parent[t_id].id;
	}
	console.log(str);
}