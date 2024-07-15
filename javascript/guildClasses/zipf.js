"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

class Zipf {
    constructor(zipfMap, self){
        /**
         *  takes two arguments from the parent guild constructor object
         * @param zipfMap - The original zipfMap object before Class encapsulation
         * @param self - A serialized copy without methods of this object, containing all the latest data after the transfer
         * 
         * In all three cases, zipfMap is:
         * 
         * A hash map of words that have been observed to occur in the server.  Maps a word string to a
         * @type [key][string]word -> [value][int]instances
         * 
         */
        this.zipfMap = self.zipfMap || zipfMap || {}; // reimport the map either from the origin or the new source
    }

    getZipfSubset (startIndex) {
        let uniqueWordCount = Object.keys(this.zipfMap).length;
        if(!isFinite(startIndex)){
            return `Inappropriate input parameter: \`${startIndex}\`. Expected a number 1 - ${uniqueWordCount}`;
        }else{
            startIndex = startIndex-0;
        }

        //convert hashmap to array
        let zipfArray = [ ];
        for(let word in this.zipfMap){
            zipfArray.push({word:word, occurrences:this.zipfMap[word]});
        }
        zipfArray.sort((a,b) => {return b.occurrences - a.occurrences});

        let maxZipfWordLen = 0;
        let maxZipfIdxLen = 0;

        let idxAlignFlag = "%iaf";
        let freqAlignFlag = "%faf";
        let includedWords = [];

        let printData = ["Frequency of values starting at " + startIndex + "```"];
        for(let i = -1; i<9 && startIndex+i < zipfArray.length; i++){
            let wordObj = zipfArray[startIndex+i];
            includedWords.push(wordObj);
            maxZipfWordLen = Math.max(maxZipfWordLen, wordObj.word.length);
            let pushString = ""+(1+startIndex+i) + ":" + idxAlignFlag + wordObj.word + freqAlignFlag+" - " + wordObj.occurrences + "";
            printData.push(pushString);
            maxZipfIdxLen = Math.max(maxZipfIdxLen, pushString.indexOf(":"));
        }

        //Skarm.spam(`maxZipfWordLen: ${maxZipfWordLen}`);

        for(let i in printData){
            let lineText = printData[i];
            if(lineText.includes(freqAlignFlag)){
                let replacementString = "";
                let spaceBufferWidth = 2 + maxZipfWordLen -  includedWords[i-1].word.length;
                //Skarm.spam(`Assigning ${spaceBufferWidth} spaces for ${lineText}`);
                for(let j=0; j<spaceBufferWidth; j++){
                    replacementString+= " ";
                }
                while(replacementString.includes("    "))
                    replacementString = replacementString.replace("    ","\t");
                lineText = lineText.replace(freqAlignFlag,replacementString)
            }

            let indexEndFlag = ":";
            let idxAlignText = "  ";
            if(lineText.includes(indexEndFlag)){
                if(lineText.indexOf(":") < maxZipfIdxLen)
                    idxAlignText+= " ";
                lineText = lineText.replace(idxAlignFlag, idxAlignText);
            }

            printData[i] = lineText;
        }

        printData.push("```");
        return printData.join("\r\n");
    }

    
    appendZipfData (content) {
        //Skarm.spam(`Received content: ${content}`);
        //filter sentence structure
        content = content.toLowerCase();


        //purge special characters
        let replaceWithSpaceChars  = '.,/\r\n:()<>@"`#$%^&*_+={}[]\\|?!;';
        for(let i in replaceWithSpaceChars){
            let repl = replaceWithSpaceChars[i];
            while(content.includes(repl)){
                content = content.replace(repl," ");
            }
        }

        while(content.includes("  ")){
            content = content.replace("  "," ");
        }


        let words = content.split(" ");

        //Skarm.spam(`Generated array: ${words}`);

        for(let i in words){
            let word = words[i];

            //filter word structure
            if(word.includes("http"))   continue;
            if(word.includes("="))      continue;
            if(word[0] === "-")         continue;
            if(word[0] === "!")         continue;
            if(word.length > 1 && word[1] === "!")         continue;

            if(!(word in this.zipfMap))
                this.zipfMap[word] = 0;
            this.zipfMap[word]++;
        }

        if ("" in this.zipfMap){
            delete this.zipfMap[""];
        }
    };
}

module.exports = {
    Zipf
}
