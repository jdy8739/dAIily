import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Daiily - Track Your Professional Growth";
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

const TwitterImage = async () => {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          padding: "60px 80px",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* Logo/Icon - Growth Chart Bars */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "48px",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "white",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "56px",
                background: "white",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "80px",
                background: "white",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "104px",
                background: "white",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Brand Name */}
          <div
            style={{
              fontSize: "100px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: "20px",
            }}
          >
            Daiily
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "40px",
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
              maxWidth: "800px",
            }}
          >
            Track Your Professional Growth
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: "400",
              marginTop: "24px",
              maxWidth: "700px",
            }}
          >
            Share daily experiences, learn, and achieve together
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
};

export default TwitterImage;
