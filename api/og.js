import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Nyedot data soko URL parameter (sing dikirim soko Hugo)
    // Yen datane kosong, bakal nggunakake teks cadangan (default)
    const title = searchParams.get('title') || 'Judul Postingan';
    const author = searchParams.get('author') || 'Anonymous';
    const site = searchParams.get('site') || 'My Hugo Blog';

    return new ImageResponse(
      (
        // Ning kene sampeyan iso ngatur desain nganggo HTML & CSS (Flexbox)
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
          {/* Jeneng Situs neng Ndhuwur Cilik */}
          <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', color: '#0070f3', marginBottom: 20 }}>
            {site}
          </div>
          
          {/* Judul Utama neng Tengah Gedhe */}
          <div style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', maxWidth: '900px', lineHeight: 1.3 }}>
            {title}
          </div>
          
          {/* Jeneng Author neng Ngisor */}
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
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
