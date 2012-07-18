/*
	YouTube Instant functions
*/
window.YT = window.YT || {};


/*
	Mock function to simulate the i18n behaviour when testing the instant.html page outside the plugin
	chrome.i18n.getMessage('yearsAgo', [amount]);
*/
YT.getMessage = function(key, array)
{
	if(array!=null && array.length>0)
	{
		return array[0] + " " + key;
	}
	
	return key;
};
window.chrome = window.chrome || {};
chrome.i18n = chrome.i18n || {};
chrome.i18n.getMessage = chrome.i18n.getMessage || YT.getMessage;
//end mock


// Navigates to the specified URL.
YT.navigate = function(url, newTab) 
{
	if(newTab)
	{
		try
		{
			chrome.tabs.create({"url":url,"selected":true});
		}
		catch(e)
		{
			//alert(e);
			//Used for testing the popup page in a normal browser window
			window.location = url;
		}
	}
	else
	{
		chrome.tabs.getSelected(null, function(tab)
		{
			chrome.tabs.update(tab.id, {url: url});
		});
	}
};
    
	
YT.getUrlVars = function()
{	
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
		vars[key] = value;
	});
	
	return vars;
};


YT.isEmpty = function(variable)
{
    return variable == null || variable == "undefined" || variable == "";
};


/**
 * Saves the specified options in local storage.
 * @param {Object} options The key/value pairs of options.
 */
YT.saveOptions = function(options) 
{
	for(var option in options) 
	{
		localStorage['yt_opt_' + option] = options[option];
	}
};


YT.getOption = function(key, fallback)
{
	if(YT.getOptions()[key] != undefined)
	{
		return YT.getOptions()[key];
	}
	
	return fallback;
};


YT.getOptions = function()
{
	var options = 
	{
		'regionIso': localStorage['yt_opt_regionIso'] || "",
		'autoPlay': localStorage['yt_opt_autoPlay'] === 'true' || false,
		'foo': 'bar' 	
	};
	
	//'autoPlay': localStorage['yt_opt_autoPlay'] === undefined || localStorage['yt_opt_autoPlay'] === 'true' || false,
	return options;
};




/*
http://www.w3schools.com/tags/ref_entities.asp

"	&#34;	&quot;	quotation mark
'	&#39;	&apos; (does not work in IE)	apostrophe 
&	&#38;	&amp;	ampersand
<	&#60;	&lt;	less-than
>	&#62;	&gt;	greater-than
*/
YT.escapeXml = function(str)
{
	if(!YT.isEmpty(str))
	{
		return str
			.replace(/&/g, "&amp;")	
			.replace(/</g, "&lt;")	
			.replace(/>/g, "&gt;");
		
		/*
		return str.replace(/"/g, '&quot;')
			.replace(/'/g, "&apos;")	
			.replace(/&/g, "&amp;")	
			.replace(/</g, "&lt;")	
			.replace(/>/g, "&gt;");
			*/
	}
	
	return str;
};


	
	
YT.formatVideoLength = function(videoLength) 
{
	if (!videoLength)
	{
	return '';
	}
	
	var result = '';
	var hours = Math.floor(videoLength / 3600);
	var secondsLeft = videoLength - hours * 3600;
	var minutes = Math.floor(secondsLeft / 60);
	var seconds = secondsLeft - minutes * 60;
	
	if (hours && hours < 10)
	{
	hours = '0' + hours;
	}
	
	if (minutes < 10)
	{
	minutes = '0' + minutes;
	}
	
	if (seconds < 10) 
	{
	seconds = '0' + seconds;
	}
	
	if (hours) 
	{
	result = [hours, minutes, seconds].join(':');
	} 
	else 
	{
	result = [minutes, seconds].join(':');
	}
	
	return result;
};


