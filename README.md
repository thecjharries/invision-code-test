# `invision-code-test`

Repo containing code for InVision's code test.

## Installing

DL the repo first via your method of choice.

```
$ cd <repo location>
$ yarn install
```

`npm` is fine too but the author prefers `yarn` for pretentious reasons.

## Running

To launch,

```
$ npm run hook
# or
$ ts-node lib/main.ts
```

[`ngrok`](https://ngrok.com/) was used to test locally. You'll need to launch the service via

```
$ ngrok http 7777
```

You'll then need to pull out the URL and set your webhook url to

```
<url from ngrok>/webhook
```

The forward slash is, unsurprisingly, important.

## Plan

* Figure out method of attack - done 1446
* Understand webhooks (never built my own webhook app but used many) - 1320
* Set up server ot handle webhooks - 1434
* Parse URLs from desc - 1510
* Check URL viability - 1537
* Write comment - 1543
* Understand bot comments on GitHub (literally never touched in my life other than some reddit commenting bots research in Python years ago)
* Figure out bot code and setup
* Post comment
* Comment everything possible
* Test

## Dev Log

* 1434: Wasted 45 minutes trying to figure out why the server wasn't working period (first in TS then in vanilla JS); I forgot a `/`. That's what I get for trying to rewrite instead of just using copypasta.
* 1443: Pulling regex for URLs from https://stackoverflow.com/a/6041965/2877698; may or may not work.
