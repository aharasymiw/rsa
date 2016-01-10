function random_prime(min, max) {
  var p = Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
  if (bigInt(p).isProbablePrime(5) === true) {
    return p;
  } else {
    return random_prime(min, max);
  }
}

// Algorithm for this function sourced from https://en.wikipedia.org/wiki/RSA_(cryptosystem)#A_working_example
function calculatePrivateExponent(totient, publicExponent) {
  var t = 0;
  var nt = 1;
  var r  = totient;
  var nr = publicExponent % totient;

  while (nr !== 0) {
    var quot = (r / nr) | 0;
    var tmp = nt;

    nt = t - quot * nt;
    t = tmp;
    tmp = nr;
    nr = r - quot * nr;
    r = tmp;
  }

  if (r > 1) {
    return -1;
  }

  if (t < 0) {
    t += totient;
  }

  return t;
}

function calculatePublicExponent(totient) {
  var publicExponent = Math.floor(Math.random() * (totient - 1)) + 1;
  if (bigInt.gcd(totient, publicExponent).valueOf() === 1) {
    return publicExponent;
  } else {
    return calculatePublicExponent(totient);
  }
}

function cipher(key, exponent, n) {
  return bigInt(key).modPow(exponent, n);
}

function displayWorking() {
  $('#submit').attr('value', 'Calculating...');
}

function displayDone() {
  $('#submit').attr('value', 'Done');
}

$(function() {

  $('form').on('submit', function(e) {
    e.preventDefault();
    var $ul = $('<ul>');
    displayWorking();

    var sharedKey = parseInt(sharedKeyStrength.value);

    $ul.append($('<li>').text('Shared key (Secret message): ' + sharedKey));
    sharedKeyStrength.value = '5';

    var publicKeySize = parseInt(publicKeyStrength.value);
    $ul.append($('<li>').text('Public key size: ' + publicKeySize));
    var smallPublicKeySize = publicKeySize / 2 - 1;
    $ul.append($('<li>').text('Maximum bits for p: ' + smallPublicKeySize));
    var bigPublicKeySize = publicKeySize / 2 + 1;
    $ul.append($('<li>').text('Maximum bits for q: ' + bigPublicKeySize));
    publicKeyStrength.value = '18';

    var p = random_prime(1, bigInt(2).pow(smallPublicKeySize));
    $ul.append($('<li>').text('p (a random prime less than 2^' + smallPublicKeySize + '): ' + p));
    var q = random_prime(1, bigInt(2).pow(bigPublicKeySize));
    if (q === p) {
      do {
        q = random_prime(1, bigInt(2).pow(bigPublicKeySize));
      } while (q === p);
    }

    $ul.append($('<li>').text('q (a random prime less than 2^' + bigPublicKeySize + '): ' + q));

    var n = p * q;
    $ul.append($('<li>').text('n = p * q: ' + n));
    var totient = (p - 1) * (q - 1);
    if (bigInt.gcd(totient, n).valueOf() !== 1) {alert('This result is not reliable.  Either one of p or q are a perfect number, trivially prime, or (p-1) and (q-1) have too many shared factors.  This is likely due to a high radio of shared key bitlength to private key bitlength.  In a production application, this would not be an issue.');}

    $ul.append($('<li>').text('totient = (p-1) * (q-1): ' + totient));

    var publicExponent = calculatePublicExponent(totient);
    $ul.append($('<li>').text('Public exponent (Coprime to, and less than the totient): ' + publicExponent));
    var privateExponent = calculatePrivateExponent(totient, publicExponent);
    $ul.append($('<li>').text('Private exponent (Multiplicitive inverse of the Public exponent, mod the totient): ' + privateExponent));

    var encryptedKey = cipher(sharedKey, publicExponent, n);
    $ul.append($('<li>').text('Encrypted key (Scrambled message): ' + encryptedKey.valueOf()));
    var decryptedKey = cipher(encryptedKey.valueOf(), privateExponent, n);
    $ul.append($('<li>').text('Decrypted key (Secret message revealed!): ' + decryptedKey.valueOf()));

    $('ul').html($ul);
    displayDone();
  });

});
