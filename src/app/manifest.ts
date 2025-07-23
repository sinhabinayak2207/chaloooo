// Define the manifest type manually since MetadataRoute is causing issues
type ManifestType = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
};

export default function manifest(): ManifestType {
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
