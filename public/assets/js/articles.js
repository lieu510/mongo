// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
    $("#scrape").on("click", function(event) {

        $.get("/api/articles", function(data) {
            console.log(data);
            
            location.assign("/");
        });
    });

    $(document).on("click", ".save", function(event) {
        var id = $(this).data("id");

        $.post("/api/articles/" + id, function(data) {
            console.log(data);

            location.assign("/");
        });
    });

    // $("#saved").on("click", function(event) {
    //     $.get("/api/saved", function(data) {
    //         console.log(data);
        
    //         location.assign("/");    
    //     });
    // });

    $(document).on("click", ".remove", function(event) {
        var id = $(this).data("id");

        $.ajax("/api/articles/" + id,{type:"DELETE"}, function(data) {
            console.log(data);

            location.reload();
        });
    });
});
