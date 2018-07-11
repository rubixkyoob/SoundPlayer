/* 
Custom Sound Player Javascript 
P. Kalmar
2018
*/

var scenes = 1;
var tracks = 1;

$( document ).ready(function() {
	
	$("#btnNewScene").click(function() {
		createScene(scenes);
	});
	
	// handle input changes
	$("#fileLoad").change(function() {
		console.log(this.files)
	
		// grab the first file in the FileList object and pass it to the function
		renderFile(this.files[0])
	});
	
});


////////////////////
// Scene Management
function createScene(sceneId, defaultName) {
	
	if(defaultName == undefined || defaultName == null) {
		defaultName = "SCENE " + sceneId;
	}
	
	var row = $('<div id="Scene' + sceneId + '" class="scene center"></div>').append($("#sceneTemplate").html());
	$("#allScenes").append(row);
	
	// set vars
	$("#Scene" + sceneId + " .sceneId").html(sceneId);
	
	// set listeners
	$("#Scene" + sceneId + " .sceneTitle").text(defaultName);
	$("#Scene" + sceneId + " .btnNewTrack").click(function() {
		console.log("createTrack(" + sceneId + ", " + tracks + ")");
		createTrack(sceneId, tracks);
	});
	$("#Scene" + sceneId + " .removeScene").click(function() {
		var r = confirm("Are you sure you want to remove this Scene?");
		if(r) {
			removeScene(sceneId);
		}
	});
	$("#Scene" + sceneId + " .removeScene").hover(
		function() {
			$( this ).removeClass("hover");
		}, 
		function() {
			$( this ).addClass("hover");
		}
	);
	
	scenes = parseInt(sceneId) + 1;
}

function removeScene(sceneId) {
	$("#Scene" + sceneId).remove();
}

function createTrack(sceneId, trackId, defaultFilename, defaultVolume, defaultNotes, defaultLoop) {
	
	if(defaultFilename == undefined || defaultFilename == null) {
		defaultFilename = "";
	}
	if(defaultVolume == undefined || defaultVolume == null) {
		defaultVolume = 50;
	}
	if(defaultNotes == undefined || defaultNotes == null) {
		defaultNotes = "";
	}
	if(defaultLoop == undefined || defaultLoop == null) {
		defaultLoop = false;
	}
	
	var table = $('<div id="Track' + trackId + '" class="track"></div>').append($("#trackTemplate").html());
	
	$("#Scene" + sceneId + " .trackTable").append(table);
	var track = $("#Track" + trackId);
	// set vars
	track.find(".trackId").html(trackId);
	
	// set listeners
	track.find(".fileUpload").change(function () {
		var filePath = track.find(".fileUpload").val();
		if (filePath) {
			//parse the filename
			var startIndex = (filePath.indexOf('\\') >= 0 ? filePath.lastIndexOf('\\') : filePath.lastIndexOf('/'));
			var filename = filePath.substring(startIndex);
			if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
				filename = filename.substring(1);
			}
			var txtTrackName = track.find(".txtFilename");
			txtTrackName.val(filename);
			txtTrackName.trigger("change");
		}
	});
	track.find(".txtFilename").change(function() {
		var file = $("#txtFilePath").val() + $(this).val();
		console.log('loading ' + file + '...');
		track.find(".audMp3Src").attr("src",file);
		track.find(".audOggSrc").attr("src",file);
		track.find(".audio").attr("src",file);
	});
	track.find(".volume").change(function() {
		track.find(".txtVolume").html($(this).val());
		track.find(".audio").prop("volume", $(this).val() / 100);
	});
	track.find(".btnVolumeAdd").click(function() {
		track.find(".volume").val(parseInt(track.find(".volume").val()) + 1);
		track.find(".volume").trigger("change");
	});
	track.find(".btnVolumeSub").click(function() {
		track.find(".volume").val(parseInt(track.find(".volume").val()) - 1);
		track.find(".volume").trigger("change");
	});
	track.find(".removeTrack").click(function() {
		var r = confirm("Are you sure you want to remove this Track?");
		if(r) {
			removeTrack(trackId);
		}
	});
	track.find(".removeTrack").hover(
		function() {
			$( this ).removeClass("hover");
		}, 
		function() {
			$( this ).addClass("hover");
		}
	);
	track.find(".btnPlayTrack").click(function() {
		var	 aud = track.find(".audio");
		if(!aud.hasClass("playing")) {
			aud.trigger("play");
		}
		else {
			aud.trigger("pause");
		}
	});
	track.find(".btnRestartTrack").click(function() {
		var	 aud = track.find(".audio");
		aud.trigger("pause");
		aud.prop("currentTime",0);
	});
	track.find(".btnFadeInTrack").click(function() {
		var	 aud = track.find(".audio");
		fadeIn(aud, track.find(".volume"));
	});
	track.find(".btnFadeOutTrack").click(function() {
		var	 aud = track.find(".audio");
		if(aud.hasClass("playing")) {
			fadeOut(aud, track.find(".volume"));
		}
	});
	track.find(".audio")[0].addEventListener("play", function() {
		console.log("playing");
		$(this).addClass("playing");
		track.find(".btnPlayTrack .glyphicon-play").addClass("hide");
		track.find(".btnPlayTrack .glyphicon-pause").removeClass("hide");
	});
	track.find(".audio")[0].addEventListener("pause", function() {
		$(this).removeClass("playing");
		track.find(".glyphicon-play").removeClass("hide");
		track.find(".glyphicon-pause").addClass("hide");
	});
	track.find(".loopCheckbox").change(function() {
		track.find(".audio").prop("loop", $(this).prop("checked"));
	});
	
	// set defaults
	if(defaultFilename !== "") {
		var txtTrackName = track.find(".txtFilename");
		txtTrackName.val(defaultFilename);
		txtTrackName.trigger("change");
	}
	var volSlider = track.find(".volume");
	volSlider.val(defaultVolume);
	volSlider.trigger("change");
	track.find(".notes").text(defaultNotes);
	var loopChkbox = track.find(".loopCheckbox");
	loopChkbox.prop("checked", defaultLoop);
	loopChkbox.trigger("change");
	
	tracks = parseInt(trackId) + 1;
}

