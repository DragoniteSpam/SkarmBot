let commandParamTokens = function(message) {
    let tokens = [];
    let quoteCount = (message.match(/"/g) || []).length;
    if (quoteCount % 2 === 0 && quoteCount > 0) {
        firstLayerTokens = message.split('"');
    } else {
        firstLayerTokens = [message];
    }


    for(let i in firstLayerTokens) {
        if(i%2 == 1){  // inside of quotes.  Paired -> successive swaps, starting at out
            tokens.push(firstLayerTokens[i]);
        } else {       // outside of quotes
            let words = firstLayerTokens[i].split(" ");
            for(let word of words) {
                tokens.push(word);
            }
        }
    }

    // prune empty tokens
    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].length === 0){
            tokens.splice(i--,1);
        }
    }
    tokens.shift();
    return tokens;
};



let testCases = {
    " e@parrot skarm 0.3 0.3 ": ["skarm", "0.3", "0.3"],
    ' e@parrot skarm "something completely" 0.3    ' : ["skarm", "something completely", "0.3"],
    ' e@parrot skarm "" 0.3 ': ["skarm", "0.3"],
    'e@omnibus "there once was a" hero "named ragnar the red" who came ': [ "there once was a", "hero", "named ragnar the red", "who", "came"],
    'e@omnibus "there once was a" hero "named ragnar the red" who came "': [ '"there', 'once', 'was', 'a"', "hero", '"named', 'ragnar', 'the', 'red"', "who", "came", '"'],
}

let passed = 0;

function equalArrs (a1, a2){
    if (a1.length != a2.length) return false;
    for(let i in a1){
        if(a1[i] !== a2[i]) return false;
    }

    return true;
}

for(let input in testCases){
    let response = commandParamTokens(input);
    if(equalArrs(response, testCases[input])) passed++;
    else console.log("Failed test: ", input, "Found:", response, "Expected:", testCases[input]);
}
console.log(`Passed ${passed}/${Object.keys(testCases).length}`);

