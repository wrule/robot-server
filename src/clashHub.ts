import fs from 'fs';
import net from 'net';
import axios from 'axios';

export
class ClashHub {
  public constructor(
    private readonly apiAddr = 'http://127.0.0.1:9090',
    private readonly proxyHost = '127.0.0.1',
    private readonly proxyPort = 7890,
    private readonly basePort = 30000,
  ) { }

  private nowProxy = '';
  private allProxys = [] as string[];

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
      return;
    } catch (e) {
      console.log(e);
    }
    throw '无法正确设置proxy，请检查clash配置';
  }

  private async setProxyCheck(name: string) {
    await this.setProxy(name);
    const proxies = await this.getProxies();
    if (proxies.now !== name) {
      throw '无法正确设置proxy，请检查clash配置';
    } else {
      console.log('代理节点切换为', name);
    }
  }

  private async wait(time = 10000) {
    return new Promise<void>(
      (resolve) =>
        setTimeout(() => resolve(), time)
    );
  }

  private portBind(name: string, port: number) {
    const server = net.createServer(async (clientSocket) => {
      try {
        if (this.nowProxy !== name) {
          await this.setProxyCheck(name);
        }
        const remoteSocket = net.connect(this.proxyPort, this.proxyHost);
        clientSocket.pipe(remoteSocket);
        remoteSocket.pipe(clientSocket);
        remoteSocket.on('error', (e) => {
          // console.log(e);
          try {
            clientSocket.end();
          } catch(e) {
            console.log(1, e);
          }
        });
      } catch (e) {
        console.log(2, e);
      }
    });
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    server.listen(port, () =>
      console.log(name, `socks5://127.0.0.1:${port}`, 'listening...')
    );
  }

  private async pollNowProxy() {
    try {
      const proxies = await this.getProxies();
      this.allProxys = proxies.all;
      if (proxies.now !== this.nowProxy) {
        this.nowProxy = proxies.now;
        console.log('当前代理节点为:', this.nowProxy);
      }
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => {
      this.pollNowProxy();
    }, 5000);
  }

  public async Start() {
    await this.pollNowProxy();
    this.allProxys.forEach(
      (name, index) =>
        this.portBind(name, this.basePort + index)
    );
  }
}

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  // 写入错误日志
  // 执行某些代码
});

process.on('unhandledRejection', function (reason, promise) {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // 写入错误日志
  // 执行某些代码
});
