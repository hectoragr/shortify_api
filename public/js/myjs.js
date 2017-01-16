$(document).ready(function() {
    console.log( "ready!" );
    $("#shorten").submit(function(e) {
    	var url = '/api/shortify';

    	$.ajax({
           type: "POST",
           url: url,
           data: $("#shorten").serialize(), // serializes the form's elements.
           success: function(data)
           {
               console.log(data);
               $("#goto").html(data.shortUrl);
               $("#goto").attr("href", data.shortUrl);
               $(".result").fadeIn("slow");
           },
           error: function() {
           		alert("Something went wrong");
           }
         });

    e.preventDefault(); // avoid to execute the actual submit of the form.
    });
});