import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Discuss — AI Group Chat Simulator"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            background: "#ffffff",
            color: "#000000",
            fontSize: "56px",
            fontWeight: 800,
            marginBottom: "28px",
          }}
        >
          D
        </div>
        <div style={{ fontSize: "84px", fontWeight: 800, letterSpacing: "-2px" }}>
          Discuss
        </div>
        <div
          style={{
            fontSize: "34px",
            fontWeight: 400,
            opacity: 0.8,
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          AI Group Chat Simulator
        </div>
        <div
          style={{
            fontSize: "24px",
            opacity: 0.6,
            marginTop: "20px",
          }}
        >
          Drop a topic — AI characters debate like real people · discuss.tirup.in
        </div>
      </div>
    ),
    { ...size }
  )
}
