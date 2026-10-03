const { ImageResponse } = require('@vercel/og');

module.exports = async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    
    // Nyedot kabeh data suguhan soko Hugo
    const title = searchParams.get('title') || 'Judul Postingan';
    const author = searchParams.get('author') || 'Anonymous';
    const site = searchParams.get('site') || 'My Hugo Blog';

    const imageResponse = new ImageResponse(
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
          {/* Jeneng Situs neng Ndhuwur */}
          <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', color: '#0070f3', marginBottom: 20 }}>
            {site}
          </div>
          
          {/* Judul Utama */}
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

    const blob = await imageResponse.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(buffer);

  } catch (e) {
    return res.status(500).send(`Failed: ${e.message}`);
  }
};
