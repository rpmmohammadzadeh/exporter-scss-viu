/**
 * Convert group name, token name and possible prefix into camelCased string, joining everything together
 */


Pulsar.registerFunction(
  "readableVariableName",
  function (token, tokenGroup, prefix) {
    // Create array with all path segments and token name at the end
    const segments = [...tokenGroup.path];
    if (!tokenGroup.isRoot) {
      segments.push(tokenGroup.name);
    }
    segments.push(token.name);

    if (prefix && prefix.length > 0) {
      segments.unshift(prefix);
    }

    // Create "sentence" separated by spaces so we can camelcase it all
    let sentence = segments.join(" ");

    // Remove repetitive strings from the sentence
    sentence = sentence.split(" ").filter((word, index, arr) => arr.indexOf(word) === index).join(" ");

    // Convert all words to lowercase
    sentence = sentence.toLowerCase();

    // Replace all non-alphanumeric characters with underscores
    sentence = sentence.replace(/[^a-zA-Z0-9_]/g, "-");

    // Prepend an underscore if the sentence starts with a digit
    if (/^\d/.test(sentence)) {
      sentence = "_" + sentence;
    }

    return sentence;
  }
);

function findAliases(token, allTokens) {
  let aliases = allTokens.filter(
    (t) => t.value.referencedToken && t.value.referencedToken.id === token.id
  );
  for (const t of aliases) {
    aliases = aliases.concat(findAliases(t, allTokens));
  }
  return aliases;
}

Pulsar.registerFunction("findAliases", findAliases);

Pulsar.registerFunction("gradientAngle", function (from, to) {
  var deltaY = to.y - from.y;
  var deltaX = to.x - from.x;
  var radians = Math.atan2(deltaY, deltaX);
  var result = (radians * 180) / Math.PI;
  result = result + 90;
  return (result < 0 ? 360 + result : result) % 360;
});

/**
 * Behavior configuration of the exporter
 * Prefixes: Add prefix for each category of the tokens. For example, all colors can start with "color, if needed"
 */
Pulsar.registerPayload("behavior", {
  colorTokenPrefix: "color",
  borderTokenPrefix: "border",
  gradientTokenPrefix: "color",
  measureTokenPrefix: "",
  shadowTokenPrefix: "",
  typographyTokenPrefix: "",
  radiusTokenPrefix: "",
  textTokenPrefix: "",
});

Pulsar.registerFunction("rgbaToHsla", function (r, g, b, a = 1) {
  var ratiodR = r / 255;
  var ratiodG = g / 255;
  var ratiodB = b / 255;

  var cmin = Math.min(ratiodR, ratiodG, ratiodB),
    cmax = Math.max(ratiodR, ratiodG, ratiodB),
    delta = cmax - cmin,
    h;

  if (delta === 0) {
    h = 0;
  } else if (cmax === ratiodR) {
    h = ((ratiodG - ratiodB) / delta) % 6;
  } else if (cmax === ratiodG) {
    h = (ratiodB - ratiodR) / delta + 2;
  } else {
    h = (ratiodR - ratiodG) / delta + 4;
  }

  h = Math.round(h * 60);

  var hue = h + (h < 0 ? 360 : 0);

  var light = (cmax + cmin) / 2;
  var lightness = Math.round(((cmax + cmin) / 2) * 100);
  var saturation = Math.round(
    (delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1))) * 100
  );

  var alpha = Math.round((a / 255) * 10) / 10;

  return (
    "hsla(" + hue + "," + saturation + "%," + lightness + "%," + alpha + ")"
  );
});

Pulsar.registerFunction("logKeys", function (object) {
  for (const entry in object) {
    console.log(entry);
  }
});

Pulsar.registerFunction("baseWrap", function (token, designSystemName) {
  const stringPrefix = token.split(":")[0];
  const safeName = designSystemName.toLowerCase();
  if (stringPrefix === "data") {
    return `url("${token}")`;
  }

  if (token.includes("keyframes")) {
    return token.replace("keyframes", `keyframes-${safeName}`);
  }

  return token;
});

Pulsar.registerFunction("getSelector", function (name) {
  const safeName = name.toLowerCase();

  return '[data-theme="' + safeName + '"]';
});

Pulsar.registerFunction("getScheme", function (name) {
  const safeName = name.toLowerCase();

  if (safeName === "dark") {
    return "color-scheme: dark;";
  }

  return "color-scheme: light;";
});

Pulsar.registerFunction("pixelsToRem", function (value) {
  return `${value["measure"] / 10}rem`;
});

Pulsar.registerFunction("log", function (token) {
  console.log(Object.keys(token));
  console.log(token.name);

  return token;
});

Pulsar.registerFunction(
  "constructGenericTokensStyles",
  function (token, dsName) {
    const name = token.name;
    const safeThemeName = dsName.toLowerCase();

    if (token.name.includes("keyframes")) {
      return `@keyframes ${safeThemeName}-${name} `;
    }

    return token.name;
  }
);

Pulsar.registerFunction("prefixWithThemeName", function (value, dsName) {
  const safeThemeName = dsName.toLowerCase();
  return `${safeThemeName}-${value}`;
});
