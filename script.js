let video = null
let canvas = null
let context = null
let scaler = 0.8
let size = {x:0, y:0, width:0,height:0,rows:3,columns:3}
let pieces = []
let selected_piece = null
let startTime = null
let endTime = null
let popSound = new Audio ("pop.m4a")
popSound.volume = 0.1

let audioContext = new (AudioContext||
   webkitAuidoContext||window.webkitAudioContext) ()

   let keys = {
      DO:261.6,
      RE:293.7,
      MI:329.6
   }


function main() {
   canvas =  document.getElementById("myCanvas")
   context = canvas.getContext("2d")
   addEventListeners()
   
   
   let promise = navigator.mediaDevices.getUserMedia({video:true})
   promise.then(function(signal) {
      video = document.createElement('video')
      video.srcObject = signal
      video.play()

      video.onloadeddata = function() {
       handleResize()
       window.addEventListener('resize', handleResize)
       updateGame()
       initializePieces(size.rows,size.columns)
       
      }
   } ).catch(function(err) {
      alert("camera error:" + err)
   })
}

function setDifficulty() {
   let diff = document.getElementById("difficulty").value
   switch(diff) {
      case "easy":
         initializePieces(3,3)
         break;
      case "medium":
         initializePieces(5,5)
         break;
      case "hard":
         initializePieces(10,10)
         break;
      case "insane":
         initializePieces(40,25)
         break;
   }
}
function restart() {
   startTime = new Date().getTime()
   endTime = null
   randomizePieces()
   document.getElementById("menuItems").style.display = "none "
}
function updateTime() {
   let now = new Date().getTime()
   if(startTime!= null) {
      if(endTime != null) {
         document.getElementById("time").innerHTML = 
         formatTime(endTime - startTime)
      }else{
         document.getElementById("time").innerHTML = 
         formatTime(now - startTime)
      }

   } 
}

function isComplete() {
   for (let i = 0; i < pieces.length; i++) {
      if(pieces[i].correct === false) {
         return false
      }

   }
   return true
}

function formatTime(milliseconds) {
   let seconds = Math.floor(milliseconds/1000)
   let s = Math.floor(seconds % 60)
   let m = Math.floor((seconds % (60 * 60))/60)
   let h = Math.floor((seconds % (60 * 60 * 24))/ (60 * 60))
let formattedTime = h.toString().padStart(2, '0')
    formattedTime += ":"
    formattedTime += m.toString().padStart(2, '0')
    formattedTime += ":"
    formattedTime += s.toString().padStart(2, '0')
   

    return formattedTime

}

function addEventListeners() {
    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("touchstart", onTouchStart)
    canvas.addEventListener("touchmove",onTouchMove )
    canvas.addEventListener("touchend", onTouchEnd)
}

function onTouchStart(evt) {
   let loc = {x:evt.touches[0].clientX,
       y:evt.touches[0].clientY}
       onMouseDown(loc)
}
function onTouchMove(evt) {
   let loc = {x:evt.touches[0].clientX,
       y:evt.touches[0].clientY}
       onMouseMove(loc)
}
function  onTouchEnd() {

       onMouseUp()
}
function onMouseDown(evt) {
   selected_piece = getPressedPiece(evt)
   if (selected_piece!= null) {
       const index = pieces.indexOf(selected_piece)
       if(index > -1) {
         pieces.splice(index, 1)
         pieces.push(selected_piece)
       }

      selected_piece.offset = {
         x:evt.x-selected_piece.x,
         y:evt.y-selected_piece.y
      }
      selected_piece.correct =  false
   } 
}
function onMouseUp(){
   if(selected_piece.isClose()){
      selected_piece.snap()
      if(isComplete() && endTime == null) {
         let now = new Date().getTime()
         endTime = now
         setTimeout(playMelody,1000)
         showEndScreen()
      }
   }
selected_piece = null


}


function onMouseMove(evt) {
  if(selected_piece!= null) {
   selected_piece.x = evt.x-selected_piece.offset.x
   selected_piece.y = evt.y-selected_piece.offset.y

  }
}

function getPressedPiece(loc) {
   for(let i = pieces.length - 1; i >= 0 ; i--) {
      if(loc.x > pieces[i].x && loc.x < pieces[i].x + pieces[i].width &&
          loc.y > pieces[i].y && loc.y < pieces[i].y + pieces[i].height) {
            return pieces[i]
          } 
   }
   return null
}

function handleResize() {
   canvas.width = window.innerWidth
   canvas.height = window.innerHeight
   let resizer = scaler *
   Math.min(
      window.innerWidth / video.videoWidth,
      window.innerHeight / video.videoHeight
   ) 
   size.width = resizer* video.videoWidth
   size.height = resizer* video.videoHeight
   size.x = window.innerWidth/2 - size.width/2
   size.y = window.innerHeight/2 - size.height/2

}

function updateGame() {
   context.clearRect(0,0,canvas.width, canvas.height)
   context.globalAlpha = 0.5
   context.drawImage(video,size.x,size.y, size.width,size.height)
   context.globalAlpha = 1
   for( let i = 0; i < pieces.length; i++){
      pieces[i].draw(context)
   }
   updateTime()
   window.requestAnimationFrame(updateGame)
}

