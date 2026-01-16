import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

export class MockFeedServer {
  private server: Server;
  private port: number = 0;

  constructor() {
    this.server = createServer((req, res) => {
      // Set CORS headers just in case
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      if (req.url === '/feed.xml') {
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Test Feed</title>
  <link>http://localhost:${this.port}/feed.xml</link>
  <description>A test feed</description>
  <item>
    <title>Test Article 1</title>
    <link>http://localhost:${this.port}/article/1</link>
    <description>This is the description of test article 1</description>
    <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    <guid>1</guid>
  </item>
  <item>
    <title>Test Article 2</title>
    <link>http://localhost:${this.port}/article/2</link>
    <description>This is the description of test article 2</description>
    <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
    <guid>2</guid>
  </item>
</channel>
</rss>`);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  }

  async start(): Promise<string> {
    return new Promise((resolve) => {
      this.server.listen(0, '127.0.0.1', () => {
        this.port = (this.server.address() as AddressInfo).port;
        resolve(`http://127.0.0.1:${this.port}/feed.xml`);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
