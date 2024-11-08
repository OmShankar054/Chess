const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = { white: null, black: null };
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
});

io.on("connection", (uniquesocket) => {
    console.log("A player connected:", uniquesocket.id);

    // Assign player role
    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    } else {
        uniquesocket.emit("spectatorRole");
    }

    // Handle player disconnect
    uniquesocket.on("disconnect", () => {
        if (uniquesocket.id === players.white) {
            delete players.white;
        } else if (uniquesocket.id === players.black) {
            delete players.black;
        }
        console.log("A player disconnected:", uniquesocket.id);
    });

    // Handle move events
    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen()); // Send updated board state to all clients
                console.log("Valid move:", move, "New FEN:", chess.fen());
            } else {
                console.log("Invalid move attempted:", move);
                uniquesocket.emit("invalidMove", move);
            }
        } catch (err) {
            console.log("Error in move:", err);
            uniquesocket.emit("invalidMove", move);
        }
    });
});

server.listen(3002, () => {
    console.log("Server listening on port 3002");
});



//----------------------------------------------------------------------------------------------------------------------------
// const express = require("express");
// const socket = require("socket.io"); //real time connection 
// const http = require("http");
// const {Chess} = require("chess.js"); //we accuired all this in this file.
// const path = require("path");
// const { log } = require("console");

// const app = express(); //cereated express app instance:- routing part; middleware setup.  //initialise http server with express

// const server = http.createServer(app);//http model se server create karna hai {express ko call kr ke jo instance mila tha usko pass kar dena hai createServer ke ander }
// const io = socket(server);  // socket ko chaiye http ka server jo ki express pe based hota hai

// const chess= new Chess(); //all rules of CHess js in now in chess too
// let players = {};
// let curentPlayer = "w";//first player white

// app.set("view engine", "ejs"); 
// app.use(express.static(path.join(__dirname, "public")));// static file use  

// app.get("/", (req, res) => { //first route ko render karega ye
//     res.render("index", {title: "Chess Game"});
// });

// io.on("connection", function (uniquesocket){ // when someone connects- function will run- give unique socet //all socket function can be done by io 
//      console.log("connected");
     
//     if(!players.white){ //the first person enters- check  white field is present or not,if not make it white
//         players.white = uniquesocket.id;
//         uniquesocket.emit("playerRole","w");
//     }
//     else if(!players.black){ // second person comes - black field is checked -if not present, make him black
//         players.black = uniquesocket.id;
//         uniquesocket.emit("playerRole", "b");
//     } else { //if both are present them spectator is given 
//         uniquesocket.emit("spectatorRole");
//     }

//     uniquesocket.on("disconnect", function(){
//         if(uniquesocket.id === players.white) {
//             delete players.white;
//         } else if (uniquesocket.id === players.black){
//             delete players.black;
//         }
//     });

//     uniquesocket.on("move", (move)=>{
//         try{ // if other person moves its piece on wrong turns- the piece will return
//             if(chess.turn() === 'w' && socket.id !== players.white) return;
//             if(chess.turn() === 'b' && socket.id !== players.black) return;


//            const result =  chess.move(move);// wrong move done 
//            if(result){// if move is valid- it gives truthy value
//             curentPlayer= chess.turn();
//             io.emit("move", move);// the correct is being sent to everyone- opponent + spectators
//             io.emit("boardState", chess.fen())//FEN- has information about the board condition and sends it to all
//            }
//            else{
//             console.log("Invalid move: ", move);
//             uniquesocket.emit("invalidMove", move);
//            }
//         } catch (err) {
//             console.log(err);
//             uniquesocket.emit("invalidMove :", move);
//         }
//     });

// });

// server.listen(3002, function() {
//     console.log("listening on port 3002");
// })