YT.formatTimeSince = function(timeString) 
{
	if (!timeString) 
	{
		return '';
	}
	
	var timeStringDate = new Date(timeString);
	var currentDate = new Date();
	var timeDiffSeconds = (currentDate.getTime() - timeStringDate.getTime()) / 1000;
	var minutesAgo =  Math.floor(timeDiffSeconds / 60);
	var secondsAgo = timeDiffSeconds - minutesAgo * 60;
	var hoursAgo = Math.floor(minutesAgo / 60);
	var daysAgo = Math.floor(hoursAgo / 24);
	var weeksAgo = Math.floor(daysAgo / 7);
	var monthsAgo = Math.floor(daysAgo / 30);
	var yearsAgo = Math.floor(monthsAgo / 12);
	var amount = 0;
	var messageSingular = '';
	var messagePlural = '';
	var result = '';
	
	if (yearsAgo) 
	{
		amount = yearsAgo;
		messageSingular = chrome.i18n.getMessage('yearAgo');
		messagePlural = chrome.i18n.getMessage('yearsAgo', [amount]);
	}
	else if (monthsAgo) 
	{
		amount = monthsAgo;
		messageSingular = chrome.i18n.getMessage('monthAgo');
		messagePlural = chrome.i18n.getMessage('monthsAgo', [amount]);
	} 
	else if (weeksAgo) 
	{
		amount = weeksAgo;
		messageSingular = chrome.i18n.getMessage('weekAgo');
		messagePlural = chrome.i18n.getMessage('weeksAgo', [amount]);
	} 
	else if (daysAgo) 
	{
		amount = daysAgo;
		messageSingular = chrome.i18n.getMessage('dayAgo');
		messagePlural = chrome.i18n.getMessage('daysAgo', [amount]);
	} 
	else if (hoursAgo) 
	{
		amount = hoursAgo;
		messageSingular = chrome.i18n.getMessage('hourAgo');
		messagePlural = chrome.i18n.getMessage('hoursAgo', [amount]);
	} 
	else if (minutesAgo) 
	{
		amount = minutesAgo;
		messageSingular = chrome.i18n.getMessage('minuteAgo');
		messagePlural = chrome.i18n.getMessage('minutesAgo', [amount]);
	} 
	else if (secondsAgo) 
	{
		amount = secondsAgo;
		messageSingular = chrome.i18n.getMessage('secondAgo');
		messagePlural = chrome.i18n.getMessage('secondsAgo', [amount]);
	} 
	else 
	{
		amount = 1;
		messageSingular = chrome.i18n.getMessage('secondAgo');
		messagePlural = chrome.i18n.getMessage('secondsAgo', [amount]);
	}
	
	if (amount > 1) 
	{
		result = messagePlural;
	} 
	else 
	{
		result = messageSingular;
	}
	
	return result;
};


YT.bodyClick = function()
{
	$("#ytInstantSpacer").hide();	
};


YT.render = function()
{
	var jsonObj;
	var text;
	
	try
	{
		text = localStorage.getObject('last'); 
		jsonObj = localStorage.getObject('ytj_' + text);
	}
	catch(e)
	{
		alert("Could not render the results = " + e);
	}
	
	//Testing outside the extension
	//jsonObj = testSearch;
	//text = "Testing";
	
	$("#ytQuery").html(text);	
	$("title").html(text + " - YouTube Instant");
	try 
	{
		$("#ytResults").html(jsonObj.data.totalItems.format("0,000"));	
	}
	catch(e)
	{
		$("#ytResults").html("0");	
	}
	
	
	if(YT.getUrlVars()['autoplay'] == "true")
	{
		YT.createPlayer(jsonObj);
	}
	
	var html = YT.createHTML(jsonObj);
	$("ul").append(html);
};


/*
	http://apiblog.youtube.com/
	http://code.google.com/apis/youtube/player_parameters.html
*/
YT.createPlayer = function(jsonObj)
{
	// Not using the swfobject to embed the video.  It causes security warnings on localhost, i dont want to bother the users with this
	// Just a simple old school iframe
	var entry =jsonObj.data.items[0];
	var videoId=entry.id;
	//var url = "http://www.youtube.com/v/" + videoId + "?version=3&enablejsapi=1&playerapiid=ytplayer&rel=0&autoplay=1&egm=0&loop=0&fs=1&hd=0&showsearch=1&showinfo=0&iv_load_policy=3&cc_load_policy=1&theme=dark";
	var url = "http://www.youtube.com/embed/" + videoId + "?theme=dark&color=red&autoplay=1";
	var html = '<iframe class="youtube-player" type="text/html" width="700" height="400" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
	
	$("#ytPlayer").html(html);
	$("#ytPlayerWrapper").show();
	
	/*<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/VIDEO_ID" frameborder="0"></iframe>*/
};


