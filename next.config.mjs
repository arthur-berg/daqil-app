
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/* const radixPackages = [
  "@radix-ui/react-accordion",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-icons",
  "@radix-ui/react-label",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toast",
  "@radix-ui/react-tooltip"
]; */

const radixPackages = [
  "@radix-ui/react-icons",
];

/** @type {import('next').NextConfig} */
const nextConfig = {experimental: {optimizePackageImports: [
  ...radixPackages
],serverComponentsExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']}};

export default withNextIntl(nextConfig)


/* import autoCert from "anchor-pki/auto-cert/integrations/next";

const withAutoCert = autoCert({
    enabledEnv: "development",
  });
  withAutoCert(withNextIntl(nextConfig));
 */