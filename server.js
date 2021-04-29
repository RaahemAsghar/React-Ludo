const fs = require(`fs`)
const http = require(`http`)
const WebSocket = require(`ws`)  // npm i ws
var playerCount = 0
const readFile = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, (readErr, fileContents) => {
      if (readErr) {
        reject(readErr)
      } else {
        resolve(fileContents)
      }
    })
  })

const server = http.createServer(async (req, resp) => {
    console.log(`browser asked for ${req.url}`)
    if (req.url == `/mydoc`) {
        const clientHtml = await readFile(`client.html`)
        resp.end(clientHtml)
    } else if (req.url == `/myjs`) {
        const clientJs = await readFile(`client.js`)
        resp.end(clientJs)
    }
    else if (req.url == `/center.png`) {
        const clientImg = await readFile(`center.png`)
        resp.end(clientImg)
    }
    else if (req.url == `/ludo.css`){
        const clientCSS = await readFile(`ludo.css`)
        resp.end(clientCSS)
    }
})

server.listen(8000)
var board =[[['blue','blue','blue','blue'],[],[],[],[],[],[],[],[],[],[],[],[],[],['red','red','red','red']],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[['yellow','yellow','yellow','yellow'],[],[],[],[],[],[],[],[],[],[],[],[],[],['green','green','green','green']]]
//var board =[[['blue','blue'],[],[],[],[],[],[],[],[],[],[],[],[],[],['red','red','red']],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],[['yellow','yellow','yellow'],[],[],[],[],[],[],[],[],[],[],[],[],[],['green','green','green']]]
//board[6][2].push('red','yellow','green','blue')
//board[6][1].push('blue')


var safeSpots = ["1,8","2,6","6,1","6,12","8,2","8,13","13,6","12,8"]
var nearHomeSpots = {red:"0,7", blue:"7", green:"7,14", yellow:"14,7"}
var homeRun = {red:"6,7", blue:"7,6", green:"7,8", yellow:"8,7"}
var startSpots = ["0,0","0,14","14,14","14,0"]
var homeCount = {red:0, blue:0, yellow:0, green:0}
var hasWon = false

const step = (color, ox, oy, steps) => {
  const transform = ([ox,oy]) => ({'blue': [+ox,+oy], 'green': [-ox,-oy], 'red': [-oy,+ox], 'yellow': [+oy,-ox]}[color])
  const path = ['-7,-7', '-1,-6', '-1,-5', '-1,-4', '-1,-3', '-1,-2', '-2,-1', '-3,-1', '-4,-1', '-5,-1', '-6,-1', '-7,-1', '-7,0', '-7,1', '-6,1', '-5,1', '-4,1', '-3,1', '-2,1', '-1,2', '-1,3', '-1,4','-1,5', '-1,6', '-1,7', '0,7', '1,7', '1,6', '1,5', '1,4', '1,3','1,2', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '7,0', '7,-1', '6,-1', '5,-1', '4,-1', '3,-1', '2,-1', '1,-2', '1,-3', '1,-4', '1,-5', '1,-6', '1,-7', '0,-7', '0,-6', '0,-5', '0,-4', '0,-3', '0,-2', '0,-1']
  const [x,y] = 
  transform(transform(transform(path[path.indexOf(transform([ox-7, oy-7]).join(','))+steps].split(','))))
  return [x+7,y+7]
}

const iskilled= (ox, oy) => (ox-7)*(ox-7)+(oy-7)*(oy-7) == 98

