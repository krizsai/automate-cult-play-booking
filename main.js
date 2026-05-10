"use strict";
const https = require("https"),
  co = require("co"),
  config = require("./config"),

  Game = {
    badminton: {
      id: 350,
      name: "Badminton",
      displayText: "Badminton",
      preference: 1,
    },
  };

const PREFERRED_CENTER = config.preferred_center;

const commonHeaders = {
  accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "CureFit/904835 CFNetwork/3826.500.131 Darwin/24.5.0", 
  st: config.st,
  at: config.at, 
  osname: config.osName,
  Cookie: config.Cookie,
  deviceId: config.deviceId,
  encryptedDeviceId: config.encryptedDeviceId,
  clientVersion: config.clientVersion,
  appsource: config.appsource,
  microappversion: config.microappversion,
  deviceModel: config.deviceModel,
  deviceBrand: config.deviceBrand,
  "Accept-Language": config["Accept-Language"],
  timezone: config.timezone,
  "x-tenant-id": config["x-tenant-id"],
  lat: config.lat,
  lon: config.lon,

};

const CULT_FIT_URL = config.main_app_url;
const PREFERRED_SLOT = "08:00:00";

const URLS = {
  GET_CLASSES: `/api/v2/fitso/schedule?productType=FITNESS&centerId=${PREFERRED_CENTER}&centerServiceId&isPilateGymPage=false&fromWidgetId=b507aee2-7300-41b0-a6c7-c41167ec7284`,
  BOOK_CLASS: "/api/cult/class/${activityID}/book",
};

const HTTP_POST = "POST",
  HTTP_GET = "GET";


const PREFERRED_CLASSES_IN_ORDER = [Game.badminton];


co(function* () {
  let classes = yield makeAPICall(
    {},
    CULT_FIT_URL,
    URLS.GET_CLASSES,
    HTTP_GET,
    commonHeaders
  );
  const parsedData = JSON.parse(classes);
  //get the lastest date available to book.
  let date = parsedData.classByDateMap[Object.keys(parsedData.classByDateMap)[0]].id;
  //let date = '2025-07-17'; 

  //fetch if slots are available for preferred slot and class.
  let slots = getSlots(
    parsedData.classByDateMap[date],
    PREFERRED_SLOT,
    PREFERRED_CLASSES_IN_ORDER
  );
  if (slots.length > 0) {
    yield bookClass(slots[0]);
    console.log("Yay! booked");
  } else {
    errorHandler("No classes");
  }
}).then(
  function () {},
  function (error) {
    errorHandler(error);
  }
);

function* bookClass(classObj) {
  const dateTime = `${classObj.date}T${classObj.startTime}`; 
  const bookingTimestamp = new Date(dateTime).getTime(); 

  return yield makeAPICall(
    {
      slotId: parseInt(classObj.id), 
      bookingTimestamp,
      centerId: classObj.centerID, 
      workoutId: classObj.workoutId,
      productArenaCategoryId: 2,
      params: null,
    },
    CULT_FIT_URL,
    "/api/v2/fitso/class/book",
    HTTP_POST,
    commonHeaders
  );
}

function* makeAPICall(request, host, path, method, headers) {
  headers["Content-Type"] = "application/json";
  headers["User-Agent"] = "CommonMan";
  let httpParams = {
    host: host,
    path: path,
    method: method,
    headers: headers,
  };
  return new Promise(function (resolve, reject) {
    try {
      let post_req = https.request(httpParams, function (res) {
        res.setEncoding("utf8");
        let responseStatus = parseInt(res.statusCode);
        let response = "";

        res.on("data", function (chunk) {
          response += chunk;
           const date = new Date(request.bookingTimestamp);
        //sendTelegramAlert("Booking successful for Badminton at" + "Silpa Park" + " on " + date);
        });
        res.on("end", function () {
          let output =
            response.length === 0
              ? ""
              : isResponseJSON(res)
              ? JSON.parse(response)
              : response;
          if (responseStatus !== 200) {
            reject(response);
          }
          return resolve(output);
        });
        res.on("error", function (e) {
          return reject(e);
        });
      });
      post_req.on("error", function (e) {
        return reject(e);
      });
      post_req.write(JSON.stringify(request));
      post_req.end();
    } catch (error) {
      if(error.statusCode === 200) {
       
      } else {
       return reject(error);
      }
    }
  });
}

function sendTelegramAlert(message) {
  const token = config.telegramToken ;
  const chatId = config.chatId;
  const text = encodeURIComponent(message);

  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;

  https.get(url, (res) => {
    console.log(`Telegram alert sent: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error('Failed to send Telegram alert:', e);
  });
}


function isResponseJSON(response) {
  return response.headers["content-type"] === "application/json; charset=utf-8";
}

function getSlots(classesForDay, slot, classTypes) {
  let classTypeIDs = classTypes.map(function (classType) {
    return classType.id;
  });
  let classIDs = classesForDay.classByTimeList
    .filter(function (classByTime) {
      return classByTime.id == slot;
    })[0]
    .centerWiseClasses.filter(function (center) {
      return center.centerId == PREFERRED_CENTER;
    })[0]
    .classes.filter(function (classs) {
      let filterElement = classTypes.filter(function (classType) {
        return classType.id == classs.workoutId;
      })[0];
      if (!filterElement) {
        return false;
      }
      classs.preference = filterElement.preference;
      return (
        classTypeIDs.indexOf(classs.workoutId) > -1 &&
        classs.state === "AVAILABLE"
      );
    })
    .sort(function (class1, class2) {
      return class1.preference - class2.preference;
    });
  return classIDs;
}

function errorHandler(error) {
  console.log("Failed! ", error);
}
