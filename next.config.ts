
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
      {
        pathname: "/reviewers/**",
        search: "?v=20261117",
      },
    ],
  },
};

export default nextConfig;