function removeTrack(trackId) {
	$("#Track" + trackId).remove();
}

///////////////////
// Action functions

function fadeIn(aud, slider) {
	var start = null;
	var startVol = slider.val();
	var duration = 3000;
	slider.val(0);
	slider.trigger("change");
	aud.trigger("play");
	
	
	function fadeinstep(timestamp) {
		if (!start) start = timestamp;
		var progress = timestamp - start;
		
		if(parseInt(slider.val()) < parseInt(startVol)) {
			slider.val(parseInt(slider.val()) + 1);
			slider.trigger("change");
		}
		else {
			return;
		}
		
		if (progress < duration) {
			window.requestAnimationFrame(fadeinstep);
		}
	}
	window.requestAnimationFrame(fadeinstep);
}

function fadeOut(aud, slider) {
	var start = null;
	var startVol = slider.val();
	var duration = 3000;
	
	function fadeoutstep(timestamp) {
		if (!start) start = timestamp;
		var progress = timestamp - start;
		if(parseInt(slider.val()) > 0) {
			slider.val(parseInt(slider.val()) - 1);
			slider.trigger("change");
		}
		else {
			slider.val(startVol);
			slider.trigger("change");
			aud.trigger("pause");
			return;
		}
		
		if (progress < duration) {
			window.requestAnimationFrame(fadeoutstep);
		}
		else {
			slider.val(startVol);
			slider.trigger("change");
			aud.trigger("pause");
		}
	}
	window.requestAnimationFrame(fadeoutstep);
}

//////////////////
// Save/Load Files
function loadScenes(data) {
	
	//clear everything
	$("#allScenes").html("");
	
	// load info
	for(var s = 0; s < data.length; s++) {
		createScene(data[s].id, data[s].name);
		for(var t = 0; t < data[s].tracks.length; t++) {
			createTrack(
				data[s].id, 
				data[s].tracks[t].id, 
				data[s].tracks[t].filename, 
				data[s].tracks[t].volume,
				data[s].tracks[t].notes,
				data[s].tracks[t].loop);
		}
	}
}

function exportScenes() {
	var exp = [];
	
	$('.scene').each(function(i, sobj) {
		var s = {};
		s.id = $(sobj).find(".sceneId").html();
		s.name = $(sobj).find(".sceneTitle").html();
		s.tracks = [];
		$('#Scene' + s.id + " .track").each(function(j, tobj) {
			var t = {};
			t.id = $(tobj).find(".trackId").html();
			t.filename = $(tobj).find(".txtFilename").val();
			t.volume = $(tobj).find(".volume").val();
			t.notes = $(tobj).find(".notes").val();
			t.loop = $(tobj).find(".loopCheckbox").prop("checked");
			s.tracks.push(t);
		});
		exp.push(s);
	});
	download(JSON.stringify(exp), "data.json", "application/json");
}

// Function to download data to a file
function download(data, filename, type) {
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
				url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);  
		}, 0); 
	}
}

function renderFile(file) {
	var reader = new FileReader();

	// inject an image with the src url
	reader.onload = function(event) {
		loadScenes(JSON.parse(event.target.result));
	}
	reader.readAsText(file);
}