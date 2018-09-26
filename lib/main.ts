import * as http from "http";
import * as createHandler from "github-webhook-handler";
import { handler } from "github-webhook-handler";

// Lovingly copied from https://stackoverflow.com/a/6041965/2877698
// with minor edits
// TS/JS doesn't have verbose PCRE to clean this up w/whitespace
const URL_REGEX = /(?:http|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;

/**
 * This parses URLs in the PR desc
 *
 * @param prBody {string} the PR body
 * @return {string[]} the found URLs
 */
function findUrlsInPrBody(prBody: string): string[] {
    console.log("Searching description for URLs");
    let foundUrls: string[] = [];
    // Use any b/c RegExpExecArray is messing with types ATM
    let match: any;
    do {
        match = URL_REGEX.exec(prBody);
        if (match) {
            foundUrls.push(match[0]);
        }
    } while (match);
    return foundUrls;
}

const eventHandler: handler = (createHandler as any)({
    path: "/webhook",
    secret: "myhashsecret",
});

eventHandler.on("pull_request", (event: any) => {
    console.log("Received a PR event for %s to %s",
        event.payload.repository.name,
        event.payload.ref)
    console.log(event.payload.pull_request.body);
    let urls: string[] = findUrlsInPrBody(event.payload.pull_request.body);
    console.log(urls);
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


