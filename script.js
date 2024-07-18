const _ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const _abc = _ABC.toLowerCase();

const dropSound = new Audio('MMDrop.mp3');
const flipSound = new Audio('MMFlip.mp3');
const replaceSound = new Audio('MMReplace.mp3');

let cursorX = 0;
let cursorY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;

let dropElement = null;
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
  flipSound.play();
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

// function setAsDropZone(element) {

//   for (eventType of ["mousemove", "touchmove", "touchstart"]) {
//     element.addEventListener(eventType, () => {
//       element.classList.add("highlight-square");
//       dropZone = element;
//     })
//   }

//   for (eventType of ["mouseout", "touchend", "touchcancel"]) {
//     element.addEventListener(eventType, () => {
//       element.classList.remove("highlight-square");
//       dropZone = null;
//     })
//   }
// }

function enableDrag(element) {

  for (let eventType of ["mousedown", "touchstart"]) {
    element.addEventListener(eventType, (event) => {
      dragElement = element;
      startDrag(event);
    });
  }
}

function startDrag(event) {
  event.preventDefault();

  resetContext();

  drag(event);
  document.onmousemove = drag;
  document.onmouseup = releaseDrag;

  document.ontouchmove = drag;
  document.ontouchend = releaseDrag;
  document.ontouchcancel = releaseDrag;
}

function releaseDrag() {
  dragElement.style.pointerEvents = "auto";
  clearDocEvents();
  dropIn(dragElement);
  dragElement.classList.remove("dragged-piece");
}

function clearDocEvents() {
  document.onmousemove = null;
  document.onmouseup = null;

  document.ontouchmove = null;
  document.ontouchend = null;
  document.ontouchcancel = null;
}

function updateDropZones() {
  const squares = document.querySelectorAll(".board-cell");
  const range = squares[0].getBoundingClientRect().width / 2;
  for (let square of squares) {
    square.classList.remove("highlight-square");
  }
  const nearest = nearestElement(dragElement, squares);
  if (nearest.distance <= range * 1.5) {
    nearest.element.classList.add("highlight-square");
    dropZone = nearest.element;
  } else {
    dropZone = null;
  }
}

function drag(event) {
  // event.preventDefault();
  updateCursorPos(event);
  updateElementPos();
  updateDropZones();
}

function updateCursorPos(event) {
  if (["touchstart", "touchmove"].includes(event.type)) {
    cursorX = event.touches[0].clientX
    cursorY = event.touches[0].clientY
  } else {
    cursorX = event.clientX;
    cursorY = event.clientY;
  }

  const rect = dragElement.getBoundingClientRect();

  // Subtracting half the width & height positions the center of the element under the cursor
  dragOffsetX = cursorX - (rect.width / 2);
  dragOffsetY = cursorY - (rect.height / 2);
}

function updateElementPos() {
  dragElement.style.position = "absolute";
  dragElement.style.left = (dragOffsetX) + "px";
  dragElement.style.top = (dragOffsetY) + "px";
}

function resetContext() {
  dragElement.classList.add("dragged-piece");
  document.body.append(dragElement);
  dragElement.style.position = "absolute";
  dragElement.style.pointerEvents = "none";
}


function dropIn(element) {
  if (dropZone) {
    dropZone.append(element);
    element.style.position = "static";
    dropZone.classList.remove("highlight-square");
    dropSound.play();

    setTimeout(flipBoard, 2000);
  }
  dropZone = null;
}

function getCenterPos(element) {
  const rect = element.getBoundingClientRect();
  x = rect.left + (rect.width / 2);
  y = rect.top  + (rect.height / 2);
  return { x:x, y:y }
}

function getDistance(element1, element2) {
  e1 = getCenterPos(element1);
  e2 = getCenterPos(element2);
  xSide = Math.abs(e1.x - e2.x);
  ySide = Math.abs(e1.y - e2.y);
  return Math.sqrt((xSide ** 2) + (ySide ** 2))
}

function nearestElement(originElement, elements) {
  nearest = { element:elements[0], distance:getDistance(originElement, elements[0]) }
  for (let element of elements) {
    const distance = getDistance(originElement, element);
    if (distance < nearest.distance) {
      nearest = { element:element, distance:distance }
    }
  }
  return nearest
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
