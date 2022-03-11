//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const schedule = require('node-schedule');
const fetch = require('node-fetch')
const https = require("https");
const fs = require('fs');

const urlExoApi = "https://api.exoclick.com/v2"
const urlLogin = "/login";
const urlIVR = "https://www.trafficcompany.com/feed/ivr-carrier-performance?access-token=49ae894764953577d4e76e2ef6ffecec";

const api_token = "cb4fdaac26497b9060b3de4239976805a96f80fc";
const arrConfig = require('./ivr_config.json');

const activityLog = "./activity.log";

 
const app = express();

var j = schedule.scheduleJob('*/15 * * * *', async () => {
  var date = new Date();
  writeLog('\n\n*** Running the check at: ' + date.toISOString() + " ***");
  let  ret = await fProcessEXO();
  // writeLog("\n--- Summary: ", ret);
  writeLog('\n*** Waiting... ***');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// console.log(arrConfig[0]);

function writeLog(text, text2=null) {
  console.log(text);
  fs.appendFileSync(activityLog, text);

  if(text2) {
    console.log(text2);
    fs.appendFileSync(activityLog, text2);
  }
}

async function getEXOToken() {
  try {

    const result = await fetch(urlExoApi + urlLogin, {
      method: 'POST',
      body: JSON.stringify({ api_token }),
      headers: {'Content-Type': 'application/json'}
    });

    let json = await result.json();

    // writeLog("Successfully logged in... token retrieved.");
    return json.token;

  } catch(err) {
      writeLog("Error logging in...: " + err.message)
      return null;
    }
}

async function processEXO(req, res) {

  let ret = await fProcessEXO();
  writeLog(ret);
  res.send(ret)
}

async function fProcessEXO() {

  try {

    const arrAllC = [];
    arrConfig.map(config => arrAllC.push(config.campaign_id));

    await pauseCampaign(arrAllC);

    writeLog("\n--- Zjistuju dobre kampane.... Vyhovuje:");
  
    const result = await fetch(urlIVR, { method: 'GET' });

    arrIVR = await result.json();

    let iCountIVR = 0;
    let iCountMatch = 0;
    let iCountWin = 0;

    arrCPlay = [];

    arrIVR.forEach(itm => {
      if(itm.carrier_name!=null) {

        ivr = arrConfig.find(config => config.carrier_id === itm.carrier_id);

        if(ivr) {
          iCountMatch++;

          if(itm.ecpm_recent>ivr.ecpm_level) {
            arrCPlay.push(ivr.campaign_id);
            writeLog(" - " + itm.country_name);
            iCountWin++;
          }
        }

        iCountIVR++;
      }
    });

    if(iCountWin>0) await playCampaign(arrCPlay);

    return {success: true, 
      countChecked: arrIVR.length, 
      countNotNull: iCountIVR, 
      countMatched: iCountMatch,
      countWin: iCountWin,
      campaign_ids: arrCPlay
    };

  } catch(err) {
    writeLog("Error: ", err);
    return {success: false, message: err.message};
  }

}

async function playCampaign(arrCampaigns, req = null, res = null) {

  writeLog(`\n--- Spoustim (${arrCampaigns.length}): `, JSON.stringify(arrCampaigns));

  var loginToken = await getEXOToken();

  try {

    const result = await fetch(urlExoApi + "/campaigns/play", {
      method: 'PUT',
      body: JSON.stringify({"campaign_ids": arrCampaigns}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + loginToken
      }
    });

    json = await result.json();

    if(res) res.send(json); else {
      writeLog("... Vysledek: " + json.message);
    }

  } catch(err) { 
    if(res) res.send(err); else writeLog("Error: ", err);
  }

}

async function pauseCampaign(arrCampaings, req = null, res = null) {

  if(arrCampaings.length==0) arrConfig.map(config => arrCampaings.push(config.campaign_id));
  
  writeLog(`\n--- Zastavuji kampane (${arrCampaings.length})....`);
  
  var loginToken = await getEXOToken();

  try {

    const result = await fetch(urlExoApi + "/campaigns/pause", {
      method: 'PUT',
      body: JSON.stringify({"campaign_ids": arrCampaings}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + loginToken
      }
    });

    json = await result.json();
    if(res) res.send(json); else writeLog("... Vysledek: " + json.message);

  } catch(err) { 
    if(res) res.send(err); else writeLog("Error: ", err);
  }

}

app.get("/processexo", (req, res) => {

  processEXO(req, res);

});

app.get("/playcamp", (req, res, next) => {

  playCampaign([3732585, 3732583], req, res, next);

});

app.get("/pausecamp", (req, res) => {

  pauseCampaign([3732585, 3732583], req, res);

});

app.get("/pausecampall", (req, res) => {

  pauseCampaign([], req, res);

});

// APP MANAGEMENT
const port = 5000;

app.listen(port, () =>
  console.log(`Backend Server started on port ${port} ...`)
);
