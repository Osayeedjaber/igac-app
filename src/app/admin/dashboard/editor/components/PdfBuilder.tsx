"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Trash, Type, QrCode, Image as ImageIcon, Download, Settings, MousePointer2, Save } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type ElementType = "text" | "qr" | "image";

interface PdfElement {
  id: string;
  type: ElementType;
  text?: string;
  src?: string; // For image elements
  x: number;
  y: number;
  width?: number; // For resizing images
  height?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export default function PdfBuilder() {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [elements, setElements] = useState<PdfElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);

  // Load existing template from database
  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch("/api/admin/templates");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.pdf_config) {
            const config = json.data.pdf_config;
            setElements(config.elements || []);
            setBgImage(config.bgImage || null);
            
            if (config.bgImage) {
              const img = new Image();
              img.onload = () => {
                setCanvasSize({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
              };
              img.src = config.bgImage;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load PDF template", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplate();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Before saving, ensure all coordinates are integers to avoid sharp decimals
      const sanitizedElements = elements.map(el => ({
        ...el,
        x: Math.round(el.x),
        y: Math.round(el.y)
      }));

      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfTemplate: { elements: sanitizedElements, bgImage }
        }),
      });
      if (res.ok) {
        alert("Event Pass template saved successfully!");
      } else {
        alert("Failed to save template.");
      }
    } catch (err) {
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  // Typical A4 aspect ratio is 1 : 1.414
  // Measure canvas to handle responsive bounds
  useEffect(() => {
    if (canvasRef.current && !bgImage) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
           // Only update based on observer if there is no background image
           // If there IS a background image, we set size in handleImageUpload
           setCanvasSize((prev) => {
             if (bgImage) return prev;
             return {
                width: entry.contentRect.width,
                height: entry.contentRect.height,
             };
           });
        }
      });
      resizeObserver.observe(canvasRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [bgImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBgImage(result);
        
        // Create an image object to get natural dimensions
        const img = new Image();
        img.onload = () => {
          setCanvasSize({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextElement = () => {
    const newId = crypto.randomUUID();
    setElements([
      ...elements,
      {
        id: newId,
        type: "text",
        text: "{{Name}}",
        x: 50,
        y: 50,
        color: "#000000",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    ]);
    setSelectedId(newId);
  };

  const addQrElement = () => {
    const newId = crypto.randomUUID();
    setElements([
      ...elements,
      {
        id: newId,
        type: "qr",
        x: 50,
        y: 50,
        fontSize: 100, // Using fontSize to control QR scale
      },
    ]);
    setSelectedId(newId);
  };

  const addImageElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setElements([
          ...elements,
          {
            id: crypto.randomUUID(),
            type: "image",
            src: event.target?.result as string,
            x: 50,
            y: 50,
            width: 150, // default width
            height: 150, // default width
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id: string, updates: Partial<PdfElement>) => {
    setElements((els) => els.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    setElements((els) => els.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    // Deselect to remove borders
    setSelectedId(null);

    // Wait a brief moment for React state to clear the selection border
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) => {
          // Ignore the Next.js static asset indicators or scripts, not strictly needed but can help
           return false;
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // Calculate PDF dimensions (A4 is 210 x 297 mm)
      const pdf = new jsPDF({
        orientation: canvasSize.width > canvasSize.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvasSize.width, canvasSize.height],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvasSize.width, canvasSize.height);
      pdf.save("certificate_preview.pdf");
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Check console.");
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" /> PDF Builder
          </h2>
          <p className="text-xs text-gray-500 mt-1">Design certificates visually</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Background Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {bgImage && (
              <button 
                onClick={() => setBgImage(null)}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove Background
              </button>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Add Elements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Elements</label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={addTextElement}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-sm"
                >
                  <Type className="w-4 h-4" /> Text
                </button>
                <button
                  onClick={addQrElement}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-sm"
                >
                  <QrCode className="w-4 h-4" /> QR Code
                </button>
              </div>
              <div className="relative overflow-hidden w-full">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-sm">
                  <ImageIcon className="w-4 h-4" /> Logo/Sticker
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImageElement}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Properties Editor */}
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4" /> Properties
                </label>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete element"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              {selectedElement.type === "text" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Text / Variable</label>
                    <input
                      type="text"
                      className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={selectedElement.text || ""}
                      onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Tip: Use {'{{Name}}'}, {'{{Role}}'}, {'{{Email}}'} for variables</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        className="w-full text-sm p-2 border border-gray-300 rounded"
                        value={selectedElement.fontSize || 24}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color</label>
                      <input
                        type="color"
                        className="w-full h-[38px] p-1 border border-gray-300 rounded"
                        value={selectedElement.color || "#000000"}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Font Family</label>
                    <select
                      className="w-full text-sm p-2 border border-gray-300 rounded"
                      value={selectedElement.fontFamily || "Arial"}
                      onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                    <select
                      className="w-full text-sm p-2 border border-gray-300 rounded"
                      value={selectedElement.fontWeight || "normal"}
                      onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="800">Extra Bold</option>
                    </select>
                  </div>
                </>
              )}

              {selectedElement.type === "qr" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Size (px)</label>
                  <input
                    type="number"
                    className="w-full text-sm p-2 border border-gray-300 rounded"
                    value={selectedElement.fontSize || 100}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This will be replaced by user's QR code on export</p>
                </div>
              )}

              {selectedElement.type === "image" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                    <input
                      type="number"
                      className="w-full text-sm p-2 border border-gray-300 rounded"
                      value={selectedElement.width || 150}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                    <input
                      type="number"
                      className="w-full text-sm p-2 border border-gray-300 rounded"
                      value={selectedElement.height || 150}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded">
              Select an element on the canvas to edit its properties
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gray-200 p-4 lg:p-8 flex flex-col min-h-0 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
            <span className="font-semibold text-gray-500 animate-pulse">Loading Template...</span>
          </div>
        )}
        <div className="w-full flex justify-between items-center mb-4 gap-2 shrink-0">
          <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">
            Canvas Preview
          </div>
          <div className="flex gap-2">
            <button 
               onClick={() => setSelectedId(null)}
               className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Deselect
            </button>
            <button 
               onClick={handleExport}
               className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded text-sm font-medium text-white shadow-sm hover:bg-black"
            >
              <Download className="w-4 h-4" /> Download Test
            </button>
            <button 
               onClick={handleSave}
               disabled={isSaving}
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-600 rounded text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
        
        {/* Inner Scrollable Canvas Area */}
        <div className="flex-1 overflow-auto flex justify-center items-start lg:items-center p-8 bg-gray-200">
          {/* Zoom Controls Overlay */}
          <div className="fixed bottom-8 right-8 flex gap-2 z-50 bg-white/80 backdrop-blur p-2 rounded-full shadow-lg border border-gray-200">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 font-bold">-</button>
            <span className="flex items-center text-xs font-medium w-12 justify-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 font-bold">+</button>
            <button onClick={() => setZoom(1)} className="px-2 text-[10px] uppercase font-bold hover:underline">Reset</button>
          </div>

          {/* The PDF Canvas */}
          <div 
            className="relative bg-white shadow-2xl shrink-0 border border-gray-300 overflow-hidden"
            style={{ 
              width: "1414px",
              height: "2000px",
              transform: `scale(${zoom})`,
              transformOrigin: "center center"
            }}
            onClick={(e) => {
              // Deselect if clicking exactly on the canvas background
              if (e.target === e.currentTarget) {
                setSelectedId(null);
              }
            }}
            ref={canvasRef}
          >
          {/* Background Image Layer */}
          <img 
            src="/qr code/Allocation Pass.jpg" 
            alt="PDF Background" 
            className="absolute inset-0 w-full h-full object-fill pointer-events-none" 
          />

          {/* Draggable Elements Layer */}
          {elements.map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedId(el.id);
                
                const startX = el.x;
                const startY = el.y;
                const mouseStartX = e.clientX;
                const mouseStartY = e.clientY;

                const onMouseMove = (moveEvent: MouseEvent) => {
                  const dx = (moveEvent.clientX - mouseStartX) / zoom;
                  const dy = (moveEvent.clientY - mouseStartY) / zoom;
                  
                  // Constrain within 1414x2000 boundaries
                  const newX = Math.round(startX + dx);
                  const newY = Math.round(startY + dy);

                  setElements(prev => prev.map(item => 
                    item.id === el.id ? { ...item, x: newX, y: newY } : item
                  ));
                };

                const onMouseUp = () => {
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
              }}
              style={{
                position: "absolute",
                left: `${el.x}px`, 
                top: `${el.y}px`,
                cursor: selectedId === el.id ? "grab" : "pointer",
                userSelect: "none",
                zIndex: selectedId === el.id ? 20 : 10,
              }}
              className={`transition-colors ${
                selectedId === el.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:outline hover:outline-1 hover:outline-gray-300"
              }`}
            >
              {el.type === "text" && (
                <div 
                  style={{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    fontFamily: el.fontFamily,
                    fontWeight: el.fontWeight,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    padding: 0,
                    margin: 0
                  }}
                >
                  {el.text}
                </div>
              )}
              {el.type === "qr" && (
                <div style={{ pointerEvents: "none", padding: 0, margin: 0, display: "block" }}>
                  <QRCodeSVG value="DEMO-QR-CODE" size={el.fontSize || 100} marginSize={0} />
                </div>
              )}
              {el.type === "image" && el.src && (
                <img 
                  src={el.src} 
                  alt="Element Logo" 
                  style={{
                    width: el.width || 150,
                    height: el.height || 150,
                    objectFit: "contain",
                    pointerEvents: "none",
                    display: "block",
                    padding: 0,
                    margin: 0
                  }} 
                  draggable={false} 
                />
              )}
            </div>
          ))}
          
          {!bgImage && elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 font-medium text-2xl">
              A4 Canvas (1:1.414)
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
