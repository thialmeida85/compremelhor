/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.mercadolivre.com.br',
      },
      {
        protocol: 'https',
        hostname: 'mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'magazine-luiza.com.br',
      },
      {
        protocol: 'https',
        hostname: '*.magazine-luiza.com.br',
      },
    ],
  },
};

export default nextConfig;