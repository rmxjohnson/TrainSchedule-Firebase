// Homework Assignment #7 - Train Scheduler
// Uses Firebase
// javascript/jQuery
// Rhonda Johnson

$(document).ready(function () {

    var trainBody = $("#train-body");
    var trainName = $("#train-name");
    var destination = $("#destination");
    var firstTrainTime = $("#first-train-time");
    var frequency = $("#frequency");
    var submitTrain = $("#submit-train");

    var currentTrainName = "";
    var currentDestination = "";
    var currenFirstTrainTime = "";
    var currentFrequency = "";

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyC_pHhFcnN2OGcl8f4GRKwWGPjeyVMFbw8",
        authDomain: "trainschedule-1af83.firebaseapp.com",
        databaseURL: "https://trainschedule-1af83.firebaseio.com",
        projectId: "trainschedule-1af83",
        storageBucket: "trainschedule-1af83.appspot.com",
        messagingSenderId: "567892850926"
    };
    firebase.initializeApp(config);


    // Create a variable to reference the database
    var database = firebase.database();

    // function to add a train when user clicks "SUBMIT"
    submitTrain.on("click", function (event) {
        // disable normal "SUBMIT" button behavior
        event.preventDefault();

        // get user input from the textbox
        var currentTrainName = trainName.val().trim();
        var currentDestination = destination.val().trim();
        var currentFirstTrainTime = firstTrainTime.val().trim();
        var currentFrequency = frequency.val().trim();

        // Check for empty fields
        if ((currentTrainName == "") || (currentDestination == "")
            || (currentFirstTrainTime == "") || (currentFrequency == "")) {
            alert("Invalid: Blank Fields - cannot submit. \nPlease enter valid data into all fields");
            return
        }
        else {
            console.log("name = " + currentTrainName);
            console.log("destination = " + currentDestination);
            console.log("first time = " + currentFirstTrainTime);
            console.log("frequency = " + currentFrequency);

            // create new train object to be saved in firebase
            var newTrain = {
                oName: currentTrainName,
                oDestination: currentDestination,
                oFirstTime: currentFirstTrainTime,
                oFrequency: currentFrequency,
            }

            database.ref().push(newTrain);

            // clear the user input from the input fields
            $("input").val('');
        }
    });

    // Firebase watcher + initial loader 
    database.ref().on("child_added", function (childSnapshot) {

        // Log everything that's coming out of snapshot
        console.log(childSnapshot.val().oName);
        console.log(childSnapshot.val().oDestination);
        console.log(childSnapshot.val().oFirstTime);
        console.log(childSnapshot.val().oFrequency);
        console.log("key = " + childSnapshot.key);

        // Store everything into a variable.
        var trainName = childSnapshot.val().oName.toUpperCase();
        var trainDestination = childSnapshot.val().oDestination.toUpperCase();
        var tempTime = childSnapshot.val().oSFirstTime;
        var trainFrequency = childSnapshot.val().oFrequency;

        // Correctly format the first train time
        var firstTrainTime = moment.unix(tempTime).format("hh:mm a");

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTrainTimeConverted = moment(firstTrainTime, "hh:mm a").subtract(1, "years");
        console.log(firstTrainTimeConverted);

        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm a"));

        // Difference between the current time and the first train time
        var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % trainFrequency;
        console.log(tRemainder);

        // Minutes Until Next Train
        var tMinutesTillTrain = trainFrequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

        // Next Train Time = [(current time) + (minutes until next train)]
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm a"));
        var nextArrival = moment(nextTrain).format("hh:mm a");

        //create a new table row with correct table data elements
        var newRow = $("<tr>"),
            newTD1 = $("<td>"),
            newTD2 = $("<td>"),
            newTD3 = $("<td>"),
            newTD4 = $("<td>"),
            newTD5 = $("<td>"),
            newTD6 = $("<td>");

        newTD1.text(trainName);
        newTD2.text(trainDestination);
        newTD3.text(trainFrequency + " min");
        newTD4.text(nextArrival);
        newTD5.text(tMinutesTillTrain + " min");

        // Generate a "DELETE" button
        var deleteButton = $("<button>");

        // get child key from Firebase for data-key attribute
        var dataKey = childSnapshot.key;

        // Adding a class, text, and data attribute to the button
        deleteButton.addClass("btn btn-danger delete-btn");
        deleteButton.text("DELETE");
        deleteButton.attr("data-key", dataKey);

        // append button to table data element
        deleteButton.appendTo(newTD6);

        // append all td elements to the table row
        newRow.append(newTD1).append(newTD2).append(newTD3).append(newTD4).append(newTD5).append(newTD6);

        // append the new row to the train info table
        trainBody.append(newRow);



        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Alternate working code: create an html string to add the row to the train info table
        // var buttonHTML = "<button class='btn btn-danger delete-btn' data-key=" + dataKey + ">DELETE</button>";
        // console.log("buttonhtml = " + buttonHTML);
        // // create html
        // var html = "<tr><td>" + trainName + "</td><td>" + trainDestination + "</td><td>"
        //     + trainFrequency + " min" + "</td><td>" + nextArrival + "</td><td>" + tMinutesTillTrain + " min"
        //     + "</td><td>" + buttonHTML + "</td></tr>";
        // trainBody.append(html);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////


        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    //window.location.reload(true);


    // When click "DELETE" button, remove row from Firebase & from page view
    // Used "tbody" since that is the closest static (not dynamically created) element
    $('tbody').on("click", "button.delete-btn", function (event) {
        // disable normal "SUBMIT" button behavior
        event.preventDefault();
        alert("I clicked delete");
        // get the current firebase key from the button's data-key attribute
        var currentKey = ($(this).attr("data-key"));

        // create a reference to the Firebase child
        let ref = database.ref().child(currentKey);

        // delete the child from Firebase database
        ref.remove();

        // remove the table row that contained the delete button
        // first parent is the <td>; second parent is the <tr>
        $(this).parent().parent().remove();
    });

})