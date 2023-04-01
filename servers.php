
    <?php



$db_host = "localhost";
$db_user = "root";
$db_password = "";

header('Content-Type: application/json');



$lnk = mysqli_connect($db_host,$db_user,$db_password);
if(!$lnk)
    die(" Database connection failed");
mysqli_select_db($lnk, "puzzlecam") or die ("Failed to select DB");

if(isset($_GET["info"])){
     $info = json_decode($_GET["info"],true);
    if(addScore($info,$lnk)){
        echo " score inserted";
    } else{
        echo " score insertion  failed";
    }
} else {
    $results = getAllScores($lnk);
    echo json_encode($results);
}
function addScore($info, $lnk) {
    $query = "INSERT INTO Scores (Name,Time,Difficulty) VALUES".
    "('".$info["name"]."', " .$info["time"].", ' ".    
    $info["difficulty"]. "')";
    $rs = mysqli_query($lnk, $query);
    if(!$rs){
        return false;

    }
    return true;
}
// 

function getAllScores($lnk) {

    $easy = getScoreWithDifficulty("easy", $lnk) ;
    $medium = getScoreWithDifficulty("medium", $lnk) ;
    $hard = getScoreWithDifficulty("hard", $lnk) ;
    $insane = getScoreWithDifficulty("insane", $lnk) ;
    return array("easy" => $easy, "medium" => $medium, "hard" => $hard, 
    "insane" => $insane);
}



function getScoreWithDifficulty($difficulty, $lnk) {
    
        $query = "Select Name, Time From Scores". 
       " Where Difficulty Like '".$difficulty."'".
       " ORDER BY Time"; // the '.' is used for concatination
        $rs =  mysqli_query($lnk, $query); // this creates an object we will use to iterate d result
        $results =  array();
        if(mysqli_num_rows($rs) > 0) {
            while($row = mysqli_fetch_assoc($rs)) {
                array_push($results, $row);
            }
        }
        
        return ($results);

    
}    

?>
