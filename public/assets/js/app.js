/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable linebreak-style */
/* eslint-disable func-names */

// To scrape articles
$('#scrape').on('click', () => {
  $.ajax({
    method: 'GET',
    url: '/scrape',
  }).done((data) => {
    // console.log(data);
    window.location = '/';
  });
});

// Navbar
$('.navbar-nav li').click(function () {
  $('.navbar-nav li').removeClass('active');
  $(this).addClass('active');
});

// To save the article
$('.save').on('click', function () {
  const thisId = $(this).attr('data-id');
  $.ajax({
    method: 'POST',
    url: `/articles/save/${thisId}`,
  }).done((data) => {
    window.location = '/';
  });
});

// To delete article
$('.delete').on('click', function () {
  const thisId = $(this).attr('data-id');
  $.ajax({
    method: 'POST',
    url: `/articles/delete/${thisId}`,
  }).done((data) => {
    window.location = '/saved';
  });
});

// To save the note
$('.saveNote').on('click', function () {
  const thisId = $(this).attr('data-id');
  if (!$(`#noteText${thisId}`).val()) {
    alert('please enter a note to save');
  } else {
    $.ajax({
      method: 'POST',
      url: `/notes/save/${thisId}`,
      data: {
        text: $(`#noteText${thisId}`).val(),
      },
    }).done((data) => {
      console.log(data);
      // Empty the section
      $(`#noteText${thisId}`).val('');
      $('.modalNote').modal('hide');
      window.location = '/saved';
    });
  }
});

// To delete the note
$('.deleteNote').on('click', function () {
  const noteId = $(this).attr('data-note-id');
  const articleId = $(this).attr('data-article-id');
  $.ajax({
    method: 'DELETE',
    url: `/notes/delete/${noteId}/${articleId}`,
  }).done((data) => {
    console.log(data);
    $('.modalNote').modal('hide');
    window.location = '/saved';
  });
});
