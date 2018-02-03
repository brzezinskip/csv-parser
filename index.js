const fs = require("fs");
const Hapi = require("hapi");
const XLSX = require("xlsx");
const upload = require("./src/utils/upload");
const UPLOAD_PATH = 'uploads';
const fileOptions = { dest: `${UPLOAD_PATH}/`, fileFilter: upload.sheetFilter };
const server = new Hapi.Server();

if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH);
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
        path: '/',
        handler: (req, reply) => reply.file('./public/index.html')
    });
});

server.route({
    method: "POST",
    path: "/upload",
    config: {
        payload: {
            output: "stream",
            allow: "multipart/form-data"
        }
    },
    handler: async (request, reply) => {
        try {
            const data = request.payload;
            const { name, days, hours, sheet } = request.payload;

            const fileDetails = await upload.uploader(sheet, fileOptions);
            const wb = XLSX.readFile(fileDetails.path, {type: "buffer"});
            const stream = fs.createWriteStream("uploads/test.csv");
            stream.once("open", () => {
                wb.SheetNames.forEach((sheetName) =>{
                    var csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
                    if(csv.length > 0){
                        stream.write(csv);
                    }
                });
                stream.end();
                reply("OK");
            });
            
        } catch (err) {
            reply(err.message);
        }
    }
});

server
    .start()
    .then(() => console.log(`Server is running at ${server.info.uri}`))
    .catch(err => { throw err });