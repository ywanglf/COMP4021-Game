const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signin = function(username, password, onSuccess, onError) {

        //
        // Preparing the user data
        //
        const json = JSON.stringify({ username, password });

        //
        // Sending the AJAX request to the server
        //
        fetch("/signin", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json
         })
            .then((res) => res.json() )
            .then((json) => {
                console.log("Successful!");
                
                // Handling the success response from the server
                //  
                if (json.status == "success"){
                    user = json.user;
                    if (onSuccess) onSuccess();
                }
                //
                // Processing any error returned by the server
                //
                //
                else if (json.status == "error"){
                    if (onError)
                        onError(json.error);
                }
                
            })
            .catch((err) => {
                console.log("Error! "+err);
            });
    };

    // This function sends a validate request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const validate = function(onSuccess, onError) {

        //
        // Sending the AJAX request to the server
        // Sending a valid request
        fetch("/validate")
            .then((res => res.json()))
            .then((json) => {
                if (json.status == "success"){
                    // set the user information
                    user = json.user;
                    //
                    // Handling the success response from the server
                    //
                    if (onSuccess) onSuccess();
                }
                //
                // Processing any error returned by the server
                //
                else if (onError) onError(json.error);
            })
            .catch((err => {
                console.log(err);
                if (onError) onError(err);
            }))
    };

    // This function sends a sign-out request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signout = function(onSuccess, onError) {
        fetch("/signout")
            .then((res => res.json()))
            .then((json) => {
                if (json.status == "success"){
                    // set the user information
                    user = json.user;
                    //
                    // E. Handling the success response from the server
                    //
                    if (onSuccess) onSuccess();
                }
                //
                // Processing any error returned by the server
                //
                else if (onError) onError(json.error);
            })
            .catch((err => {
                console.log(err);
                if (onError) onError(err);
            }))
    };

    return { getUser, signin, validate, signout };
})();
