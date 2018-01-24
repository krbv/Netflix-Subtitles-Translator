// Saves options to chrome.storage
function save_options2() {
	
	alert('');
	return false;
  var color = document.getElementById('color').value;
  var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    lang: 'ru',
	showsec: 5,
	delay: true,
	images: false,
  }, function(items) {
		document.querySelector('select[name="lang"]').value = items.lang;
		document.querySelector('input[name="images"]').checked = items.images;
		
		document.querySelector('input[name="delay"]').checked = items.delay;
		document.querySelector('select[name="showsec"]').value = items.showsec;
  });
}


function save_options() {

	console.log("sdf");
	 let lang = document.querySelector('select[name="lang"]').value;
	 let images = document.querySelector('input[name="images"]').checked;
	 let showsec = document.querySelector('select[name="showsec"]').value;
	 let delay = document.querySelector('input[name="delay"]').checked;
	 
	 chrome.storage.sync.set({
		lang: lang,
		delay: delay,
		images: images,
		showsec: showsec,
	 });
 
}


document.querySelector('select[name="lang"]').addEventListener('change',save_options);
document.querySelector('input[name="delay"]').addEventListener('change',save_options);
document.querySelector('input[name="images"]').addEventListener('change',save_options);
document.querySelector('select[name="showsec"]').addEventListener('change',save_options);


document.addEventListener('DOMContentLoaded', restore_options);


