import koa from 'koa';
import robot from 'robotjs';

function main() {
  const app = new koa();
  app.use((ctx) => {
    try {
      const method = ctx.path.replace(/\//g, '');
      if (method in robot) {
        const args: any[] = Object.values(ctx.query)
          .map((arg) => isNaN(Number(arg)) ? arg : Number(arg));
        console.log(`robot.${method}(${args})`);
        ctx.body = {
          success: true,
          data: (robot as any)[method](...args) || undefined,
        };
      } else {
        ctx.body = {
          success: false,
        };
      }
    } catch (e) {
      console.log(e);
      ctx.body = {
        success: false,
      };
    }
  });
  console.log('Server started at http://localhost:7195');
  app.listen(7195);
}

main();
