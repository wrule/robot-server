import fs from 'fs';
import net from 'net';
import axios from 'axios';

export
class ClashHub {
  public constructor(
    private apiAddr = 'http://127.0.0.1:9090',
    private proxyHost = '127.0.0.1',
    private proxyPort = 7890,
  ) {

  }

  private async getProxies() {
    try {
      const rsp = await axios.get(`${this.apiAddr}/proxies`);
      if (rsp.status === 200) return {
        all: rsp.data.proxies.GLOBAL.all as string[],
        now: rsp.data.proxies.GLOBAL.now as string,
      };
    } catch (e) {
      console.log(e);
    }
    throw '无法正确获取proxies，请检查clash配置';
  }

  private async setProxy(name: string) {
    try {
      await axios.put(`${this.apiAddr}/proxies/GLOBAL`, { name });
    } catch (e) {
      console.log(e);
    }
    throw '无法正确设置proxy，请检查clash配置';
  }

  private async setProxyCheck(name: string) {
    await this.setProxy(name);
    const proxies = await this.getProxies();
    if (proxies.now !== name) throw '无法正确设置proxy，请检查clash配置';
  }

  private async wait(time = 10000) {
    return new Promise<void>(
      (resolve) =>
        setTimeout(() => resolve(), time)
    );
  }

  private portBind(port: number) {
    const server = net.createServer(async (localSocket) => {
      console.log(port, 1);
      await this.wait(5000);
      console.log(port, 2);
      const remoteSocket = net.connect(this.proxyPort, this.proxyHost);
      localSocket.pipe(remoteSocket).pipe(localSocket);
      remoteSocket.on('error', (err) => {
        localSocket.destroy();
      });
    });
    server.listen(port, () => console.log('Forwarding server listening on port', port, '...'));
  }



  public async Start() {
    const proxies = await this.getProxies();
    // console.log(a.all.length);
    this.portBind(9912);
  }
}