const wss = new WebSocket.Server({ port: 8080 })
var spriteColor = ['red', 'blue', 'green', 'yellow']
var pickTurn = ['blue', 'red', 'green', 'yellow']
var index = 0
wss.on(`connection`, (ws) => {
  console.log(`A player connected`)
  const playerColor = {
    type: `spriteColor`,
    data: spriteColor.pop(Math.floor(Math.random()*3)),
    username: `server`,

  }
  ws.send(JSON.stringify(playerColor))
  playerCount = playerCount + 1 
  if(playerCount==4){
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: `newboard`,
          data: board,
          username: `server`
        }))
        client.send(JSON.stringify({
          type: `dice`,
          data:  1 ,
          username: `server`
        }))
        client.send(JSON.stringify({
          type: `turn`,
          data:  pickTurn[index] ,
          username: `server`
        }))
      }
    })
    
  }
  
  

  ws.on(`message`, (message) => {
    const clientMessage = JSON.parse(message)
    if(clientMessage.type=="coordinates"){
      console.log(`received: ${clientMessage.data}`)
      var msg = clientMessage.data.split(" ")
      var ox = msg[0]
      var oy = msg[1]
      var color = msg[2]
      var die = msg[3]

      if (iskilled(parseInt(ox), parseInt(oy)))
      {
      if(parseInt(die)==6)
      {
        board[ox][oy].splice(board[ox][oy].indexOf(color),1)
        var nextStep= step(color,parseInt(ox),parseInt(oy),1)
        
        board[nextStep[0]][nextStep[1]].push(color)
      }
      }
      else
      {
        console.log(parseInt(ox) - parseInt(homeRun[color].split(",")[0]) )
          if(color=="red" && parseInt(oy)==7){
            var stepSize = Math.abs(parseInt(homeRun["red"].split(",")[0]) - parseInt(ox))
            if (die<=stepSize){
              board[ox][oy].splice(board[ox][oy].indexOf(color),1)
              var nextStep= step(color,parseInt(ox),parseInt(oy),parseInt(die))
              board[nextStep[0]][nextStep[1]].push(color)
              if(nextStep[0].toString() + ","+ nextStep[1].toString() == "6,7"){
                homeCount["red"] = board[nextStep[0]][nextStep[1]].length
                if(homeCount["red"]==4)
               {
                hasWon = true
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: `turn`,
                      data: color + ' wins!',
                      username: `server`
                    }))  
                    const ignoreMessage = {
                      type: `ignored`,
                      data: color + ' wins!',
                      username: `server`,
                    }
                    client.send(JSON.stringify(ignoreMessage))
                  }
                })
               }
               }
            }
          }
          else if(color=="yellow" && parseInt(oy)==7){
            var stepSize = Math.abs(parseInt(homeRun["yellow"].split(",")[0]) - parseInt(ox))
            if (die<=stepSize){
              board[ox][oy].splice(board[ox][oy].indexOf(color),1)
              var nextStep= step(color,parseInt(ox),parseInt(oy),parseInt(die))
              board[nextStep[0]][nextStep[1]].push(color)
              if(nextStep[0].toString() + ","+ nextStep[1].toString() == "8,7"){
                homeCount["yellow"] = board[nextStep[0]][nextStep[1]].length
                if(homeCount["yellow"]==4)
                {
                  hasWon = true
                 wss.clients.forEach((client) => {
                   if (client.readyState === WebSocket.OPEN) {
                     client.send(JSON.stringify({
                       type: `turn`,
                       data: color + ' wins!',
                       username: `server`
                     })) 
                     const ignoreMessage = {
                      type: `ignored`,
                      data: color + ' wins!',
                      username: `server`,
                    }
                    client.send(JSON.stringify(ignoreMessage)) 
                   }
                 })
                }
               }
            }
            
          }
          else if(color=="blue" && parseInt(ox)==7){
            var stepSize = Math.abs(parseInt(homeRun["blue"].split(",")[1]) - parseInt(oy))
            if (die<=stepSize){
              board[ox][oy].splice(board[ox][oy].indexOf(color),1)
              var nextStep= step(color,parseInt(ox),parseInt(oy),parseInt(die))
              board[nextStep[0]][nextStep[1]].push(color)
              if(nextStep[0].toString() + ","+ nextStep[1].toString() == "7,6"){
                homeCount["blue"] = board[nextStep[0]][nextStep[1]].length
                if(homeCount["blue"]==4)
               {
                 hasWon=true
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: `turn`,
                      data: color + ' wins!',
                      username: `server`
                    }))
                    const ignoreMessage = {
                      type: `ignored`,
                      data: color + ' wins!',
                      username: `server`,
                    }
                    client.send(JSON.stringify(ignoreMessage)) 
                  }
                })
               }
               }
            }
          }
          else if(color=="green" && parseInt(ox)==7){
            var stepSize =  Math.abs(parseInt(homeRun["green"].split(",")[1]) - parseInt(oy))
            if (die<=stepSize){
              board[ox][oy].splice(board[ox][oy].indexOf(color),1)
              var nextStep= step(color,parseInt(ox),parseInt(oy),parseInt(die))
              board[nextStep[0]][nextStep[1]].push(color)
              if(nextStep[0].toString() + ","+ nextStep[1].toString() == "7,8"){
                homeCount["green"] = board[nextStep[0]][nextStep[1]].length
                if(homeCount["green"]==4)
               {
                 hasWon = true
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: `turn`,
                      data: color + ' wins!',
                      username: `server`
                    }))
                    const ignoreMessage = {
                      type: `ignored`,
                      data: color + ' wins!',
                      username: `server`,
                    }
                    client.send(JSON.stringify(ignoreMessage))
                  }
                })
               }
               }
            }
          }
          else{
            board[ox][oy].splice(board[ox][oy].indexOf(color),1)
        var nextStep= step(color,parseInt(ox),parseInt(oy),parseInt(die))
        
        var killed =[]
        var test = false
        if(board[nextStep[0]][nextStep[1]].length!=0)
        {
          if(safeSpots.includes(nextStep[0].toString() + ","+ nextStep[1].toString())){
            board[nextStep[0]][nextStep[1]].push(color)
            test = true
          }
          else{
            board[nextStep[0]][nextStep[1]].map((piece) => 
            (piece!=color) ? (killed.push(board[nextStep[0]][nextStep[1]].splice(0,piece.length))):(console.log("Same color, nothing happens"))
            ) 
          }
          
        }
        if(killed.length!=0)
        {
          console.log(killed)
          killed.map((pieces) => pieces.map((piece => (piece=="red") ? (board[0][14].push(piece)) : ((piece=="blue") ? (board[0][0].push(piece)) : ((piece=="green") ? (board[14][14].push(piece)) : ((piece=="yellow") ? (board[14][0].push(piece)) : (console.log("nothing will happen"))))))
          ))

        }
        if(test==false)
        board[nextStep[0]][nextStep[1]].push(color)
        
          }
        
      }
      
      var diceRoll = Math.floor(Math.random() * 6) + 1 
      index = index + 1
      if(index==4){
      index=0
      }
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: `board`,
            data: board,
            username: `server`
          }))
          client.send(JSON.stringify({
            type: `dice`,
            data: diceRoll,
            username: `server`
          }))
          
          
          
        }
      })
      if(hasWon==false){
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: `turn`,
              data:  pickTurn[index] ,
              username: `server`
            }))
          }
        })
      }

    }
    if (clientMessage.type === `ignore` && hasWon==false) {
      const ignoreMessage = {
        type: `ignored`,
        data: "It's "+pickTurn[index]+"'s turn!",
        username: `server`,
      }
      ws.send(JSON.stringify(ignoreMessage))
  }   
    
    
  })
  if(hasWon==true)
  {
    wss.close()
    ws.close()
  }

  
})

    
      

    