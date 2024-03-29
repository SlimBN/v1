/*!
 * medium-editor-insert-plugin v0.1.1 - jQuery insert plugin for MediumEditor
 *
 * Images Addon
 *
 * https://github.com/orthes/medium-editor-images-plugin
 *
 * Copyright (c) 2013 Pavel Linkesch (http://linkesch.sk)
 * Released under the MIT license
 */

(function ($) {

  $.fn.mediumInsert.registerAddon('images', {

    /**
    * Images initial function
    * @return {void}
    */

    init: function (options) {
      if (options && options.$el) {
        this.$el = options.$el;
      }
      this.options = $.extend(this.default, options);

      this.setImageEvents();
      this.setDragAndDropEvents();
      this.preparePreviousImages();
    },


    insertButton: function(buttonLabels){
      var label = '<i class="fa fa-picture-o"></i><br>Image';
      if (buttonLabels == 'fontawesome') {
        label = '<i class="fa fa-picture-o"></i>';
      }
      return '<button data-addon="images" data-action="add" class="medium-editor-action medium-editor-action-image mediumInsert-action">'+label+'</button>';
    },

    /**
    * Images default options
    */

    default: {
      imagesUploadScript: 'upload.php',
      formatData: function (file) {
        var formData = new FormData();
        formData.append('file', file);
        return formData;
      }
    },

    /**
    * Make existing images interactive
    */
    preparePreviousImages: function () {
      this.$el.find('.mediumInsert-images').each(function() {
        var $parent = $(this).parent();
        $parent.html('<div class="mediumInsert-placeholder" draggable="true">' + $parent.html() + '</div>');
      });
    },

    /**
    * Add image to placeholder
    * @param {element} $placeholder Placeholder to add image to
    * @return {element} $selectFile <input type="file"> element
    */

    add: function ($placeholder) {
      var that = this,
          $selectFile, files;

      $selectFile = $('<input type="file">').click();
      $selectFile.change(function () {
        files = this.files;
        that.uploadFiles($placeholder, files, that);
      });

      $.fn.mediumInsert.insert.deselect();

      return $selectFile;
    },

    /**
    * Update progressbar while upload
    * @param {event} e XMLHttpRequest.upload.onprogress event
    * @return {void}
    */

    updateProgressBar: function (e) {
      var $progress = $('.progress:first', this.$el),
          complete;

      if (e.lengthComputable) {
        complete = (e.loaded / e.total * 100 | 0);
        $progress.attr('value', complete);
        $progress.html(complete);
      }
    },

    /**
    * Show uploaded image after upload completed
    * @param {jqXHR} jqxhr jqXHR object
    * @return {void}
    */

    uploadCompleted: function (jqxhr, $placeholder) {
      var $progress = $('.progress:first', $placeholder),
          $img;

      $progress.attr('value', 100);
      $progress.html(100);

      $progress.before('<div class="mediumInsert-images"><img src="'+ jqxhr.responseText +'" draggable="true" alt=""></div>');
      $img = $progress.siblings('img');
      $progress.remove();

      $img.load(function () {
        $img.parent().mouseleave().mouseenter();
      });

      $.fn.mediumInsert.insert.$el.keyup();
    },

    /**
    * Upload single file
    *
    * @param {element} $placeholder Placeholder to add image to
    * @param {File} file File to upload
    * @param {object} that Context
    * @param {void}
    */

    uploadFile: function ($placeholder, file, that) {
      $.ajax({
        type: "post",
        url: that.options.imagesUploadScript,
        xhr: function () {
          var xhr = new XMLHttpRequest();
          xhr.upload.onprogress = that.updateProgressBar;
          return xhr;
        },
        cache: false,
        contentType: false,
        complete: function (jqxhr) {
          that.uploadCompleted(jqxhr, $placeholder);
        },
        processData: false,
        data: that.options.formatData(file)
      });
    },

    /**
    * Lopp though files, check file types and call uploadFile() function on each file that passes
    * @param {element} placeholder Placeholder to add image to
    * @param {FileList} files Files to upload
    * @param {object} that Context
    * @return {void}
    */

    uploadFiles: function ($placeholder, files, that) {
      var acceptedTypes = {
        'image/png': true,
        'image/jpeg': true,
        'image/gif': true
      };

      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (acceptedTypes[file.type] === true) {
          $placeholder.append('<progress class="progress" min="0" max="100" value="0">0</progress>');

          that.uploadFile($placeholder, file, that);
        }
      }
    },

    /**
    * Set image events displaying remove and resize buttons
    * @return {void}
    */

    setImageEvents: function () {
      this.$el.on('mouseenter', '.mediumInsert-images', function () {
        var $img = $('img', this),
            positionTop,
            positionLeft;

        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        if ($img.length > 0) {
          $(this).append('<a class="mediumInsert-imageRemove"><i class="fa fa-trash-o"></i></a>');

          // if ($(this).parent().parent().hasClass('small-left')) {
          //   $(this).append('<a class="mediumInsert-imageResizeBigger"><i class="fa fa-arrow-circle-o-right"></i></a>');
          // } else {
          //   $(this).append('<a class="mediumInsert-imageResizeSmaller"><i class="fa fa-arrow-circle-o-left"></i></a>');
          // }

          $(this).append('<a class="mediumInsert-imageSetRight"><i class="fa fa-arrow-circle-o-right"></i></a>');

          $(this).append('<a class="mediumInsert-imageSetLeft"><i class="fa fa-arrow-circle-o-left"></i></a>');

          $(this).append('<a class="mediumInsert-imageSetCenter"><i class="fa fa-arrows-alt"></i></a>');

          positionTop = $img.position().top + parseInt($img.css('margin-top'), 10);
          positionLeft = $img.position().left + $img.width() -30;
          $('.mediumInsert-imageRemove', this).css({
            'right': 'auto',
            'top': positionTop,
            'left': positionLeft
          });

          // $('.mediumInsert-imageResizeBigger, .mediumInsert-imageResizeSmaller', this).css({
          //   'right': 'auto',
          //   'top': positionTop,
          //   'left': positionLeft-31
          // });

          $('.mediumInsert-imageSetRight', this).css({
            'right': 'auto',
            'top': positionTop,
            'left': positionLeft-31
          });

          $('.mediumInsert-imageSetLeft', this).css({
            'right': 'auto',
            'top': positionTop,
            'left': positionLeft-93
          });

          $('.mediumInsert-imageSetCenter', this).css({
            'right': 'auto',
            'top': positionTop,
            'left': positionLeft-62
          });
        }
      });

      this.$el.on('mouseleave', '.mediumInsert-images', function () {
        $('.mediumInsert-imageRemove, .mediumInsert-imageSetLeft, .mediumInsert-imageSetRight, .mediumInsert-imageSetCenter', this).remove();
      });

      this.$el.on('click', '.mediumInsert-imageSetLeft', function () {
        $(this).parent().parent().parent().removeClass('small-right');
        $(this).parent().parent().parent().removeClass('small-center');
        $(this).parent().parent().parent().addClass('small-left');
        $(this).parent().mouseleave().mouseleave();

        $.fn.mediumInsert.insert.deselect();
      });

      this.$el.on('click', '.mediumInsert-imageSetRight', function () {
        $(this).parent().parent().parent().removeClass('small-left');
        $(this).parent().parent().parent().removeClass('small-center');
        $(this).parent().parent().parent().addClass('small-right');
        $(this).parent().mouseleave().mouseleave();

        $.fn.mediumInsert.insert.deselect();
      });

      this.$el.on('click', '.mediumInsert-imageSetCenter', function () {
        $(this).parent().parent().parent().removeClass('small-left');
        $(this).parent().parent().parent().removeClass('small-right');
        $(this).parent().parent().parent().addClass('small-center');
        $(this).parent().mouseleave().mouseleave();

        $.fn.mediumInsert.insert.deselect();
      });

      this.$el.on('click', '.mediumInsert-imageResizeBigger', function () {
        $(this).parent().parent().parent().removeClass('small-left');
        $(this).parent().mouseleave().mouseleave();

        $.fn.mediumInsert.insert.deselect();
      });

      this.$el.on('click', '.mediumInsert-imageRemove', function () {
        if ($(this).parent().siblings().length === 0) {
          $(this).parent().parent().parent().removeClass('small-left');
        $(this).parent().parent().parent().removeClass('small-right');
        }
        $(this).parent().remove();

        $.fn.mediumInsert.insert.deselect();
      });
    },

    /**
    * Set drag and drop evnets
    * @return {void}
    */

    setDragAndDropEvents: function () {
      var that = this,
          dropSuccessful = false,
          dropSort = false,
          dropSortIndex, dropSortParent;

      $(document).on('dragover', 'body', function () {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        $(this).addClass('hover');
      });

      $(document).on('dragend', 'body', function () {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        $(this).removeClass('hover');
      });

      this.$el.on('dragover', '.mediumInsert', function () {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        $(this).addClass('hover');
        $(this).attr('contenteditable', true);
      });

      this.$el.on('dragleave', '.mediumInsert', function () {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        $(this).removeClass('hover');
        $(this).attr('contenteditable', false);
      });

      this.$el.on('dragstart', '.mediumInsert .mediumInsert-images img', function (e) {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        dropSortIndex = $(this).parent().index();
        dropSortParent = $(this).parent().parent().parent().attr('id');
      });

      this.$el.on('dragend', '.mediumInsert .mediumInsert-images img', function (e) {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        if (dropSuccessful === true) {
          if ($(e.originalEvent.target.parentNode).siblings().length === 0) {
            $(e.originalEvent.target.parentNode).parent().parent().removeClass('small-left');
          }
          $(e.originalEvent.target.parentNode).mouseleave();
          $(e.originalEvent.target.parentNode).remove();
          dropSuccessful = false;
          dropSort = false;
        }
      });

      this.$el.on('dragover', '.mediumInsert .mediumInsert-images img', function (e) {
        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        e.preventDefault();
      });

      this.$el.on('drop', '.mediumInsert .mediumInsert-images img', function (e) {
        var index, $dragged, finalIndex;

        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }


        if (dropSortParent !== $(this).parent().parent().parent().attr('id')) {
          dropSort = false;
          dropSortIndex = dropSortParent = null;
          return;
        }

        index = parseInt(dropSortIndex, 10);

        // Sort
        $dragged = $(this).parent().parent().find('.mediumInsert-images:nth-child('+ (index+1) +')');
        finalIndex = $(this).parent().index();
        if(index < finalIndex) {
          $dragged.insertAfter($(this).parent());
        } else if(index > finalIndex) {
          $dragged.insertBefore($(this).parent());
        }

        $dragged.mouseleave();

        dropSort = true;
        dropSortIndex = null;
      });

      this.$el.on('drop', '.mediumInsert', function (e) {
        var files;

        e.preventDefault();

        if ($.fn.mediumInsert.settings.enabled === false) {
          return;
        }

        $(this).removeClass('hover');
        $('body').removeClass('hover');
        $(this).attr('contenteditable', false);

        files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
          // File upload
          that.uploadFiles($('.mediumInsert-placeholder', this), files, that);
        } else if (dropSort === true) {
          dropSort = false;
        } else {
          // Image move from block to block
          $('.mediumInsert-placeholder', this).append('<div class="mediumInsert-images">'+ e.originalEvent.dataTransfer.getData('text/html') +'</div>');
          $('meta', this).remove();
          dropSuccessful = true;
        }
      });
    }
  });
}(jQuery));