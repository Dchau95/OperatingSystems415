var folderLocation = "root"
function runCMD(userInput)
{
    var arrArguments = [];
    var command = userInput.split(/\s+/g);
    console.log(userInput);

    for(var i = 1; i < command.length; i++) {
        arrArguments.push(command[i]);
    }
    
    switch(command[0].toLowerCase())
    {
        case "clear": case "cls":
            clearCMD();
            break;
        case "ls": case "dir":
            lsCMD(arrArguments);
            break;
        case "man": case "help":
            man();
            break;
        case "delete": case "rm":
            deleteCMD(arrArguments[0]);
            break;
        case "copy": case "cp":
            copyCMD(arrArguments[0], arrArguments[1]);
            break;
        case "ps":
            ps();
            break;
        case "kill":
            kill(arrArguments[0]);
            break;
        case "more":
            more(arrArguments[0]);
            break;
        case "cat":
            cat(arrArguments, 0);
            break;
        case "script": case "sh": case "bash":
            script(arrArguments[0])
            break;
        case "contactp":
            runContact();
            break;
        case "bankp":
            runBank();
            break;
        case "passwordp":
            runPassword();
            break;
        case "readp":
            runRead();
            break;
        case "statsp":
            runStats();
            break;
        case "vectorp":
            runVector();
            break;
        case "scriptp":
            runScript();
            break;
        case "charwatchp":
            runCharWatch();
            break;
        case "starterp":
            runStarter();
            break;
        case "sleepp":
            runSleep();
            break;
        case "consumep":
            runConsumeProcess(arrArguments[0]);
            break;
        case "philp":
            runPhil();
            break;
        case "reset":
            reset();
            break;
        case "memstats":
            displayMemory();
            break;
        case "cd":
            cdCMD(arrArguments[0]);
            break;
        case "mkdir":
            mkdirCMD(arrArguments[0]);
            break;
        default:
            commandOutput("That is not a valid command.\n");
            break;
    }
}


function displayMemory() {
    var task = {
        sysCall : "Memory Stats",
    };
    device.postMessage(task);
}

function cdCMD(folder)
{
    //Make sure it's a folder
    //Make sure it goes back a folder
    
    if(folder === ".." && folderLocation !== "root")
    {
        document.getElementById("filepath").innerHTML = "C:\\Interrobang\>";
        folderLocation = "root";
        return;
    }
    else if (folder.toLowerCase() !== "results")
    {
        commandOutput("The folder does not exist\n")
        return;
    }
    else 
    {
        document.getElementById("filepath").innerHTML = "C:\\Interrobang\\" + folder + ">";
        folderLocation = folder.toLowerCase().toString();
        return;
    }
}

function clearCMD()
{
    var errorCode = 0;
    contentout.innerText = ""; 
    return errorCode;
}

function reset(){
    console.log(indexedDB.deleteDatabase("hashDirectory"));
    location.reload();
}

function lsCMD(directories)
{
    console.log(folderLocation);
    console.log(directories);
    var result = "";
    try {
        //List current directory
        if(directories.length === 0 || directories[0] === "") {
            var transact = db.transaction([folderLocation]);
            var store = transact.objectStore(folderLocation);
            var index = store.index("by_filename");
            index.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    result = result.concat(cursor.value.filename + "\n");
                    cursor.continue();
                } else {
                    console.log("All Entries Displayed.");
                    commandOutput(result);
                    return result;
                }
            }
            index.openCursor().onerror = function(event) {
                console.log("An error has occured.");
                console.log(event.target.errorCode);
            }
        }
        //List one or more directories listed
        else {
            for(var i = 0; i < directories.length; i++) {
                var transact = db.transaction([directories[i].toLowerCase()]);
                var store = transact.objectStore(directories[i].toLowerCase());
                var index = store.index("by_filename");
                index.openCursor().onsuccess = function(event) {
                    var cursor = event.target.result;
                    if(cursor) {
                        result= result.concat(cursor.value.filename + "\n");
                        cursor.continue();
                    } else {
                        console.log("All Entries Displayed.");
                        commandOutput(result);
                        return result;
                    }
                }
                index.openCursor().onerror = function(event) {
                    console.log("An error has occured.");
                    console.log(event.target.errorCode);
                }
            }
        }
    } 
    catch (error){
        commandOutput("That directory does not exist.\n");
        return;
    }
}