YT.createHTML = function(jsonObj)
{
	var html = "";
	
	for(var i=0;i<jsonObj.data.items.length;i++)
	{
		var entry = jsonObj.data.items[i];
		var url = decodeURIComponent(entry.player['default']); 
		var viewCount;
		
		try 
		{
			viewCount = entry.viewCount.format("0,000");
		}
		catch(e)
		{
			viewCount = 0;
		}
		
		var uploaded = entry.uploaded;
		var category = entry.category;
		var thumbnail1 = entry.thumbnail.sqDefault;
		var thumbnail2 = entry.thumbnail.hqDefault;
		var player = entry.player.default;
		var rating = entry.rating;	
		
			

		var li = "<li class='clearfix'><a href='" + url + "' class='thumb left shadow'>";
		li+= "<img src='" + entry.thumbnail.sqDefault + "' alt='Loading'/><span>" + YT.formatVideoLength(entry.duration) + "</span></a>";
		li+= "<div class='left content'>";
		li+= "<a name='" + entry.id + "' href='" + url + "' class='title'>" + entry.title + "</a>";
		li+= "<p class='desc'>" + entry.description + "</p>";
		li+= "<p class='meta'>by <a href='http://www.youtube.com/user/" + entry.uploader + "'>" + entry.uploader + "</a> | " + YT.formatTimeSince(entry.uploaded);
		li+= " | <strong>" + viewCount + " views</strong></p>";
		li+= "</div>";
		li+= "</li>";

		html+=li; 
	}	
	
	return html;	
};

	/*
var testSearch = {"apiVersion":"2.0","data":{"updated":"2011-08-10T18:06:53.108Z","totalItems":1000000,"startIndex":1,"itemsPerPage":10,"items":[{"id":"FJfFZqTlWrQ","uploaded":"2009-10-25T06:50:52.000Z","updated":"2011-08-10T15:16:54.000Z","uploader":"PinkVEVO","category":"Music","title":"P!nk - So What","description":"Music video by P!nk performing So What. YouTube view counts pre-VEVO: 952031 (C) 2008 LaFace Records, LLC","tags":["P!nk","laface","Records","Pop"],"thumbnail":{"sqDefault":"http://i.ytimg.com/vi/FJfFZqTlWrQ/default.jpg","hqDefault":"http://i.ytimg.com/vi/FJfFZqTlWrQ/hqdefault.jpg"},"player":{"default":"http://www.youtube.com/watch?v=FJfFZqTlWrQ&feature=youtube_gdata_player"},"content":{"5":"http://www.youtube.com/v/FJfFZqTlWrQ?f=videos&app=youtube_gdata"},"duration":226,"aspectRatio":"widescreen","rating":4.939531,"likeCount":"48895","ratingCount":49645,"viewCount":54619168,"favoriteCount":65298,"commentCount":16126,"status":{"value":"restricted","reason":"limitedSyndication"},"restrictions":[{"type":"country","relationship":"deny","countries":"AS AW AX BL BV CC CX DE GG GS HM IM JE JP MF NF SJ UM VI"}],"accessControl":{"comment":"allowed","commentVote":"allowed","videoRespond":"allowed","rate":"allowed","embed":"allowed","list":"allowed","autoPlay":"allowed","syndicate":"denied"}},*/













YT.omniboxSearch = function(query, callback) 
{
	//var url = "http://www.google.com/codesearch/feeds/search?" + "vert=chromium&as_q=" + query;
	var url = "http://gdata.youtube.com/feeds/api/videos?q=" + query + "&max-results=20&v=2&alt=jsonc";
	console.log(url);
	
	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.setRequestHeader("GData-Version", "2");
	req.onreadystatechange = function() 
	{
		if(req.readyState == 4)
		{
			try
			{
				callback(req.responseText);
			}
			catch(e)
			{
				//ignore ajax exception ... request object can be aborted or null
				//console.log(e);	
			}
		}
	}
	req.send(null);
	return req;
};
	


YT.omniboxtHighlight = function(bodyText, searchTerm) 
{
	// the highlightStartTag and highlightEndTag parameters are optional
	var highlightStartTag = "<match>";	
	var highlightEndTag = "</match>";
	
	// find all occurences of the search term in the given text,
	// and add some "highlight" tags to them (we're not using a
	// regular expression search, because we want to filter out
	// matches that occur within HTML tags and script blocks, so
	// we have to do a little extra validation)
	var newText = "";
	var i = -1;
	var lcSearchTerm = searchTerm.toLowerCase();
	var lcBodyText = bodyText.toLowerCase();
	
	while(bodyText.length > 0) 
	{
		i = lcBodyText.indexOf(lcSearchTerm, i+1);
		if (i < 0)
		{
			newText += bodyText;
			bodyText = "";
		} 
		else 
		{
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i))
			{
				// skip anything inside a <script> block
				if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i))
				{
					newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
					bodyText = bodyText.substr(i + searchTerm.length);
					lcBodyText = bodyText.toLowerCase();
					i = -1;
				}
			}
		}
	}

	return newText;
};





YT.contextMenuSearch = function(info, tab)
{
	YT.navigate("http://www.youtube.com/results?search_query=" + info.selectionText, true);
	//alert(info.selectionText);	
};





