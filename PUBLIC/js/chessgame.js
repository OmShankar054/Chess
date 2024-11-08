const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Renders the chessboard
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = ""; // Clear board

    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            // If there is a piece on this square
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: colIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();

                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    // Flip board for black player
    if (playerRole === "b") {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

// Converts the move to Chess.js format and sends it to the server
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    };

    console.log("Move sent:", move);
    socket.emit("move", move);
};

// Maps chess pieces to Unicode symbols
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙", r: "♖", k: "♔", q: "♕", b: "♗", n: "♘",
        P: "♟", R: "♜", K: "♚", Q: "♛", B: "♝", N: "♞",
    };
    return unicodePieces[piece.type] || "";
};

// Receive and set player role
socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

// Spectator handling
socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

// Receive board state and update
socket.on("boardState", (fen) => {
    chess.load(fen);
    console.log("Board state updated:", fen);
    renderBoard();
});

// Receive and execute move
socket.on("move", (move) => {
    chess.move(move);
    console.log("Move received:", move);
    renderBoard();
});

// Initial render
renderBoard();



// const socket = io(); //this will open first when we open our browser

//  const chess = new Chess();
//  const boardElement = document.querySelector(".chessboard");

//  let dragPiece = null;
//  let sourceSquare = null;
//  let playerRole = null;

// const renderBoard = () => {
//     const board = chess.board();
//     boardElement.innerHTML = ""; //to get the board empty- all the time 
//     board.forEach((row, rowindex) => {
//         row.forEach((square, squareindex) => {
//           const squareElement = document.createElement("div");
//           squareElement.classList.add(
//             "square", //for the pattern of the chess board
//             (rowindex + squareindex) %2 ===0 ? "light" : "dark" //design
//           );

//           squareElement.dataset.row = rowindex; //values given to the square -row index value
//           squareElement.dataset.col = squareindex;// column index value

//           if (square) { //for the square holding piece
//             const pieceElement = document.createElement("div");
//             pieceElement.classList.add(
//               "piece",
//                square.color === "w" ? "white" : "black");

//                pieceElement.innerText = getPieceUnicode(square);
//                pieceElement.draggable = playerRole === square.color; //for the valid player to only drag his piece

//                pieceElement.addEventListener("dragstart", (e) => {//event receive
//                 if (pieceElement.draggable){ // agar piecelemnt is dragable then store pieceElemnt in draggedpiece in 
//                    draggedPiece = pieceElement; 
//                    sourceSquare = { row: rowindex, col: squareindex};
//                    console.log("Drag started:", draggedPiece, sourceSquare);
//                    e.dataTransfer.setData("text/plain", "");//dragable will work cross browsers
//                   }
//                 });

//                pieceElement.addEventListener("dragend", (e) => {
//                 console.log("Drag ended");
//                 dragPiece = null;  //when nothing is being dragged
//                 sourceSquare = null;  
//                });

//                squareElement.appendChild(pieceElement); //attachibng piece element over the square
//            }

//            squareElement.addEventListener("dragover", function (e) {
//             e.preventDefault();
//            });

//            squareElement.addEventListener("drop", function (e) {
//             e.preventDefault(); //stops the deault function of drop
//             console.log("Drop event fired");

//             if (draggedPiece) {
//               const targetSource = {
//                 row: parseInt(squareElement.dataset.row),
//                 col: parseInt(squareElement.dataset.col),
//               };

//               console.log("Piece dropped from", sourceSquare, "to", targetSource);
//               handleMove(sourceSquare, targetSource);
//             }
//             else {
//               console.log("No piece is being dragged");            
//             }
//            });
//            boardElement.appendChild(squareElement);
//         });
//   });  
  
//   if (playerRole === "b") {
//     boardElement.classList.add("flipped");
//   }
//   else {
//     boardElement.classList.remove("flipped");
//   }
// };  

// const handleMove = (source, target) => {
//   const move = {
//       from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
//       to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
//       promotion: "q",
//   };

//   console.log("Move sent:", move);
//   socket.emit("move", move);
// };
 
// const getPieceUnicode = (piece) => { //for face structure of pieces
//   const unicodePieces = { 
//     p: "♙",  
//     r: "♖", 
//     k: "♔",  //white pieces
//     q: "♕", 
//     b: "♗", 
//     n: "♘ ", 
   
//     K: "♚",  //black pieces
//     Q: "♛",  
//     R: "♜",  
//     B: "♝",  
//     N: "♞",  
//     P: "♟",
//   };

//   return unicodePieces[piece.type] || "";//find the piece form piece.type and send it in to be received in getPieceUnicode = (piece) 
// };

// socket.on("playerRole", function (role) {
//   playerRole = role; //assign the role
//   renderBoard(); //this will set the board accoarding to the player role
// });

// socket.on("spectatorRole", function() {
//   playerRole = null;
//   renderBoard();
// });

// socket.on("boardState", function(fen) { // the new state is 'fen', and load it in load method
//   chess.load(fen);
//   console.log("Board state updated");
//   renderBoard();
// });

// socket.on("move", function(move) { // the new state is 'fen', and load it in load method
//   chess.move(move);
//   console.log("Move received:", move);
//   renderBoard();
// });

// renderBoard();
