const { commands, window, workspace } = require("vscode");
const fs = require("fs");
const IO_EWC = require("io-email-worker-core");

module.exports = class BuildCommandHandler {
  constructor(subscriptions) {
    console.log("constructor hit");

    subscriptions.push(
      commands.registerCommand("ewu.build", () => {
        this.Build();
      })
    );
  }

  Build() {
    window
      .showInputBox({
        placeHolder: "Path of the directory top build",
        prompt: "campaign",
        value: workspace.getConfiguration("ewu").workingDirectory
      })
      .then(workingDir => {
        // Build file paths
        let mjmlInjectedDataPath =
          workingDir +
          "\\" +
          this.GetDirNameHelper(workingDir) +
          ".injectedData.mjml";

        let htmlResultPath =
          workingDir + "\\" + this.GetDirNameHelper(workingDir) + ".html";
        // Build file paths

        // Clean out working files

        // this.deleteFile(mjmlInjectedDataPath);
        // this.deleteFile(htmlResultPath);

        // Clean out working files

        //Parse data

        let dataInjectionResult = this.parseData(workingDir);
        let GenerateResult = IO_EWC.generateHtml(
          dataInjectionResult.data[0].html
        );

        // Parse data

        // write to files

        this.writeFileHelper(
          mjmlInjectedDataPath,
          dataInjectionResult.data[0].html
        );

        this.writeFileHelper(htmlResultPath, GenerateResult.data[0].html);

        // write to files

        // notify

        window.showInformationMessage("Build Successful!");
      });
  }

  ExtractMjmlTemplate(workingDir) {
    let dirName = this.GetDirNameHelper(workingDir);
    let jsonData = `${workingDir}\\` + `${dirName}.mjml`;

    var data = fs.readFileSync(jsonData);
    var dataString = data.toString();

    return dataString;
  }

  ExtractJsonData(workingDir) {
    let dirName = this.GetDirNameHelper(workingDir);
    console.log(`${workingDir}\\` + `${dirName}.json`);
    let jsonData = `${workingDir}\\` + `${dirName}.json`;

    var data = fs.readFileSync(jsonData);
    var dataJson = JSON.parse(data.toString());

    return dataJson;
  }

  GetDirNameHelper(workingDir) {
    let splitArr = workingDir.split("\\");
    let directoryName =
      splitArr[splitArr.length - 1] || splitArr[splitArr.length - 2];
    return directoryName;
  }

  isStructureValid(dataTemplateProperties, rawData) {
    let result = {
      isSuccess: false,
      errors: []
    };

    let structureValidationResponse = IO_EWC.validateStructureAgainstTemplate(
      dataTemplateProperties,
      rawData
    );

    if (structureValidationResponse == null) {
      console.error("structure validation response can not bge null");
      return;
    }

    if (structureValidationResponse.length == 0) {
      console.error("structure validation response was empty");
      return;
    }

    for (let index = 0; index < structureValidationResponse.length; index++) {
      if (!structureValidationResponse[index].isSuccess)
        result.errors.push(
          `structure validation failed for node: ${index} \n error: ${structureValidationResponse[index].errors}`
        );
    }

    result.isSuccess = !(result.errors.length > 0);
    return result;
  }

  deleteFile(path) {
    fs.stat(path, err => {
      if (err) {
        return console.error(err);
      }

      fs.unlink(path, err => {
        if (err) return console.log(err);
        console.log(path + "deleted successfully");
      });
    });
  }

  parseData(workingDir) {
    let dataJson = this.ExtractJsonData(workingDir);
    let mjmlTemplate = this.ExtractMjmlTemplate(workingDir);

    let isStructureValid = this.isStructureValid(
      dataJson.data.dataTemplate.properties,
      dataJson.data.rawData
    );

    if (!isStructureValid.isSuccess) {
      isStructureValid.errors.forEach(error => {
        window.showErrorMessage(error);
      });

      return;
    }

    let dataInjectionResult = IO_EWC.injectDataIntoTemplate(
      dataJson.data.rawData,
      mjmlTemplate
    );
    console.log("Injected result: " + dataInjectionResult.data);

    return dataInjectionResult;
  }

  writeFileHelper(path, data) {
    fs.unlink(path, err => {
      if (err) return console.log(err);
      console.log(path + "deleted successfully");
    });

    fs.writeFile(path, data, function(err) {
      if (err) throw err;
      console.log(path + " created successfully.");
    });
  }
};
