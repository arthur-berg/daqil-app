import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const radixPackages = ["@radix-ui/react-icons"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [...radixPackages],
    serverComponentsExternalPackages: [
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
    ],
  },
  images: {
    domains: ["zakina-images.s3.eu-north-1.amazonaws.com"],
  },
  async headers() {
    return [
      {
        source: "/api/appointment/(.*)", 
        headers: [
          {
            key: "x-vercel-protection-bypass",
            value: "true", 
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

/* import autoCert from "anchor-pki/auto-cert/integrations/next";

const withAutoCert = autoCert({
    enabledEnv: "development",
  });
  withAutoCert(withNextIntl(nextConfig));
 */
