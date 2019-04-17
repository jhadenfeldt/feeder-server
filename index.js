const feeds = require('./feeds.json');

const Parser = require('rss-parser');
let parser = new Parser();

const dayjs = require('dayjs');

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const express = require('express');
const app = express();
const port = 3000;

function compare(a, b) {
	let comparison = 0;
	if (a.isoDate > b.isoDate) {
		comparison = -1;
	} else if (a.isoDate < b.isoDate) {
		comparison = 1;
	}
	return comparison;
}

app.get('/', async function (req, res) {
	const arr = await Promise.all([...feeds.map(async (currentFeed) => {
		let fullFeedContent = await parser.parseURL(currentFeed.feedUrl);

		let cleanedFeedContent = fullFeedContent.items.map((feedItem) => {
			return {
				title: feedItem.title,
				content: feedItem.content,
				isoDate: feedItem.isoDate,
				link: feedItem.link
			}
		});

		return cleanedFeedContent;
	})]);

	let returnArray = [];

	for (let el of arr) {
		returnArray.push(...el);
	}

	returnArray.sort(compare);

	res.send(returnArray);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
