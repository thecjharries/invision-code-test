import * as http from "http";
import * as createHandler from "github-webhook-handler";
import { handler } from "github-webhook-handler";

// function

const eventHandler: handler = (createHandler as any)({
    path: "/webhook",
    secret: "myhashsecret",
});

eventHandler.on("pull_request", (event: any) => {
    console.log("Received a PR event for %s to %s",
        event.payload.repository.name,
        event.payload.ref)
    console.log(event.payload.pull_request.body);
});

eventHandler.on("error", (err: any) => {
    console.error("Error:", err.message)
});

http.createServer((req: any, res: any) => {
    eventHandler(req, res, (err: any) => {
        console.log(err)
        res.statusCode = 404;
        console.log("entered");
        res.end("no such location");
    })
}).listen(7777);