function deleteCMD(fileName)
{
    var transact = db.transaction([folderLocation], "readwrite");
    var store = transact.objectStore(folderLocation);
    var index = store.index("by_filename");

    index.openCursor().onsuccess = function(event){
        var cursor = event.target.result;
        if(cursor) {
            if (cursor.value.filename === fileName){
                var request = store.delete(cursor.primaryKey);
                request.onsuccess = function(){
                    console.log(request.result);
                    console.log("File Deleted: " + fileName)
                    commandOutput("File Removed")
                }
            }
            cursor.continue();
        }

    }

}

//Maybe todo CopyFilename be directories + filename
function copyCMD(fileName, copyFileName)
{
    var errorCode = 0;
    var transact = db.transaction([folderLocation], "readwrite");
    var store = transact.objectStore(folderLocation);
    var index = store.index("by_filename");

    var request = index.get(fileName);
    request.onsuccess = function() {
        console.log("Copying File: " + fileName + " to: copyFileName: " + copyFileName);
        var hold = request.result.content;
        
        os.create(copyFileName, "write", 10);
        os.write(copyFileName, 1, hold, "result");
    }
    request.onerror = function(event){
        console.log("An error has occured.");
    }
    return errorCode;
}

var index = 0;
var stopInterval;
function runConsume(arguement){
    commandOutput("You may want to do something else while this runs\n");
    stopInterval = setInterval(function(){
        var output = "outputFile"+index+".file";
        index++;
        commandOutput("We're outputting "+index+"\n");
        copyCMD(arguement, output);
    }, 3000);
}

function mkdirCMD(folder) {
    var store = db.createObjectStore(folder, {autoIncrement: true});
    store.createIndex("by_filepath", "filepath");
    store.createIndex("by_filename", "filename", {unique: true});
    store.createIndex("by_content", "content");
    store.createIndex("by_filesize", "filesize");
    
    var transact = db.transaction([folderLocation], "readwrite");
    var store2 = transact.objectStore(folderLocation);
    store2.put({filepath: "", filename: folder, content: "Folder", filesize: 0});
}

/**
Help manual
clear, ls or dir, delete, copy, ps, kill, more, cat, man …
*/
function man()
{
    var errorCode = 0;
    var result = "\nAssignment 2 Processes\n";
    result += "------------------------------------------------------\n";
    result += "clear : Clear terminal screen\n";
    result += "reset : Clear terminal and reset database\n";
    result += "ls or dir : List directory contents, takes in one or more parameters\n";
    result += "delete or rm : Delete file. Requires one (or more) parameter\n";
    result += "copy or cp: Copy file. Requires two parameters\n";
    result += "ps : Print process status\n";
    result += "kill : Ends current process. Requires one parameter\n";
    result += "more : Display file output screen. Requires one parameter\n";
    result += "cat : Display file(s) content. Requires one or more parameters\n";
    result += "man or help : Display help manual\n";
    result += "\nAssignment 1 Processes\n";
    result += "------------------------------------------------------\n";
    result += "contactp : Initiates the contact manager process\n";
    result += "bankp : Initiates the bank calculator process\n";
    result += "passwordp : Initiates the password process\n";
    result += "readp : Initiates the sort a list of numbers process\n";
    result += "vectorp : Initiates the vector calculator process\n";
    result += "statsp : Initiates the statistics calculator process\n";
    result += "\nAssignment 4 Processes\n";
    result += "------------------------------------------------------\n";
    result += "scriptp : Initiates the script process and runs script\n";
    result += "script or sh or bash: Run a script from a file. Requires one parameter\n";
    result += "charwatchp : Initiates the character watch process\n";
    result += "starterp : Starts the starter process, which starts the mather process and statsp process\n";
    result += "sleepp : Starts the sleep process which sleeps after doing some work, starts a new process which starts and finishes work, and then alerts the sleep process to wake up\n";
    result += "philp : Starts the philosopher process\n";
    result += "\nAssignment 5 Processes\n";
    result += "------------------------------------------------------\n";
    result += "memstats: Displays the remaining memory in the Operating System\n";
    result += "cd: Change directory, requires one parameter\n";
    result += "consumep: Copies the specified file over and over. Takes in one parameter\n";
    commandOutput(result);
    return result;
}

