import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import * as sgMail from '@sendgrid/mail';


admin.initializeApp();
const db = admin.firestore();

const url = 'https://www.gov.gg/covid19testresults';
const sg_api_key = functions.config().sendgrid.api;
const sg_update_id = functions.config().sendgrid.update;
sgMail.setApiKey(sg_api_key);

let results: any;
let lastGrabbed: any = null;

let latest: any;

const sendNotifications = async function (data: any, nextPageToken?: string) {
    
    console.log("sendNotifications");

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
        }
    });

    await sgMail.sendMultiple(msg);

    if (userList.pageToken) {
        // List next batch of users.
        await sendNotifications(data, userList.pageToken);
    }
}

const storeUpdate = function (data: any, type: string) {
    if (lastGrabbed < new Date(data['Updated'])) {

        db.collection('tracking').add(data).catch((err) => { console.log("Error: " + err.message); });

        if (!!results) {
            results.cacheUntil = moment().add(30, 'm');

            for (const key in data) {
                if (!results.hasOwnProperty(key)) {
                    results[key] = [];
                }
                results[key].push(data[key]);
            }
        }

        latest = {};
        for (const key in data) {
            latest[key].push(data[key]);
        }
        latest['cacheUntil'] = moment().add(30, 'm');


        sendNotifications(data).catch(err => console.log(err));
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

export const updateData = functions.region('europe-west2').pubsub.schedule('*/15 * * * *').timeZone('europe/london').onRun((context) => {

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

export const graphData = functions.region('europe-west2').runWith({ memory: '512MB'}).https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');

    if (!!request.query.clearResults) {
        results = null;
        // response.send('Graph data cleared');
        // return;
    }

    const exclude = ['Awaiting Testing'];

    if (!results || results.cacheUntil < moment()) {
        results = { cacheUntil: moment().add(30, 'm') };

        db.collection('tracking').orderBy('Updated', 'desc').limit(100).get()
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

    if (!latest || latest?.cacheUntil < moment() || !!request.query.clearResults) {
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
