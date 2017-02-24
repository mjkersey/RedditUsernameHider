// ==UserScript==
// @name         Reddit Username Anonymizer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Anonomizes reddit pages for screenshots
// @author       mjkersey
// @match        https://*.reddit.com/*
// @grant        none
// @downloadURL	 https://raw.githubusercontent.com/mjkersey/RedditUsernameHider/master/files/redditblur_tampermonkey.js
// @supportURL   https://github.com/mjkersey/RedditUsernameHider

// ==/UserScript==

/**
 * Reddit screenshot username obscuring funcs
 * Some things cannot be undone without reloading the page (stripping extra classes like 'submitter', 'moderator', etc.)
 * This is really convoluted, because reddit doesn't set <div> IDs, so we have to use a lot of getElementsByClassName fuckery.
 * See here for more info: https://www.reddit.com/r/Enhancement/comments/5rpqc9/feature_request_anonymizer_buttonlinkwidget_for/
 *
 * Also, what is a style guide
*/

(function() {

	function toggleAnonymize() {

		hideSubredditInfo = true;         // Hides subreddit info
		hideSideLists = true;             // Hides mod/recent links lists
		hideSidebar = false;              // Hides the whole sidebar
		useDefaultStyle = true;           // Unchecks the "Use subreddit style". Requires undoing to show the theme again. Don't know RES hooks for this.
		hideSubmitButtons = true;		  // Hides submit buttons to avoid giving away the subreddit.
		hideHeader = true;				  // Hides header. You know, because there might be information in there.
		hideUsernameMentions = true;      // Not hooked up, exists for future expansion. Requires evaluating all <a> tags :(
		hideSubredditMentions = true;      // Not hooked up, exists for future expansion. Requires evaluating all <a> tags :(
		hideSubredditLinks = true;        // Same as above.

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

		// Reserved classes and associated colors. 
		reservedClasses = ['submitter', 'moderator', 'admin'];
		reservedColors = ['blue', 'green', 'red'];

		/**
		 * Set defined color to a given element for foreground and background
		 * @param {Object} el - DOM element
		 * @param {string} color - An HTML color; name or #hex accepted
		 */
		function setColor(el, color) {
			if (color !== undefined) {				// If our distinguishable color exists, set it!
				el.style.backgroundColor = color;
				el.style.color = color;
			} else {								// Color isn't in the array. Must be a big thread, and we're outta colors. Instead, blur it.
				el.style.cssText = "-webkit-filter: blur(5px); /* Safari */";
				el.style.cssText = "filter: blur(5px)";
			}
		}

		/**
		 * Set innerHTML of elements by class name
		 * @param {string} className - A CSS class
		 */
		function toggleClassVisibility(className) {
			[].forEach.call(
				document.getElementsByClassName(className), function(el) {
					el.style.display = el.style.display == 'none' ? '' : 'none';						// This is fine. Removes it from flow, also eliminating big ol' gaps
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

		function hideLinks() {
			// This ain't skookum yet
			// [].forEach.call(
				// document.getElementsByTagName('a'), function(el) {
					// par = el.parentElement;
					// if (par.tagName.toLowerCase() == 'p') {
						// console.log('yup, in /p');
						// if (el.href.indexOf('/u/') > -1) {
							// uname = el.textContent.replace('/u/', '');	// Get username being called - we can probably move this into its own function too.
							// if (unames.indexOf(uname) === -1) {			// Check to see if the username is already in the array. We don't want duplicates.
								// unames.push(uname); 					// If not in array, add it.
							// }
							// uIndex = unames.indexOf(uname);				// Get the index of the unique username that we've been pushing to the array.
							// color = colors[uIndex];						// Get the color that matches the index.
							// setColor(el, color);
							// el.classList.toggle('anonymized');
						// }
						// if (el.href.indexOf('/r/') > -1) {
							// el.style.cssText = "-webkit-filter: blur(5px); /* Safari */";
							// el.style.cssText = "filter: blur(5px)";
							// el.classList.toggle('anonymized');
						// }
					// }
				// }
			// )
		}

		/**
		 * The meat of it all. This iterates through elements with className "author" and does the business.
		 * Iterate through all tags with className 'author'	
		 */
		[].forEach.call(
			document.getElementsByClassName('author'), function(el) {	// Find all elements with class "author"
				if (!checkReserved(el)) { 								// Check whether it's a reserved class. If true, a reserved color will be set by the function. If false, continue assigning colors
					par = el.parentElement;								// Get parent element. We only want to make changes to <a> tags within a <p> or <span>
					if (
						(
							par.tagName.toLowerCase() == 'p' 			// Comment author tags are in <p> tags
							|| par.tagName.toLowerCase() == 'span'		// Message author tags are in <span>
						)
						&& (
							par.className == 'tagline' 					// Means we're reading a comment	
							|| par.className == 'sender' 				// Means we're reading a message
							|| par.className == 'recipient')			// Ditto
						) 
					{ 
						if (el.classList.contains('anonymized')) {		// Means it has already been anonymized, and we can toggle it off. Set our explicit style declaration to '' and let CSS take over
							setColor(el, '');
							el.style.cssText = '';
							
						} else {
							uname = el.textContent;
							if (unames.indexOf(uname) === -1) {			// Check to see if the username is already in the array. We don't want duplicates.
								unames.push(uname); 					// If not in array, add it.
							}
							uIndex = unames.indexOf(uname);				// Get the index of the unique username that we've been pushing to the array.
							color = colors[uIndex];						// Get the color that matches the index.
							setColor(el, color);
						}
						el.classList.toggle('anonymized');
					}
				}
			}
		);

		// Hide link info, so that its IP can't be backtraced with Visual Basic
		toggleClassVisibility('linkinfo');

		// Iterate through tags with class "user" (should only be the one in the header by the logout button)
		toggleClassVisibility('user');

		// Hide the whole sidebar for privacy (maximum paranoia). If not, hide elements individually
		if (hideSidebar == true) { 
			toggleClassVisibility('side');
		} else {
			if (hideSubredditInfo == true) { // Hide all subreddit info. If not, hide elements individually
				// Hide subreddit info
				toggleClassVisibility('titlebox');
			} else {
				// Find the "set flair", and replace the username and flair with hide text
				// Since this is a one-off and sets only a child element, we're not using toggleClassVisibility function here.
				[].forEach.call(
					document.getElementsByClassName('titlebox'), function(el) {
						elFlair = el.getElementsByClassName('tagline');	// Is Spanish for "The Flair". But seriously, hides the flair element.
						elFlair[0].style.visibility = elFlair[0].style.visibility == 'hidden' ? 'visible' : 'hidden';
					}
				);
			}
		}

		if (hideHeader == true) {
			// An instance where a <div> has an id! toggleClassVisibility won't work here, let's do it by id.
			elHead = document.getElementById('header');				// More Spanish. This time it means "The head"
			elHead.style.display = elHead.style.display == 'none' ? '' : 'none';
		}

		if (hideSideLists == true) { 								// Hides the moderators/recent lists
			toggleClassVisibility('sidecontentbox');
		}

		if (useDefaultStyle == true) {
			var styleCheckbox = document.getElementById('res-style-checkbox');
			if (styleCheckbox != null) {							// Make sure we're actually in a comments section
				styleCheckbox.click();
			}
		}

		if (hideSubmitButtons == true) {
			toggleClassVisibility('sidebox submit submit-link');	// Hides "Submit Link" button.
			toggleClassVisibility('sidebox submit submit-text');	// Hides "Submit Text" button
		}

		if (hideUsernameMentions == true) {
			hideLinks();
		}


		toggleClassVisibility('commentingAsUser');					// Hides RES  "Speaking as:" box.
		toggleClassVisibility('flair');								// Hides flair - does not work on ::before pseudo-elements

	}

	//var commentMenu = document.getElementsByClassName('menuarea');
	[].forEach.call(
		document.getElementsByClassName('menuarea'), function(el){
			el.innerHTML += '<input id="anonymizeButton" type="button" value="Toggle Page Anomymization" />';
		}
	);

	document.getElementById("anonymizeButton").addEventListener("click", toggleAnonymize);

})();