/**
 * Reddit screenshot username obscuring funcs
 * Some things cannot be undone without reloading the page (stripping extra classes like 'submitter', 'moderator', etc.)
 * This is really convoluted, because reddit doesn't set <div> IDs, so we have to use a lot of getElementsByClassName fuckery.
 * See here for more info: https://www.reddit.com/r/Enhancement/comments/5rpqc9/feature_request_anonymizer_buttonlinkwidget_for/
 *
 * Also, what is a style guide
*/

hideSubredditInfo = false;  // Hides subreddit info
hideSideLists = true;       // Hides mod/recent links lists
hideSidebar = false;        // Hides the whole sidebar

// Declare an empty array of usernames
unames = [];                

/** 
 * Array of colors
 * The first "author" class it will find is the first one on the page - the submitter. 
 * As a result, it needs to remain as the first item in the list. The rest are visually 
 * distinct, moreso at first, and less so the further down the list we go.
 */
colors = ['blue', 'black', 'orange', 'yellow', 'olive', 'maroon', 'purple', 'fuchsia', 'lime', 'teal', 'aqua', 'navy', 'gray', // Easily distinguished/common colors
	'silver', '#1cd100', '#b02ad1', '#2ad199', '#d12a2a', '#ab5b00', '#226bab', '#7c8500', '#850035', '#006a85', '#6a0085',    // Less common, but still somewhat distinguishable
	'#1b3785', '#0d5e00', '#005e58', '#00005e', '#5e2713', '#003807', '#382d00', '#380b29'];                                   // Can't get the top off the bottom of the barrel. Getting muddy.

// Reserved classes and associated colors. Not in use yet, but defined for later expansion.
reservedClasses = ['submitter', 'moderator', 'admin'];
reservedColors = ['blue', 'green', 'red'];

/**
 * Set defined color to a given element for foreground and background
 * @param {Object} el - DOM element
 * @param {string} color - An HTML color; name or #hex accepted
 */
function setColor(el, color) {
	if (color !== undefined) {                 // If our distinguishable color exists, set it!
		el.style.backgroundColor = color;
		el.style.color = color;
	} else {                                    // Color isn't in the array. You're quoting a huge thread, and we don't have enough easily distinguishable colors to go around. Instead, blur it.
		el.style.cssText = "-webkit-filter: blur(5px); /* Safari */";
		el.style.cssText = "filter: blur(5px)";
	}
}

/**
 * Set innerHTML of elements by class name
 * @param {string} className - A CSS class
 * @param {string} str - A string
 */
function setByClassName(className, str) {
	[].forEach.call(
		document.getElementsByClassName(className), function(el) {
			el.innerHTML = str;
		}
	);
}

/**
 * Toggles className between class and class-anonymized (as opposed to removing)
 * Prevents CSS override when we set explicit style properties
 * @param {Object} el - DOM element
 * @param {string} str name of the class to toggle
 */
function classToggle(el, className) {
	if (el.classList.contains(className + '-anonymized')) {
		el.classList.remove(className + '-anonymized');
		el.classList.add(className);
	} else {
		el.classList.remove(className);
		el.classList.add(className + '-anonymized');
	}
}

/**
 * Checks for reserved classes (admin, submitter, moderator)
 * Sets to reserved color if found
 * @param {Object} el - DOM element
 */
function checkReserved(el) {
	reservedFound = false;
	reservedClasses.forEach(
		function(className, index) {
			if(el.classList.contains(className) || el.classList.contains(className + '-anonymized')) {
				classToggle(el, className);
				setColor(el, reservedColors[index]);
				reservedFound = true;
			}
		}
	)
	return reservedFound;
}
	
// The meat of it all. This iterates through elements with className "author" and does the business.
// Iterate through all tags with className 'author'	
[].forEach.call(
	document.getElementsByClassName('author'), function(el) { // Find all elements with class "author"
		// Make sure moderator, admin, and submitter classes are excluded, we'll set those separately
		if (!checkReserved(el)) { // Check whether it's a reserved class. If true, a reserved color will be set by the function. If false, continue assigning colors
			par = el.parentElement; // Get parent element. We only want to make changes to <a> tags that reside within a <p>
			if (par.tagName.toLowerCase() == 'p' && par.className == "tagline") {
				if (el.classList.contains('anonymized')) {
					setColor(el, '');
				} else {
					uname = el.textContent;
					if (unames.indexOf(uname) === -1) { // Check to see if the username is already in the array. We don't want duplicates.
						unames.push(uname); // If not in array, add it.
					}
					uIndex = unames.indexOf(uname); // Get the index of the unique username that we've been pushing to the array.
					color = colors[uIndex]; // Get the color that matches the index.
					setColor(el, color);
				}
				el.classList.toggle('anonymized');
			}
		}
	}
);

// Hide link info, so that its IP can't be backtraced with Visual Basic
setByClassName('linkinfo', '');

// Iterate through tags with class "user" (should only be the one in the header by the logout button)
setByClassName('user', 'Username and stats hidden');

// Hide the whole sidebar for privacy (maximum paranoia). If not, hide elements individually
if (hideSidebar == true) { 
	setByClassName('side', '<div><p><br>Sidebar hidden for privacy</p></div>');
} else {
	if (hideSubredditInfo == true) { // Hide all subreddit info. If not, hide elements individually
		// Hide subreddit info
		setByClassName('titlebox','Subreddit info hidden');
	} else {
		// Find the "set flair", and replace the username and flair with hide text
		// Since this is a one-off and sets only a child element, we're not using setByClassName function here.
		[].forEach.call(
			document.getElementsByClassName('titlebox'), function(el) {
				elFlair = el.getElementsByClassName('tagline');
				elFlair[0].innerHTML = "User/flair hidden for privacy"; // Only the first one needs to be set. Should only be one total.
			}
		);
	}

	if (hideSideLists == true) { // Hides the moderators/recent lists
		setByClassName('sidecontentbox','Mod/recent list hidden for privacy');
	}
}
