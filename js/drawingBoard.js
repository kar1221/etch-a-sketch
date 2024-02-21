export class DrawingBoard {
  constructor(element) {
    if (typeof element === "string") {
      this.element = document.querySelector(element);
    } else {
      this.element = element;
    }
    this.isDrawing = false;
    this.pencilMode = false;
    this.color = "black";

    document.body.addEventListener("mousedown", () => {
      this.isDrawing = true;
    });
    document.body.addEventListener("mouseup", () => {
      this.isDrawing = false;
    });
  }

  setColor(color) {
    this.color = color;
  }

  pencilDraw(event) {
    const target = event.target;

    if (!target.hasAttribute("shading")) {
      target.setAttribute("shading", "1");
    }
  }

  draw(event) {
    event.target.style.backgroundColor = this.color;
  }

  handleMouseMove(event) {
    if (!this.isDrawing) return;

    if (this.pencilMode) {
      this.pencilDraw(event);
      return;
    }

    this.draw(event);
  }

  handleMouseDown(event) {
    this.isDrawing = true;
    this.handleMouseMove(event);
  }

  handleMouseUp() {
    this.isDrawing = false;
  }

  preventDefault(event) {
    event.preventDefault();
  }

  /**
   * Create a grid of the specified size.
   *
   * @param {number} size - The size of the grid
   * @return {void}
   */
  createGrid(size) {
    this.#emptyContainer();

    for (let x = 0; x < size; x++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let y = 0; y < size; y++) {
        const column = document.createElement("div");
        column.classList.add("column");

        column.addEventListener("mousedown", this.handleMouseDown);
        column.addEventListener("mousemove", this.handleMouseMove);
        column.addEventListener("mouseup", this.handleMouseUp);
        column.addEventListener("dragstart", this.preventDefault);
        column.addEventListener("drop", this.handleMouseMove);
        row.appendChild(column);
      }
      this.element.appendChild(row);
    }
  }

  #emptyContainer() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
}
