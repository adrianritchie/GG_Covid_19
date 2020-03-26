import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

admin.initializeApp();
const db = admin.firestore();

const url = 'https://www.gov.gg/covid19testresults';

let results: any;
let lastGrabbed: any = null;

let latest: any;

const storeUpdate = function (data: any, type: string) {
    if (lastGrabbed < new Date(data['Updated'])) {

        if (!!results) {
            results.cacheUntil = moment().add(30, 'm');

            for (const key in data) {
                if (!results.hasOwnProperty(key)) {
                    results[key] = [];
                }
                results[key].push(data[key]);
            }
        }

        db.collection('tracking').add(data).catch((err) => { console.log("Error: " + err.message); });
        db.collection('web_hooks').limit(1).get()
            .then(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                    for (const webHook of documentSnapshot.get('urls')) {
                        console.log("Webhook url: " + webHook);
                        https.get(webHook);
                    }
                });
            })
            .catch((err) => { console.log("Error: " + err.message); });

        lastGrabbed = new Date(data['Updated']);
        return data;
    }
    else {
        return `No change - ${type}`;
    }
}

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const refreshData = functions.region('europe-west2').https.onRequest((request, response) => {
    const req = https.get(url, (resp) => {
        let data: string = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            const $ = cheerio.load(data);
            const date_updated = $('meta[name="DC.date.modified"]').attr('content');
            const table = $('table').first();

            const scraped_data: Array<Array<string>> = [];

            table.find('tr').map(function (i, el) {
                scraped_data.push([]);
                return $(this).find('td').map(function (j, fl) {
                    scraped_data[i].push($(this).text())
                })
            });

            const o: any = {};
            for (let i = 0; i < scraped_data[0].length; i++) {
                o[scraped_data[0][i]] = parseInt(scraped_data[1][i]);
            }
            o["Updated"] = date_updated;
            o["Saved"] = new Date().toISOString();

            if (!!lastGrabbed) {
                const result = storeUpdate(o, 'quick check')
                response.send(result);
            }
            else {
                db.collection('tracking')
                    .orderBy('Updated', 'desc').limit(1).get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(documentSnapshot => {
                            lastGrabbed = new Date(documentSnapshot.get('Updated'));
                        });
                    })
                    .then(() => {
                        const result = storeUpdate(o, 'reload check')
                        response.send(result);
                    })
                    .catch(err => response.send(err));
            }
        });

    }).on("error", (err) => { console.log("Error: " + err.message); });


});


export const updateData = functions.region('europe-west2').pubsub.schedule('every 15 minutes').timeZone('europe/london').onRun((context) => {

    const req = https.get(url, (resp) => {
        let data: string = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
            const $ = cheerio.load(data);
            const date_updated = $('meta[name="DC.date.modified"]').attr('content');
            const table = $('table').first();

            const scraped_data: Array<Array<string>> = [];

            table.find('tr').map(function (i, el) {
                scraped_data.push([]);
                return $(this).find('td').map(function (j, fl) {
                    scraped_data[i].push($(this).text())
                })
            });

            const o: any = {};

            for (let i = 0; i < scraped_data[0].length; i++) {
                o[scraped_data[0][i]] = parseInt(scraped_data[1][i]);
            }
            o["Updated"] = date_updated;
            o["Saved"] = new Date().toISOString();

            if (!!lastGrabbed) {
                const result = storeUpdate(o, 'quick check')
                console.log(result);
            }
            else {
                db.collection('tracking')
                    .orderBy('Updated', 'desc').limit(1).get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(documentSnapshot => {
                            lastGrabbed = new Date(documentSnapshot.get('Updated'));
                        });
                    })
                    .then(() => {
                        const result = storeUpdate(o, 'reload check')
                        console.log(result);
                    })
                    .catch(err => console.log("Error: " + err.message));
            }
        });

    }).on("error", (err) => { console.log("Error: " + err.message); });

});

export const graphData = functions.region('europe-west2').https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');

    if (!!request.query.clearResults) {
        results = null;
    }

    if (!results || results.cacheUntil < moment()) {
        results = { cacheUntil: moment().add(30, 'm') };

        db.collection('tracking').orderBy('Updated', 'desc').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                for (const key in data) {
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
        latest = null;
    }

    if (!latest || latest.cacheUntil < moment()) {
        db.collection('tracking')
        .orderBy('Updated', 'desc').limit(1).get()
        .then(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                latest = documentSnapshot.data();
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
 