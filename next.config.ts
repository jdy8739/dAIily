import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone 출력 모드 (Docker 최적화)
  output: "standalone",

  // gzip 압축으로 응답 크기 줄이기 (대역폭 절약)
  compress: true,

  // X-Powered-By 헤더 제거 (보안 + 응답 크기 절약)
  poweredByHeader: false,

  // Prisma 클라이언트와 pino 로거를 서버 컴포넌트에서 외부 패키지로 처리 (번들 크기 최적화)
  serverExternalPackages: [
    "@prisma/client",
    "pino",
    "pino-pretty",
    "thread-stream",
  ],

  images: {
    // 이미지 최적화 비활성화 (메모리 사용량 대폭 감소, t3.micro에 필수)
    unoptimized: true,
  },

  // Turbopack 설정 (Next.js 16 기본값)
  turbopack: {},
};

export default nextConfig;