/**
Concatenate files and print on the standard output	
*/
/**compare array of "files passed in then print"
file elements matching hastable(array of files)
*/
function cat(arrFiles, rec)
{
    var transact = db.transaction([folderLocation]);
    var store = transact.objectStore(folderLocation);
    var index = store.index("by_filename");
    var i = rec;
    var errorCode = 0;
    var request = index.get(arrFiles[i]);
    request.onsuccess = function(){
        if(request.result === undefined){
            console.log("File Not Found");
            commandOutput("File not found.\n");
        } else {
        console.log("Reading File: " + arrFiles[i] + " Contents: " + request.result.content);
        if (request.result.content !== "Folder")
            commandOutput(request.result.content + "\n");
        else
            commandOutput(arrFiles[i] +": Is a directory " + "\n");
        }
        i++;
        if(i < arrFiles.length){
            cat(arrFiles, i);
        }
    }
    request.onerror = function(event) {
        console.log("An error occured");
        i++;
        if(i < arrFiles.length){
            cat(arrFiles, i);
        }
    }
    return errorCode;
}

/**
Display output one screen at a time	
-At the moment, even when the more command is active, it allows usage of other linux commands
-When you do = for current line number, it displays it on the console but doesn't go away
-Need to capture the ENTER/return key. For now, just made it e

*/
var moreIncrement = 0;
function more(fileName)
{  
    var transact = db.transaction([folderLocation], "readwrite");
    var store = transact.objectStore(folderLocation);
    var index = store.index("by_filename");

    moreFlag = 1;
    var request = index.get(fileName);
    request.onsuccess = function(){

        var splitFile = request.result.content.match(/.{1,129}/g);
        document.getElementById("filepath").innerHTML = "--more (" + Math.round(100 * (moreIncrement / splitFile.length)) + "%)--";
        var moreInput = contentin.innerText;
        contentin.innerText = "";
        inputbox.value = "";
        //variable that represents how much to print per screen
        var screenful = 5;

        if(moreIncrement === 0)
        {
        //Show initial amount comparable to screen size
            while((moreIncrement < screenful) && (moreIncrement < splitFile.length))
            {
                commandOutput(splitFile[moreIncrement]+"\n");
                moreIncrement = moreIncrement + 1;
            }
        }

        switch(moreInput)
        {
            //If input == space, Display next page/Next amount of text the browser can show/allowed to show
            //z is the same, however, any argument will become the new default. Is not implemented
            case "\u00A0": case "z":
                var temp = moreIncrement;
                while(moreIncrement < temp+screenful && moreIncrement < splitFile.length){
                    commandOutput(splitFile[moreIncrement]+"\n");
                    moreIncrement = moreIncrement + 1;
                }
                break;
            //Display next line, wrapped around screen, how do capture enter
            case "e":
                commandOutput(splitFile[moreIncrement]+"\n");
                moreIncrement = moreIncrement + 1;
                break;
            //Skip forward k lines and then does SPACEBAR case, where k is defaulted to 1.
            case "s":
                moreIncrement = moreIncrement + 1;
                var temp = moreIncrement;
                commandOutput("... skipping 1 line\n");
                while(moreIncrement < temp+screenful && moreIncrement < splitFile.length){
                    commandOutput(splitFile[moreIncrement]+"\n");
                    moreIncrement = moreIncrement + 1;
                }
                break;
            //display next file? Google says Skip forward k screenfuls of text. Defaults to 1.
            // Made it do basically the same thing with "s", but with the screenful part.
            case "f":
                var arrCount = 1;
                moreIncrement = moreIncrement + screenful;
                var temp = moreIncrement;
                commandOutput("... skipping 1 screenful of text\n");
                while(moreIncrement < temp+screenful && moreIncrement < splitFile.length){
                    commandOutput(splitFile[moreIncrement]+"\n");
                    moreIncrement = moreIncrement + 1;
                }
                console.log("Display next file");
                break;
            //quit
            case "q": case "Q":
                moreInput = "q";
                break;
            //Shows current file name and current line number
            case ":f":
                commandOutput("Current file is: "+fileName+" Current line number is: "+moreIncrement+"\n");
                break;
            //show available commands
            case "?": case "h":
                commandOutput("-------------------------------------------------\n");
                commandOutput("? or H - Shows Help page\n");
                commandOutput("SPACEBAR or z - Display next page. With z, any argument becomes new default\n");
                commandOutput("ENTER(e for now) - Display next line\n");
                commandOutput("s - Skips k lines where k is defaulted to 1\n");
                commandOutput("f - Display next file\n");
                commandOutput("q or Q - quit more command\n");
                commandOutput(":f - show current file and line number\n");
                commandOutput("= - show current line number\n");
                commandOutput("-------------------------------------------------\n");
                break;
            //show current line number
            case "=":
                commandOutput("THE CURRENT LINE NUMBER IS: "+moreIncrement+"\n");
                break;
        }// ENd "more" switch loop
        if(moreInput === "q" || moreIncrement >= splitFile.length)
        {
            document.getElementById("filepath").innerHTML = "C:\\Interrobang>";
            moreIncrement = 0;
            moreFlag = 0;
        }
        else
        {
            setTimeout(function(){
                more(fileName);
            }, 10);
        }
    }
}//END more function

