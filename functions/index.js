// @ts-check

const functions = require('firebase-functions')
const rp = require('request-promise')

exports.submit = functions.https.onRequest((req, res) => {
    const recaptchaResponse = req.body["g-recaptcha-response"];

    const emailAddr = req.body["user_email_input"];
    const firstName = req.body["user_fname_input"];
    const lastName = req.body["user_lname_input"];
    const country = req.body["user_country_menu"];
    const usStates = req.body["user_us_state_menu"];
    const caStates = req.body["user_ca_state_menu"];
    const mxStates = req.body["user_mx_state_menu"];
    const city = req.body["user_city_input"];
    const zipCode = req.body["user_zip_code_input"];

    // remove .value
    switch(countryFlag){
        case 1:    
          address = city.value + " " + usStates.value + " " + zipCode.value + " " + country.value;
          caStates.value = null;
          mxStates.value = null;
          break;
        case 2: 
          address = city.value + " " + caStates.value + " " + zipCode.value + " " + country.value;
          usStates.value = null;
          mxStates.value = null;
          break;
        case 3: 
          address = city.value + " " + mxStates.value + " " + zipCode.value + " " + country.value;
          caStates.value = null;
          usStates.value = null;
          break;
        case 0: 
          address = city.value + " " + zipCode.value + " " + country.value;
          caStates.value = null;
          mxStates.value = null;
          usStates.value = null;
          break;
      }

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
            res.end("Recaptcha verification successful.")

            // function writeToFirebase(data){
                // firebase.database().ref("Country/" + country.value).push().set({
                //   User_Information: {
                //     First_Name: firstName.value,
                //     Last_Name: lastName.value, 
                //     Email: emailAddr.value
                //   },
                //   User_Location: {
                //     // Street_Address: streetAddr.value, 
                //     City: city.value,
                //     US_State: usStates.value,
                //     CA_Province: caStates.value,
                //     MX_State: mxStates.value,
                //     Zip_Postal_Code: zipCode.value,
                //     Country: country.value
                //   },
                //   GPS_Coordinates: {
                //     Latitude: data.geometry.location.lat(),
                //     Longitude: data.geometry.location.lng()
                //   }
                // });
            //   }
        }
        else {
            res.end("Recaptcha verification failed.")
        }
    }).catch(reason => {
        res.end("Recaptcha request failed.")
    })

    res.end("Recaptcha API request failed.");

})
