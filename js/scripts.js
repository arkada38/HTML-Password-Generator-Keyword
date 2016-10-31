"use strict";

$(function () {

    $("#password_length").on("input", function () {
        $("#password_length_range").val($("#password_length").val());
    });

    $("#password_length_range").on("input", function () {
        $("#password_length").val($("#password_length_range").val());
    });

    $("#main_form").on("input", function () {
        onFormChange();
    });

    $("#special_characters_checkbox").on("change", function () {
        onFormChange();
    });

    $("#copy_button").on("click", function () {
        document.getElementById("password").select();
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    });

});

function onFormChange() {
    var serviceName = $("#service_name").val();
    var keyword = $("#keyword").val();
    var passwordLength = parseFloat($("#password_length").val());
    var useSpecialCharacters = document.getElementById("special_characters_checkbox").checked;

    $("#password").val(generatePassword(serviceName, keyword, passwordLength, useSpecialCharacters));
}

var _uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var _lowercaseLetters = "abcdefghijklmnopqrstuvwxyz".split("");
var _numbers = "1234567890".split("");
var _specialCharacters = "!#$%'()*+-./:?@[]^_`{}~".split("");

var _seed;
var _m = (38 * 4 + 3) * (62 * 4 + 3);// p % 4 = 3 // q % 4 = 3 // m = p * q

