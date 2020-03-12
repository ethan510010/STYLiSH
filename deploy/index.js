const http = require('http');
const createHandler = require('github-webhook-handler');

const handler = createHandler({ path: '/', secret: 'root' });
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
// 上面的 secret 保持和 GitHub 后台设置的一致
// function run_cmd(cmd, args, callback) {
//   var spawn = require('child_process').spawn;
//   var child = spawn(cmd, args);
//   var resp = "";
//   console.log("HiHi")
//   child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
//   child.stdout.on('end', function () { callback(resp) });
// }
http.createServer((req, res) => {
  handler(req, res, (err) => {
    res.statusCode = 404;
    res.end('no such location');
  });
}).listen(7777);
handler.on('error', (err) => {
  console.error('Error:', err.message);
});
handler.on('push', async (event) => {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  const branchName = event.payload.ref.replace('refs/heads/', '');
  console.log(await exec('echo "start pulling data"'));
  const checkoutResult = await exec(`git checkout ${branchName}`);
  console.log('git checkout的結果', checkoutResult);
  const pullResult = await exec(`git pull origin ${branchName}`);
  console.log('git pull的結果', checkoutResult);
  const restartPm2Result = await exec('pm2 restart stylish');
  console.log('pm2 重啟stylish結果', restartPm2Result);
});
