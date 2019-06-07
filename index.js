const feeds = require('./feeds.json');

const Parser = require('rss-parser');
let parser = new Parser();

const dayjs = require('dayjs');

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const express = require('express');
const app = express();
const port = 8000;

let expressWs = require('express-ws')(app);
let latestFeed = [];

function compare(a, b) {
	let comparison = 0;
	if (a.isoDate > b.isoDate) {
		comparison = -1;
	} else if (a.isoDate < b.isoDate) {
		comparison = 1;
	}
	return comparison;
}

getSingleFeeds();
setTimeout(() => {
	getSingleFeeds();
}, 10000);

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.ws('/api', function (ws, req) {
	ws.send(JSON.stringify(latestFeed));

	setInterval(function() {
		ws.send(JSON.stringify(latestFeed));
	}, 2 * 60 * 1000);
});

async function getSingleFeeds() {
	const arr = await Promise.all([...feeds.map(async (currentFeed) => {
		let fullFeedContent = await parser.parseURL(currentFeed.feedUrl);

		let cleanedFeedContent = fullFeedContent.items.map((feedItem) => {
			return {
				title: feedItem.title,
				content: feedItem.content,
				isoDate: feedItem.isoDate,
				link: feedItem.link,
				pageName: currentFeed.pageName,
				gradient: currentFeed.gradient,
				hasImage: currentFeed.hasImage,
				fitImage: currentFeed.fitImage
			}
		});

		return cleanedFeedContent;
	})]);

	let returnArray = [];

	for (let el of arr) {
		returnArray.push(...el);
	}

	returnArray.sort(compare);
	latestFeed = returnArray;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
