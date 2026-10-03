const { ImageResponse } = require('@vercel/og');

module.exports = async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    
    // Nampa data slug soko rute vercel.json
    const slug = searchParams.get('title') || 'postingan';
    
    // Ngowahi "cara-mancing-belut" dadi "Cara Mancing Belut"
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

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
          <div style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', maxWidth: '900px', lineHeight: 1.3 }}>
            {title}
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
