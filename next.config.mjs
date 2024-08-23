/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@nillion/client-core",
    "@nillion/client-react-hooks",
    "@nillion/client-vms",
  ],
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.resolve.fallback = {
      crypto: false,
      stream: false,
      buffer: false,
      vm: false,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/nilchain-proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_NILLION_NILCHAIN_JSON_RPC}/:path*`,
      },
    ];
  },
};

export default nextConfig;
