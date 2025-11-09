import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Daiily - Track Your Professional Growth";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const OpenGraphImage = async () => {
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
          padding: "80px 100px",
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
              gap: "12px",
              marginBottom: "60px",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "white",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                width: "40px",
                height: "70px",
                background: "white",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                width: "40px",
                height: "100px",
                background: "white",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                width: "40px",
                height: "130px",
                background: "white",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Brand Name */}
          <div
            style={{
              fontSize: "120px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: "24px",
            }}
          >
            Daiily
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "48px",
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
              maxWidth: "900px",
            }}
          >
            Track Your Professional Growth
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: "400",
              marginTop: "32px",
              maxWidth: "800px",
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

export default OpenGraphImage;
