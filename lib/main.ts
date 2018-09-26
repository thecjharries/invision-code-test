import * as http from "http";
import * as createHandler from "github-webhook-handler";
import { handler } from "github-webhook-handler";

const eventHandler: handler = (createHandler as any)({
    path: "/webhook",
    secret: "myhashsecret",
});

eventHandler.on("pull_request", function(event: any) {
    console.log("Received a PR event for %s to %s",
        event.payload.repository.name,
        event.payload.ref)
});

eventHandler.on("push", function(event: any) {
    console.log("Received a push event for %s to %s",
        event.payload.repository.name,
        event.payload.ref)
});

eventHandler.on("error", function(err: any) {
    console.error("Error:", err.message)
});

eventHandler.on("issues", function(event: any) {
    console.log("Received an issue event for %s action=%s: #%d %s",
        event.payload.repository.name,
        event.payload.action,

        event.payload.issue.number,
        event.payload.issue.title)
});

http.createServer(function(req: any, res: any) {
    eventHandler(req, res, function(err: any) {
        console.log(err)
        res.statusCode = 404;
        console.log("entered");
        res.end("no such location");
    })
}).listen(7777);


