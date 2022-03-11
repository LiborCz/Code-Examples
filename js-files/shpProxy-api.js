//jshint esversion:6
const fs = require('fs');
const path = require('path');
const util = require('util');
const request = require('request');
const spAuth = require('node-sp-auth');
const requestProm = require('request-promise');

const config = require("../config");

const readFileProm = util.promisify(fs.readFile);

var creds = { username: process.env.SHP_USER, password: process.env.SHP_PWD };
var spRequest = require('sp-request').create(creds);

const urlSPSite = `http://sharepoint/${config.smlVerze}`;
const urlSPSiteAPI = urlSPSite + "/_api/web";

const fileErrorLog = "C:\\temp\\ShpProxy_Errors.txt";

function showConsoleHeading(text) {
  dashCnt = Math.ceil((40 - text.length));
  if(dashCnt<0) dashes=0;
  console.log(".".repeat(34) + text + " " + "-".repeat(dashCnt));
} 

function spDecodeErrMsg(errParam) {

  try {

    if(typeof errParam.error==="object") errObj = errParam.error;
    else errObj = JSON.parse(errParam.error);
  
    errMsg = errObj.error.message.value;
  }
  catch(err) {

    errMsg = "Uknown System Error - please contact Admin (Error logged in console)";

    console.log("Error - spDecodeError: ");
    console.log(errParam.message);

  }

  return errMsg;

}

function logError(errText) {
  console.log(errText);
  fs.appendFileSync(fileErrorLog, new Date().toISOString() + " - " + errText + "\n");
}

//  SP API calls - functions

const spCreateList = async function(listName, listDescription = "") {

  //OK

  showConsoleHeading("CREATE LIST REQUEST");

  url = urlSPSiteAPI + '/lists';

  try {

    digest = await spRequest.requestDigest(urlSPSite);

    result = await spRequest.post(url, { headers: { 'X-RequestDigest': digest },
      body: {
        '__metadata': { 'type': 'SP.List' },
        'BaseTemplate': 100,
        'AllowContentTypes': true,
        'ContentTypesEnabled': false,
        'Description': listDescription,
        'Title': listName
        }
    });

    return {success: true, data: `List ${listName} was successfully created!!!`};

  }
  catch(err) {

    return {success: false, error: spDecodeErrMsg(err)};

  }
}

const spAddListItem = async function(listName, fldObj, value="") {

  // This function has a little specific params...
  // either it takes a single string values fld-value - or ...
  // ... it takes object with multiple key-value properties ...

  // OK

  showConsoleHeading(`ADD LIST ITEM (${listName})`);

  listName = listName.charAt(0).toUpperCase() + listName.slice(1);

  url = urlSPSiteAPI + encodeURI("/lists/getbytitle('" + listName + "')/items");

  body = { '__metadata': { type: `SP.Data.${listName}ListItem` } };

  if(typeof(fldObj)==='object') {

    for (const [key, val] of Object.entries(fldObj)) { body = { ...body, [`${key}`]: val } }

  } else body = { ...body, [`${fldObj}`]: value };

  return new Promise(async (resolve, reject) => {

    digest = await spRequest.requestDigest(urlSPSite);

    spRequest.post(url, { headers: { 'X-RequestDigest': digest}, body })

    .then(response => {
      resolve({ success: true, message: "List item was added !!", data:response.body.d });
    })

    .catch(err => {
        logError("spAddListItem - Error back from Sharepoint API: " + spDecodeErrMsg(err));
        reject({ success: false, message: spDecodeErrMsg(err) });
    });

  });

}

