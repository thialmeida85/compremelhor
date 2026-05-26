/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      // Adicione aqui outros domínios no futuro, como os do Mercado Livre, Magazine Luiza, etc.
    ],
  },
};

export default nextConfig;