import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import * as sgMail from '@sendgrid/mail';
// @ts-ignore
import * as chrono from 'chrono-node';


admin.initializeApp();
const db = admin.firestore();

const url = 'https://covid19.gov.gg/test-results';

const sg_api_key = functions.config().sendgrid.api;
const sg_update_id = functions.config().sendgrid.update;
sgMail.setApiKey(sg_api_key);

const graphDataUrl = 'https://europe-west2-gg-covid-19.cloudfunctions.net/graphData?clearResults=true';
const latestDataUrl = 'https://europe-west2-gg-covid-19.cloudfunctions.net/latestData?clearResults=true';
const aggregate_map = {
    'Awaiting results': 'awaiting_results',
    'Negative results': 'negative',
    'Number of deaths': 'deaths',
    'Number of samples tested': 'tested',
    'Positive results': 'positive'
};

const translate: any = {
    "Samples tested": "Number of samples tested",
    "No. of deaths": "Number of deaths",
    "Awaiting results": "Awaiting results",
    "Negative results": "Negative results",
    "Positive results": "Positive results",
    "Number recovered": "Number Recovered"
}
const sendNotifications = async function (data: any, nextPageToken?: string) {

    console.log(`sendNotifications: ${nextPageToken}`);

    const msg = {
        to: new Array<string>(),
        from: "ar@kodo.gg",
        templateId: sg_update_id,
        dynamic_template_data: data
    };

    // List batch of users, 1000 at a time.
    const userList = await admin.auth().listUsers(1000, nextPageToken);

    userList.users.forEach(userRecord => {
        if (userRecord.emailVerified && userRecord.email) {
            msg.to.push(userRecord.email);
            //msg.to.push('ar@kodo.gg');
        }
    });

    console.log(msg);

    try {
        sgMail.sendMultiple(msg).catch(err => console.log('error from sendGrid', err));
    }
    catch (err) {
        console.log('exception from try sendgrid', err);
    }

    if (userList.pageToken) {
        // List next batch of users.
        await sendNotifications(data, userList.pageToken);
    }
}

const storeUpdate = async function (data: any, done: (value: any) => void) {
    const existing = await db.collection('tracking').orderBy('Saved', 'desc').limit(1).get();
    const lastUpdate = new Date(existing.docs[0].data().Updated);

    if (new Date(lastUpdate) < new Date(data['Updated'])) {
        try {
            db.collection('tracking').add(data).catch((err) => { console.log("Error: " + err.message); });
        }
        catch (err) {
            console.log('Error with saving to db: ', err);
        }

        try {
            sendNotifications(data).catch(err => console.log(err));
        }
        catch (err) {
            console.log("Caught error: ", err);
        }

        https.get(graphDataUrl, (resp) => {
            resp.on('data', (chunk) => console.log(chunk));
            resp.on('end', () => console.log('Graph data cleared'));
        }).on("error", (err) => { console.log("Error: " + err.message); });

        https.get(latestDataUrl, (resp) => {
            resp.on('data', (chunk) => console.log(chunk));
            resp.on('end', () => console.log('Latest data cleared'));
        }).on("error", (err) => { console.log("Error: " + err.message); });

        done(data);
    }
    else {
        done('No change');
    }
}

const scrapeData = function (source: string) {
    const $ = cheerio.load(source);
    const date_updated = $('div.ace-paragraph-notice-information').text();
    const table = $('div.ace-paragraph-data-infographic').first();

    const o: any = {};

    table.find('.ace-paragraph-data').map(function (i, el) {
        const label = $('.ace-field-type', this).text().trim();
        const value = $('.ace-field-value', this).text().trim();
        o[translate[label]] = parseInt(value);
    });

    o["Updated"] = chrono.parseDate(date_updated).toISOString();
    o["Saved"] = new Date().toISOString();

    return o;
}

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const refreshData = functions.region('europe-west2').https.onRequest((request, response) => {
    const req = https.get(url, (resp) => {
        let source: string = '';
        resp.on('data', (chunk) => { source += chunk; });
        resp.on('end', () => {
            const data = scrapeData(source);

            storeUpdate(data, (result) => response.send(result))
                .then(() => console.log('store complete'))
                .catch(err => {
                    console.log('problem calling storeUpdate', err);
                    response.send(`storeUpdate error ${err}`);
                });
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        response.send(`Error: ${err}`);
    });
});

export const updateData = functions.region('europe-west2').pubsub.schedule('*/15 * * * *').timeZone('europe/london').onRun((context) => {
    const req = https.get(url, (resp) => {
        let source: string = '';
        resp.on('data', (chunk) => { source += chunk; });
        resp.on('end', () => {

            const data = scrapeData(source);

            storeUpdate(data, (result) => console.log(result))
                .then(() => console.log('store complete'))
                .catch(err => console.log('problem calling storeUpdate', err));
        });
    }).on("error", (err) => { console.log("Error: " + err.message); });

    return null;
});

export const graphData = functions.region('europe-west2').runWith({ memory: '512MB' }).https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');

    if (!!request.query.clearResults) {
        results = null;
        response.send('Graph data cleared');
        return;
    }

    const exclude = ['Awaiting Testing'];

    if (!results || results.cacheUntil < moment()) {
        results = { cacheUntil: moment().add(30, 'm') };

        db.collection('tracking').orderBy('Updated', 'desc').get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    for (const key in data) {
                        if (exclude.indexOf(key) !== -1) {
                            continue;
                        }
                        if (!results.hasOwnProperty(key)) {
                            results[key] = [];
                        }
                        results[key].push(data[key]);
                    }
                });
            })
            .then(() => {
                response.send(results);
            })
            .catch(err => response.send(err));
    }
    else {
        response.send(results);
    }
});

export const latestData = functions.region('europe-west2').https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');

    if (!!request.query.clearResults) {
        results = null;
        response.send('latest data cleared');
        return;
    }

    if (!latest || latest?.cacheUntil < moment()) {
        db.collection('tracking')
            .orderBy('Updated', 'desc').limit(1).get()
            .then(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                    const data = documentSnapshot.data();
                    latest = {};
                    for (const key in data) {
                        latest[key] = data[key];
                    }
                    latest['cacheUntil'] = moment().add(30, 'm');
                });
            })
            .then(() => {
                response.send(latest);
            })
            .catch(err => response.send(err));
    }
    else {
        response.send(latest);
    }
});