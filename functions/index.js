// @ts-check

const firebaseAdmin = require('firebase-admin')
const firebaseFunc = require('firebase-functions')
const nodeGeocoder = require('node-geocoder')
const rp = require('request-promise')

firebaseAdmin.initializeApp(firebaseFunc.config().firebase);

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: "AIzaSyA0Q7m1gULd67FSmRGaoP6UUtV-zlmMcJc",
    formatter: null 
  };

var geocoder = nodeGeocoder(options);

exports.submit = firebaseFunc.https.onRequest((req, res) => {
    const recaptchaResponse = req.body["g-recaptcha-response"];

    const emailAddr = req.body["user_email_input"];
    const firstName = req.body["user_fname_input"];
    const lastName = req.body["user_lname_input"];
    const country = req.body["user_country_menu"];
    // const usStates = req.body["user_us_state_menu"];
    // const caStates = req.body["user_ca_state_menu"];
    // const mxStates = req.body["user_mx_state_menu"];
    const city = req.body["user_city_input"];
    const zipCode = req.body["user_zip_code_input"];

    const address = city + " " + zipCode + " " + country;

    // switch(countryFlag){
    //     case 1:    
    //       address = city + " " + usStates + " " + zipCode + " " + country;
    //     //   caStates = null;
    //     //   mxStates = null;
    //       break;
    //     case 2: 
    //       address = city + " " + caStates + " " + zipCode + " " + country;
    //     //   usStates = null;
    //     //   mxStates = null;
    //       break;
    //     case 3: 
    //       address = city + " " + mxStates + " " + zipCode + " " + country;
    //     //   caStates = null;
    //     //   usStates = null;
    //       break;
    //     case 0: 
    //       address = city + " " + zipCode + " " + country;
    //     //   caStates = null;
    //     //   mxStates = null;
    //     //   usStates = null;
    //       break;
    //   }

    rp({
        uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
        method: 'POST',
        formData: {
            secret: '6LeopD8UAAAAALTKnD0jUog0tmE4Xvm_ofL128JM',
            response: recaptchaResponse
        },
        json: true
    }).then(result => {
        if (result.success) {
            geocoder.geocode(address, function(err, geoCoderResult) {

                firebaseAdmin.database().ref("Country/" + country).push().set({
                    User_Information: {
                      First_Name: firstName,
                      Last_Name: lastName, 
                      Email: emailAddr
                    },
                    User_Location: {
                      City: city,
                    //   US_State: usStates,
                    //   CA_Province: caStates,
                    //   MX_State: mxStates,
                      Zip_Postal_Code: zipCode,
                      Country: country
                    },
                    GPS_Coordinates: {
                      Latitude: geoCoderResult[0].latitude,
                      Longitude: geoCoderResult[0].longitude
                    }
                  });
        
                  res.end("Recaptcha verification successful.")
              });
        }
        else {
            res.status(500).end("Recaptcha verification failed.")
        }
    }).catch(reason => {
        res.end("Recaptcha request failed.")
    })
})