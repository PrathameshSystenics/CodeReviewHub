"use client";

import { useEffect, useState } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MdRefresh } from "react-icons/md";
import {
  VscDebugConsole,
  VscChevronDown,
  VscChevronUp,
  VscCopy,
} from "react-icons/vsc";

//#region Font Declaration
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

const isDev = process.env.NODE_ENV === "development";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [showStack, setShowStack] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const copyErrorDetails = () => {
    const details = [
      `Error: ${error.message}`,
      error.digest ? `Digest: ${error.digest}` : "",
      `Stack Trace:\n${error.stack ?? "No stack trace available"}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(details).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    // global-error must include its own <html> and <body> — it replaces the root layout
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Critical Error — CodeReviewHub</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#020617",
          color: "#f1f5f9",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 30% 30%, rgba(239,68,68,0.10) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(249,115,22,0.07) 0%, transparent 50%)",
            zIndex: 0,
          }}
        />

        <main
          className={inter.className}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "56rem",
            margin: "0 auto",
            padding: "3rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Label */}
          <p
            className={jetbrains_mono.className}
            style={{
              color: "#f87171",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 700,
              marginBottom: "1.25rem",
            }}
          >
            Critical Error: Global Exception
          </p>

          {/* Heading */}
          <h1
            className={space_grotesk.className}
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ color: "#e2e8f0", display: "block", marginBottom: "0.25rem" }}>
              Application
            </span>
            <span
              style={{
                background: "linear-gradient(to right, #f87171, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Crashed
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={inter.className}
            style={{
              color: "#94a3b8",
              fontSize: "clamp(0.875rem, 2.5vw, 1.1rem)",
              lineHeight: 1.7,
              maxWidth: "38rem",
              marginBottom: "2.5rem",
            }}
          >
            {isDev
              ? "A critical unhandled error crashed the root application. The debug panel below contains the full details."
              : "A fatal exception occurred in the application root. Our systems have been notified. You can retry or come back later."}
          </p>

          {/* Retry Button */}
          <div style={{ marginBottom: "3rem" }}>
            <button
              onClick={unstable_retry}
              className={inter.className}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                background: "linear-gradient(to right, #ef4444, #f97316)",
                color: "#fff",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <MdRefresh style={{ fontSize: "1.25rem" }} />
              Try Again
            </button>
          </div>

          {/* Dev-only Debug Panel */}
          {isDev && (
            <div
              style={{
                width: "100%",
                maxWidth: "48rem",
                textAlign: "left",
              }}
            >
              {/* Debug Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <VscDebugConsole style={{ color: "#f87171", fontSize: "1.1rem" }} />
                <span
                  className={jetbrains_mono.className}
                  style={{
                    color: "#f87171",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontWeight: 700,
                  }}
                >
                  Debug Information
                </span>
                <span
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(100,116,139,0.3)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: "#64748b",
                    background: "rgba(30,41,59,0.6)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(100,116,139,0.2)",
                  }}
                >
                  DEV ONLY
                </span>
              </div>

              {/* Error Card */}
              <div
                style={{
                  background: "rgba(15,23,42,0.7)",
                  border: "1px solid rgba(100,116,139,0.25)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Error Message Row */}
                <div
                  style={{
                    padding: "1.25rem",
                    borderBottom: "1px solid rgba(100,116,139,0.2)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        marginBottom: "0.375rem",
                      }}
                    >
                      Error Message
                    </p>
                    <p
                      className={jetbrains_mono.className}
                      style={{
                        color: "#fca5a5",
                        fontSize: "0.8rem",
                        wordBreak: "break-all",
                        margin: 0,
                      }}
                    >
                      {error.message || "Unknown error"}
                    </p>
                  </div>
                  <button
                    onClick={copyErrorDetails}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: "#64748b",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                      marginTop: "1.25rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    title="Copy error details"
                  >
                    <VscCopy style={{ fontSize: "0.85rem" }} />
                    <span className={jetbrains_mono.className}>
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>

                {/* Error Type & Digest Row */}
                <div
                  style={{
                    padding: "0.875rem 1.25rem",
                    borderBottom: "1px solid rgba(100,116,139,0.2)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem 2rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      Error Type
                    </p>
                    <p
                      className={jetbrains_mono.className}
                      style={{ color: "#fdba74", fontSize: "0.75rem", margin: 0 }}
                    >
                      {error.name || "Error"}
                    </p>
                  </div>
                  {error.digest && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          marginBottom: "0.25rem",
                        }}
                      >
                        Digest
                      </p>
                      <p
                        className={jetbrains_mono.className}
                        style={{ color: "#7dd3fc", fontSize: "0.75rem", margin: 0 }}
                      >
                        {error.digest}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stack Trace */}
                <div>
                  <button
                    onClick={() => setShowStack((prev) => !prev)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1.25rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(30,41,59,0.3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                      }}
                    >
                      Stack Trace
                    </span>
                    {showStack ? (
                      <VscChevronUp style={{ color: "#64748b", fontSize: "0.85rem" }} />
                    ) : (
                      <VscChevronDown style={{ color: "#64748b", fontSize: "0.85rem" }} />
                    )}
                  </button>

                  {showStack && (
                    <div style={{ padding: "0 1.25rem 1.25rem" }}>
                      <pre
                        className={jetbrains_mono.className}
                        style={{
                          fontSize: "0.72rem",
                          lineHeight: 1.6,
                          color: "#94a3b8",
                          background: "rgba(2,6,23,0.6)",
                          borderRadius: "0.5rem",
                          padding: "1rem",
                          border: "1px solid rgba(30,41,59,0.6)",
                          overflowX: "auto",
                          overflowY: "auto",
                          maxHeight: "18rem",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          margin: 0,
                        }}
                      >
                        {error.stack ?? "No stack trace available."}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <p
                style={{
                  fontSize: "0.65rem",
                  color: "#334155",
                  marginTop: "0.75rem",
                  textAlign: "center",
                }}
              >
                This debug panel is only visible in development mode and will not
                appear in production builds.
              </p>
            </div>
          )}
        </main>
      </body>
    </html>
  );
}