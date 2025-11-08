import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 빌드
  output: "standalone",

  // gzip 압축으로 응답 크기 줄이기 (대역폭 절약)
  compress: true,

  // X-Powered-By 헤더 제거 (보안 + 응답 크기 절약)
  poweredByHeader: false,

  // Prisma 클라이언트를 서버 컴포넌트에서 외부 패키지로 처리 (번들 크기 최적화)
  serverExternalPackages: ["@prisma/client"],

  images: {
    // 이미지 최적화 비활성화 (메모리 사용량 대폭 감소, t3.micro에 필수)
    unoptimized: true,
  },
};

export default nextConfig;
