$(document).ready(function () {

    // implement editor
    window.m1 = $('textarea#content').meltdown({
        openPreview: true,
        previewHeight: "editorHeight",
    });

    // Variables
    var d = new Date(),
        month = d.getMonth() + 1,
        day = d.getDate(),
        date = d.getFullYear() + '-' + (('' + month).length < 2 ? '0' : '') + month + '-' + (('' + day).length < 2 ? '0' : '') + day,
        time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(),
        title = $('input#title').val(),
        type = $('input:radio[name=type]:checked').val();

    // hide result container
    $('.result').slideUp();

    // add characters counters
    $('#title').charCounter(55);
    $('#desc').charCounter(115);

    // show and hide type containers accordingly
    if (type == "post") {
        $('.post').slideDown();
    } else {
        $('.post').slideUp();
    }
    if (type == "page") {
        $('.page').slideDown();
    } else {
        $('.page').slideUp();
    }

    // type containers on click
    $('input:radio[name=type]').click(function () {
        var type = $('input:radio[name=type]:checked').val();

        if (type == "post") {
            $('.post').slideDown();
        } else {
            $('.post').slideUp();
        }
        if (type == "page") {
            $('.page').slideDown();
        } else {
            $('.page').slideUp();
        }
    });

    // title or URL title
    $('input:radio[name=title-check]').yesOrNo('.url-title', 'no');

    // header pic based on header
    $('input:radio[name=page-header]').yesOrNo('.page-header-pic', 'yes');

    // menu display
    $('input:radio[name=menudisplay]').yesOrNo('.menudisplay', 'yes');

    // Click on generater will generate front matter
    $('.generatefile').click(function () {
        // show result
        $('.result').slideDown();

        // remove everything that was in any of the containers before
        $('#inputTextToSave').empty();
        $('.warn').empty();
        $('.msg').empty();

        // starting front-matter
        frontMatter('', '', '---');

        // title
        $('input#title').frontMatter('Set a title!', 'title');

        // subtitle
        $('input#subtitle').frontMatter('', 'subtitle');

        // add warning if URL title is selected but empty
        if ($('input:radio[name=title-check]:checked').val() == "yes") {
            if ($('input#url').val() == '') {
                $('.warn').append('Add URL title');
            }
        }

        // description
        $('textarea#desc').frontMatter('include meta description', 'description');

        // tags
        $('input#tags').frontMatter('', 'tags', 'array');

        // variables for each type
        var type = $('input:radio[name=type]:checked').val();

        if (type == "post") {
            // author
            $('input#author').frontMatter('include author!', 'author');

            // featured image
            $('input#header-pic').frontMatter('Include Featured Image', 'header-pic');

            // final mesage about file location
            var urlTitle = $('input:radio[name=title-check]:checked').val();

            if (urlTitle == "no") {
                var fileNameToSaveAs = createURL(date + ' ' + title + '.md');
            } else {
                var fileNameToSaveAs = createURL(date + ' ' + $('input#url').val() + '.md');
            }
            
            $('.msg').append('<p>Save this to <code>_posts</code to publish. (file name will be: "'+ fileNameToSaveAs +'"</p>');
        }

        if (type == "page") {
            var pageHeader = $('input:radio[name=page-header]:checked').val();

            // if header is set to yes, header image is required, otherwise add 'header: no' in front matter
            if (pageHeader == "yes") {
                $('input#page-header-pic').frontMatter('include header image!', 'header-pic');
            } else {
                $('#inputTextToSave').append('header: no\n');
            }

            // add group variable if it has to be displayed in menu
            var menuDisplay = $('input:radio[name="menudisplay"]:checked').val(),
                menuOrder = $('input#menudisplay-order').val();

            if (menuOrder == '') {
                var menuVal = '';
            } else {
                var menuVal = '"navigation-' + pad(menuOrder, 2) + '"';
            }

            if (menuDisplay == "yes") {
                frontMatter('include Menu Order Number!', 'group', menuVal);
            }

            // saving information
            $('.msg').append('<p>Save this into a folder named after your title (or URL title) (file name itself is "index.md").</p>');
        }

        // ending front matter
        frontMatter('', '', '---');

        // add content
        frontMatter('', '', $('textarea#content').val());

        // if any warning is displayed, hide the results
        if ($(".warn").text().length > 0) {
            $('.result').slideUp();
        } else {
            $('.result').slideDown();
        }

        // set results to automatic height
        $(".result textarea").height($(".result textarea")[0].scrollHeight);
    });
});

