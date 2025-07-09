import express from 'express';
import { Downloader } from 'ytdl-mp3';
import fs from 'fs';
import path from 'path';
// import serverless from 'serverless-http';

const app = express();
const port = 3001;

// Route to download song
app.get('/download-song', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  const downloader = new Downloader({ getTags: true, outputDir:"/tmp" });

  try {
    const songInfo = await downloader.downloadSong(url);
    const filepath = songInfo.file; // Path to downloaded file
    const filename = path.basename(filepath);

    // Stream the file as a download
    res.download(filepath, filename, (err) => {
      // Clean up after sending
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });

      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file.');
      }
    });
  } catch (err) {
    console.error('Download failed:', err);
    res.status(500).json({ error: 'Failed to download song.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});


// export const handler = serverless(app);