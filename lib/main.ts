import * as Bluebird from "bluebird";
import * as createHandler from "github-webhook-handler";
import { handler } from "github-webhook-handler";
import * as http from "http";
import { env, exit } from "process";
import * as request from "request-promise";

// I hate mixing and matching but this has no types
// I don't have time to track them down ATM
const github = require("octonode");

// Init the token; if it DNE throw and die
let GITHUB_TOKEN: string;
if (env.HOOK_TOKEN) {
    GITHUB_TOKEN = env.HOOK_TOKEN;
} else {
    console.error("No GitHub token found in HOOK_TOKEN");
    exit(1);
}

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

/**
 * This checks the reachability of passed-in URLs and returns a promise array
 * of the results
 * @param urls {string[]} Array of URLs to check
 * @return {Bluebird<string[]>} A string array of results in the form
 *     "url: (not |)found"
 */
function checkUrls(urls: string[]): Bluebird<string[]> {
    let status: boolean = false;
    return Bluebird.map(urls, (urlToCheck) => {
        return new Bluebird((resolve, reject) => {
            return request
                .get({ url: urlToCheck })
                .then((result: any) => {
                    console.log(`${urlToCheck} success`);
                    return resolve(true);
                })
                .catch((error: any) => {
                    console.log(`${urlToCheck} failed`);
                    return resolve(false);
                })
        })
            .then((result) => {
                console.log(`${urlToCheck} ${result}`);
                return `\`${urlToCheck}\`: ${!result ? 'not ' : ''}found`;
            });
    });
}

/**
 * Formats the comment for the PR
 *
 * @param urlStatuses {string[]} An array of URLs and their reachability
 * @return {string} the formatted comment
 */
function formatComment(urlStatuses: string[]): string {
    return `\
The following URLs were parsed in the body. \`found\` indicates it was reachable\
; \`not found\` indicates a \`GET\` request on the URL failed.

* ${urlStatuses.join("* \n")}\
`
}

function connectAndComment(comment: string): any {
    const client = (github as any).client(GITHUB_TOKEN);
    return new Bluebird((resolve, reject) => {
        return client.get('/user', {}, (err: any, status: any, body: any, headers: any) => {
            return resolve(body);
        });
    }).then((body: any) => {
        console.log(body);
    })
}

/**
 * Formats a URI for GitHub PR Comments
 *
 * @param owner {string} The repo owner
 * @param repo {string} The repo name
 * @param prNumber {number} The PR number
 * @return {string} the full URI
 * @see https://developer.github.com/v3/pulls/comments/
 */
function formatPrCommentUri(owner: string, repo: string, prNumber: number): string {
    return `/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
}

const eventHandler: handler = (createHandler as any)({
    path: "/webhook",
    secret: "myhashsecret",
});

eventHandler.on(
    "pull_request",
    (event: any) => {
        console.log("Received a PR event for %s to %s",
            event.payload.repository.name,
            event.payload.ref,
        )
        let prNumber: number = event.payload.pull_request.number;
        let prOwner: string = event.payload.pull_request.user.login;
        let prRepo: string = event.payload.pull_request.head.repo.name;
        console.log(event.payload.pull_request.body);
        console.dir(event.payload.pull_request);
        exit(0);
        let urls: string[] = findUrlsInPrBody(event.payload.pull_request.body);
        if (urls) {
            checkUrls(urls)
                .then((results) => {
                    return Bluebird.resolve(formatComment(results))
                })
                .then((comment: string) => {
                    return connectAndComment(comment);
                });
        }
    },
);

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


