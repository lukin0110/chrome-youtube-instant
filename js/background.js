// Helper functions for local storage and strings
// copy/paste from the chrome developers extension
Storage.prototype.setObject = function(key, value, opt_expiration) 
{
    //var expiration = opt_expiration || 3e9; // defaults to a little bit more than 1 month
	//var expiration = opt_expiration || 604800000; // 7 days
	var expiration = opt_expiration || 3600000; //1hour
    if (expiration > 0) {
        expiration += Date.now();
    }
    this.setItem(key, JSON.stringify(value));
    this.setItem(key + "__expiration", expiration);
};

Storage.prototype.getObject = function(key) 
{
    return JSON.parse(this.getItem(key));
};

Storage.prototype.hasUnexpired = function(key)
{
    if (!this.getItem(key + "__expiration") || !this.getItem(key)) {
        return false;
    }
    var expiration = +this.getItem(key + "__expiration");
    return expiration > Date.now();
};

String.prototype.startsWith = function(str)
{
    if (str.length > this.length) {
        return false;
    }
    return (String(this).substr(0, str.length) == str);
};

String.prototype.endsWith = function(str)
{
    if (str.length > this.length) {
        return false;
    }
    return (String(this).substr(this.length - str.length, this.length) == str);
};

String.prototype.encode = function()
{
    return encodeURIComponent(String(this));
};

String.prototype.strip = function()
{
    var str = String(this);
    if (!str) {
        return "";
    }
    var startidx=0;
    var lastidx=str.length-1;
    while ((startidx<str.length)&&(str.charAt(startidx)==' ')){
        startidx++;
    }
    while ((lastidx>=startidx)&&(str.charAt(lastidx)==' ')){
        lastidx--;
    }
    if (lastidx < startidx) {
        return "";
    }
    return str.substring(startidx, lastidx+1);
};



/*
	Autosuggest implementation
*/
(function(){
    
    // Navigates to the specified URL.
    function nav(url) 
	{
        chrome.tabs.getSelected(null, function(tab)
		{
            chrome.tabs.update(tab.id, {url: url});
        });
    };
    
    // Sets the the default styling for the first search item
    function setDefaultSuggestion(text) 
	{
        if (text) {
            chrome.omnibox.setDefaultSuggestion({"description":"<url><match>YouTube Search</match></url> " + text});
        } else {
            chrome.omnibox.setDefaultSuggestion({"description":"<url><match>YouTube Search</match></url>"});
        }
    };
    
	
	function search(query, callback) 
	{
	  //var url = "http://www.google.com/codesearch/feeds/search?" + "vert=chromium&as_q=" + query;
	  var url = "http://gdata.youtube.com/feeds/api/videos?q=" + query + "&max-results=10&v=2&alt=jsonc";

	  var req = new XMLHttpRequest();
	  req.open("GET", url, true);
	  req.setRequestHeader("GData-Version", "2");
	  req.onreadystatechange = function() 
	  {
		if(req.readyState == 4)
		{
		  callback(req.responseText);
		}
	  }
	  req.send(null);
	  return req;
	};
	
	
	function doHighlight(bodyText, searchTerm) 
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
	}

	
	
	//http://gdata.youtube.com/feeds/api/videos?q=Jennifer&max-results=5&v=2&alt=jsonc
    chrome.omnibox.onInputCancelled.addListener(function()
	{
        console.log("Input cancelled.");
        setDefaultSuggestion('');
    });
    


    var currentRequest = null;
    
    chrome.omnibox.onInputChanged.addListener(function(text, suggest_callback)
	{
		//setDefaultSuggestion(text);
			
		if (!text)
		{
			return;
		}
			 	
		if(localStorage.hasUnexpired('yt_'+text))
		{
			var results = localStorage.getObject('yt_'+text);
			suggest_callback(results);		
		}
		else
		{
			if(currentRequest != null) 
			{
			  currentRequest.onreadystatechange = null;
			  currentRequest.abort();
			  currentRequest = null;
			}
	
			currentRequest = search(text, function(jsonStr) 
			{
				var jsonObj = eval('(' + jsonStr + ')');
				var results = [];
				var arr = text.split(' ');

				// Example data
				// http://gdata.youtube.com/feeds/api/videos?q=Jenni&max-results=5&v=2&alt=jsonc
				for(var i=0, entry;i<8 && (entry = jsonObj.data.items[i]);i++)
				{
					var url = decodeURIComponent(entry.player['default'].replace("&feature=youtube_gdata_player",""));
					var url2 = url.replace("&", "&amp;");
					var title = entry.title;

					for (var j = 0; j < arr.length; j++) 
					{
						title = doHighlight(title, arr[j]);
					}

					results.push({
						content: url,
						description: "<dim>" + decodeURIComponent(title) + "</dim> - <url>" + url2 + "</url>"
					});
					
					// ["<dim>" ,entry.title, "</dim> - <url>", entry.player['default'], "</url>"].join('')
					// "description":["<match>", name, "</match> <dim>(", type, " <match>", fqn, "</match>)</dim> - <url>", url, "</url>"].join('')
					// suggestion.push(['<dim>', match['description'], '</dim>'].join(''));
					// description: ["<url>", "http://google.com", "</url>"].join('')
				}
				
				localStorage.setObject('yt_'+text, results);
				suggest_callback(results);
			});
		}
    });
    
	
	
	
    chrome.omnibox.onInputEntered.addListener(function(text) 
	{
        console.log("Input entered: " + text);
		
		var stripped_text = text.strip();
        if (!stripped_text) {
            return;
        }

        if (stripped_text.startsWith("http://") || stripped_text.startsWith("https://")) {
            nav(stripped_text);
            return;
        }
        
        if (stripped_text.startsWith("www.") || stripped_text.endsWith(".com") || stripped_text.endsWith(".net") || stripped_text.endsWith(".org") || stripped_text.endsWith(".edu")) {
            nav("http://" + stripped_text);
            return;
        }
                
        nav("http://www.youtube.com/results?search_query=" + encodeURIComponent(stripped_text));
    });
})();

