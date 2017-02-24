function setColor(e,s){void 0!==s?(e.style.backgroundColor=s,e.style.color=s):(e.style.cssText="-webkit-filter: blur(5px); /* Safari */",e.style.cssText="filter: blur(5px)")}function toggleClassVisibility(e){[].forEach.call(document.getElementsByClassName(e),function(e){e.style.display="none"==e.style.display?"":"none"})}function classToggle(e,s){e.classList.contains(s+"-anonymized")?(e.classList.remove(s+"-anonymized"),e.classList.add(s)):(e.classList.remove(s),e.classList.add(s+"-anonymized"))}function checkReserved(e){return reservedFound=!1,reservedClasses.forEach(function(s,i){(e.classList.contains(s)||e.classList.contains(s+"-anonymized"))&&(classToggle(e,s),setColor(e,reservedColors[i]),reservedFound=!0)}),reservedFound}function hideLinks(){}if(hideSubredditInfo=!0,hideSideLists=!0,hideSidebar=!1,useDefaultStyle=!0,hideSubmitButtons=!0,hideHeader=!0,hideUsernameMentions=!0,hideSubredditMentions=!0,hideSubredditLinks=!0,unames=[],colors=["blue","black","orange","yellow","olive","maroon","purple","fuchsia","lime","teal","aqua","navy","gray","silver","#1cd100","#b02ad1","#2ad199","#d12a2a","#ab5b00","#226bab","#7c8500","#850035","#006a85","#6a0085","#1b3785","#0d5e00","#005e58","#00005e","#5e2713","#003807","#382d00","#380b29"],reservedClasses=["submitter","moderator","admin"],reservedColors=["blue","green","red"],[].forEach.call(document.getElementsByClassName("author"),function(e){checkReserved(e)||(par=e.parentElement,"p"!=par.tagName.toLowerCase()&&"span"!=par.tagName.toLowerCase()||"tagline"!=par.className&&"sender"!=par.className&&"recipient"!=par.className||(e.classList.contains("anonymized")?(setColor(e,""),e.style.cssText=""):(uname=e.textContent,-1===unames.indexOf(uname)&&unames.push(uname),uIndex=unames.indexOf(uname),color=colors[uIndex],setColor(e,color)),e.classList.toggle("anonymized")))}),toggleClassVisibility("linkinfo"),toggleClassVisibility("user"),1==hideSidebar?toggleClassVisibility("side"):1==hideSubredditInfo?toggleClassVisibility("titlebox"):[].forEach.call(document.getElementsByClassName("titlebox"),function(e){elFlair=e.getElementsByClassName("tagline"),elFlair[0].style.visibility="hidden"==elFlair[0].style.visibility?"visible":"hidden"}),1==hideHeader&&(elHead=document.getElementById("header"),elHead.style.display="none"==elHead.style.display?"":"none"),1==hideSideLists&&toggleClassVisibility("sidecontentbox"),1==useDefaultStyle){var styleCheckbox=document.getElementById("res-style-checkbox");null!=styleCheckbox&&styleCheckbox.click()}1==hideSubmitButtons&&(toggleClassVisibility("sidebox submit submit-link"),toggleClassVisibility("sidebox submit submit-text")),1==hideUsernameMentions&&hideLinks(),toggleClassVisibility("commentingAsUser"),toggleClassVisibility("flair");