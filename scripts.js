function generateRandom(min, max) {
  var upperLimit = parseInt(max) + 1;
  var tooBig = bigInt(bigInt(2).pow(upperLimit));
  var result = bigInt.randBetween(min, tooBig.prev().toString()).toString();
  return result;
}

function generatePrime(min, max) {
  var prime = bigInt(generateRandom(min, max));
  if (prime.isProbablePrime() === true) {
    return prime;
  } else {
    return generatePrime(min, max);
  }
}

function generateSharedKey(strength) {
  var min = '0';
  var sharedKey = generateRandom(min, strength);

  sharedKeyStrength.value = '128';
  return sharedKey;
}

function makeFactors(sharedKey) {
  var p = '';
  var q = '';
  var diff = Math.floor(Math.random() * 7) + 2;
  var diff1 = 0;
  var diff2 = 0;
  diff = parseInt(diff);
  if (diff % 2 === 0) {
    diff1 = diff / 2;
    diff2 = diff / 2;
  } else {
    diff1 = (diff - 1) / 2;
    diff2 = (diff + 1) / 2;
  }

  var long = parseInt(publicKeyStrength.value) / 2 + diff1;
  var short = parseInt(publicKeyStrength.value) / 2 - diff2;

  p = generatePrime(sharedKey, long.toString());
  q = generatePrime(sharedKey, short.toString());

  return {
    pPrime: p,
    qPrime: q,
  };
}

function displayWorking() {
    $('#submit').attr('value', 'Calculating...');
    $('#submit').prop('disabled', 'true');
  }

function displayDone() {
  $('#submit').attr('value', 'Done');
  $('#submit').prop('disabled', 'false');
}

$(function() {

  $('form').on('submit', function(e) {
    e.preventDefault();

    displayWorking();

    var sharedKey = generateSharedKey(sharedKeyStrength.value);
    console.log('shared key: ', sharedKey.toString());

    var primes = makeFactors(sharedKey);
    console.log('p: ', primes.pPrime.toString());
    console.log('q: ', primes.qPrime.toString());

    var n = primes.pPrime.multiply(primes.qPrime);
    console.log('n: ', n.toString());

    var totient = primes.pPrime.prev().multiply(primes.qPrime.prev());
    console.log('totient: ', totient.toString());

    var encriptionExponent = bigInt(65537);
    if (bigInt.gcd(encriptionExponent, totient) !== 1) {
      encriptionExponent = generatePrime(encriptionExponent, encriptionExponent.pow(3).toString());
    }

    console.log('e: ', encriptionExponent.toString());

    displayDone();
  });

});
