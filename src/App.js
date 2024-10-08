import { useEffect, useState, useRef } from 'react';
import './App.css';
import './media-queries.css';

export default function App() {
  const colors = ["black", "red", "orange", "green", "blue", "purple", "yellow", "pink", "white"];

  const canvasReference = useRef(null);
  const contextReference = useRef(null);
  const brushSizeReference = useRef(5);

  const [isPressed, setIsPressed] = useState(false);
  const [brushSize, setBrushSize] = useState(5);

  const clearCanvas = () => {
    const canvas = canvasReference.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setIsPressed(false);
  };

  const beginDraw = (e) => {
    e.preventDefault();
    const rect = canvasReference.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    contextReference.current.beginPath();
    contextReference.current.moveTo(x, y);
    setIsPressed(true);
  };

  const updateDraw = (e) => {
    if (!isPressed) return;
    e.preventDefault();
    const rect = canvasReference.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    contextReference.current.lineTo(x, y);
    contextReference.current.stroke();
  };

  const endDraw = () => {
    contextReference.current.closePath();
    setIsPressed(false);
  };

  const handleMouseEnter = (e) => {
    // Only continue drawing if the mouse button is still pressed
    if (e.buttons === 1 && isPressed) {
      setIsPressed(true);
    }
  };

  const handleGlobalMouseUp = () => {
    // Stop drawing when the mouse button is released anywhere on the document
    setIsPressed(false);
  };

  const handleBrushSizeChange = (e) => {
    const newSize = e.target.value;
    setBrushSize(newSize);
    brushSizeReference.current = newSize;
    contextReference.current.lineWidth = newSize;
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasReference.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'canvas.png';
    link.click();
  };

  useEffect(() => {
    const canvas = canvasReference.current;
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = brushSizeReference.current;
    contextReference.current = context;

    const resizeCanvas = () => {
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempContext.drawImage(canvas, 0, 0);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="App">
      <div className="btns">
        {colors.map((color) => (
          <button
            className="btn-colors"
            key={color}
            onClick={() => { contextReference.current.strokeStyle = color; setIsPressed(false); endDraw() }}
            style={{
              backgroundColor: color,
              color: color === 'black' ? 'white' : 'black'
            }}
          >
            {color === 'white' ? 'eraser' : color}
          </button>
        ))}
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasReference}
          onMouseDown={beginDraw}
          onMouseMove={updateDraw}
          onMouseUp={endDraw}
          onMouseEnter={handleMouseEnter}

          onTouchStart={beginDraw}
          onTouchMove={updateDraw}
          onTouchEnd={endDraw}
        />
        <button className="clr-button" onClick={clearCanvas}>
          Clear Drawing
        </button>

        <button className="save-button" onClick={saveCanvasAsImage}>
          Save as PNG
        </button>

        <div className="slider-container">
          <label className="slider-label" htmlFor="brushSize">
            Brush Size: {brushSize}
          </label>
          <input
            className="slider"
            id="brushSize"
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={handleBrushSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
