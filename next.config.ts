import type { NextConfig } from "next";

const nextConfig = {
  // Thêm cấu hình 'images' vào đây
  images: {
    // remotePatterns là cách mới và an toàn
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // Cho phép tất cả các đường dẫn ảnh từ host này
      },
    ],
  },
};

export default nextConfig;
