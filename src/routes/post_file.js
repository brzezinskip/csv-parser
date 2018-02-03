const postFile = {
    method: "GET",
    path: "/",
    handler: (request, reply) => reply("Hello world")
};

exports.postFile = postFile;