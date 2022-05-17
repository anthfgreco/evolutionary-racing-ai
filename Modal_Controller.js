$(function() {
    $("#modal").each(function() {
        var pages = $(this).find('.modal-split');

        pages.hide();
        pages.eq(0).show();

        var page_track = 0;
        var next_button = "#next-button";
        var prev_button = "#previous-button";

        // Hide previous button at first page
        if (page_track == 0) {
            $(prev_button).hide();
        }

        // Next button is clicked
        $(next_button).on("click", function() {
            // Show previous button on second page
            if (page_track == 0) {
                $(prev_button).show();
            }
            
            // Change text of next button to "Finish" on last page
            if (page_track == pages.length-2) {
                $(next_button).text("Finish");
            }

            // If "Finish" is pressed on last page, close modal
            if (page_track == pages.length-1) {
                $(next_button).addClass("uk-modal-close");
            }

            // If "Next" is pressed, go to next page
            if (page_track < pages.length-1) {
                $(next_button).removeClass("uk-modal-close");
                page_track++;
                pages.hide();
                pages.eq(page_track).show();
            }
        });

        // Previous button is clicked
        $(prev_button).on("click", function() {
            // Hide previous button on first page
            if (page_track == 1) {
                $(prev_button).hide();
            }

            // Change text of next button from "Finish" to "Next" going from last to second last page
            if (page_track == pages.length-1) {
                $(next_button).text("Next");
            }

            // If "Previous" is pressed, go to previous page
            if (page_track > 0) {
                page_track--;
                pages.hide();
                pages.eq(page_track).show();
            }
        });
    });
});