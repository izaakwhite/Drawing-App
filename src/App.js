import { useEffect, useState, useRef } from 'react';
import './App.css';

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
    contextReference.current.beginPath();
    contextReference.current.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    setIsPressed(true);
  };

  const updateDraw = (e) => {
    if (!isPressed) return;

    contextReference.current.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    contextReference.current.stroke();
  };

  const endDraw = () => {
    contextReference.current.closePath();
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
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="App">
      <div className="btns">
        {colors.map((color) => (
          <button
            className="btn-colors"
            key={color}
            onClick={() => { contextReference.current.strokeStyle = color; setIsPressed(false); }}
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
          onMouseLeave={endDraw}
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