/** 
Display the process and the state of each running process
*/
function ps()
{
    var errorCode = 0;
    var result = "";
    try {
        for(var i = 0; i<statesQueue.length; i++)
            result += "Process "+statesQueue[i].processName + " is currently "
                    + statesQueue[i].process+"\n" ;
        result += "Process ps is currently Running";
        commandOutput(result);
    }
    catch(err) {
        errorCode = -1;
    }
    return result;
}

function script(fileName){
    setTimeout(function() {
        var transact = db.transaction(["results"]);
        var store = transact.objectStore("results");
        var index = store.index("by_filename");
        var request = index.get(fileName);
        request.onsuccess = function(event) {
            try {
                commands = request.result.content.split(",")
                commandOutput("<>.Script Commands: " + commands +  ".<>\n");

                // Checking for valid script file from directory.
                if (commands[0].indexOf("run:") >= 0){
                    for (var i = 0; i < commands.length; i++){
                        command = commands[i].replace(/\s*run:\s*/, '');
                        osCMD(command);
                    }
                }
                else{
                    commandOutput("This file contains invalid commands.\n")
                }
            } 
            catch(err) {
                script(fileName);
            }
        }
    },1250);
}

/**
Terminate current running process
*/
function kill(processName)
{
    var errorCode = 0;
    try{
        switch(processName){
            case "contactp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "ContactManager") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "bankp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "BankProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "passwordp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "PasswordProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "readp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "ReadProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n\n");
                break;
            case "vectorp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "VectorProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker[i] = undefined;
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "statsp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "StatsProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "scriptp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "ScriptCreatorProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "starterp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === ("StarterProcess" || "MathsProcess" || "StatsMatherProcess")) {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "charwatchp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "CharWatchProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                        defaultStart -= 1;
                    }
                    charWatchInfo.charWatchFlag = false;
                }
                commandOutput("Killed the process\n");
                break;
            case "sleepp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === ("SleepProcess")) {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }

                    if (statesQueue[i].processName === ("SignalProcess")) {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "philp":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "PhilosopherProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                        defaultStart -= 1;
                    }
                }
                commandOutput("Killed the process\n");
                break;
            case "consumep":
                for(var i = 0; i<statesQueue.length; i++){
                    if (statesQueue[i].processName === "ConsumeProcess") {
                        statesQueue.splice(i, 1);
                        arrWorker[i].terminate();
                        arrWorker.splice(i, 1);
                        defaultStart -= 1;
                    }
                }
                clearInterval(stopInterval);
                commandOutput("Killed the process\n");
                break;
            default:
                commandOutput("There was no process to kill.\n");
        }
    }catch(err){
        errorCode = -1;
    }    
    return errorCode;
}
