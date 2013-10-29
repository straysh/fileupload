;(function($){
	var uploader;
	var doc_leave_timer;
	var files;//drop files at one time
	var $el;//uploader container
	var opts = {
		files: [],
		files_count: 0,
		allowedfileextensions : [],
		allowedfiletypes : [],
		paramname: 'avatar[]',
		data: {},
		headers: {},
		requestType: 'POST',
		url: '/fileupload/upload.php',
		drop : empty,
		dragStart : empty,
		dragEnter : empty,
		dragOver : empty,
		dragLeave : empty,
		docEnter : empty,
		docOver : empty,
		docLeave : empty,
		uploadFinished: empty,
		error : function(err, file, i, status) {
			alert(err);
		},
	};
	
	uploader = {
		init: function(cfg){
			opts = $.extend(opts,cfg);
			if(!opts.$el)
				return false;
			$el = opts.$el;
			$el.on('drop', drop).on('dragstart', opts.dragStart).on('dragenter', dragEnter).on('dragover', dragOver).on('dragleave', dragLeave);
			return this;
		},
		upload: function(param){
			console.log('uploader.upload');
			upload(param);
			return this;
		},
	};
	
	function drop(e) {
		files = [];
		if (opts.drop.call(this, e) === false)
			return false;
		if (!e.dataTransfer)
			return false;
		var raw_files = e.dataTransfer.files;
		if (raw_files === null || raw_files === undefined || raw_files.length === 0) {
			opts.error(errors[0]);
			return false;
		}
		for(var i=0,f;f=raw_files[i];i++){
			files.push(f);
		}
		fileFilter();
		opts.files = opts.files.concat(files);//push files into global container opts.files
		opts.files_count = files.length;//re-calculate opts.files length
		e.preventDefault();
		return false;
	}
	
	function upload(param){
		opts.fdata = [];
		opts.data = $.extend(opts.data, param);
		for(var i=0,f;f=opts.files[i];i++){
			var reader = new FileReader();
			reader.onload = function(){
				opts.fdata.push(atob(this.result.split(',')[1]));
			};
			reader.readAsDataURL(f);
		}
		setTimeout(function(){
			send();
		},100);
	}
	
	function getBuilder(filename, filedata, mime, boundary) {
		var dashdash = '--',
			crlf = '\r\n',
			builder = '',
			paramname = opts.paramname;

		if (opts.data) {
			var params = $.param(opts.data).replace(/\+/g, '%20').split(/&/);

			$.each(params, function() {
				var pair = this.split("=", 2), name = decodeURIComponent(pair[0]), val = decodeURIComponent(pair[1]);

				if (pair.length !== 2) {
					return;
				}

				builder += dashdash;
				builder += boundary;
				builder += crlf;
				builder += 'Content-Disposition: form-data; name="' + name + '"';
				builder += crlf;
				builder += crlf;
				builder += val;
				builder += crlf;
			});
		}

		if (jQuery.isFunction(paramname)) {
			paramname = paramname(filename);
		}

		builder += dashdash;
		builder += boundary;
		builder += crlf;
		builder += 'Content-Disposition: form-data; name="' + (paramname || "") + '"';
		builder += '; filename="' + filename + '"';
		builder += crlf;

		builder += 'Content-Type: ' + mime;
		builder += crlf;
		builder += crlf;

		builder += filedata;
		builder += crlf;

		builder += dashdash;
		builder += boundary;
		builder += dashdash;
		builder += crlf;
		return builder;
	}
	
	function send() {

		var xhr = new XMLHttpRequest(),
			upload = xhr.upload,
			start_time = new Date().getTime(),
			boundary = '------multipartformboundary' + (new Date()).getTime(),
			builder='';
			//newName = rename(file.name), 

		if (opts.withCredentials) {
			xhr.withCredentials = opts.withCredentials;
		}

		for(var i=0,f;f=opts.files[i];i++){
			builder += getBuilder(f.name, opts.fdata[i], f.type, boundary);
		}

//		upload.index = index;
//		upload.file = file;
//		upload.downloadStartTime = start_time;
//		upload.currentStart = start_time;
//		upload.currentProgress = 0;
//		upload.global_progress_index = global_progress_index;
//		upload.startData = 0;
		//upload.addEventListener("progress", progress, false);

		// Allow url to be a method
		if (jQuery.isFunction(opts.url)) {
			xhr.open(opts.requestType, opts.url(), true);
		} else {
			xhr.open(opts.requestType, opts.url, true);
		}

		xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

		// Add headers
		$.each(opts.headers, function(k, v) {
			xhr.setRequestHeader(k, v);
		});

		xhr.sendAsBinary(builder);

		xhr.onload = function() {
			var serverResponse = null;

			if (xhr.responseText) {
				try {
					serverResponse = jQuery.parseJSON(xhr.responseText);
				} catch (e) {
					serverResponse = xhr.responseText;
				}
			}

			var now = new Date().getTime(),
				timeDiff = now - start_time,
				result = opts.uploadFinished(serverResponse, timeDiff, xhr);

//			afterAll();

			// Pass any errors to the error option
			if (xhr.status < 200 || xhr.status > 299) {
				opts.error(xhr.statusText, file, fileIndex, xhr.status);
			}
		};
	};
	
	function fileFilter(){
		if (!files.length) {
			opts.error(errors[0]);
			return false;
		}

		if (opts.allowedfiletypes.push && opts.allowedfiletypes.length) {
			for ( var fileIndex = files.length; fileIndex--;) {
				if (!files[fileIndex].type || $.inArray(files[fileIndex].type, opts.allowedfiletypes) < 0) {
					opts.error(errors[3], files[fileIndex]);
					files.splice(fileIndex,1);
				}
			}
		}

		if (opts.allowedfileextensions.push && opts.allowedfileextensions.length) {
			for ( var fileIndex = files.length; fileIndex--;) {
				var allowedextension = false;
				for (i = 0; i < opts.allowedfileextensions.length; i++) {
					if (files[fileIndex].name.substr(files[fileIndex].name.length - opts.allowedfileextensions[i].length) == opts.allowedfileextensions[i]) {
						allowedextension = true;
					}
				}
				if (!allowedextension) {
					opts.error(errors[8], files[fileIndex]);
					files.splice(fileIndex,1);
				}
			}
		}
	}
	
	function dragEnter(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.dragEnter.call(this, e);
	}

	function dragOver(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docOver.call(this, e);
		opts.dragOver.call(this, e);
	}

	function dragLeave(e) {
		clearTimeout(doc_leave_timer);
		opts.dragLeave.call(this, e);
		e.stopPropagation();
	}

	function docDrop(e) {
		e.preventDefault();
		opts.docLeave.call(this, e);
		return false;
	}

	function docEnter(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docEnter.call(this, e);
		return false;
	}

	function docOver(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docOver.call(this, e);
		return false;
	}

	function docLeave(e) {
		doc_leave_timer = setTimeout((function(_this) {
			return function() {
				opts.docLeave.call(_this, e);
			};
		})(this), 200);
	}
	
	function empty(){
		;
	}
	
	jQuery.event.props.push("dataTransfer");
	$.uploader = uploader;
	
})(jQuery);
try {
	if (XMLHttpRequest.prototype.sendAsBinary) {
		;
	}else{
		XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
			function byteValue(x) {
				return x.charCodeAt(0) & 0xff;
			}
			var ords = Array.prototype.map.call(datastr, byteValue);
			var ui8a = new Uint8Array(ords);
			
			// Not pretty: Chrome 22 deprecated sending ArrayBuffer, moving
			// instead
			// to sending ArrayBufferView. Sadly, no proper way to detect this
			// functionality has been discovered. Happily, Chrome 22 also
			// introduced
			// the base ArrayBufferView class, not present in Chrome 21.
			if ('ArrayBufferView' in window)
				this.send(ui8a);
			else
				this.send(ui8a.buffer);
		};
	}
} catch (e) {
	;
}