// Reddit screenshot username obscuring function
// Some things cannot be undone without reloading the page (stripping extra classes like 'submitter', 'moderator', etc.)
// This is really convoluted, because reddit doesn't set <div> IDs, so we have to use a lot of getElementsByClassName fuckery.

hideSubredditInfo = false;
hideSideLists = true;
hideSidebar = false;

unames = []; // Declare an array of usernames
// The first "author" tag it will find is the first one on the page - the submitter. The rest are as distinct as possible
colors = ['blue', 'black', 'orange', 'yellow', 'olive', 'maroon', 'purple', 'fuchsia', 'lime', 'teal', 'aqua', 'navy', 'gray', 'silver',  // Easily distinguished/common colors
	'#1cd100', '#b02ad1', '#2ad199', '#d12a2a', '#ab5b00', '#226bab', '#7c8500', '#850035', '#006a85', '#6a0085', '#1b3785', '#0d5e00', '#005e58', // Less common, but still distinguishable
	'#00005e', '#5e2713', '#003807', '#382d00', '#380b29']; // Can't get the top off the bottom of the barrel. Getting desperate for new colors here.


// Iterate through all tags with className 'author'	
[].forEach.call(
	document.getElementsByClassName('author'), function(el) { // Find all elements with class "author"
		// Make sure moderator, admin, and submitter classes are excluded, we'll set those separately
		if (!(el.classList.contains('submitter') && el.classList.contains('moderator') && el.classList.contains('admin'))) { 
			par = el.parentElement;
			if (par.tagName.toLowerCase() == 'p' && par.className == "tagline") {
				uname = el.textContent;
				if (unames.indexOf(uname) === -1) { // Check to see if the username is already in the array. We don't want duplicates.
					unames.push(uname); // If not in array, add it.
				}
				uIndex = unames.indexOf(uname); // Get the index of the unique username that we've been pushing to the array.
				color = colors[uIndex]; // Get the color that matches the index.
				if (color !== undefined) { // If our distinguishable color exists, set it!
					el.style.backgroundColor = color;
					el.style.color = color;
				} else { // Color isn't in the array. You're quoting a huge thread, and we don't have enough easily distinguishable colors to go around. Instead, blur it.
					el.style.cssText = "-webkit-filter: blur(5px); /* Safari */";
					el.style.cssText = "filter: blur(5px)";
				}
			}
		}
		
		// If submitter, set it blue to match the first element found and reddit's scheme
		if(el.classList.contains('submitter')) {
			el.classList.remove('submitter'); // Remove the class so it doesn't override our manually set style
			el.style.backgroundColor = 'blue';
			el.style.color = 'blue';
		}
		
		// If moderator, set it to green
		if(el.classList.contains('moderator')) {
			el.classList.remove('moderator');
			el.style.backgroundColor = 'green';
			el.style.color = 'green';
		}
		
		// If admin, set it to red
		if(el.classList.contains('admin')) {
			el.classList.remove('admin');
			el.style.backgroundColor = 'red';
			el.style.color = 'red';
		}
		
	}
);

// Hide link info, so that its IP can't be backtraced with Visual Basic
[].forEach.call(
		document.getElementsByClassName('linkinfo'), function(el) {
			el.innerHTML = "";
		}
);

// Iterate through tags with class "user" (should only be the one in the header by the logout button)
[].forEach.call(
	document.getElementsByClassName('user'), function(el) {
		el.innerHTML = "Username and stats hidden";
	}
);

if (hideSidebar == true) { // Hide the whole sidebar for privacy (maximum paranoia)
	[].forEach.call(
		document.getElementsByClassName('side'), function(el) {
			el.innerHTML = '<div><p><br>Sidebar hidden for privacy</p></div>';
		}
	);
}  else {
	if (hideSubredditInfo == true) {
		// Hide subreddit info
		[].forEach.call(
			document.getElementsByClassName('titlebox'), function(el) {
				el.innerHTML = 'Subreddit info hidden';
			}
		);
	} else {
		// Find the "set flair", and replace the username and flair with hide text
		[].forEach.call(
			document.getElementsByClassName('titlebox'), function(el) {
				elFlair = el.getElementsByClassName('tagline')
				elFlair[0].innerHTML = "User/flair hidden for privacy";
			}
		);
	}

	if (hideSideLists == true) {
		// Hide everything in the divs that contain moderators and recently viewed links 
		[].forEach.call(
			document.getElementsByClassName('sidecontentbox'), function(el) {
				el.getElementsByTagName('ul')[0].innerHTML = '<li>Hidden for privacy</li>';
			}
		)
	}
}