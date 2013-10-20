;$().ready(function(){
	var config = {};
	var $el = null;
	
	function init(){
		config = {
				url: '/index.php?r=albumclbt/create',
				default:{style: {width:'150px',height:'150px'}},//默认头像大小
				prompt: {
					default: '图片拖拽到此',
				},
				uploadBtn: $('#start_upload'),
				picNum: 0,//本次拖拽的文件数
				picTotal: 0,//总共等待上传的文件数
				multi: false,//false为但文件上传，true为文件上传
				removed: [],//被删除文件的索引
				error: [],//上传的图片有错误
				done: [],//长传成功的文件名
				allowedfiletypes: ['image/jpeg','image/png','image/gif'],
				allowedfileextensions: ['.jpg','.jpeg','.gif'],
			    error: function(err, file) {
			        switch(err) {
			            case 1: handleError(file, 1, 'browser does not support HTML5 drag and drop');break;
			            case 2: handleError(file, 2, 'too many files');break;
			            case 3: handleError(file, 3, 'file too large');break;
			            case 4: handleError(file, 4, 'file type not allowed');break;
			            case 5: handleError(file, 5, 'file ext not allowed');break;
			            default: handleError(file, 0, 'unkown error'); break;
			        }
			    },
			};
		$el = $('#upload');//上传组件的容器
		config.$el = $el;
	}
	
	function prepareUploader()
	{
		var dropzone = $('<div class="avatarArea" id="avatarArea"></div>')
		var promptDialog = $('<div id="tip-dialog">'+config.prompt.default+'</div>');
		dropzone.append(promptDialog)
			.css({width:'150px',height:'150px',overflow:'hidden'});
		config.dropzone = dropzone;
		config.promptDialog = promptDialog;
		$el.append(dropzone);
	}
	
	//图片预览区域 n 为等待上传的文件总数
	function prepareShowArea(n){
		config.multi = n>1;
		config.multi = true;
		if(!config.multi){
			//单文件上传时，dropzone作为预览区
//			config.showarea = config.dropzone;
//			config.dropzone.toggleClass('avatarArea').toggleClass('avatarArea-view');
		}else{
			config.showarea = $('<ul id="showarea" class="showarea"></ul>');
			$el.append(config.showarea);
		}
	}
	
	function prepareTipDialog()
	{
		var prompt = '<div id="tip-dialog">'+config.prompt.default;
		if(config.picNum>0)
			prompt += '<br/>本次上传'+config.picNum+'张图片'; 
		if(config.picNum>0 || config.picTotal)
			prompt += '<br/>共'+config.picTotal+'张图片等待上传';
		prompt += '</div>';
		return $(prompt);
	}
	
	function prepareProgressBar(i)
	{
		if(config.progressBar===undefined)
			config.progressBar = [];
		config.progressBar[i] = config.showarea.find('.showarea-li-progresscon:eq('+i+')');
	}
	
	//还原dropzone
	function revertDropzone(){
		config.dropzone.addClass('avatarArea').removeClass('avatarArea-view');
		//config.dropzone.siblings().remove();
		config.dropzone.empty().append(config.promptDialog);
	}
	
	//刷新dropzone
	function refreshDropzone()
	{
		config.promptDialog = prepareTipDialog();
		revertDropzone();
	}
	
	var template = '<li class="showarea-li"> \
					<input type="checkbox" name="opt_img" onclick="$(this).quickLookAndCut()" /> \
					<div {imgConStyle} class="showarea-li-imgcon">{img}</div> \
					<div class="showarea-li-progresscon"><span class="percent" ></span></div> \
					<a class="showarea-li-remove" onclick="$(this).quickRemove()" >删除</a> \
				</li>';
	function createImageLi(imgEleStr){
		return template.replace('{img}', imgEleStr)
			.replace('{imgConStyle}', 'style="width:'+config.default.style.width+';height:'+config.default.style.height+';"');
	}
	
	$.fn.quickLookAndCut = function(){
		if($(this).is(':checked')){
			config.promptDialog = prepareTipDialog();
			config.dropzone.empty().append('<img src="'+$(this).parent().find('img').attr('src')+'" />');
			config.dropzone.removeClass('avatarArea').addClass('avatarArea-view');
		}else{
			revertDropzone();
		}
	}
	
	//删除按钮触发
	$.fn.quickRemove = function(){
		var pos = arguments[0];
		if(pos===undefined || pos==='img'){
			config.removed.push($(this).parent().index());
			$(this).parent().remove();
		}else if(pos==='li'){
			config.removed.push($(this).index());
			$(this).remove();
		}
		
		config.picTotal--;
		refreshDropzone();
	}
	
	function handleError(file, errorno, error){
		if(file)
		setTimeout(function(){
			var errorLi = config.showarea.find('li').has('img[name="'+file.name+'"]');
			errorLi.find('img ');
			errorLi.animate({height:0}, 'slow',function(){
				$(this).quickRemove('li');
			});
		},1000);
	}
	
	//收集POST参数
	function gatherPostData(){
		return {name:'test img'};
	}
	
	//main progress
	init();
	prepareUploader();
	config.dropzone.filedrop({
		queuefiles: 10,
	    url: '/fileupload/upload.php',              // upload handler, handles each file separately, can also be a function taking the file and returning a url
	    paramname: 'avatar',          // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
	    withCredentials: true,          // make a cross-origin request with cookies
	    data: gatherPostData(),
/*	    headers: {          // Send additional request headers
	        'header': 'value'
	    },*/
	    error: function(err, file) {
	        switch(err) {
	            case 'BrowserNotSupported':
	            	handleError(null, 1, 'browser does not support HTML5 drag and drop');break;
	            case 'TooManyFiles':
	            	handleError(file, 2, 'too many files');break;
	            case 'FileTooLarge':
	            	handleError(file, 3, 'file too large');break;
	            case 'FileTypeNotAllowed':
	            	handleError(file, 4, 'file type not allowed');break;
	            case 'FileExtensionNotAllowed':
	            	handleError(file, 5, 'file ext not allowed');break;
	            default:
	                break;
	        }
	    },
	    //allowedfiletypes: [],   // filetypes allowed by Content-Type.  Empty array means no restrictions
	    //allowedfileextensions: [], // file extensions allowed. Empty array means no restrictions
	    allowedfiletypes: ['image/jpeg','image/png','image/gif'],
		allowedfileextensions: ['.jpg','.jpeg','.gif'],
	    maxfiles: 25,
	    maxfilesize: 5,    // max file size in MBs
	    dragOver: function() {
	        // user dragging files over #dropzone
	    },
	    dragLeave: function() {
	        // user dragging files out of #dropzone
	    },
	    docOver: function() {
	        // user dragging files anywhere inside the browser document window
	    },
	    docLeave: function() {
	        // user dragging files out of the browser document window
	    },
	    drop: function(e) {
	    	if(!e.dataTransfer)
			    return;
			files = e.dataTransfer.files;
			if (files === null || files === undefined || files.length === 0) {
			    return false;
			}
			config.picNum = files.length;
			config.picTotal += config.picNum;
			prepareShowArea(config.picTotal);
			for(var i=0,f; f=files[i]; i++){
				var reader = new FileReader();
				reader.onload = (function(f){
					return function(){
						config.showarea.append(createImageLi('<img src="'+this.result+'" name="'+f.name+'" />'));
					};
				})(f);
				reader.readAsDataURL(f);
			}
			refreshDropzone();
	    },
	    uploadStarted: function(i, file, len){
	    	prepareProgressBar(i);
	    },
	    uploadFinished: function(i, file, response, time) {
	    	config.done.push(file.name);
	    },
	    progressUpdated: function(i, file, progress) {
	    	config.showarea.find('li').has('img[name="'+file.name+'"]')
	    		.find('.showarea-li-progresscon span').width(progress+'%').html(progress+'%');
	    },
	    speedUpdated: function(i, file, speed) {
	    	config.showarea.find('li').has('img[name="'+file.name+'"]')
	    		.find('.showarea-li-progresscon span').width(progress+'%').append('/'+speed+'Kb/s');
	    },
	    beforeSend: function(file, i, done, obj) {
	    	config.uploadBtn.click(function(e){
	    		e.preventDefault();
	    		if($('#upload').find('img').width()>150/* && confirm('头像宽高超过150像素，上传后头像会被截取，确定上传？')*/)
	    			done();
	    	});
	    },
	    afterAll: function() {
	        for(var i=0,name;name=config.done[i];i++){
	        	(function(i,name){
	        		setTimeout(function(){
		        		config.showarea.find('li').has('img[name="'+name+'"]').animate({height:0},'slow',function(){
		        			$(this).quickRemove('li');
		        		});
		        	}, 1000*i)
	        	})(i,name);
	        }
	    }
	});
});