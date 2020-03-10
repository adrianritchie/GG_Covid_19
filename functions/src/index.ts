import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

admin.initializeApp();

let results: any;
let lastGrabbed: any = null;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const refreshData = functions.https.onRequest((request, response) => {
    const url = 'https://www.gov.gg/coronavirus';

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
                if (lastGrabbed < new Date(o['Updated'])) {
                    admin.firestore().collection('tracking').add(o).catch(() => 'something went wrong');
                    response.send(o);
                    results = null;
                    lastGrabbed = new Date(o['Updated']);
                }
                else {
                    response.send('No change - quick check');
                }
            }
            else {

                admin.firestore()
                    .collection('tracking')
                    .orderBy('Updated', 'desc').limit(1).get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(documentSnapshot => {
                            lastGrabbed = new Date(documentSnapshot.get('Updated'));
                        });
                    }).then(() => {
                        if (lastGrabbed < new Date(o['Updated'])) {
                            admin.firestore().collection('tracking').add(o).catch(() => 'something went wrong');
                            response.send(o);
                            results = null;
                        }
                        else {
                            response.send('No change');
                        }
                    })
                    .catch(err => response.send(err));
            }
        });

    }).on("error", (err) => { console.log("Error: " + err.message); });


});

export const graphData = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', '*');

    if (!results || results.cacheUntil < moment()) {
        results = { cacheUntil: moment().add(30, 'm') };

        admin.firestore().collection('tracking').orderBy('Updated', 'desc').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                for (const key in data) {
                    if (!results.hasOwnProperty(key)) {
                        results[key] = [];
                    }
                    results[key].push(data[key]);
                }
            });
        }).then(() => {
            response.send(results);
        })
            .catch(err => response.send(err));
    }
    else {
        response.send(results);
    }
});

export const forceUpdate = functions.https.onRequest((request, response) => {
    results = null;
    response.send("Ok");
});