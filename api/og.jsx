import { ImageResponse } from '@vercel/og';

export const config = {
  // Kita balikake nggo runtime 'edge' merga saiki format import-e wis bener lan dijamin anti-unsupported modules!
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Nyedot janganan segar soko parameter Hugo sing kacithak neng HTML
    const title = searchParams.get('title') || 'Judul Postingan';
    const author = searchParams.get('author') || 'Anonymous';
    const site = searchParams.get('site') || 'My Hugo Blog';

    // ImageResponse Vercel modern iki otomatis langsung ngetokake format PNG murni!
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            padding: '40px',
            border: '20px solid #0070f3',
          }}
        >
          {/* Jeneng Situs */}
          <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', color: '#0070f3', marginBottom: 20 }}>
            {site}
          </div>
          
          {/* Judul Utama */}
          <div style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', maxWidth: '900px', lineHeight: 1.3 }}>
            {title}
          </div>
          
          {/* Author */}
          <div style={{ fontSize: 28, color: '#a0a0a0', marginTop: 40, fontStyle: 'italic' }}>
            By {author}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Gagal Nggambar: ${e.message}`, { status: 500 });
  }
}
