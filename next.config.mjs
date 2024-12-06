import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const { withAxiom } = require('next-axiom');

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
    domains: ["zakina-images.s3.eu-north-1.amazonaws.com"], // Add this line to allow the domain
  },
};

const wrappedConfig = withAxiom(withNextIntl(nextConfig));


export default wrappedConfig

/* import autoCert from "anchor-pki/auto-cert/integrations/next";

const withAutoCert = autoCert({
    enabledEnv: "development",
  });
  withAutoCert(withNextIntl(nextConfig));
 */
