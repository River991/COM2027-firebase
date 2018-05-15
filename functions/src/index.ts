import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

const countries: string[] = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech_Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "United_Kingdom"
];

const db = admin.database();
const ref = db.ref("/");
//Once an hour reduce the rating multiplier so new beer's appear higher
exports.hourly_job = functions.pubsub.topic("hourly-tick").onPublish(event => {
  countries.forEach(country => {
    const itemRef = ref.child("countries/" + country + "/beers");
    itemRef.on(
      "child_added",
      function(snapshot) {
        let rating: number = snapshot.val().rating;
        if (rating > 1) {
          rating--;
        }
        const beer = snapshot.val();
        beer.rating = rating;
        return snapshot.ref.child("rating").set(rating);
      },
      err => {
        console.log("Error");
        return "Error";
      }
    );
  });
});
