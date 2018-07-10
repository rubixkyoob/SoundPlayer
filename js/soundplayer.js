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

function createTrack(sceneId, trackId, defaultFilename, defaultVolume, defaultNotes) {
	
	if(defaultFilename == undefined || defaultFilename == null) {
		defaultFilename = "";
	}
	if(defaultVolume == undefined || defaultVolume == null) {
		defaultVolume = 50;
	}
	if(defaultNotes == undefined || defaultNotes == null) {
		defaultNotes = "";
	}
	
	var table = $('<div id="Track' + trackId + '" class="track"></div>').append($("#trackTemplate").html());
	
	$("#Scene" + sceneId + " .trackTable").append(table);
	
	// set vars
	$("#Track" + trackId + " .trackId").html(trackId);
	
	// set listeners
	$("#Track" + trackId + " .fileUpload").change(function () {
		var filePath=$("#Track" + trackId + " .fileUpload").val();
		if (filePath) {
			//parse the filename
			var startIndex = (filePath.indexOf('\\') >= 0 ? filePath.lastIndexOf('\\') : filePath.lastIndexOf('/'));
			var filename = filePath.substring(startIndex);
			if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
				filename = filename.substring(1);
			}
			var txtTrackName = $("#Track" + trackId + " .txtFilename");
			txtTrackName.val(filename);
			txtTrackName.trigger("change");
		}
	});
	$("#Track" + trackId + " .txtFilename").change(function() {
		var file = $("#txtFilePath").val() + $(this).val();
		console.log('loading ' + file + '...');
		$("#Track" + trackId + " .audMp3Src").attr("src",file);
		$("#Track" + trackId + " .audOggSrc").attr("src",file);
		$("#Track" + trackId + " .audio").attr("src",file);
	});
	$("#Track" + trackId + " .volume").change(function() {
		$("#Track" + trackId + " .txtVolume").html($(this).val());
		$("#Track" + trackId + " .audio").prop("volume", $(this).val() / 100);
	});
	$("#Track" + trackId + " .btnVolumeAdd").click(function() {
		$("#Track" + trackId + " .volume").val(parseInt($("#Track" + trackId + " .volume").val()) + 1);
		$("#Track" + trackId + " .volume").trigger("change");
	});
	$("#Track" + trackId + " .btnVolumeSub").click(function() {
		$("#Track" + trackId + " .volume").val(parseInt($("#Track" + trackId + " .volume").val()) - 1);
		$("#Track" + trackId + " .volume").trigger("change");
	});
	$("#Track" + trackId + " .removeTrack").click(function() {
		var r = confirm("Are you sure you want to remove this Track?");
		if(r) {
			removeTrack(trackId);
		}
	});
	$("#Track" + trackId + " .removeTrack").hover(
		function() {
			$( this ).removeClass("hover");
		}, 
		function() {
			$( this ).addClass("hover");
		}
	);
	
	// set defaults
	if(defaultFilename !== "") {
		var txtTrackName = $("#Track" + trackId + " .txtFilename");
		txtTrackName.val(defaultFilename);
		txtTrackName.trigger("change");
	}
	var volSlider = $("#Track" + trackId + " .volume");
	volSlider.val(defaultVolume);
	volSlider.trigger("change");
	$("#Track" + trackId + " .notes").text(defaultNotes);
	
	tracks = parseInt(trackId) + 1;
}

function removeTrack(trackId) {
	$("#Track" + trackId).remove();
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
				data[s].tracks[t].notes);
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