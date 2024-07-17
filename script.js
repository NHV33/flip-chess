const _ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const _abc = _ABC.toLowerCase();

let cursorX = 0;
let cursorY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;


let dropZone = null;
const board = document.getElementById("board");

let boardFlipped = false;
const flipButton = document.getElementById("flip-button");
flipButton.addEventListener("click", flipBoard)

function flipBoard() {
  if (boardFlipped) {
    board.classList.remove("flipped-board");
    document.querySelectorAll(".chess-piece").forEach(piece => {
      piece.classList.remove("flipped-piece");
    });
    boardFlipped = false;
  } else {
    board.classList.add("flipped-board");
    document.querySelectorAll(".chess-piece").forEach(piece => {
      piece.classList.add("flipped-piece");
    });
    boardFlipped = true;
  }
  console.log("flip me");
}

function newElement(tag, attrs) {
  const newElem = document.createElement(tag);
  for (const key in attrs) {
    newElem.setAttribute(key, attrs[key])
  }
  return newElem
}

function generateBoard() {
  for (let x = 0; x < 8; x++) {
    const newRow = newElement("div", {class: "board-row"});
    board.append(newRow);
    for (let y = 8; y > 0; y--) {
      const chessPos = `${_abc[x]}${y}`

      const newCell = newElement("div", {class: "board-cell", id: chessPos});
      newRow.append(newCell);

      newCell.setAttribute("pos", `${x}-${y - 1}`);
      newCell.setAttribute("chess-pos", chessPos);

      const newCellBG = newElement("div", {class: "board-cell-bg"});
      newCell.append(newCellBG);

      ((y + x) % 2 == 0 ) ?
        newCellBG.classList.add("light-square") :
        newCellBG.classList.add("dark-square") ;

      // display grid notation (disabled for now)
      // newCellBG.textContent = chessPos;

      setAsDropZone(newCell);
    }
  }
}

generateBoard();

function placePiece(pos) {
  const boardCell = document.getElementById(pos.slice(0, 2));
  // boardCell.style.backgroundColor = "red";
  const pieceContainer = newElement("div", {class: "piece-container draggable"});
  boardCell.append(pieceContainer);
  enableDrag(pieceContainer);

  const newPiece = newElement("div", {class: "chess-piece"});
  pieceContainer.append(newPiece);

  pieceColors = {l:"light-piece", d:"dark-piece"}
  newPiece.classList.add(pieceColors[pos[2]]);
  pieceTypes = {p:"o", n: "m", b:"v", r:"t", q:"w", k:"l"}
  newPiece.textContent = pieceTypes[pos[3]];

}

function setPieces() {
  // set pawns
  for (let posFormat of ["_7dp", "_2lp"]) {
    for (let i = 0; i < 8; i++) {
      placePiece(posFormat.replace("_", _abc[i]));
    }
  }
  // set other pieces
  const pieceOrder = "rnbqkbnr";
  for (let posFormat of ["_8d*", "_1l*"]) {
    for (let i = 0; i < 8; i++) {
      placePiece(posFormat.replace("_", _abc[i]).replace("*", pieceOrder[i]));
    }
  }
}

setPieces();

function setAsDropZone(element) {
  const originalColor = window.getComputedStyle(element)["backgroundColor"];
  console.log("originalColor: ", originalColor);

  element.addEventListener("mousemove", () => {
    element.style.backgroundColor = "rgba(100,255,100, 0.5)";
    dropZone = element;
  })

  element.addEventListener("mouseout", () => {
    element.style.backgroundColor = originalColor;
    dropZone = null;
  })
}

function enableDrag(dragElement) {

  dragElement.addEventListener("mousedown", (event) => {
    event.preventDefault();

    resetContext(dragElement);

    drag(event);
    document.onmousemove = drag;
    document.onmouseup = releaseDrag;
  });

  function releaseDrag() {
    dragElement.style.pointerEvents = "auto";
    clearDocEvents();
    dropIn(dragElement);
    dragElement.classList.remove("dragged-piece");
  }

  function clearDocEvents() {
    document.onmousemove = null;
    document.onmouseup = null;
  }

  function drag(event) {
    event.preventDefault();
    updateCursorPos(event);
    updateElementPos(dragElement);
  }

  function updateCursorPos(event) {
    cursorX = event.clientX;
    cursorY = event.clientY;

    const rect = dragElement.getBoundingClientRect();

    // Subtracting half the width & height positions the center of the element under the cursor
    dragOffsetX = cursorX - (rect.width / 2);
    dragOffsetY = cursorY - (rect.height / 2);
  }

  function updateElementPos(element) {
    element.style.position = "absolute";
    element.style.left = (dragOffsetX) + "px";
    element.style.top = (dragOffsetY) + "px";
  }

  function resetContext(element) {
    dragElement.classList.add("dragged-piece");
    document.body.append(element);
    element.style.position = "absolute";
    element.style.pointerEvents = "none";
  }
}

function dropIn(element) {
  if (dropZone) {
    dropZone.append(element);
    element.style.position = "static";
  }
  dropZone = null;
}


// function enableDragging(element) {
//   let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

//   element.addEventListener("mousedown", dragMouseDown);


//   function dragMouseDown(e) {
//     // e = e || window.event;
//     e.preventDefault();



//     // get the mouse cursor position at startup:
//     x2 = e.clientX;
//     y2 = e.clientY;

//     elementDrag(e);

//     document.onmouseup = closeDragElement;
//     // call a function whenever the cursor moves:
//     document.onmousemove = elementDrag;
//     element.style.pointerEvents = "none";
//   }

//   function elementDrag(e) {
//     // e = e || window.event;
//     e.preventDefault();


//     // calculate the new cursor position:
//     x1 = x2 - e.clientX;
//     y1 = y2 - e.clientY;
//     x2 = e.clientX;
//     y2 = e.clientY;
//     // set the element's new position:
//     element.style.top = (element.offsetTop - y1) + "px";
//     element.style.left = (element.offsetLeft - x1) + "px";

//     resetContext();
//   }

//   function closeDragElement(e) {

//     resetContext();

//     // stop moving when mouse button is released:
//     document.onmouseup = null;
//     document.onmousemove = null;
//     element.style.pointerEvents = "all";
//     console.log(dropZone);
//     if (dropZone) {
//       dropZone.append(element);
//       element.style.position = "static";
//     }

//   }

//   function resetContext() {
//     document.body.append(element);
//     element.style.position = "absolute";
//   }
// }
