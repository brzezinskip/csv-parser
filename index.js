const Hapi = require("hapi");
const routes = require("./src/routes/post_file");


const server = new Hapi.Server();
server.connection({ port: 3000, host: "localhost" });

server.register(require('inert'), (err) => {
    if (err) throw err;

    server.route({
        method: 'GET',
        path: '/styles/{assetpath*}',
        handler: {
            directory: {
                path: './public/'
            }
        }
    })

    server.route({
        method: 'GET',
        path: '/hello',
        handler: (req, reply) => reply.file('./public/index.html')
    });
});

server.route(routes.postFile);

server
    .start()
    .then(() => console.log(`Server is running at ${server.info.uri}`))
    .catch(err => { throw err });