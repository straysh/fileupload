;(function($){
	var uploader;
	var $el;
	var config = {
		$el: $el,
		prompt: {default:'头像拖拽到此'},
		tip_area: null,
		file: null,
		uploadNum: 0,
		reciveNum: 0,
	};
	
	uploader = {
		init: function(cfg){
			config = $.extend(config,cfg);
			if(config.$el===undefined)
				return false;
			$el = config.$el;
			prepareUploder();
			//clear show area
			$('#avatarArea').siblings().remove();
			config.show_area = $('<div id="show_area" class="row"></div>');
			config.filelists = $('<ul id="list" style="block"></ul>');
			$el[0].addEventListener('dragover', handleDragOver, false);
			$el[0].addEventListener('drop', handleFileSelect, false);
			
			//upload
			$('#start_upload').click(function(e){
				e.preventDefault();
				if(/*$('#upload').find('img').width()>150 &&*/ confirm('头像宽高超过150像素，上传后头像会被截取，确定上传？')){
					$('#album-clbt-form').submit();return true;
					upload(config.file);
/*					var fileInput = $('<input type="file" name="avatar[]" value="'+config.file+'" multiple />');
//					fileInput.val(config.file);
					$('#album-clbt-form').append(fileInput);
					$('#album-clbt-form').submit();*/
				}
			});
		},
	};
	
	function prepareUploder()
	{
		var con = $('<div class="avatarArea" id="avatarArea"></div>')
		var prompt = con.append('<div id="tip_dialog">'+config.prompt.default+'</div>');
//		con.css({textAlign:'center'});//, lineHeight:con.height()+'px'
		con.css({width:'150px',height:'150px',overflow:'hidden'});
		$el.append(con);
	}
	
	function handleDragOver(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}
	
	function handleFileSelect(evt) {
		var ul = config.filelists;
		ul.detach();
		evt.stopPropagation();
	    evt.preventDefault();
	    var files = evt.dataTransfer.files; // FileList object.
	    // files is a FileList of File objects. List some properties.
	    if(files.length<1)
	    	return;
	    reader = new FileReader();
	    reader.onload = function(){
	    	$el.find('#avatarArea').empty().append('<img src="'+this.result+'" />');
	    }
	    reader.readAsDataURL(files[0]);
//	    config.file = files[0];
	    
	    var reader2 = new FileReader();
	    reader2.onload = function(){
	    	config.file = this.result;
	    }
	    reader2.readAsBinaryString(files[0]);
	    
	    return;
	    for (var i = 0, f; f = files[i]; i++) {
	      	reader = new FileReader(),
			reader.onload = (function (theFile, i) {
				return function (e) {
					var img = '<div class="img"><img class="thumb" src="' + e.target.result + '" title="' + theFile.name + '"/></div>';
					addTOFileList(theFile, i, img);
/*					var ul_html = config.filelists;
					if(ul_html!=null)
					{
						document.getElementById('show_area').style.display = 'block';
						source[i] = e.target.result;
						//get_source(source);
						upload_btn();
					}*/
				};
			})(f, i)
			reader.readAsDataURL(f);
	    }
	    config.uploadNum = files.length;
	    config.reciveNum += config.uploadNum;
	    //var flag = $el.find('#tip_dialog').html().match(/\d/);
	    $el.append(ul.show());
	    $el.find('#tip_dialog').html('本次拖拽 <a class="num">'+config.uploadNum+'</a> 张图片<br/>共'+config.reciveNum+'张图片等待上传。');
	}
	
    function addTOFileList(f, i, img) {
    	var li = $('<li class="li_area"></li>');
    	li.append('<input type="radio" class="radio mark'+i+'" name="mark" onclick="setval(this)" value="" />');
    	li.append(img);
    	li.append($('<div id="middle"></div>')
    			.append('<div class="title"><p>'+f.name+' ('+f.type+')</p></div>')
    			.append('<div class="intro"><div class="intro_word">简介：</div><textarea class=text'+i+'></textarea></div>'));
    	var tips = (f.size/1024/1024).toFixed(1)>5 ? '文件大小超过上传限制' : '等待上传';
    	li.append($('<div class="load_row"></div>')
    			.append('<div class="size size'+i+'">'+(f.size/1024).toFixed(1)+' K</div>')
    			.append('<div class="loading loaded'+i+'">'+tips+'</div>'));
    	li.append($('<div id="del_btn" onclick="del_btn(this)"><input type="button" value="删除"/></div>'));
    	config.filelists.append(li);
    };
    
    function upload(f){
    	(function(f){
    		var _data = {};
    		_data.avatar = f;
    		$.ajax({
    			url: '/fileupload/upload.php',
    			type: 'post',
//    			dataType: 'json',
    			contentType:"multipart/form-data; boundary=-------------",
    			data: _data,
    			beforesend: function(xhr){
    				var xhr = jQuery.ajaxSettings.xhr(); xhr.send = xhr.sendAsBinary; return xhr;
    			},
//    			headers: {},
    			success: function(data){
    				
    			},
    		});
    	})(f);
    }
    
    function upload2(f){
    	(function(f){
    		var xhr = new XMLHttpRequest();
    		if(xhr.upload){
    			xhr.onreadystatechange = function(e){
    				if(xhr.readyState==4){
    					if(xhr.status==200){
    						//console.log(xhr.responseText);
    					}else{
    						//console.log(xhr.responseText);
    					}
    				}
    			};
    			xhr.open('POST', '/fileupload/upload.php', true);
    			xhr.setRequestHeader("X_FILENAME", "avatar");
    			xhr.send(f);
    		}
    	})(f);
    }
	
	$.avatarUpload = uploader;
})(jQuery);