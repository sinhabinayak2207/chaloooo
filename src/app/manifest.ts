export default function manifest() {
  return {
    name: 'OCC World Trade',
    short_name: 'OCC World Trade',
    description: 'OCC World Trade offers high-quality bulk commodities and raw materials for businesses worldwide',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0066CC',
    icons: [
      {
        src: '/octpopuslogo.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      }
    ],
  }
}
