"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Terminal } from "lucide-react";

export default function TerminalApp() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([
    "Welcome to the Terminal App!",
  ]);
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenMoved, setHasBeenMoved] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Define icon size as a percentage of the window size using useMemo
  const iconSizePercent = useMemo(() => ({ width: 5, height: 5 }), []);
  const [iconSize, setIconSize] = useState({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (terminalRef.current) {
      const rect = terminalRef.current.getBoundingClientRect();
      const newIconSize = {
        width: (rect.width * iconSizePercent.width) / 100,
        height: (rect.height * iconSizePercent.height) / 100,
      };
      setIconSize(newIconSize);

      if (!hasBeenMoved) {
        setIconPosition({
          x: rect.width - newIconSize.width,
          y: rect.height - newIconSize.height,
        });
      } else {
        setIconPosition({
          x: rect.width - newIconSize.width,
          y: rect.height - newIconSize.height,
        });
        setHasBeenMoved(false);
      }
    }
  }, [hasBeenMoved, iconSizePercent]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOutput = [...output, `$ ${input}`, processCommand(input)];
    setOutput(newOutput);
    setInput("");
  };

  const processCommand = (cmd: string): string => {
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

  const handleMouseDown = () => {
    setIsDragging(true);
    setHasBeenMoved(true);
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
        className="absolute cursor-move flex items-center justify-center"
        style={{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`,
          width: `${iconSize.width}px`,
          height: `${iconSize.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <Terminal className="w-full h-full text-white" />
      </div>
    </div>
  );
}
