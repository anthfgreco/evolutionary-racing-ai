// Controls modal interactivity
$(function () {
  var modal = UIkit.modal("#modal");
  var page_track = 0;
  var next_button = "#next-button";
  var prev_button = "#previous-button";

  // Show modal and hide previous button on startup
  //modal.show();
  $(prev_button).hide();

  $("#modal").each(function () {
    var pages = $(this).find(".modal-split");

    pages.hide();
    pages.eq(0).show();

    update_page_number(page_track, pages.length);

    // "Next" button is clicked
    $(next_button).on("click", function () {
      // Show "Previous" button on second page
      if (page_track == 0) {
        $(prev_button).show();
      }

      // Change text of "Next" button to "Finish" on last page
      if (page_track == pages.length - 2) {
        $(next_button).text("Finish");
      }

      // If "Finish" button is pressed on last page, close modal
      if (page_track == pages.length - 1) {
        modal.hide();
      }

      // If "Next" is pressed, go to next page
      if (page_track < pages.length - 1) {
        page_track++;
        pages.hide();
        pages.eq(page_track).show();
      }

      update_page_number(page_track, pages.length);
    });

    // "Previous" button is clicked
    $(prev_button).on("click", function () {
      // Hide "Previous" button on first page
      if (page_track == 1) {
        $(prev_button).hide();
      }

      // Change text of "Next" button from "Finish" to "Next" going from last to second last page
      if (page_track == pages.length - 1) {
        $(next_button).text("Next");
      }

      // If "Previous" button is pressed, go to previous page
      if (page_track > 0) {
        page_track--;
        pages.hide();
        pages.eq(page_track).show();
      }

      update_page_number(page_track, pages.length);
    });

    function update_page_number(x, y) {
      let str = String(x + 1) + "/" + String(y);
      $("#page_number").html(str);
    }
  });
});
