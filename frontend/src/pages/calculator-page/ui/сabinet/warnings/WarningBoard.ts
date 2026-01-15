export class WarningBoard {
  private static instance: WarningBoard | null = null; // singleton не хорошо но поправлю потом
  private element: HTMLDivElement;

  constructor(message: string) {
    this.element = document.createElement('div');
    this.element.classList.add('warning-board');
    this.element.style.position = 'absolute';
    this.element.style.top = '200px';
    this.element.style.left = '50px';
    this.element.style.padding = '10px 15px';
    this.element.style.background = 'rgba(255, 50, 50, 0.9)';
    this.element.style.color = 'white';
    this.element.style.borderRadius = '5px';
    this.element.style.cursor = 'move';
    this.element.style.zIndex = '9999';
    this.element.innerHTML = `
            <span>${message}</span>
            <span style="float:right; cursor:pointer; font-weight:bold;">✖</span>
        `;
    document.body.appendChild(this.element);

    const closeBtn = this.element.querySelector('span:last-child') as HTMLElement;
    closeBtn.addEventListener('click', () => this.destroy());

    this.makeDraggable();
  }

  private makeDraggable() {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    this.element.addEventListener('mousedown', (e: MouseEvent) => {
      if ((e.target as HTMLElement).innerText === '✖') return;
      isDragging = true;
      offsetX = e.clientX - this.element.offsetLeft;
      offsetY = e.clientY - this.element.offsetTop;
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;
      this.element.style.left = `${e.clientX - offsetX}px`;
      this.element.style.top = `${e.clientY - offsetY}px`;
    });

    window.addEventListener('mouseup', () => (isDragging = false));
  }

  public destroy() {
    this.element.remove();
    WarningBoard.instance = null; // разрешаем создание нового после удаления
  }
}
