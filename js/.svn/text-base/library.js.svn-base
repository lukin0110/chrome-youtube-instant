
/*
	Generic prototype extension for Storange, String, Number, Boolean 
*/
Storage.prototype.setObject = function(key, value, opt_expiration) 
{
    //var expiration = opt_expiration || 3e9; // defaults to a little bit more than 1 month
	//var expiration = opt_expiration || 604800000; // 7 days
	var expiration = opt_expiration || 3600000; //1hour
    if (expiration > 0)
	{
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
    if (!this.getItem(key + "__expiration") || !this.getItem(key)) 
	{
        return false;
    }
	
    var expiration = +this.getItem(key + "__expiration");
    return expiration > Date.now();
};

String.prototype.startsWith = function(str)
{
    if (str.length > this.length) 
	{
        return false;
    }
	
    return (String(this).substr(0, str.length) == str);
};

String.prototype.endsWith = function(str)
{
    if (str.length > this.length)
	{
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

/**
* Formats the number according to the ‘format’ string;
* adherses to the american number standard where a comma
* is inserted after every 3 digits.
*  note: there should be only 1 contiguous number in the format,
* where a number consists of digits, period, and commas
*        any other characters can be wrapped around this number, including ‘$’, ‘%’, or text
*        examples (123456.789):
*          ‘0′ - (123456) show only digits, no precision
*          ‘0.00′ - (123456.78) show only digits, 2 precision
*          ‘0.0000′ - (123456.7890) show only digits, 4 precision
*          ‘0,000′ - (123,456) show comma and digits, no precision
*          ‘0,000.00′ - (123,456.78) show comma and digits, 2 precision
*          ‘0,0.00′ - (123,456.78) shortcut method, show comma and digits, 2 precision
*
* @method format
* @param format {string} the way you would like to format this text
* @return {string} the formatted number
* @public
*/ 

Number.prototype.format = function(format) 
{
  //if (! isType(format, 'string')) {return'';} // sanity check 

  var hasComma = -1 < format.indexOf(','),
    psplit = format.split('.'),
    that = this; 

  // compute precision
  if (1 < psplit.length) {
    // fix number precision
    that = that.toFixed(psplit[1].length);
  }
  // error: too many periods
  else if (2 < psplit.length) {
    throw('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
  }
  // remove precision
  else {
    that = that.toFixed(0);
  } 

  // get the string now that precision is correct
  var fnum = that.toString(); 

  // format has comma, then compute commas
  if (hasComma) {
    // remove precision for computation
    psplit = fnum.split('.'); 

    var cnum = psplit[0],
      parr = [],
      j = cnum.length,
      m = Math.floor(j / 3),
      n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop 

    // break the number into chunks of 3 digits; first chunk may be less than 3
    for (var i = 0; i < j; i += n) {
      if (i != 0) {n = 3;}
      parr[parr.length] = cnum.substr(i, n);
      m -= 1;
    } 

    // put chunks back together, separated by comma
    fnum = parr.join(','); 

    // add the precision back in
    if (psplit[1]) {fnum += '.' + psplit[1];}
  } 

  // replace the number portion of the format with fnum
  return format.replace(/[\d,?\.?]+/, fnum);
};


Boolean.parse = function (str) 
{
	switch (str.toLowerCase ()) 
	{
		case "true":
			return true;
		case "false":
			return false;
		default:
			return false;
	}
};