function initializePieces(rows, cols) {
   size.rows = rows
   size.columns = cols
   pieces = []
   for(let i =  0; i < size.rows;i++ ){
      for( let j = 0 ; j < size.columns; j++) {
         pieces.push(new piece(i, j))
      }
   } 
}

function randomizePieces() {
   for(let i = 0; i < pieces.length; i++) {
      let loc = {
         x:Math.random() * (canvas.width - pieces[i].width),
         y:Math.random() * (canvas.height - pieces[i].height)
      }
      pieces[i].x = loc.x
      pieces[i].y = loc.y
      pieces[i].correct = false
   }
}

class piece {
   constructor(rowIndex, colIndex) {
      this.rowIndex = rowIndex
      this.colIndex = colIndex
      this.x = size.x + size.width *  this.colIndex / size.columns
      this.y = size.y + size.height *  this.rowIndex / size.rows
      this.width = size.width /size.columns
      this.height = size.height /size.rows
      this.xCorrect = this.x
      this.yCorrect = this.y
      this.correct = true 
   }
draw(context) {
   context.beginPath() 
   context.drawImage(video, 
      this.colIndex*video.videoWidth/size.columns,
      this.rowIndex*video.videoHeight/size.rows,
      video.videoWidth / size.columns,
      video.videoHeight / size.rows,
      this.x,
      this.y,
      this.width,
      this.height

      )
   context.rect(this.x,this.y,this.width, this.height)
   context.stroke()
}
isClose() {
   if(distance({x:this.x,y:this.y},
     {x:this.xCorrect,y:this.yCorrect}) < this.width/3 ) {
       return true
     }
     return false
}
snap() {
   this.x = this.xCorrect
   this.y = this.yCorrect
   this.correct = true
   popSound.play()
}
}

function distance (p1,p2) {
   return Math.sqrt (
      (p1.x - p2.x) * (p1.x - p2.x) + 
      (p1.y - p2.y) * (p1.y - p2.y)
   )
}

function playNote (key,duration) {
   let osc = audioContext.createOscillator()
   osc.frequency.value = key
   osc.start(audioContext.currentTime)
   osc.stop(audioContext.currentTime+duration/1000)
   osc.type = "triangle"
   
   let envelope = audioContext.createGain()
   osc.connect(envelope)
   envelope.connect(audioContext.destination)
   envelope.gain.setValueAtTime(0,audioContext.currentTime)
   envelope.gain.linearRampToValueAtTime(0.5,audioContext.currentTime + 0.1)

   setTimeout(function() {
      osc.disconnect()
   }, duration)

   
   
} 
function playMelody() {
  playNote(keys.MI, 300)
  setTimeout(function () {
     playNote(keys.DO, 300)
     
  },300)
  setTimeout(function () {
     playNote(keys.RE, 150)
     
  },450)
  setTimeout(function () {
     playNote(keys.MI, 600)
     
  },600)
}


function showEndScreen() {
   const time = Math.floor((endTime - startTime)/1000)
   let score = document.getElementById("scoreValue")
   score.innerHTML = "Score: " + time
   document.getElementById("endScreen").style.display = "block"
   document.getElementById("saveBtn").innerHTML = "Save"
   document.getElementById("saveBtn").disabled = false
   
}

function showMenu(){
   document.getElementById("endScreen").style.display = "none"
   document.getElementById("menuItems").style.display = "block"

}
function showScores() {
   document.getElementById("endScreen").style.display= "none"
   document.getElementById("scoresScreen").style.display= "block"
   document.getElementById("scoresContainer").innerHTML= "Loading.."
   getScores()
}



function getScores() { 
   fetch("servers.php").then(function(response) {
 response.json().then(function(data){
        console.log(data)
   })
   })

}

function saveScore(){
   const time = Math.floor((endTime - startTime)/1000)
   const name = document.getElementById("name").value

   if(name== "") {
      alert("Enter your name!")
      return
   }

   const difficulty = document.getElementById("difficulty").value

   fetch(`localhost/puzzlecam/server.php? info = { 
      "name": "${name}",
      "time": ${time},
      "difficulty": "${difficulty}"

   }`)
   .then(function(response){
      
      document.getElementById("saveBtn").innerHTML = "OK!"
   })
   document.getElementById("saveBtn").disabled = true


}


function formatScores(data) {
   let html = "<table style = 'width:100%; text-aligh:center;'>"
   html += formatScoreTable(data["easy"],"Easy");
   html += formatScoreTable(data["medium"],"Medium");
   html += formatScoreTable(data["hard"],"Hard");
   html += formatScoreTable(data["insane"],"Insane");

   return html 
}

function formatScoreTable(data, header) {
   let html = " <tr style ='background: rgb(123,146,196); color:white;'> "
   html += `<td></td>
             <td><b>${header}</b></td>
             <td>Time</td></tr>
             `

  for(let i = 0; i < data.length; i++) {
   html += `<tr>`
   html += `<td>${i + 1}</td>
            <td title = ${data[i]["Name"]} ">${data[i]["Name"]}</td>
            <td>${Math.floor(data[i]["Time"]/1000)}
            </tr>
            `
  }
  return html
}

function closeScores(){
   document.getElementById("endScreen").style.display= "block"
   document.getElementById("scoresScreen").style.display= "none"
}


