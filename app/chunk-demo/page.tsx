"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import StopCircleIcon from "@mui/icons-material/StopCircle";

export default function ChunkDemoPage() {
  const [chunks, setChunks] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [totalChunks, setTotalChunks] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function startStream() {
    setChunks([]);
    setDone(false);
    setTotalChunks(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chunk", { signal: controller.signal });

      // Read total chunks from the response header sent by the server
      const total = parseInt(res.headers.get("X-Total-Chunks") ?? "0");
      setTotalChunks(total || null);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const text = decoder.decode(value, { stream: true });
        setChunks((prev) => [...prev, text]);
      }
      setDone(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setChunks((prev) => [...prev, `❌ Error: ${err.message}`]);
      }
    } finally {
      setStreaming(false);
    }
  }

  function stopStream() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        py: 6,
        px: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <WifiTetheringIcon sx={{ fontSize: 52, color: "#a78bfa", mb: 1 }} />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Streaming API Demo
        </Typography>
        <Typography variant="body2" color="grey.400" mt={1}>
          Hits <code style={{ color: "#60a5fa" }}>/api/chunk</code> —{" "}
          {totalChunks !== null
            ? <><strong style={{ color: "#a78bfa" }}>{totalChunks} chunks</strong> with 2s delay each</>  
            : "streaming with 2s delay each"}
        </Typography>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={startStream}
          disabled={streaming}
          startIcon={<WifiTetheringIcon />}
          sx={{
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            "&:hover": { opacity: 0.9 },
          }}
        >
          {streaming ? "Streaming…" : "Start Stream"}
        </Button>

        <Button
          variant="outlined"
          onClick={stopStream}
          disabled={!streaming}
          startIcon={<StopCircleIcon />}
          sx={{
            borderColor: "#f87171",
            color: "#f87171",
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            "&:hover": { borderColor: "#ef4444", color: "#ef4444" },
          }}
        >
          Stop
        </Button>
      </Box>

      {/* Progress Bar */}
      {streaming && (
        <Box sx={{ width: "100%", maxWidth: 700, mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={totalChunks ? (chunks.length / totalChunks) * 100 : 0}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
              },
            }}
          />
          <Typography
            variant="caption"
            color="grey.400"
            sx={{ mt: 0.5, display: "block", textAlign: "right" }}
          >
            {chunks.length} / {totalChunks ?? "?"} chunks received
          </Typography>
        </Box>
      )}

      {/* Chunks Display */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 700,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {chunks.map((chunk, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(167, 139, 250, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              animation: "fadeSlideIn 0.4s ease",
              "@keyframes fadeSlideIn": {
                from: { opacity: 0, transform: "translateY(8px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Chip
              label={`#${i + 1}`}
              size="small"
              sx={{
                background: "linear-gradient(90deg, #a78bfa33, #60a5fa33)",
                color: "#a78bfa",
                fontWeight: 700,
                minWidth: 40,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "grey.200", lineHeight: 1.8, flex: 1 }}
            >
              {chunk.replace(/^\[Chunk \d+\/10\] /, "")}
            </Typography>
          </Paper>
        ))}

        {done && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#34d399", fontWeight: 600 }}>
              ✅ Stream complete — all {totalChunks ?? chunks.length} chunks received!
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
