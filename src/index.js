import request from 'request';
import uuidV4 from 'uuid/v4';

class Analytics {
  /**
   * Class constructor
   */
  constructor(trackingID, { userAgent = '', debug = false, version = 1 } = {}) {
    // Debug
    this.globalDebug = debug;
    // User-agent
    this.globalUserAgent = userAgent;
    // Links
    this.globalBaseURL = 'https://www.google-analytics.com';
    this.globalDebugURL = '/debug';
    this.globalCollectURL = '/collect';
    this.globalBatchURL = '/batch';
    // Google generated ID
    this.globalTrackingID = trackingID;
    // Google API version
    this.globalVersion = version;
  }

  get debug() {
    return this.globalDebug;
  }

  set debug(value) {
    this.globalDebug = value;
  }

  get userAgent() {
    return this.globalUserAgent;
  }

  set userAgent(value) {
    this.globalUserAgent = value;
  }

  get baseURL() {
    return this.globalBaseURL;
  }

  set baseURL(value) {
    this.globalBaseURL = value;
  }

  get debugURL() {
    return this.globalDebugURL;
  }

  set debugURL(value) {
    this.globalDebugURL = value;
  }

  get collectURL() {
    return this.globalCollectURL;
  }

  set collectURL(value) {
    this.globalCollectURL = value;
  }

  get batchURL() {
    return this.globalBatchURL;
  }

  set batchURL(value) {
    this.globalBatchURL = value;
  }

  get trackingID() {
    return this.globalTrackingID;
  }

  set trackingID(value) {
    this.globalTrackingID = value;
  }

  get version() {
    return this.globalVersion;
  }

  set version(value) {
    this.globalVersion = value;
  }

  /**
   * Send a "pageview" request
   *
   * @param  {string} url      Url of the page
   * @param  {string} title    Title of the page
   * @param  {string} hostname Document hostname
   * @param  {string} clientID uuidV4
   *
   * @return {Promise}
   */
  pageview(hostname, url, title, clientID) {
    const params = { dh: hostname, dp: url, dt: title };
    return this.send('pageview', params, clientID);
  }

  /**
   * Send a "event" request
   *
   * @param  {string} evCategory Event category
   * @param  {string} evAction   Event action
   * @param  {string} clientID   uuidV4
   * @param  {string} evLabel    Event label
   * @param  {string} evValue    Event description
   *
   * @return {Promise}
   */
  event(evCategory, evAction, { evLabel, evValue, clientID } = {}) {
    let params = { ec: evCategory, ea: evAction };

    if (evLabel) params.el = evLabel;
    if (evValue) params.ev = evValue;

    return this.send('event', params, clientID);
  }

  /**
   * Send a "screenview" request
   *
   * @param  {string} appName        App name
   * @param  {string} appVer         App version
   * @param  {string} appID          App Id
   * @param  {string} appInstallerID App Installer Id
   * @param  {string} screenName     Screen name / Content description
   * @param  {string} clientID       uuidV4
   *
   * @return {Promise}
   */
  screen(appName, appVer, appID, appInstallerID, screenName, clientID) {
    const params = {
      an: appName,
      av: appVer,
      aid: appID,
      aiid: appInstallerID,
      cd: screenName
    };

    return this.send('screenview', params, clientID);
  }

  /**
   * Send a "transaction" request
   *
   * @param  {string} trnID    Transaction ID
   * @param  {string} trnAffil Transaction affiliation
   * @param  {string} trnRev   Transaction Revenue
   * @param  {Number} trnShip  Transaction shipping
   * @param  {Number} trnTax   Transaction tax
   * @param  {string} currCode Currency code
   * @param  {string} clientID uuidV4
   *
   * @return {Promise}
   */
  transaction(trnID, {
    trnAffil, trnRev, trnShip, trnTax, currCode
  } = {}, clientID) {
    let params = { ti: trnID };

    if (trnAffil) params.ta = trnAffil;
    if (trnRev) params.tr = trnRev;
    if (trnShip) params.ts = trnShip;
    if (trnTax) params.tt = trnTax;
    if (currCode) params.cu = currCode;

    return this.send('transaction', params, clientID);
  }

  /**
   * Send a "social" request
   *
   * @param  {string} socialAction  Social Action
   * @param  {string} socialNetwork Social Network
   * @param  {string} socialTarget  Social Target
   * @param  {string} clientID      uuidV4
   *
   * @return {Promise}
   */
  social(socialAction, socialNetwork, socialTarget, clientID) {
    const params = { sa: socialAction, sn: socialNetwork, st: socialTarget };

    return this.send('social', params, clientID);
  }

