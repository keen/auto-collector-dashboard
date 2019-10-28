# Keen Auto-Collector Dashboard

[Live Demo](https://keen.github.io/auto-collector-dashboard/)

An instant analytics dashboard for Keen projects using the web [Auto-Collector](https://keen.io/docs/streams/web-auto-collection/?s=gh_ac_dash).

This dashboard comes pre-populated with charts based on the standard event data model used by the web [Auto-Collector](https://keen.io/docs/streams/web-auto-collection/?s=gh_ac_dash).

You can clone the project to make it your own in Glitch with your own Keen data here:

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/keen-auto-collector-dashboard-1) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/keen/auto-collector-dashboard)

## Getting Started

To get started, you need:
- A Keen account. [Talk to our team](https://try.keen.io/contact) to get started today.
- A Keen project with data streaming to it from the [Auto-Collector](https://keen.io/docs/streams/web-auto-collection/?s=gh_ac_dash)

If you don’t already have Auto-Collector installed, drop in [this snippet](https://keen.io/docs/streams/web-auto-collection/) with your `PROJECT_ID` and `WRITE_KEY` into your website’s `<head>` code and start seeing web events flow in within seconds.

Once you have these two things, you can clone (or "remix") the code in [Glitch](https://glitch.com/edit/#!/remix/keen-auto-collector-dashboard-1) or locally by git cloning this repo.

Next, you need to replace the example `projectId` and `readKey` in the `/js/charts.js` file with those for your project.

## Running the Application

If you are **running the project within Glitch**, click the "Show Live" button.

If you are **running the project locally** and have the files downloaded or git cloned, open the index.html file in a browser.

Your dashboard should now render in your browser!

## Going Forward

The cool thing about the Auto-Collector is that it is just a start.

Since you don’t have to think about what your data model is, it’s a great starting point to hit the ground running quickly. You can always customize and enrich your data and your data views later alongside the event data models from the Auto-Collector.

If you want to track custom events beyond pageviews, clicks, and form submissions, you can easily access our core Javascript tracking library (which this SDK uses under the hood). See more [here](https://keen.io/docs/streams/web-auto-collection/?s=gh_ac_dash).

For example: You could have a graph of `signup` or `login` events that are custom to your application. Other example actions you could track with Keen are: purchases, powerups, upgrades, errors, swipes, favorites, impressions, etc.

If you want to think more about event data, check out this [blog post](https://blog.keen.io/analytics-for-hackers-how-to-think-about-event-data-cabeefe1f3d9?source=gh_ac_dash).

## Contributions Welcome

This is an open source project, and we love involvement from the community! If you are interested in getting involved, please see the [CONTRIBUTING.md](CONTRIBUTING) file.

## Need Help?

Send us an email at [team@keen.io](mailto:team@keen.io) or join our [Community Slack](http://slack.keen.io/) to share bugs, issues, or suggestions!
