const http = require("http");
const config = require("./src/config");
const app = require("./src/app");
const createSocketServer = require("./src/sockets");
const Story = require("./src/models/Story");

const server = http.createServer(app);
createSocketServer(server);

// Los estados caducan a las 24 h
const purgeStories = () => Story.purgeExpired();
purgeStories();
setInterval(purgeStories, 10 * 60 * 1000).unref();

server.listen(config.port, () => {
  console.log(`Yabla escuchando en http://localhost:${config.port}`);
});
