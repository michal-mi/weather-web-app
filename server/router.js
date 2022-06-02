const express = require('express');
const fetch = require('node-fetch');
let router = express.Router();

// router.get('/:locationName', (req, res) => {
//     const locationName = req.params.locationName;
//     console.log(locationName);
//     const format = "json";
//     const api = "C56Z3NHTBARVJ68SU6SEETZTT";
//     const startDate = "2019-06-13";
//     const endDate = "2019-06-20";

//     const url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=24&" +
//         "startDateTime=" + startDate + "T00:00:00&endDateTime=" + endDate + "T00:00:00&unitGroup=uk&contentType=" + format + "&" +
//         "dayStartTime=0:0:00&dayEndTime=0:0:00&location=" + locationName + "&key=" + api;

//     console.log(url);

//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             res.send(data);
//         });
// });

module.exports = router;