function generatePassword(serviceName, keyword, passwordLength, useSpecialCharacters) {
    var serviceNameScore = getScoreOfUTF8BytesFromString(serviceName);
    var keywordScore = getScoreOfUTF8BytesFromString(keyword);

    _seed = serviceNameScore + serviceNameScore % 9 +
                keywordScore -     keywordScore % 4 -
                passwordLength;

    //Password should be contain uppercase, lowercase, numbers and special characters
    //without repeated characters
    //and consecutive of letters or numbers

	var quantityOfSpecialCharacters = 0;
    if (useSpecialCharacters)
        quantityOfSpecialCharacters = Math.max(2, Math.floor(passwordLength / 5));

    var quantityOfNumbers = Math.floor(passwordLength / 4);
    var quantityOfUppercaseLetters = Math.floor((passwordLength - quantityOfNumbers - quantityOfSpecialCharacters) / 2);
    var quantityOfLowercaseLetters = passwordLength - quantityOfNumbers - quantityOfSpecialCharacters - quantityOfUppercaseLetters;

    var passwordOfNumbers = "";
    var passwordOfSpecialCharacters = "";
    var passwordOfUppercaseLetters = "";
    var passwordOfLowercaseLetters = "";

    //quantityOfSpecialCharacters <= quantityOfNumbers <= quantityOfUppercaseLetters <= quantityOfLowercaseLetters

    //#region Составление символов для пароля
    //uppercase
    var uppercaseLetters = _uppercaseLetters.slice();
    for (var i = 0; i < quantityOfUppercaseLetters; i++) {
        var j = nextRandom(uppercaseLetters.length);
        passwordOfUppercaseLetters += uppercaseLetters[j];
        uppercaseLetters.splice(j, 1);
    }

    _seed += serviceName.length;

    //lowercase
    var lowercaseLetters = _lowercaseLetters.slice();
    for (var i = 0; i < quantityOfLowercaseLetters; i++) {
        var j = nextRandom(lowercaseLetters.length);
        passwordOfLowercaseLetters += lowercaseLetters[j];
        lowercaseLetters.splice(j, 1);
    }

    _seed += keyword.length;

    //numbers
    var numbers = _numbers.slice();
    for (var i = 0; i < quantityOfNumbers; i++) {
        var j = nextRandom(numbers.length);
        passwordOfNumbers += numbers[j];
        numbers.splice(j, 1);
    }

    _seed += passwordLength;

    //specialCharacters
    var specialCharacters = _specialCharacters.slice();
    for (var i = 0; i < quantityOfSpecialCharacters; i++) {
        var j = nextRandom(specialCharacters.length);
        passwordOfSpecialCharacters += specialCharacters[j];
        specialCharacters.splice(j, 1);
    }

    _seed += serviceName.length + keyword.length + passwordLength;
    //#endregion

    //#region Перемешивание символов для пароля и его создание
    //Creation a password
    var password = "";
    var lastSymbolForPasswordFrom = "";

    for (var i = 0; i < passwordLength; i++) {
        //Максимальное значение символов в категории последовательности для пароля
        var maxQuantity = Math.max(Math.max(passwordOfNumbers.length, passwordOfSpecialCharacters.length),
			Math.max(passwordOfUppercaseLetters.length, passwordOfLowercaseLetters.length));

        //Новый символ пароля будет из одной из самых длинных последовательностей
        var newSymbol = "";

        //Отбираем претендентов
        if (passwordOfNumbers.length == maxQuantity && passwordOfNumbers != lastSymbolForPasswordFrom && password.length > 0)
            newSymbol += passwordOfNumbers[0];

        if (passwordOfSpecialCharacters.length == maxQuantity && passwordOfSpecialCharacters != lastSymbolForPasswordFrom && password.length > 0)
            newSymbol += passwordOfSpecialCharacters[0];

        if (passwordOfUppercaseLetters.length == maxQuantity && passwordOfUppercaseLetters != lastSymbolForPasswordFrom)
            newSymbol += passwordOfUppercaseLetters[0];

        if (passwordOfLowercaseLetters.length == maxQuantity && passwordOfLowercaseLetters != lastSymbolForPasswordFrom)
            newSymbol += passwordOfLowercaseLetters[0];

        //Вот этот символ
        newSymbol = newSymbol[nextRandom(newSymbol.length)];
        _seed += 1;

        //Удаляем символ из последовательности и запоминаем последовательность
        if (!!~passwordOfNumbers.indexOf(newSymbol)) {
            passwordOfNumbers = passwordOfNumbers.replace(newSymbol, "");
            lastSymbolForPasswordFrom = passwordOfNumbers;
        }
        else if (!!~passwordOfSpecialCharacters.indexOf(newSymbol)) {
            passwordOfSpecialCharacters = passwordOfSpecialCharacters.replace(newSymbol, "");
            lastSymbolForPasswordFrom = passwordOfSpecialCharacters;
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

    return password;
}

function getScoreOfUTF8BytesFromString(str) {
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
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
            // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18),
                      0x80 | ((charcode >> 12) & 0x3f),
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }

    var score = 0;
	
    for (var i = 0; i < utf8.length; i++) {
		score += utf8[i];
		if (i % 2 != 0)
			score += utf8[i];
		else
			score -= utf8[i] * 2;
    }

	while (score > 1000)
		score -= 1000;
	
    return score;
}

function nextRandom(n) {
    _seed = (_seed * _seed) % _m;
    var x = (n - 1) * _seed / _m;
    return Math.round(x);
}

function checkPasswords() {
	console.log("01 - " + generatePassword("amazon", "horse", 12, true));
	console.log("02 - " + generatePassword("amazon", "horse", 12, false));
	
	console.log("03 - " + generatePassword("Просто длинное имя для сервиса",
	"Просто длинное ключевое слово", 32, true));
	console.log("04 - " + generatePassword("Просто длинное имя для сервиса",
	"Просто длинное ключевое слово", 32, false));
	
	console.log("05 - " + generatePassword("Just too long service name",
	"Just too long keyword", 32, true));
	console.log("06 - " + generatePassword("Just too long service name",
	"Just too long keyword", 32, false));
	
	console.log("07 - " + generatePassword("Just too long service name Просто длинное имя для сервиса",
	"Just too long keyword Просто длинное ключевое слово", 32, true));
	console.log("08 - " + generatePassword("Just too long service name Просто длинное имя для сервиса",
	"Just too long keyword Просто длинное ключевое слово", 32, false));
	
	console.log("09 - " + generatePassword("Just too long !@#$%^&*()_ имя для сервиса",
                "Just too long !@#$%^&*()_ ключевое слово", 32, true, 32, true));
	console.log("10 - " + generatePassword("Just too long !@#$%^&*()_ имя для сервиса",
	"Just too long !@#$%^&*()_ ключевое слово", 32, false));
}