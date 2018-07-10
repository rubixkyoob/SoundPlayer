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
function createScene(sceneId) {
	var row = $('<tr></tr>').append(
		$('<td id="Scene' + sceneId + '" class="scene td-center"></td>').append(
			$("#sceneTemplate").html()
		)
	);
	$("#allScenes").append(row);
	
	// set vars
	$("#Scene" + sceneId + " .sceneId").html(sceneId);
	
	// set listeners
	$("#Scene" + sceneId + " .sceneTitle").text("SCENE " + sceneId);
	$("#Scene" + sceneId + " .btnNewTrack").click(function() {
		console.log("createTrack(" + sceneId + ", " + tracks + ")");
		createTrack(sceneId, tracks);
	});
	
	scenes = parseInt(sceneId) + 1;
}

function createTrack(sceneId, trackId, defaultFilename="", defaultVolume=50, defaultNotes="") {
	
	var table = $('<table></table>').append(
		$('<tbody></tbody>').append(
			$('<tr></tr>').append(
				$('<td id="Track' + trackId + '" class="track"></td>').append(
					$("#trackTemplate").html()
				)
			)
		)
	);
	
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

function removeTrack(sceneId, trackId) {
	if(trackId >= 0) {
		$("#trackTable" + sceneId).remove("track" + trackId);
	}
}

//////////////////
// Save/Load Files
function loadScenes(data) {
	for(var s = 0; s < data.length; s++) {
		createScene(data[s].id);
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
	//$("#exportTextArea").text(JSON.stringify(exp));
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