  /**
   * Send a "exception" request
   *
   * @param  {string} exDesc   Exception description
   * @param  {Number} exFatal  Exception is fatal?
   * @param  {string} clientID uuidV4
   *
   * @return {Promise}
   */
  exception(exDesc, exFatal, clientID) {
    const params = { exd: exDesc, exf: exFatal };

    return this.send('exception', params, clientID);
  }

  /**
   * Send a "refund" request
   *
   * @param {string} trnID          Transaction ID
   * @param {string} evCategory     Event category
   * @param {string} evAction       Event action
   * @param {Number} nonInteraction Non-interaction parameter
   * @param {string} clientID       uuidV4
   *
   * @returns {Promise}
   */
  refund(trnID, evCategory = 'Ecommerce', evAction = 'Refund', nonInteraction = 1, clientID) {
    const params = {
      ec: evCategory,
      ea: evAction,
      ni: nonInteraction,
      ti: trnID,
      pa: 'refund'
    };

    return this.send('event', params, clientID);
  }

  /**
   * Send a "item" request
   * @param  {string} trnID         Transaction ID
   * @param  {string} itemName      Item name
   * @param  {Number} itemPrice     Item price
   * @param  {string} itemQty       Item quantity
   * @param  {string} itemSku       Item SKU
   * @param  {string} itemVariation Item variation / category
   * @param  {string} currCode      Currency code
   * @param  {string} clientID      uuidV4
   * @return {Promise}
   */
  item(trnID, itemName, {
    itemPrice, itemQty, itemSku, itemVariation, currCode
  } = {}, clientID) {
    let params = { ti: trnID, in: itemName };

    if (itemPrice) params.ip = itemPrice;
    if (itemQty) params.iq = itemQty;
    if (itemSku) params.ic = itemSku;
    if (itemVariation) params.iv = itemVariation;
    if (currCode) params.cu = currCode;

    return this.send('item', params, clientID);
  }

  /**
   * Send a "timing tracking" request
   * @param  {string} timingCtg     Timing category
   * @param  {string} timingVar     Timing variable
   * @param  {Number} timingTime    Timing time
   * @param  {string} timingLbl     Timing label
   * @param  {Number} dns           DNS load time
   * @param  {Number} pageDownTime  Page download time
   * @param  {Number} redirTime     Redirect time
   * @param  {Number} tcpConnTime   TCP connect time
   * @param  {Number} serverResTime Server response time
   * @param  {string} clientID      uuidV4
   * @return {Promise}
   */
  timingTrk(timingCtg, timingVar, timingTime, {
    timingLbl, dns, pageDownTime, redirTime, tcpConnTime, serverResTime
  } = {}, clientID) {
    let params = { utc: timingCtg, utv: timingVar, utt: timingTime };

    if (timingLbl) params.url = timingLbl;
    if (dns) params.dns = dns;
    if (pageDownTime) params.pdt = pageDownTime;
    if (redirTime) params.rrt = redirTime;
    if (tcpConnTime) params.tcp = tcpConnTime;
    if (serverResTime) params.srt = serverResTime;

    return this.send('timing', params, clientID);
  }

  /**
   * Send a request to google-analytics
   *
   * @param  {string} hitType  Hit type
   * @param  {string} clientID Unique identifier (uuidV4)
   * @param  {Object} params   Options
   *
   * @return {Promise}
   */
  send(hitType, params, clientID) {
    return new Promise((resolve, reject) => {
      let formObj = {
        v: this.globalVersion,
        tid: this.globalTrackingID,
        cid: clientID || uuidV4(),
        t: hitType
      };
      if (params) Object.assign(formObj, params);

      let url = `${this.globalBaseURL}${this.globalCollectURL}`;
      if (this.globalDebug) {
        url = `${this.globalBaseURL}${this.globalDebugURL}${this.globalCollectURL}`;
      }

      let reqObj = { url, form: formObj };
      if (this.globalUserAgent !== '') {
        reqObj.headers = { 'User-Agent': this.globalUserAgent };
      }

      return request.post(reqObj, (err, httpResponse, body) => {
        if (err) return reject(err);

        let bodyJson = {};
        if (body && (httpResponse.headers['content-type'] !== 'image/gif')) {
          bodyJson = JSON.parse(body);
        }

        if (httpResponse.statusCode === 200) {
          if (this.globalDebug) {
            if (bodyJson.hitParsingResult[0].valid) {
              return resolve({ clientID: formObj.cid });
            }

            return reject(bodyJson);
          }

          return resolve({ clientID: formObj.cid });
        }

        if (httpResponse.headers['content-type'] !== 'image/gif') {
          return reject(bodyJson);
        }

        return reject(body);
      });
    });
  }
}

export default Analytics;
