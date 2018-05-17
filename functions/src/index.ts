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
//Once an hour reduce the hotness multiplier so new beer's appear higher
exports.hourly_job = functions.pubsub.topic("hourly-tick").onPublish(event => {
  countries.forEach(country => {
    const itemRef = ref.child("countries/" + country + "/beers");
    itemRef.on(
      "child_added",
      function(snapshot) {
        let hotness: number = snapshot.val().hotness;
        if (hotness > 1) {
          hotness--;
        }
        const beer = snapshot.val();
        return snapshot.ref.child("hotness").set(hotness);
      },
      err => {
        console.log("Error");
        return "Error";
      }
    );
  });
});

//Whenever the hotness is caulcted update the rating, the rating is equal to hotness*(upvotes-downvotes)
exports.calculateRating = functions.database
  .ref("/countries/{country}/beers/{beer}/hotness")
  .onUpdate((snapshot, context) => {
    const country: string = context.params.country;
    const beer: string = context.params.beer;

    return ref
      .child("countries/" + country + "/beers/" + beer)
      .once("value", function(snap) {
        const original = snap.val();

        const hotness: number = original.hotness;
        const upvotes: number = original.upvotes;
        const downvotes: number = original.downvotes;

        const rating: number = hotness * (upvotes - downvotes);
        return snap.ref.child("rating").set(rating);
      });
  });