const spUpdateListItem_Single = async function (listName, item_id, field, value) {

  // OK - returns a promise !!

  showConsoleHeading(`UPDATE LIST ITEM (${listName})`);

  url = urlSPSiteAPI + encodeURI(`/lists/getbytitle('${listName}')/items(${item_id})`);

  body = { '__metadata': { type: `SP.Data.${listName}ListItem` }, [`${field}`]: value };

  return new Promise((resolve, reject) => {    
  
    spRequest.requestDigest(urlSPSite)
    .then(digest => {

      spRequest.post(url, {
        headers: { 'X-RequestDigest': digest, 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' },
        body
      })
      .then(result => {
        resolve({ success: true, message: "List item was updated!!" });
      }, err => {
        logError("spUpdateListItem - Error back from Sharepoint API: " + spDecodeErrMsg(err));
        reject({ success:false, message: spDecodeErrMsg(err) });
        }
      );
    })

    .catch(err => {
      logError("spUpdateListItem - Error retrieving the Sharepoint Digest string...: " + err.message);
      reject({ success:false, message: "Error retrieving the Sharepoint Digest string..." });
    });

  });

}

const spUpdateListItem = async function (listName, item_id, fldObj, value="") {

  // OK - returns a promise !!

  // This function has a little specific params...
  // either it takes a single string values fld-value - or ...
  // ... it takes object with multiple key-value properties ...

  showConsoleHeading(`UPDATE LIST ITEM (${listName})`);
  
  listName = listName.charAt(0).toUpperCase() + listName.slice(1);

  url = urlSPSiteAPI + encodeURI(`/lists/getbytitle('${listName}')/items(${item_id})`);

  body = { '__metadata': { type: `SP.Data.${listName}ListItem` } };

  if(typeof(fldObj)==='object') {

    for (const [key, val] of Object.entries(fldObj)) { body = { ...body, [`${key}`]: val } }

  } else body = { ...body, [`${fldObj}`]: value };

  return new Promise((resolve, reject) => {    
  
    spRequest.requestDigest(urlSPSite)
    .then(digest => {

      spRequest.post(url, {
        headers: { 'X-RequestDigest': digest, 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' },
        body
      })
      .then(result => {
        resolve({ success: true, message: "List item was updated!!" });
      }, err => {
        logError("spUpdateListItem - Error back from Sharepoint API: " + spDecodeErrMsg(err));
        reject({ success:false, message: spDecodeErrMsg(err) });
        }
      );
    })

    .catch(err => {
      logError("spUpdateListItem - Error retrieving the Sharepoint Digest string...: " + err.message);
      reject({ success:false, message: "Error retrieving the Sharepoint Digest string..." });
    });

  });

}

const spGetListItems = async function(listName, filter="", orderby="") {
  
  //OK

  let url = urlSPSiteAPI + encodeURI(`/lists/getbytitle('${listName}')/items`);
  
  if(filter || orderby) url += "?";
  if(filter) { filter = filter.replace(/=/g, " eq "); url += `$filter=${filter}&`; }
  if(orderby) url += `$orderby=${orderby}`;

  // console.log(url);

  showConsoleHeading(`GET LIST ITEMS (${listName})`);

  try {
    digest = await spRequest.requestDigest(urlSPSite);

    result = await spRequest.get(url, { headers: { 'X-RequestDigest': digest } });

    return {success: true, data: result.body.d.results};

  }
  catch(err) {

    return { success: false, error: spDecodeErrMsg(err) }

  }

}

const X_spGetListItems = async function(listName, filter) {

  const ret = [];
  const urlSPList = urlSP + encodeURI(`/_api/web/lists/getbytitle('${listName}')`);

  // filter = "(StavPListu eq 10) and (ZpracovatelEmail eq 'tekotyle@volny.cz')";

  return new Promise((resolve, reject) => {

    spAuth
    .getAuth(urlSP, { username: process.env.SHP_USER, password: process.env.SHP_PWD })
    .then(data =>{
      headers = data.headers;
      headers['Accept'] = 'application/json;odata=verbose';
  
      console.log("Logged in to SP successfully...");
  
      let requestOpts = data.options;
      requestOpts.json = true;
      requestOpts.headers = headers;
      requestOpts.url = urlSPList + "/items?$filter=" + filter;
  
      request.get(requestOpts).then(response => {

        // console.log(response.d.results[1]);
        
        response.d.results.forEach((item) => {
          ret.push(item);
        });

        // console.log(ret);
        resolve(ret);
  
      });
    })
    .catch(err => reject(err));
  
  });

}

const spGetFile = async function(sFileShp, sFileLocal) {

  // OK, but needs finishing the Error handling - in case Shp return an error processing the request...

  return new Promise((resolve, reject) => {
    var file = null;

    showConsoleHeading(`FILE DOWNLOAD (${path.basename(sFileLocal)})`);

    spAuth
      .getAuth(urlSPSite, { username: process.env.SHP_USER, password: process.env.SHP_PWD })
      .then((data) => {

        let headers = {...data.headers,
          'Accept': 'application/xml,application/pdf;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US',
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive'
        } 

        let requestOpts = data.options;

        requestOpts.json = true;
        requestOpts.headers = headers;
        requestOpts.url = urlSPSiteAPI + encodeURI(`/GetFileByServerRelativeUrl('${sFileShp}')/$value`);

        try {
          file = fs.createWriteStream(sFileLocal);

          requestProm(requestOpts)

            .pipe(file)

            // .catch((err) => {
            //   reject({statusCode: err.statusCode, error: spDecodeErrMsg(err.error)})
            // })
  
            .on('finish', () => {
              // console.log(`The file finished downloading.`);
              resolve(file);
            })
  
            .on('error', (err) => {
              reject(err);
            })

          }
        
        catch(err) {
          //  It does not come where if Shp returns an Error...
          //  ...instead, it put the error into the file read..

          console.log("Error while reading the Shp file...");
          reject(err);
        }
      })

      .catch(err => {
        console.log(`Error happnened while reading a file: ${err}`);
        reject({statusCode: err.statusCode, error: spDecodeErrMsg(err)});
      });

  });
}

const spGetFileNew = async function() {

  // Somehow cannot make it work with spRequest...  to be worked on?

  showConsoleHeading("GET FILE REQUEST");

  try {

    digest = await spRequest.requestDigest(urlSPSite);

    let url = urlSPSiteAPI + encodeURI("/GetFileByServerRelativeUrl('/contract/PlanovaciListy/2018/05-0042-18_v12.pdf')/$value'");

    let headers = {
      'Accept': 'application/xml,application/pdf;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'X-RequestDigest': digest
    } 

    let file = fs.createWriteStream(`file35.pdf`);

    let stream = request(url, { headers })
      .pipe(file)

      .on('finish', () => {
        console.log(file);
        return {statusCode: 200, data: `The file is finished downloading.`};
      })

      .on('error', (err) => {
        return {statusCode: err.statusCode, error: spDecodeErrMsg(err)};
      })
        
  }

  catch(err) {
    return {statusCode: err.statusCode, error: spDecodeErrMsg(err)};
  }

}

const spSendFile = async function(localFolder, localFile, spFolder, spFile="") {

  //OK

  // spFolder example = "/contract/PlanovaciListy"

  showConsoleHeading(`FILE SHP UPLOAD (${localFile})`);

  if(localFile=='' || spFolder=='') throw("Missing File / SP Folder specification");

  if(spFile=='') spFile = localFile;

  try {

    // file = await readFileProm('./file-upload/test.pdf');

    // console.log(`${localFolder}/${localFile}`);

    file = await readFileProm(`${localFolder}/${localFile}`);

    digest = await spRequest.requestDigest(urlSPSite);

    // let urlSPAPIFiles = urlSPSiteAPI + encodeURI("/GetFolderByServerRelativeUrl('/contract/PlanovaciListy')/Files");
    let urlSPAPIFiles = urlSPSiteAPI + encodeURI(`/GetFolderByServerRelativeUrl('${spFolder}')/Files`);

    result = await spRequest.post(urlSPAPIFiles + `/add(url='${spFile}',overwrite=true)`, {
      headers: { 'X-RequestDigest': digest},
      json: false,
      body: file
    });

    // return {statusCode: result.statusCode, data: "File was sucessfully uploaded to Sharepoint"};
    return {success: true, message: "File was sucessfully uploaded to Sharepoint"};

  }
  catch(err) {

    // return { statusCode: err.statusCode, error: spDecodeErrMsg(err) }
    return { success: false, message: "spSendFile - " + spDecodeErrMsg(err) }

  }

}

const X_spSendFile = async function() {

  // Older function using getRequestDigest (something like spAuth?) - to be deleted?

  return new Promise((resolve, reject) => {

    getRequestDigest()
    .then((rdToken) => {
      console.log("Logged in to SP successfully... and received RequestDigest Value ....");
  
      headers['Accept'] = 'application/json;odata=verbose';
      headers['Content-Type'] = 'application/json';
      headers['X-RequestDigest'] = rdToken
    
      let requestOpts = {};
      requestOpts.json = true;
      requestOpts.headers = headers;
      requestOpts.url = urlSP + encodeURI("/_api/web/GetFolderByServerRelativeUrl('/contract/PlanovaciListy')/Files/add(url='file1.pdf',overwrite=true)");

      console.log("Send File Request:");
      console.log(requestOpts);

      request.post(requestOpts, (error, res, body) => {

        if (error) {
          console.error(error)
          return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log(body)
  
      });

    })
    .catch(error => { console.log(`Something happened: ${error}`); });
  
  });

}

module.exports = {
  spCreateList,     //OK
  spAddListItem,    //OK
  spUpdateListItem, //OK - returns a promise
  spGetListItems,   //OK
  spSendFile,       //OK
  spGetFile         //OK - but needs proper Error handling
}