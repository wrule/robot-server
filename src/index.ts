import koa from 'koa';
import robot from 'robotjs';
import { ClashHub } from './clashHub';

const cors = require('@koa/cors');

process.on('uncaughtException', (error, origin) => {
  console.log('uncaughtException');
  console.log(origin);
  console.log(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection');
  console.log(promise);
  console.log(reason);
});

function main() {
  const hub = new ClashHub();
  hub.Start();

  // const app = new koa();
  // app.use(cors()).use((ctx) => {
  //   try {
  //     const method = ctx.path.replace(/\//g, '');
  //     if (method in robot) {
  //       const args: any[] = Object.values(ctx.query)
  //         .map((arg) => isNaN(Number(arg)) ? arg : Number(arg));
  //       console.log(`robot.${method}(${args})`);
  //       ctx.body = {
  //         success: true,
  //         data: (robot as any)[method](...args) || undefined,
  //       };
  //     } else {
  //       ctx.body = {
  //         success: false,
  //       };
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     ctx.body = {
  //       success: false,
  //     };
  //   }
  // });
  // console.log('Server started at http://localhost:7195');
  // app.listen(7195);
}

main();
