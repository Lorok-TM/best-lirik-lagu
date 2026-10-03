const { ImageResponse } = require('@vercel/og');

module.exports = async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    
    // Nampa slug soko vercel.json (misal: fauzana-padiah-bana)
    const slug = searchParams.get('title') || 'postingan';
    
    // Ngowahi strip dadi spasi lan Huruf Kapital (Fauzana Padiah Bana)
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const author = "Katrok";
    const site = "Best Lirik Lagu";

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
          <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', color: '#0070f3', marginBottom: 20 }}>
            {site}
          </div>
          <div style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', maxWidth: '900px', lineHeight: 1.3 }}>
            {title}
          </div>
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

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).end(buffer);

  } catch (e) {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send(`Gagal: ${e.message}`);
  }
};
