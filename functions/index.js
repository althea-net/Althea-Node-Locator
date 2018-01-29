// @ts-check

const express = require('express')
const validator = require('express-validator')
const firebaseAdmin = require('firebase-admin')
const firebaseFunc = require('firebase-functions')
const nodeGeocoder = require('node-geocoder')
const rp = require('request-promise')

firebaseAdmin.initializeApp(firebaseFunc.config().firebase);

var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: "<ADD STUFF HERE>",
	formatter: null
};

var geocoder = nodeGeocoder(options);

exports.submit = firebaseFunc.https.onRequest((req, res) => {
	const recaptchaResponse = req.body["g-recaptcha-response"];

	const emailAddr = req.body["user_email_input"];
	const firstName = req.body["user_fname_input"];
	const lastName = req.body["user_lname_input"];
	const country = req.body["user_country_menu"];
	const city = req.body["user_city_input"];
	const zipCode = req.body["user_zip_code_input"];

	const address = city + " " + zipCode + " " + country;
	
	rp({
		uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
		method: 'POST',
		formData: {
			secret: "<ADD STUFF HERE>",
			response: recaptchaResponse
		},
		json: true
	}).then(result => {
		if (result.success) {
			geocoder.geocode(address, function (err, geoCoderResult) {
				firebaseAdmin.database().ref("Country/" + country).push().set({
					Metadata: {
						Timestamp: firebaseAdmin.database.ServerValue.TIMESTAMP
					},
					User_Information: {
						First_Name: firstName,
						Last_Name: lastName,
						Email: emailAddr
					},
					User_Location: {
						City: city,
						Zip_Postal_Code: zipCode,
						Country: country
					},
					GPS_Coordinates: {
						Latitude: geoCoderResult[0].latitude,
						Longitude: geoCoderResult[0].longitude
					}
				});

				firebaseAdmin.database().ref("Markers/").push().set({
					GPS_Coordinates: {
						Latitude: geoCoderResult[0].latitude,
						Longitude: geoCoderResult[0].longitude
					}
				});

				res.end("Recaptcha verification successful.")
			});
		} else {
			res.status(500).end("Recaptcha verification failed.")
		}
	}).catch(reason => {
		res.end("Recaptcha request failed.")
	})
})