// functions

function createURL(string){
    value = string.replace(/\s+/g, '-').toLowerCase();
    value = value.replace(/\u00e4/g, 'ae');
    value = value.replace(/\u00f6/g, 'oe');
    value = value.replace(/\u00fc/g, 'ue');
    return value;
}

// prefix numbers with 0s
function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

// front matter function, use when value is short and easy
function frontMatter(warn, front, val) {
    $('#inputTextToSave').append(
        function () {
            if (val == '') {
                $('.warn').append('<p>' + warn + '<\p>');
            } else {
                if (front != '') {
                    $('#inputTextToSave').append(front + ': ' + val + '\n');
                } else {
                    $('#inputTextToSave').append(val + '\n');
                }
            }
        }
    );
}

// plugins

(function ($) {
    // hide input based on yes or no radio button
    $.fn.yesOrNo = function (optionalContainer, defaultValue) {
        return this.each(function () {
            var elem = $(this);

            if (defaultValue == 'no') {
                $(optionalContainer).slideUp();
            } else {
                $(optionalContainer).slideDown();
            }

            elem.click(function () {
                if (elem.is(':checked')) {
                    var value = elem.val();
                }

                if (value == "yes") {
                    $(optionalContainer).slideDown();
                } else {
                    $(optionalContainer).slideUp();
                }
            });
        });
    };

    // front matter with longer value, in complexer cases
    $.fn.frontMatter = function (warn, front, array) {
        var val = this.val();

        if (!array) {
            array = null;
        }

        $('#inputTextToSave').append(
            function () {
                if (val == '') {
                    $('.warn').append('<p>' + warn + '<\p>');
                } else {
                    if (array == null && front != '' && val != '') {
                        $('#inputTextToSave').append(front + ': ' + val + '\n');
                    }
                    if (array != null && front != '' && val != '') {
                        $('#inputTextToSave').append(front + ': [' + val + ']\n');
                    }
                }
            }
        );
        return this;
    };

    // character counter, adds a character counter
    $.fn.charCounter = function (count) {
        var counterClass = 'count',
            counterElementClass = 'counter',
            counterText = 'Characters remaining',
            counterID = this.attr('id') + '-' + counterElementClass;

        // add counter elements
        this.after('<p class="' + counterClass + '"><span id="' + counterID + '" class="' + counterElementClass + '"></span> ' + counterText + '</p>');

        $('#' + counterID).text(count - this.val().length); //initial value of characters
        var id = $('.' + counterElementClass).attr('id');

        this.keyup(function () { //user releases a key on the keyboard
            var thisChars = this.value.replace(/{.*}/g, '').length; //get chars count in textarea
            $('#' + counterID).text(count - thisChars); //count remaining chars
        });
        return this;
    };

}(jQuery));

// save file
function saveTextAsFile() {
    var d = new Date(),
        month = d.getMonth() + 1,
        day = d.getDate(),
        date = d.getFullYear() + '-' + (('' + month).length < 2 ? '0' : '') + month + '-' + (('' + day).length < 2 ? '0' : '') + day,
        title = $('input#title').val();

    // filename
    // show and hide type containers accordingly
    var type = $('input:radio[name=type]:checked').val();
    if (type == "post") {
        var urlTitle = $('input:radio[name=title-check]:checked').val();

        if (urlTitle == "no") {
            var fileNameToSaveAs = createURL(date + ' ' + title + '.md');
        } else {
            var fileNameToSaveAs = createURL(date + ' ' + $('input#url').val() + '.md');
        }
    }

    if (type == "page") {
        var fileNameToSaveAs = 'index.md';
    }

    var textToWrite = document.getElementById("inputTextToSave").value;
    var textFileAsBlob = new Blob([textToWrite], {});
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}
