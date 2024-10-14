"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export default function TerminalApp() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([
    "Welcome to the Terminal App!",
  ]);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [iconSize, setIconSize] = useState({ width: 50, height: 50 });
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (terminalRef.current) {
        const rect = terminalRef.current.getBoundingClientRect();
        setIconPosition({
          x: rect.width - iconSize.width,
          y: rect.height - iconSize.height,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [iconSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOutput = [...output, `$ ${input}`, processCommand(input)];
    setOutput(newOutput);
    setInput("");
  };

  const processCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    switch (command) {
      case "help":
        return "Available commands: help, clear, echo, date";
      case "clear":
        setOutput([]);
        return "";
      case "date":
        return new Date().toString();
      default:
        if (command.startsWith("echo ")) {
          return command.slice(5);
        }
        return `Command not found: ${command}`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    console.log(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && terminalRef.current) {
      const rect = terminalRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - iconSize.width / 2;
      const newY = e.clientY - rect.top - iconSize.height / 2;
      setIconPosition({
        x: Math.max(0, Math.min(newX, rect.width - iconSize.width)),
        y: Math.max(0, Math.min(newY, rect.height - iconSize.height)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleIconResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSize = {
      width: Math.max(30, Math.min(100, iconSize.width + e.movementX * 2)),
      height: Math.max(30, Math.min(100, iconSize.height + e.movementY * 2)),
    };
    setIconSize(newSize);
  };

  return (
    <div
      ref={terminalRef}
      className="relative w-full h-screen bg-gray-900 text-green-400 p-4 font-mono overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="h-full overflow-auto pb-16">
        {output.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <form onSubmit={handleSubmit} className="mt-2">
          <span>$ </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent outline-none w-11/12"
            autoFocus
          />
        </form>
      </div>
      <div
        className="absolute cursor-move"
        style={{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`,
          width: `${iconSize.width}px`,
          height: `${iconSize.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <Terminal className="w-full h-full text-white" />
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-white opacity-50 cursor-se-resize"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={handleIconResize}
        />
      </div>
    </div>
  );
}
