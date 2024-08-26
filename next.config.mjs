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
  headers: [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "require-corp",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "X-Requested-With, content-type, Authorization",
        },
      ],
    },
  ],
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
