var db = openDatabase('mydb', '1.0', 'Test DB', 1500);
function sqlCommand(command){
  db.transaction(function (transaction) {
    transaction.executeSql(command);
  });
}

sqlCommand('CREATE TABLE Nodes (id primary key, lat, lon)');
sqlCommand('DELETE FROM Nodes');
sqlCommand('CREATE TABLE Path ([from], [to], primary key([from], [to]))');
sqlCommand('DELETE FROM Path');

function f_ok(tx, result){
  console.log(result);
}

function f_err(tx, result){
  console.log(result);
}

function insertPath(from, to){
  db.transaction(function (transaction) {
    console.log(from + " > " + to)
    transaction.executeSql("INSERT INTO Path ([from], [to]) VALUES (?, ?)", [from, to]);
  });
}

function insertNode(id, lat, lon){
  db.transaction(function (transaction, f_ok, f_err) {
    transaction.executeSql("INSERT INTO Nodes (id, lat, lon) VALUES (?, ?, ?)", [id, lat, lon]);
  });  
}

function myFunc(){
  $.ajax({
    type: "GET", url: "maps/map2.xml", dataType: "xml",
      success: function(xml) {
	  
		console.log("AJAX Success");
		console.log("Inserting Nodes");
	  
        $(xml).find('node').each(function(){
          var id = $(this).attr("id");
          var lat = $(this).attr("lat");
          var lon = $(this).attr("lon");
          insertNode(id, lat, lon);
		  console.log("Inserting Node...");
        });
        
        $(xml).find('way').each(function(){
          var id = $(this).attr("id");
          var highway;
          var oneway = false;
          
          $(this).find('tag').each(function(){
            var k = $(this).attr("k");
            if(k == "highway") highway = $(this).attr("v");
            if(k == "oneway") oneway = true;
          });
          
          var prevNodeId = null;
          
          $(this).find('nd').each(function(){
            var nodeId = $(this).attr("ref");
            if(prevNodeId != null){
              insertPath(prevNodeId, nodeId);
              if(oneway == false){
                insertPath(nodeId, prevNodeId);
              }
            }
            prevNodeId = nodeId;
          });
		  console.log("Inserting Way...");
        });
        
      },
      error: function(err){
        console.log(err);
      }
  });  
}
