$(function() {

$( "#password_length" ).on( "input", function() {
  $( "#password_length_range" ).val($( "#password_length" ).val());
});

$( "#password_length_range" ).on( "input", function() {
  $( "#password_length" ).val($( "#password_length_range" ).val());
});

$( "input" ).on( "input", function() {
  console.log( "input!" );
  
  var serviceName     = $( "#service_name" ).val();
  var keyword           = $( "#keyword"     ).val();
  var passwordLength = $( "#password_length"      ).val();
  
  $( "#password" ).val( generatePassword(serviceName, keyword, passwordLength) );
});
 console.log("Hello");
 
 generatePassword("amazon", "horse", 8);

});
	
var _uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var _lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
var _numbers = "1234567890";
var _symbols = "()`~!@#$%^&*-+=|{}[]:;'<>,.?/";
	
_uppercaseLetters = _uppercaseLetters.split("");
_lowercaseLetters = _lowercaseLetters.split("");
_numbers = _numbers.split("");
_symbols = _symbols.split("");

var seed;
var _p = 47; // p % 4 = 3
var _q = 67; // q % 4 = 3
var _m = _p * _q;

function generatePassword(serviceName, keyword, passwordLength) {
	console.log(serviceName);
	console.log(keyword);
	console.log(passwordLength);
	
	console.log(
	"serviceName: %s, keyword: %s, passwordLength: %d",
	serviceName, keyword, passwordLength
	);
	
	var serviceNameNumber = getSumOfUTF8BytesFromString(serviceName);
	var keywordNumber = getSumOfUTF8BytesFromString(keyword);
	
	seed = serviceNameNumber + keywordNumber;
	console.log(seed);

	//Password should be contain uppercase, lowercase, numbers and symbols
	//without repeated characters
	//and consecutive of letters or numbers
            
	var quantityOfNumbers = Math.floor(passwordLength / 4);
	var quantityOfSymbols = Math.max(2, Math.floor(passwordLength / 5));
	var quantityOfUppercaseLetters = Math.floor((passwordLength - quantityOfNumbers - quantityOfSymbols) / 2);
	var quantityOfLowercaseLetters = passwordLength - quantityOfNumbers - quantityOfSymbols - quantityOfUppercaseLetters;

	var passwordOfNumbers = "";
	var passwordOfSymbols = "";
	var passwordOfUppercaseLetters = "";
	var passwordOfLowercaseLetters = "";

	//quantityOfSymbols <= quantityOfNumbers <= quantityOfUppercaseLetters <= quantityOfLowercaseLetters
	console.log("%d %d %d %d", quantityOfSymbols, quantityOfNumbers, quantityOfUppercaseLetters, quantityOfLowercaseLetters)

	//#region Составление символов для пароля
	//uppercase
	var uppercaseLetters = _uppercaseLetters.slice();
	for (var i = 0; i < quantityOfUppercaseLetters; i++) {
		var j = next(uppercaseLetters.length);
		passwordOfUppercaseLetters += uppercaseLetters[j];
		uppercaseLetters.splice(j, 1);
	}

	//lowercase
	var lowercaseLetters = _lowercaseLetters.slice();
	for (var i = 0; i < quantityOfLowercaseLetters; i++) {
		var j = next(lowercaseLetters.length);
		passwordOfLowercaseLetters += lowercaseLetters[j];
		lowercaseLetters.splice(j, 1);
	}

	//numbers
	var numbers = _numbers.slice();
	for (var i = 0; i < quantityOfNumbers; i++) {
		var j = next(numbers.length);
		passwordOfNumbers += numbers[j];
		numbers.splice(j, 1);
	}

	//symbols
	var symbols = _symbols.slice();
	for (var i = 0; i < quantityOfSymbols; i++) {
		var j = next(symbols.length);
		passwordOfSymbols += symbols[j];
		symbols.splice(j, 1);
	}
	
	console.log("%s %s %s %s", passwordOfUppercaseLetters, passwordOfLowercaseLetters, passwordOfNumbers, passwordOfSymbols);
	//#endregion

	//#region Перемешивание символов для пароля и его создание
	//Creation a password
	var password = "";
	var lastSymbolForPasswordFrom = "";

	for (var i = 0; i < passwordLength; i++) {
		//Максимальное значение символов в категории последовательности для пароля
		var maxQuantity = Math.max(Math.max(passwordOfNumbers.length, passwordOfSymbols.length),
			Math.max(passwordOfUppercaseLetters.length, passwordOfLowercaseLetters.length));

		//Новый символ пароля будет из одной из самых длинных последовательностей
		var newSymbol = "";

		//Отбираем претендентов
		if (passwordOfNumbers.length == maxQuantity && passwordOfNumbers != lastSymbolForPasswordFrom && password.length > 0)
			newSymbol += passwordOfNumbers[0];

		if (passwordOfSymbols.length == maxQuantity && passwordOfSymbols != lastSymbolForPasswordFrom && password.length > 0)
			newSymbol += passwordOfSymbols[0];

		if (passwordOfUppercaseLetters.length == maxQuantity && passwordOfUppercaseLetters != lastSymbolForPasswordFrom)
			newSymbol += passwordOfUppercaseLetters[0];

		if (passwordOfLowercaseLetters.length == maxQuantity && passwordOfLowercaseLetters != lastSymbolForPasswordFrom)
			newSymbol += passwordOfLowercaseLetters[0];

		//Вот этот символ
		newSymbol = newSymbol[next(newSymbol.length)];

		//Удаляем символ из последовательности и запоминаем последовательность
		if (!!~passwordOfNumbers.indexOf(newSymbol)) {
			passwordOfNumbers = passwordOfNumbers.replace(newSymbol, "");
			lastSymbolForPasswordFrom = passwordOfNumbers;
		}
		else if (!!~passwordOfSymbols.indexOf(newSymbol)) {
			passwordOfSymbols = passwordOfSymbols.replace(newSymbol, "");
			lastSymbolForPasswordFrom = passwordOfSymbols;
		}
		else if (!!~passwordOfUppercaseLetters.indexOf(newSymbol)) {
			passwordOfUppercaseLetters = passwordOfUppercaseLetters.replace(newSymbol, "");
			lastSymbolForPasswordFrom = passwordOfUppercaseLetters;
		}
		else if (!!~passwordOfLowercaseLetters.indexOf(newSymbol)) {
			passwordOfLowercaseLetters = passwordOfLowercaseLetters.replace(newSymbol, "");
			lastSymbolForPasswordFrom = passwordOfLowercaseLetters;
		}

		//И добавляем к паролю
		password += newSymbol;
	}
	//#endregion

	console.log(password);
	return password;
}

function getSumOfUTF8BytesFromString(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
	
	var sum = 0;
	for (var i = 0; i < utf8.length; i++) {
		sum += utf8[i];
	}
    return sum;
}

function next(n) {
	seed = (seed * seed) % _m;
	var x = (n - 1) * seed / _m;
	return Math.round(x);
}

