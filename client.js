const ws = new WebSocket(`ws://localhost:8080`)
const Ludo = () => {
    const [messageList, setBoard] = React.useState([])
    const [dice, setDice] = React.useState([])
    const [sprite, setColor] = React.useState([])
    const [turn, setTurn] = React.useState([])
    const [win, setW] = React.useState([])
    ws.onmessage = (event) => {
        const clientMessage = JSON.parse(event.data)
        if (clientMessage.type === `newboard`) {
          setBoard([
            messageList,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `board`) {
          setBoard([
            messageList,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `dice`) {
          setDice([
            dice,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `spriteColor`) {
          setColor([
            sprite,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `turn`) {
          setTurn([
            turn,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `ignored`) {
          setTurn([
            turn,
            clientMessage.data
        ])
        }
        if (clientMessage.type === `win`) {
          setW([
            win,
            clientMessage.data
        ])
        }
        
    }
    const handleClick = (i,j,color) => {
      const clientMessage = {
          type: `coordinates`,
          data: i.toString()+" "+j.toString()+" "+color+" "+dice[1].toString(),
          username: `user`,
      }
      ws.send(JSON.stringify(clientMessage))
  }
  const handleIgnore = () => {
    const clientMessage = {
      type: `ignore`,
      data: '',
      username: `user`,
  }
  ws.send(JSON.stringify(clientMessage))
}
const handleIgnore2 = () => {
  const clientMessage = {
    type: `ignore2`,
    data: '',
    username: `user`,
}
ws.send(JSON.stringify(clientMessage))
}


    
    return (
      <div>
      {
        (messageList[1]!=undefined) ? (messageList[1].map((cells, i) => <div>{cells.map((pieces, j) =>(pieces.length!=0) ?
         (<div className={"cell" + i.toString() + j.toString()}>{pieces.map((piece) => <div className={piece} onClick={(turn[1]==sprite[1]) ? ((piece==sprite[1]) ? (handleClick.bind(this,i,j, sprite[1])) : (handleIgnore2.bind(this)))  : (handleIgnore.bind(this))}/>)}</div>):
         (<div className={"cell" + i.toString() + j.toString()}/>))}</div>)) : (console.log("board not here yet"))
        
      }
      <div className="dice">{dice[1]}</div>
      <div className={"color "+sprite[1]}></div>
      <div className="text_box">{(turn[1]==undefined) ? ("Waiting for other players") : ((turn[1]=="red" || turn[1]=="blue" || turn[1]=="green" || turn[1]=="yellow") ? ("It's "+turn[1]+"'s turn") : ((turn[1].split().includes("wins!") ? (turn[1]): (turn[1]))))}</div>
      </div>

          )
}


ReactDOM.render(<Ludo />, document.querySelector(`#root`))